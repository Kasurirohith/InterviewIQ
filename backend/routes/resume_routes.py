
import os
import json
import tempfile

import pdfplumber
from fastapi import APIRouter, UploadFile, File, HTTPException
from google import genai

router = APIRouter()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF resume."
        )

    temp_path = None

    try:
        content = await file.read()

        if not content:
            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF is empty."
            )

        with tempfile.NamedTemporaryFile(
            delete=False, suffix=".pdf"
        ) as temp:
            temp.write(content)
            temp_path = temp.name

        resume_text = ""

        with pdfplumber.open(temp_path) as pdf:
            for page in pdf.pages:
                resume_text += (page.extract_text() or "") + "\n"

        if not resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No readable text found. Please upload a text-based PDF."
            )

        prompt = f"""
You are an experienced technical interviewer.

Generate 10 interview questions based ONLY on the candidate's resume.
Focus on:
- Projects and the candidate's contributions
- Technical skills and technologies
- Internships and work experience
- Education and relevant fundamentals

Include questions about specific projects and decisions.
Avoid generic questions unless relevant to the resume.
Do not invent experience that is not mentioned.

Return ONLY valid JSON in this format:
{{"questions": ["Question 1", "Question 2"]}}

RESUME:
{resume_text[:25000]}
"""

        response = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )

        raw = response.text.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()

        data = json.loads(raw)
        questions = data.get("questions", [])

        if not questions:
            raise HTTPException(
                status_code=500,
                detail="Gemini did not generate any question ."
            )

        return {
            "success": True,
            "resume_text": resume_text,
            "questions": questions[:10]
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Resume processing failed: {str(exc)}"
        )
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
