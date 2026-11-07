import os
import json
import re
import secrets
import hmac
from datetime import datetime, timezone
from google import genai
from dotenv import load_dotenv
from fastapi import HTTPException, Header
import tempfile
import pdfplumber
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Import database handles
from database import conn, cursor

app = FastAPI(
    title="AI Interview Coach API",
    version="1.0.0"
)

# ----------------------------
# AI CONFIGURATION
# ----------------------------
load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")
ai_client = genai.Client(api_key=gemini_api_key) if gemini_api_key else None

# ----------------------------
# HELPER: ROBUST JSON PARSER
# ----------------------------
def extract_json_from_response(text: str) -> dict:
    """Safely extract and parse JSON from LLM output, handling markdown wrappers and extra text."""
    text = (text or "").strip()
    
    # 1. Try direct JSON load
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 2. Try removing markdown code blocks
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.IGNORECASE | re.DOTALL).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 3. Search for the first valid JSON object block using regex
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Failed to parse JSON response from model: {text[:300]}")


# ----------------------------
# DATA VALIDATION MODELS
# ----------------------------
class User(BaseModel):
    name: str = ""
    email: str
    password: str

class InterviewAnswerSummary(BaseModel):
    question: str = Field(max_length=2000)
    category: str = Field(default="technical", max_length=80)
    score: int = Field(ge=0, le=100)
    communication_score: int = Field(default=0, ge=0, le=100)
    clarity_score: int = Field(default=0, ge=0, le=100)
    relevance_score: int = Field(default=0, ge=0, le=100)
    feedback: str = Field(default="", max_length=4000)
    strengths: list[str] = Field(default_factory=list, max_length=10)
    improvements: list[str] = Field(default_factory=list, max_length=10)
    ideal_answer: str = Field(default="", max_length=4000)

class InterviewResult(BaseModel):
    email: str
    ats_score: int
    interview_score: int
    company: str = Field(default="", max_length=120)
    track: str = Field(default="", max_length=120)
    answers: list[InterviewAnswerSummary] = Field(default_factory=list, max_length=20)

class FeedbackRequest(BaseModel):
    question: str
    answer: str
    category: str = "technical"
    company: str = ""
    language: str = ""

class CompanyInterview(BaseModel):
    company: str

class GenerateQuestionsRequest(BaseModel):
    company: str = "General"
    category: str = "Communication"
    difficulty: str = "Medium"
    count: int = Field(default=5, ge=1, le=10)
    previous_questions: list[str] = Field(default_factory=list)
    topic: str = "General"

class GeneratedQuestion(BaseModel):
    question: str
    category: str
    difficulty: str
    expected_points: list[str] = Field(default_factory=list)


class DemoSubscriptionRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=254)
    plan_code: str
    payment_method: str


SUBSCRIPTION_PLANS = {
    "starter": {
        "name": "InterviewIQ Starter",
        "category": "Interview and resume preparation",
        "list_price": 199.0,
        "discount_percent": 40,
        "amount": 119.4,
        "duration": "30 days",
        "features": [
            "Company-specific interview preparation",
            "Resume review and improvement guidance",
            "Interview practice with AI feedback",
            "Progress tracking for your preparation",
        ],
    },
    "plus": {
        "name": "InterviewIQ Plus",
        "category": "Interview, resume, and coding preparation",
        "list_price": 299.0,
        "discount_percent": 50,
        "amount": 149.5,
        "duration": "30 days",
        "features": [
            "Everything in Starter",
            "Coding practice and technical preparation",
            "Expanded company-specific preparation paths",
            "Interview feedback and progress tracking",
        ],
    },
}

class GenerateQuestionsResponse(BaseModel):
    company: str
    category: str
    questions: list[GeneratedQuestion]


# ----------------------------
# CORS SETTINGS
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------
# ENDPOINTS
# ----------------------------

@app.get("/")
def home():
    return __import__("fastapi.responses", fromlist=["RedirectResponse"]).RedirectResponse(url="https://interview-iq-pxog.vercel.app/", status_code=307)


@app.post("/signup")
def signup(user: User):
    try:
        cursor.execute(
            """
            INSERT INTO users(name, email, password)
            VALUES(?, ?, ?)
            """,
            (user.name, user.email, user.password)
        )
        conn.commit()
        return {"success": True, "message": "Signup Successful"}
    except Exception:
        return {"success": False, "message": "User Already Exists"}


@app.post("/login")
def login(user: User):
    admin_password = os.getenv("ADMIN_PASSWORD", "")
    if admin_password and (user.email.strip().casefold() in {os.getenv("ADMIN_EMAIL", "").strip().casefold(), os.getenv("ADMIN_USERNAME", "").strip().casefold()} or user.name.strip().casefold() in {os.getenv("ADMIN_EMAIL", "").strip().casefold(), os.getenv("ADMIN_USERNAME", "").strip().casefold()} or re.sub(r"\D", "", user.email) == re.sub(r"\D", "", os.getenv("ADMIN_PHONE", ""))) and hmac.compare_digest(user.password, admin_password):
        return {
            "success": True,
            "message": "Admin login successful",
            "role": "admin",
            "name": os.getenv("ADMIN_NAME") or user.name or user.email,
            "email": user.email,
        }

    cursor.execute(
        """
        SELECT * FROM users
        WHERE email=? AND password=?
        """,
        (user.email, user.password)
    )
    result = cursor.fetchone()

    if result:
        return {
            "success": True,
            "message": "Login Success",
            "role": "user",
            "name": result[1],
            "email": result[2]
        }
    return {"success": False, "message": "Invalid Credentials"}


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name

        resume_text = ""
        with pdfplumber.open(temp_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    resume_text += text + "\n"

        resume_lower = resume_text.lower()
        skills = [
            "python", "java", "sql", "react", "machine learning",
            "html", "css", "javascript", "power bi", "excel"
        ]

        detected_skills = []
        missing_skills = []
        score = 0

        for skill in skills:
            if skill in resume_lower:
                detected_skills.append(skill)
                score += 10
            else:
                missing_skills.append(skill)

        if not ai_client:
            raise HTTPException(
                status_code=503,
                detail="AI is not configured. Set GEMINI_API_KEY in backend/.env."
            )

        prompt = f"""
You are an expert technical recruiter and interview coach.
Analyze the following resume text and generate 10 tailored interview questions based on the candidate's skills, experience, and background.
Return ONLY valid JSON with this exact structure:
{{
  "questions": [
    "Question 1",
    "Question 2"
  ]
}}

Resume:
{resume_text[:25000]}
"""
        response = ai_client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            contents=prompt
        )
        
        data = extract_json_from_response(response.text)
        questions = data.get("questions", [])
        questions = [
            str(q).strip()
            for q in questions
            if isinstance(q, str) and q.strip()
        ]
        if not questions:
            raise ValueError("No valid questions were generated.")

        return {
            "success": True,
            "resume_text": resume_text,
            "ats_score": score,
            "skills": detected_skills,
            "missing_skills": missing_skills,
            "questions": questions[:10]
        }
    except HTTPException:
        raise
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=502,
            detail=f"Could not process resume: {str(exc)[:300]}"
        )
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/save-result")
def save_result(data: InterviewResult):
    cursor.execute(
        """
        INSERT INTO interview_history
            (email, ats_score, interview_score, company, track, answers_json)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            data.email.strip().lower(),
            data.ats_score,
            data.interview_score,
            data.company.strip(),
            data.track.strip(),
            json.dumps([answer.model_dump() for answer in data.answers]),
        )
    )
    conn.commit()
    return {"success": True, "message": "Result Saved Successfully"}


@app.get("/history/{email}")
def get_history(email: str):
    cursor.execute(
        """
        SELECT ats_score, interview_score, created_at, company, track, answers_json
        FROM interview_history
        WHERE lower(email)=lower(?)
        ORDER BY id DESC
        """,
        (email,)
    )
    rows = cursor.fetchall()
    return [
        {
            "ats_score": row[0],
            "interview_score": row[1],
            "created_at": row[2],
            "company": row[3] or "",
            "track": row[4] or "",
            "answers": json.loads(row[5] or "[]"),
        }
        for row in rows
    ]


@app.get("/dashboard/{email}")
def dashboard(email: str):
    cursor.execute("SELECT COUNT(*) FROM interview_history WHERE lower(email)=lower(?)", (email,))
    total = cursor.fetchone()[0]

    cursor.execute("SELECT MAX(interview_score) FROM interview_history WHERE lower(email)=lower(?)", (email,))
    best = cursor.fetchone()[0] or 0

    cursor.execute("SELECT AVG(interview_score) FROM interview_history WHERE lower(email)=lower(?)", (email,))
    avg = cursor.fetchone()[0] or 0

    cursor.execute(
        """SELECT ats_score, interview_score, created_at, company, track, answers_json
           FROM interview_history WHERE lower(email)=lower(?) ORDER BY id DESC LIMIT 12""",
        (email,),
    )
    recent = [
        {
            "ats_score": row[0],
            "interview_score": row[1],
            "created_at": row[2],
            "company": row[3] or "",
            "track": row[4] or "",
            "answers": json.loads(row[5] or "[]"),
        }
        for row in cursor.fetchall()
    ]
    dimension_totals = {"clarity_score": [], "relevance_score": [], "communication_score": []}
    category_scores = {}
    for interview in recent:
        for answer in interview["answers"]:
            for key in dimension_totals:
                score = answer.get(key)
                if isinstance(score, (int, float)) and score > 0:
                    dimension_totals[key].append(score)
            category = (answer.get("category") or "").strip()
            if category:
                category_scores.setdefault(category, []).append(answer.get("score", 0))
    areas = sorted(
        (
            {"name": key.replace("_score", "").replace("_", " ").title(), "score": round(sum(scores) / len(scores))}
            for key, scores in dimension_totals.items() if scores
        ),
        key=lambda area: area["score"],
    )
    weakest_category = min(
        category_scores,
        key=lambda category: sum(category_scores[category]) / len(category_scores[category]),
        default="",
    )
    focus_area = areas[0]["name"] if areas and areas[0]["score"] < 75 else weakest_category
    return {
        "total_interviews": total,
        "best_score": round(best),
        "average_score": round(avg),
        "recent_results": recent,
        "focus_area": focus_area,
        "focus_scores": areas,
    }


@app.post("/feedback")
def generate_feedback(data: FeedbackRequest):
    if not ai_client:
        raise HTTPException(
            status_code=503,
            detail="AI is not configured. Set GEMINI_API_KEY in backend/.env."
        )

    if not data.question.strip() or not data.answer.strip():
        raise HTTPException(
            status_code=400,
            detail="Both question and answer are required."
        )

    prompt = f"""
You are an expert interview evaluator.

Evaluate the candidate's answer against the actual question.
Assess correctness, relevance, clarity, communication, and completeness.
Be constructive and specific.

Company: {data.company or "General"}
Category: {data.category}
Question: {data.question}
Candidate answer: {data.answer}
Language: {data.language or "Not specified"}

Return ONLY valid JSON with these fields:
{{
  "score": 0,
  "result": "PASS",
  "communication_score": 0,
  "clarity_score": 0,
  "relevance_score": 0,
  "feedback": "Specific feedback on this answer",
  "strengths": ["strength 1"],
  "improvements": ["improvement 1"],
  "ideal_answer": "A concise example of a stronger answer"
}}

Rules:
- All scores must be integers from 0 to 100.
- Set result to PASS if score is 60 or above; otherwise FAIL.
- Return valid JSON only, without additional conversational text.
"""

    try:
        response = ai_client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            contents=prompt,
        )

        result = extract_json_from_response(response.text)

        required_fields = [
            "score",
            "result",
            "communication_score",
            "clarity_score",
            "relevance_score",
            "feedback",
            "strengths",
            "improvements",
            "ideal_answer",
        ]

        for field in required_fields:
            if field not in result:
                raise ValueError(f"Missing field in Gemini response: {field}")

        for field in [
            "score",
            "communication_score",
            "clarity_score",
            "relevance_score",
        ]:
            result[field] = max(0, min(100, int(result[field])))

        result["result"] = (
            "PASS" if result["score"] >= 60 else "FAIL"
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print("\n--- FEEDBACK GENERATION ERROR ---")
        traceback.print_exc()
        print("--- END FEEDBACK GENERATION ERROR ---\n")
        
        error_text = str(e).lower()
        if (
            "resource_exhausted" in error_text
            or "quota" in error_text
            or "429" in error_text
            or "rate limit" in error_text
        ):
            raise HTTPException(
                status_code=429,
                detail="Gemini API quota exceeded. Check your API quota and billing, then try again."
            )
        raise HTTPException(
            status_code=502,
            detail=f"Feedback evaluation failed: {type(e).__name__}: {str(e)[:300]}"
        )


@app.post("/generate-questions", response_model=GenerateQuestionsResponse)
def generate_questions(request: GenerateQuestionsRequest):
    if not ai_client:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not configured on the backend.",
        )

    previous = request.previous_questions[-30:]

    prompt = f"""
You are an expert interview coach.

Generate exactly {request.count} distinct interview questions.

Company: {request.company}
Interview category: {request.category}
Difficulty: {request.difficulty}
Topic: {request.topic}

Requirements:
- Generate interview questions specifically about this topic.
- Avoid unrelated or repeated questions.
- Tailor the questions to the company's known industry and role expectations.
- Avoid these questions and close paraphrases:
{json.dumps(previous, ensure_ascii=False)}

Return ONLY valid JSON in this format:
{{
  "questions": [
    {{
      "question": "Question text",
      "category": "{request.category}",
      "difficulty": "{request.difficulty}",
      "expected_points": ["point one", "point two"]
    }}
  ]
}}
"""

    try:
        response = ai_client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            contents=prompt,
        )

        data = extract_json_from_response(response.text)
        items = data.get("questions", [])

        questions = []
        seen = {q.strip().lower() for q in previous}

        for item in items:
            question = str(item.get("question", "")).strip()
            if not question or question.lower() in seen:
                continue

            seen.add(question.lower())
            questions.append(
                GeneratedQuestion(
                    question=question,
                    category=request.category,
                    difficulty=request.difficulty,
                    expected_points=item.get("expected_points", []),
                )
            )

        if len(questions) < request.count:
            raise ValueError("The model returned too few distinct questions.")

        return GenerateQuestionsResponse(
            company=request.company,
            category=request.category,
            questions=questions[:request.count],
        )

    except HTTPException:
        raise
    except Exception as exc:
        import traceback
        print("\n--- QUESTION GENERATION ERROR ---")
        traceback.print_exc()
        print("--- END QUESTION GENERATION ERROR ---\n")

        raise HTTPException(
            status_code=502,
            detail=f"Question generation failed: {type(exc).__name__}: {str(exc)[:500]}",
        )


@app.get("/certificate/{email}")
def certificate(email: str):
    cursor.execute("SELECT MAX(interview_score) FROM interview_history WHERE email=?", (email,))
    score = cursor.fetchone()[0] or 0
    return {
        "name": email,
        "score": score,
        "status": "Certified"
    }


@app.get("/company/{company}")
def company_questions(company: str):
    questions = {
        "tcs": ["Explain OOP concepts.", "What is SQL?"],
        "accenture": ["Explain DBMS.", "What is normalization?"],
        "infosys": ["What is Java.", "Explain collections."],
        "google": ["What is time complexity.", "Explain binary search."]
    }
    return {
        "questions": questions.get(company.lower(), ["Tell me about yourself."])
    }


def require_admin(admin_password: str | None) -> None:
    configured_password = os.getenv("ADMIN_PASSWORD", "")
    if not configured_password:
        raise HTTPException(
            status_code=503,
            detail="Admin access is not configured. Set ADMIN_PASSWORD on the backend.",
        )
    if not admin_password or not secrets.compare_digest(admin_password, configured_password):
        raise HTTPException(status_code=401, detail="Invalid admin password.")


@app.get("/subscriptions/plans")
def subscription_plans():
    return {"plans": SUBSCRIPTION_PLANS}


@app.post("/subscriptions/demo")
def create_demo_subscription(request: DemoSubscriptionRequest):
    """Record a clearly simulated payment; this endpoint never charges money."""
    plan = SUBSCRIPTION_PLANS.get(request.plan_code)
    if not plan:
        raise HTTPException(status_code=400, detail="Choose a valid subscription plan.")

    payment_method = request.payment_method
    if payment_method not in {"demo_card", "demo_upi"}:
        raise HTTPException(status_code=400, detail="Choose demo debit card or demo UPI.")

    email = request.email.strip().lower()
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        raise HTTPException(status_code=400, detail="Enter a valid email address.")

    reference = f"DEMO-{secrets.token_hex(5).upper()}"
    cursor.execute(
        """INSERT INTO subscriptions
           (name, email, plan_code, plan_name, category, list_price,
            discount_percent, demo_amount, payment_method, payment_reference,
            payment_status, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'demo_paid', 'pending')""",
        (
            request.name.strip(), email, request.plan_code, plan["name"],
            plan["category"], plan["list_price"], plan["discount_percent"],
            plan["amount"], payment_method, reference,
        ),
    )
    conn.commit()
    return {
        "success": True,
        "demo": True,
        "message": "Demo payment recorded for admin review. No money was charged.",
        "subscription": {
            "name": plan["name"],
            "category": plan["category"],
            "amount": plan["amount"],
            "duration": plan["duration"],
            "status": "pending",
            "payment_status": "demo_paid",
            "payment_method": payment_method,
            "payment_reference": reference,
            "activated_at": datetime.now(timezone.utc).isoformat(),
        },
    }


@app.get("/subscriptions/status/{payment_reference}")
def subscription_status(payment_reference: str):
    """Return the latest admin-reviewed state for one unguessable demo reference."""
    cursor.execute(
        """SELECT plan_name, category, demo_amount, payment_method,
                  payment_reference, payment_status, status, created_at, updated_at
           FROM subscriptions WHERE payment_reference=?""",
        (payment_reference,),
    )
    row = cursor.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Subscription record not found.")

    columns = [item[0] for item in cursor.description]
    record = dict(zip(columns, row))
    return {
        "subscription": {
            "name": record["plan_name"],
            "category": record["category"],
            "amount": record["demo_amount"],
            "duration": "30 days",
            "payment_method": record["payment_method"],
            "payment_reference": record["payment_reference"],
            "payment_status": record["payment_status"],
            "status": record["status"],
            "created_at": record["created_at"],
            "updated_at": record["updated_at"],
        }
    }


@app.get("/admin/subscriptions")
def admin_subscriptions(x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    cursor.execute(
        """SELECT id, name, email, plan_code, plan_name, category, list_price,
                  discount_percent, demo_amount, payment_method, payment_reference,
                  payment_status, status, created_at
           FROM subscriptions ORDER BY id DESC"""
    )
    columns = [item[0] for item in cursor.description]
    return {"subscriptions": [dict(zip(columns, row)) for row in cursor.fetchall()]}


@app.get("/admin/overview")
def admin_overview(x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM subscriptions")
    subscription_count = cursor.fetchone()[0]
    cursor.execute("SELECT status, COUNT(*) FROM subscriptions GROUP BY status")
    statuses = dict(cursor.fetchall())
    return {
        "users": user_count,
        "subscriptions": subscription_count,
        "active_subscriptions": statuses.get("active", 0),
        "pending_subscriptions": statuses.get("pending", 0),
    }


@app.get("/admin/users")
def admin_users(search: str = "", x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    needle = f"%{search.strip().lower()}%"
    cursor.execute(
        """SELECT u.id, COALESCE(u.name, '') AS name, u.email,
                  (SELECT COUNT(*) FROM interview_history h WHERE lower(h.email)=lower(u.email)) AS interview_count,
                  (SELECT MAX(h.created_at) FROM interview_history h WHERE lower(h.email)=lower(u.email)) AS last_interview_at,
                  (SELECT ROUND(AVG(h.interview_score), 1) FROM interview_history h WHERE lower(h.email)=lower(u.email)) AS average_score,
                  (SELECT s.plan_name FROM subscriptions s WHERE lower(s.email)=lower(u.email) ORDER BY s.id DESC LIMIT 1) AS plan_name,
                  (SELECT s.status FROM subscriptions s WHERE lower(s.email)=lower(u.email) ORDER BY s.id DESC LIMIT 1) AS subscription_status
           FROM users u WHERE lower(COALESCE(u.name, '')) LIKE ? OR lower(u.email) LIKE ?
           ORDER BY u.id DESC""",
        (needle, needle),
    )
    columns = [item[0] for item in cursor.description]
    users = [dict(zip(columns, row)) for row in cursor.fetchall()]
    for user in users:
        cursor.execute(
            """SELECT answers_json FROM interview_history
               WHERE lower(email)=lower(?) ORDER BY id DESC LIMIT 1""",
            (user["email"],),
        )
        latest = cursor.fetchone()
        answers = []
        if latest:
            try:
                answers = json.loads(latest[0] or "[]")
            except (TypeError, json.JSONDecodeError):
                answers = []
        averages = {}
        for dimension, label in (
            ("clarity_score", "Answer clarity"),
            ("relevance_score", "Answer relevance"),
            ("communication_score", "Communication"),
        ):
            values = [answer.get(dimension) for answer in answers if isinstance(answer.get(dimension), (int, float)) and answer.get(dimension) > 0]
            if values:
                averages[label] = sum(values) / len(values)
        weak_dimension = min(averages, key=averages.get, default="")
        if weak_dimension and averages[weak_dimension] < 75:
            user["focus_area"] = weak_dimension
            user["next_suggestion"] = f"Practice {weak_dimension.lower()} in the next mock interview"
        elif user["average_score"] is not None and user["average_score"] < 60:
            user["focus_area"] = "Overall interview performance"
            user["next_suggestion"] = "Review recent feedback and retry a mock interview"
        elif user["interview_count"] < 5:
            user["focus_area"] = "Build interview consistency"
            user["next_suggestion"] = "Complete another company-specific mock interview"
        else:
            user["focus_area"] = "Advanced practice"
            user["next_suggestion"] = "Try a harder interview track and compare your score"
    return {"users": users}


@app.post("/admin/subscriptions/{subscription_id}/activate")
def admin_activate_subscription(
    subscription_id: int,
    x_admin_password: str | None = Header(default=None),
):
    require_admin(x_admin_password)
    cursor.execute(
        "UPDATE subscriptions SET status='active', updated_at=CURRENT_TIMESTAMP WHERE id=?",
        (subscription_id,),
    )
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Subscription record not found.")
    conn.commit()
    return {"success": True, "status": "active"}


@app.post("/admin/subscriptions/{subscription_id}/reject")
def admin_reject_subscription(
    subscription_id: int,
    x_admin_password: str | None = Header(default=None),
):
    require_admin(x_admin_password)
    cursor.execute(
        "UPDATE subscriptions SET status='rejected', updated_at=CURRENT_TIMESTAMP WHERE id=?",
        (subscription_id,),
    )
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Subscription record not found.")
    conn.commit()
    return {"success": True, "status": "rejected"}


@app.post("/admin/subscriptions/{subscription_id}/revoke")
def admin_revoke_subscription(
    subscription_id: int,
    x_admin_password: str | None = Header(default=None),
):
    require_admin(x_admin_password)
    cursor.execute(
        "UPDATE subscriptions SET status='revoked', updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='active'",
        (subscription_id,),
    )
    if cursor.rowcount == 0:
        cursor.execute("SELECT id FROM subscriptions WHERE id=?", (subscription_id,))
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Subscription record not found.")
        raise HTTPException(status_code=409, detail="Only active subscriptions can be revoked.")
    conn.commit()
    return {"success": True, "status": "revoked"}


@app.get("/subscriptions/status/{payment_reference}")
def subscription_status(payment_reference: str):
    """Return the latest admin-reviewed state for one unguessable demo reference."""
    cursor.execute(
        """SELECT plan_name, category, demo_amount, payment_method,
                  payment_reference, payment_status, status, created_at, updated_at
           FROM subscriptions WHERE payment_reference=?""",
        (payment_reference,),
    )
    row = cursor.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Subscription record not found.")

    columns = [item[0] for item in cursor.description]
    record = dict(zip(columns, row))
    return {
        "subscription": {
            "name": record["plan_name"],
            "category": record["category"],
            "amount": record["demo_amount"],
            "duration": "30 days",
            "payment_method": record["payment_method"],
            "payment_reference": record["payment_reference"],
            "payment_status": record["payment_status"],
            "status": record["status"],
            "created_at": record["created_at"],
            "updated_at": record["updated_at"],
        }
    }

