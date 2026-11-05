import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./InterviewPractice.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://ai-interview-coach-web.onrender.com";

function InterviewPractice() {
  const { name } = useParams();
  const navigate = useNavigate();

  const company = decodeURIComponent(name || "");
  const email = localStorage.getItem("email") || "";
  const track = localStorage.getItem("targetTrack") || "General";

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [answerScore, setAnswerScore] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [endReason, setEndReason] = useState("");
  const [micActive, setMicActive] = useState(false);
  const [listeningSupported, setListeningSupported] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const endingRef = useRef(false);
  const scoresRef = useRef({ totalScore: 0, answeredQuestions: 0 });

  useEffect(() => {
    scoresRef.current = { totalScore, answeredQuestions };
  }, [totalScore, answeredQuestions]);

  useEffect(() => {
    let cancelled = false;

    async function loadQuestions() {
      try {
        setLoading(true);
        setError("");

        // Prefer questions generated from the uploaded resume.
        const savedQuestions = localStorage.getItem("resumeQuestions");

        if (savedQuestions) {
          const parsedQuestions = JSON.parse(savedQuestions);

          if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
            if (!cancelled) {
              setQuestions(parsedQuestions);
            }
            return;
          }
        }

        // Fallback when no resume questions are available.
        const response = await fetch(
          `${API_URL}/company/${encodeURIComponent(company)}`
        );

        if (!response.ok) {
          throw new Error("Unable to load interview questions");
        }

        const result = await response.json();

        if (!cancelled) {
          setQuestions(
            result.questions?.length
              ? result.questions
              : ["Tell me about yourself."]
          );
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("Unable to load interview questions. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadQuestions();
    return () => {
      cancelled = true;
    };
  }, [company]);

  const stopMedia = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Speech recognition may already be stopped.
      }
      recognitionRef.current = null;
    }

    setMicActive(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.onended = null;
        track.onmute = null;
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStarted(false);
  }, []);

  const finishInterview = useCallback(
    async (reason = "") => {
      if (endingRef.current) return;

      endingRef.current = true;
      stopMedia();
      setEndReason(reason);
      setCompleted(true);

      const savedTotal = scoresRef.current.totalScore;
      const finalScore = questions.length
        ? Math.round((savedTotal / (questions.length * 10)) * 100)
        : 0;

      try {
        if (email) {
          const response = await fetch(`${API_URL}/save-result`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              ats_score: Number(localStorage.getItem("atsScore")) || 0,
              interview_score: finalScore,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to save interview result");
          }
        }

        localStorage.setItem("interviewScore", String(finalScore));
        localStorage.setItem("interviewCompany", company);
        localStorage.setItem("interviewTrack", track);
      } catch (err) {
        console.error("Could not save interview result:", err);
      }
    },
    [company, email, questions.length, stopMedia, track]
  );

  const startInterview = async () => {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Camera access is not supported. Use a current browser over HTTPS or localhost."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      const videoTrack = stream.getVideoTracks()[0];

      if (!videoTrack) {
        throw new Error("No camera was found.");
      }

      videoTrack.onended = () => {
        finishInterview(
          "Camera access was stopped or disconnected. The interview has ended."
        );
      };

      videoTrack.onmute = () => {
        finishInterview(
          "The camera feed was interrupted. The interview has ended."
        );
      };

      const audioTrack = stream.getAudioTracks()[0];

      if (audioTrack) {
        audioTrack.onended = () => {
          finishInterview(
            "Microphone access was stopped. The interview has ended."
          );
        };
      }

      setCameraStarted(true);
      setSessionStarted(true);
    } catch (err) {
      console.error(err);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      setCameraError(
        "Camera and microphone permission are required. Allow access in your browser and try again."
      );
    }
  };

  useEffect(() => {
    if (sessionStarted && cameraStarted && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [sessionStarted, cameraStarted]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Already stopped.
        }
      }

      streamRef.current?.getTracks().forEach((track) => {
        track.onended = null;
        track.onmute = null;
        track.stop();
      });
    };
  }, []);

  const submitAnswer = async () => {
    if (!answer.trim()) {
      window.alert("Please enter your answer.");
      return;
    }

    if (!cameraStarted || completed || feedback) return;

    try {
      setSubmitting(true);
      setError("");

      const question = questions[currentQuestion];

      const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          answer: answer.trim(),
          category: track.toLowerCase() === "general" ? "behavioral" : "technical",
          company: company,
          language: "English",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Feedback request failed (${response.status}): ${errorText}`
        );
      }

      const result = await response.json();

      const score = Math.max(
        0,
        Math.min(10, Number(result.score) || 0)
      );

      setFeedback(result.feedback || "Answer evaluated successfully.");
      setAnswerScore(score);
      setTotalScore((previous) => previous + score);
      setAnsweredQuestions((previous) => previous + 1);
    } catch (err) {
      console.error("Feedback error:", err);
      window.alert(
        err.message || "Unable to get feedback from the backend."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuestion = async () => {
    if (!feedback) {
      window.alert("Please evaluate your answer first.");
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
      setAnswer("");
      setFeedback("");
      setAnswerScore(null);
    } else {
      await finishInterview();
    }
  };

  const startDictation = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setListeningSupported(false);
      return;
    }

    if (micActive) {
      recognitionRef.current?.stop();
      setMicActive(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }

      if (transcript) {
        setAnswer((previous) =>
          `${previous}${previous && !previous.endsWith(" ") ? " " : ""}${transcript}`.trimStart()
        );
      }
    };

    recognition.onerror = () => setMicActive(false);
    recognition.onend = () => setMicActive(false);

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setMicActive(true);
    } catch {
      setMicActive(false);
    }
  };

  const goBack = () => navigate(`/company/${encodeURIComponent(company)}`);

  const progress = questions.length
    ? Math.round(((currentQuestion + 1) / questions.length) * 100)
    : 0;

  const finalScore = questions.length
    ? Math.round((totalScore / (questions.length * 10)) * 100)
    : 0;

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  if (loading) {
    return (
      <main className="ip-page">
        <section className="ip-message">
          <h2>Loading {company} interview</h2>
          <p>Connecting to the interview service...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="ip-page">
        <section className="ip-message">
          <h2>Connection failed</h2>
          <p>{error}</p>
          <button className="ip-button ip-button-dark" onClick={goBack}>
            Back to {company}
          </button>
        </section>
      </main>
    );
  }

  if (completed) {
    return (
      <main className="ip-page">
        <header className="ip-topbar">
                    <strong>InterviewIQ</strong>
          <span className="ip-status">Interview ended</span>
        </header>

        <section className="ip-results">
          <p className="ip-eyebrow">
            {company} / {track}
          </p>
          <h1>{endReason ? "Interview ended" : "Interview completed"}</h1>
          <p className="ip-subtitle">
            {endReason || "Your interview results are ready."}
          </p>

          <div className="ip-final-score">
            <span>Final score</span>
            <strong>
              {finalScore}
              <small>/100</small>
            </strong>
            <span>
              {answeredQuestions} of {questions.length} questions evaluated
            </span>
          </div>

          <div className="ip-result-grid">
            <div>
              <span>Points earned</span>
              <strong>{totalScore}</strong>
            </div>
            <div>
              <span>Questions evaluated</span>
              <strong>
                {answeredQuestions}/{questions.length}
              </strong>
            </div>
            <div>
              <span>Company</span>
              <strong>{company}</strong>
            </div>
            <div>
              <span>Track</span>
              <strong>{track}</strong>
            </div>
          </div>

          <div className="ip-result-actions">
            <button className="ip-button ip-button-dark" onClick={goBack}>
              Back to preparation
            </button>
            <button
              className="ip-button"
              onClick={() => navigate("/report")}
            >
              View report
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (!sessionStarted) {
    return (
      <main className="ip-page">
        <header className="ip-topbar">
          <button className="ip-text-button" onClick={goBack}>
            Back
          </button>
                    <strong>InterviewIQ</strong>
          <span className="ip-status">Ready to start</span>
        </header>

        <section className="ip-start-card">
          <p className="ip-eyebrow">
            {company} / {track}
          </p>
          <h1>Prepare for your interview</h1>
          <p className="ip-subtitle">
            Camera and microphone access are required. Your camera preview
            remains visible throughout the test.
          </p>

          <div className="ip-start-preview">
            <video ref={videoRef} autoPlay muted playsInline />
            <div className="ip-camera-placeholder">
              Camera preview appears here after you start.
            </div>
          </div>

          {cameraError && (
            <p className="ip-error" role="alert">
              {cameraError}
            </p>
          )}

          <button
            className="ip-button ip-button-dark ip-start-button"
            onClick={startInterview}
          >
            Allow camera and microphone and start
          </button>

          <p className="ip-small-note">
            If camera or microphone access stops during the test, the interview
            will end and the current score will be shown.
          </p>
        </section>
      </main>
    );
  }

  const question = questions[currentQuestion];

  return (
    <main className="ip-page">
      <header className="ip-topbar">
        <button className="ip-text-button" onClick={goBack}>
          Back
        </button>
                <strong>InterviewIQ</strong>
        <span className="ip-status">Interview in progress</span>
      </header>

      <section className="ip-session-head">
        <div>
          <p className="ip-eyebrow">
            {company} / {track}
          </p>
          <h1>
            Question {currentQuestion + 1} of {questions.length}
          </h1>
        </div>

        <div
          className="ip-progress-dots"
          aria-label={`${progress}% complete`}
        >
          {questions.map((_, index) => (
            <span
              key={index}
              className={
                index < currentQuestion
                  ? "done"
                  : index === currentQuestion
                    ? "current"
                    : ""
              }
            />
          ))}
        </div>
      </section>

      <div className="ip-layout">
        <section className="ip-main-card">
          <div className="ip-question-heading">
            <div>
              <p className="ip-eyebrow">Interview question</p>
              <h2>{question}</h2>
              <p className="ip-subtitle">
                Answer clearly and include a specific example whenever possible.
              </p>
            </div>

            <div className="ip-current-score">
              <strong>
                {answerScore !== null ? answerScore * 10 : 0}
                <small>/100</small>
              </strong>
              <span>Current answer</span>
            </div>
          </div>

          <div className="ip-answer-label">
            <label htmlFor="interview-answer">Your answer</label>
            <span>{wordCount} words</span>
          </div>

          <textarea
            id="interview-answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Type your answer here or use microphone dictation..."
            disabled={submitting || completed || Boolean(feedback)}
          />

          <div className="ip-controls">
            <button
              className={`ip-button ${micActive ? "ip-button-active" : ""}`}
              onClick={startDictation}
              disabled={submitting || Boolean(feedback)}
            >
              {micActive ? "Stop dictation" : "Dictate"}
            </button>

            {!feedback && (
              <button
                className="ip-button ip-button-dark"
                onClick={submitAnswer}
                disabled={submitting}
              >
                {submitting ? "Evaluating..." : "Evaluate answer"}
              </button>
            )}

            {feedback && (
              <button className="ip-button ip-button-dark" onClick={nextQuestion}>
                {currentQuestion === questions.length - 1
                  ? "Finish interview"
                  : "Next question"}
              </button>
            )}

            <button
              className="ip-button ip-button-danger"
              onClick={() =>
                finishInterview(
                  "You ended the interview. Your current score is shown below."
                )
              }
            >
              End test
            </button>
          </div>

          {!listeningSupported && (
            <p className="ip-small-note">
              Speech recognition is not supported in this browser. You can type
              your answer instead.
            </p>
          )}

          {feedback && (
            <section className="ip-feedback">
              <div className="ip-feedback-title">
                <h3>Evaluation feedback</h3>
                <strong>{answerScore}/10</strong>
              </div>
              <p>{feedback}</p>
            </section>
          )}
        </section>

        <aside className="ip-side-column">
          <section className="ip-side-card ip-camera-card">
            <div className="ip-side-heading">
              <h3>Your camera</h3>
              <span className="ip-live-label">Live</span>
            </div>

            <video ref={videoRef} autoPlay muted playsInline />

            <p>Your camera is active during the test.</p>

            <button
              className="ip-button ip-button-danger ip-full-button"
              onClick={() =>
                finishInterview(
                  "The camera was turned off. The interview has ended."
                )
              }
            >
              Turn off camera and end test
            </button>
          </section>

          <section className="ip-side-card">
            <p className="ip-eyebrow">Test progress</p>

            <div className="ip-stat-line">
              <span>Completed</span>
              <strong>
                {answeredQuestions}/{questions.length}
              </strong>
            </div>

            <div className="ip-progress-track">
              <span
                style={{
                  width: `${
                    questions.length
                      ? (answeredQuestions / questions.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="ip-total-score">
              <span>Total score so far</span>
              <strong>
                {totalScore}
                <small>/{questions.length * 10}</small>
              </strong>
            </div>

            <p className="ip-small-note">
              Unanswered questions count as zero if the test ends early.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}

export default InterviewPractice;
