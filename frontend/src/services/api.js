const API_URL = import.meta.env.VITE_API_URL || "https://interviewiq-api-3ww1.onrender.com";

/* Resume Upload */
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/upload-resume`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Resume upload failed.");
  }

  // Save resume-generated interview questions
  if (Array.isArray(result.questions) && result.questions.length > 0) {
    localStorage.setItem(
      "resumeQuestions",
      JSON.stringify(result.questions)
    );
  }

  return result;
};

/* Signup */
export const signupUser = async (userData) => {
  const response = await fetch(
    `${API_URL}/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  return response.json();
};

/* Login */
export const loginUser = async (userData) => {
  const response = await fetch(
    `${API_URL}/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  return response.json();
};

/* Save Interview Result */
export const saveInterviewResult = async (
  email,
  ats_score,
  interview_score
) => {
  const response = await fetch(
    `${API_URL}/save-result`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        ats_score,
        interview_score,
      }),
    }
  );

  return response.json();
};

/* Dashboard */
export const getDashboardData = async (email) => {
  const response = await fetch(
    `${API_URL}/dashboard/${email}`
  );

  return response.json();
};

/* History */
export const getHistoryData = async (email) => {
  const response = await fetch(
    `${API_URL}/history/${email}`
  );

  return response.json();
};

