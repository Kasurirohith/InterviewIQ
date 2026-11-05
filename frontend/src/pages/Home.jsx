import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume } from "../services/api";
import "./home.css";

function Home() {
  const navigate = useNavigate();

  const [resumeName, setResumeName] = useState(
    localStorage.getItem("resumeName") || ""
  );
  const [atsScore, setAtsScore] = useState(
    Number(localStorage.getItem("atsScore")) || 0
  );
  const [uploading, setUploading] = useState(false);

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedExtensions = /\.(pdf|doc|docx)$/i;

    if (!allowedExtensions.test(file.name)) {
      alert("Please upload a PDF or Word resume.");
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const result = await uploadResume(file);

      localStorage.setItem("resumeName", file.name);
      setResumeName(file.name);

      if (typeof result.ats_score === "number") {
        localStorage.setItem("atsScore", String(result.ats_score));
        setAtsScore(result.ats_score);
      }

      if (
        Array.isArray(result.questions) &&
        result.questions.length > 0
      ) {
        alert(
          `Resume uploaded successfully! ${result.questions.length} interview questions generated.`
        );
      } else {
        alert(
          "Resume uploaded, but no interview questions were returned by the backend."
        );
      }
    } catch (error) {
      console.error("Resume upload error:", error);
      alert(error.message || "Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <main className="home-page">
      <div className="home-container">
        <section className="home-hero">
          <span className="home-eyebrow">
            YOUR CAREER PREPARATION WORKSPACE
          </span>

          <h1>
            Prepare smarter.
            <br />
            <span>Interview with confidence.</span>
          </h1>

          <p className="home-hero-description">
            Everything you need to prepare for placements,
            improve your resume, practise interviews and
            strengthen your coding skills — all in one place.
          </p>

          <div className="home-hero-actions">
            <button
              className="home-button home-button-primary"
              onClick={() => navigate("/product-companies")}
            >
              Explore companies
              <span aria-hidden="true">→</span>
            </button>

            <button
              className="home-button home-button-secondary"
              onClick={() => navigate("/coding")}
            >
              Start coding practice
            </button>
          </div>

          <div className="home-feature-strip">
            <div>
              <span className="feature-number">01</span>
              <span>Resume preparation</span>
            </div>
            <div>
              <span className="feature-number">02</span>
              <span>Interview practice</span>
            </div>
            <div>
              <span className="feature-number">03</span>
              <span>Coding skills</span>
            </div>
          </div>
        </section>

        <section className="home-section" id="resume">
          <div className="home-section-heading">
            <div>
              <span className="home-eyebrow">RESUME</span>
              <h2>Make your resume stand out.</h2>
              <p>
                Upload your resume to get started with your
                resume preparation.
              </p>
            </div>
            <span className="home-section-index">01 / 03</span>
          </div>

          <div className="resume-panel">
            <div className="resume-panel-copy">
              <div className="home-icon-box" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 3.75v4h4M8.5 12h7M8.5 15.5h7"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h3>Resume ATS Checker</h3>
              <p>
                Start with your existing resume in PDF or Word
                format.
              </p>

              <label className="resume-upload-button">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  disabled={uploading}
                />
                {uploading
                  ? "Processing resume..."
                  : resumeName
                    ? "Upload a new resume"
                    : "Choose resume"}
              </label>

              <span className="resume-file-hint">
                Supported formats: PDF, DOC and DOCX
              </span>
            </div>

            <div className="resume-status">
              <span className="resume-status-label">
                CURRENT RESUME
              </span>

              {resumeName ? (
                <>
                  <div className="resume-file-name">
                    <span className="resume-file-symbol">PDF</span>
                    <span title={resumeName}>{resumeName}</span>
                  </div>

                  <div className="resume-score">
                    <span>Saved preview score</span>
                    <strong>{atsScore}%</strong>
                    <div className="resume-score-track">
                      <div
                        className="resume-score-fill"
                        style={{ width: `${atsScore}%` }}
                      />
                    </div>
                    <small>
                      Backend ATS score analysis.
                    </small>
                  </div>

                  <button
                    className="resume-report-link"
                    onClick={() => navigate("/report")}
                  >
                    View resume report <span aria-hidden="true">→</span>
                  </button>
                </>
              ) : (
                <div className="resume-empty-state">
                  <span className="resume-empty-dot" />
                  <strong>No resume uploaded yet</strong>
                  <p>
                    Your selected resume will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="home-section" id="companies">
          <div className="home-section-heading">
            <div>
              <span className="home-eyebrow">COMPANY PREPARATION</span>
              <h2>Prepare for your target company.</h2>
              <p>
                Choose a preparation path that matches your
                placement goals.
              </p>
            </div>
            <span className="home-section-index">02 / 03</span>
          </div>

          <div className="home-company-grid">
            <article className="home-choice-card">
              <div className="home-card-topline">
                <span className="home-card-label">TECHNICAL FOCUS</span>
                <span className="home-card-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>

              <div className="home-icon-box" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="13"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M8 21h8M12 17v4M8.5 9.5l2 2-2 2M13 13.5h2.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h3>Product-based companies</h3>
              <p>
                Prepare for technical interviews, data structures,
                algorithms and problem-solving rounds.
              </p>

              <div className="home-card-tags">
                <span>DSA</span>
                <span>Algorithms</span>
                <span>Technical rounds</span>
              </div>

              <button
                className="home-card-link"
                onClick={() => navigate("/product-companies")}
              >
                Explore product companies
                <span aria-hidden="true">→</span>
              </button>
            </article>

            <article className="home-choice-card">
              <div className="home-card-topline">
                <span className="home-card-label">PLACEMENT FOCUS</span>
                <span className="home-card-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>

              <div className="home-icon-box" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 21V7.5L12 3l8 4.5V21M2.5 21h19M8 10h1M15 10h1M8 14h1M15 14h1M10 21v-4h4v4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h3>Service-based companies</h3>
              <p>
                Practise placement assessments, technical questions,
                communication and HR interviews.
              </p>

              <div className="home-card-tags">
                <span>Aptitude</span>
                <span>Technical</span>
                <span>HR rounds</span>
              </div>

              <button
                className="home-card-link"
                onClick={() => navigate("/service-companies")}
              >
                Explore service companies
                <span aria-hidden="true">→</span>
              </button>
            </article>
          </div>
        </section>

        <section className="home-section" id="coding">
          <div className="home-section-heading">
            <div>
              <span className="home-eyebrow">CODING PRACTICE</span>
              <h2>Build logic. Solve problems.</h2>
              <p>
                Improve your programming fundamentals and prepare
                for coding assessments one problem at a time.
              </p>
            </div>
            <span className="home-section-index">03 / 03</span>
          </div>

          <div className="coding-panel">
            <div className="coding-panel-content">
              <div className="home-icon-box" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3>Your next problem starts here.</h3>
                <p>
                  Practise arrays, strings, loops, linked lists,
                  trees and other coding topics.
                </p>
              </div>
            </div>

            <button
              className="home-button home-button-primary"
              onClick={() => navigate("/coding")}
            >
              Open coding practice
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <footer className="home-footer">
          <span>AI Interview Coach</span>
          <span>Prepare with purpose. Progress with practice.</span>
        </footer>
      </div>
    </main>
  );
}

export default Home;
