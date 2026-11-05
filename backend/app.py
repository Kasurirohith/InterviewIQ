import os
import json
import re
from google import genai
from dotenv import load_dotenv
from fastapi import HTTPException
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

class InterviewResult(BaseModel):
    email: str
    ats_score: int
    interview_score: int

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
    return {
        "message": "🚀 AI Interview Coach Backend Running Successfully"
    }


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
        INSERT INTO interview_history (email, ats_score, interview_score)
        VALUES (?, ?, ?)
        """,
        (data.email, data.ats_score, data.interview_score)
    )
    conn.commit()
    return {"success": True, "message": "Result Saved Successfully"}


@app.get("/history/{email}")
def get_history(email: str):
    cursor.execute(
        """
        SELECT ats_score, interview_score, created_at
        FROM interview_history
        WHERE email=?
        ORDER BY id DESC
        """,
        (email,)
    )
    rows = cursor.fetchall()
    return [
        {"ats_score": row[0], "interview_score": row[1], "created_at": row[2]}
        for row in rows
    ]


@app.get("/dashboard/{email}")
def dashboard(email: str):
    cursor.execute("SELECT COUNT(*) FROM interview_history WHERE email=?", (email,))
    total = cursor.fetchone()[0]

    cursor.execute("SELECT MAX(interview_score) FROM interview_history WHERE email=?", (email,))
    best = cursor.fetchone()[0] or 0

    cursor.execute("SELECT AVG(interview_score) FROM interview_history WHERE email=?", (email,))
    avg = cursor.fetchone()[0] or 0

    return {
        "total_interviews": total,
        "best_score": round(best),
        "average_score": round(avg)
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
