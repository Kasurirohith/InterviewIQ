import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume } from "../services/api";
import "./home.css";

function Home() {
  const navigate = useNavigate();
  const [resumeName, setResumeName] = useState(localStorage.getItem("resumeName") || "");
  const [atsScore, setAtsScore] = useState(Number(localStorage.getItem("atsScore")) || 0);
  const [targetRole, setTargetRole] = useState(localStorage.getItem("resumeTargetRole") || "");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(() => {
    try { return JSON.parse(localStorage.getItem("resumeAnalysis") || "null"); }
    catch { return null; }
  });
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedExtensions = /\.(pdf|docx)$/i;
    if (!allowedExtensions.test(file.name)) {
      setUploadError("Please upload a text-based PDF or DOCX resume.");
      event.target.value = "";
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const result = await uploadResume(file, targetRole, jobDescription);
      localStorage.setItem("resumeName", file.name);
      setResumeName(file.name);
      localStorage.setItem("resumeTargetRole", targetRole);
      if (typeof result.ats_score === "number") {
        localStorage.setItem("atsScore", String(result.ats_score));
        setAtsScore(result.ats_score);
      }
      const { resume_text: _resumeText, ...savedAnalysis } = result;
      localStorage.setItem("resumeAnalysis", JSON.stringify(savedAnalysis));
      setAnalysis(savedAnalysis);
      if (Array.isArray(result.questions) && result.questions.length > 0) {
        localStorage.setItem("resumeQuestions", JSON.stringify(result.questions));
      }
    } catch (error) {
      console.error("Resume upload error:", error);
      setUploadError(error.message || "Resume review failed. Please try again.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <main className="home-page">
      <div className="home-container">
        <section className="home-hero">
          <span className="home-eyebrow">YOUR CAREER PREPARATION WORKSPACE</span>
          <h1>Prepare Smarter.<br /><span>Interview With Confidence.</span></h1>
          <p className="home-hero-description">
            Everything you need to prepare for placements, improve your resume and practise interviews — all in one place.
          </p>
          <div className="home-hero-actions">
            <button className="home-button home-button-primary" onClick={() => navigate("/product-companies")}>
              Explore companies <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="home-feature-strip">
            <div><span className="feature-number">01</span><span>Resume preparation</span></div>
            <div><span className="feature-number">02</span><span>Interview practice</span></div>
          </div>
        </section>

        <section className="home-section" id="resume">
          <div className="home-section-heading">
            <div>
              <span className="home-eyebrow">RESUME</span>
              <h2>Make Your Resume Stand Out.</h2>
              <p>Get evidence-based feedback, role-specific skill gaps, and practical ways to strengthen your resume.</p>
            </div>
            <span className="home-section-index">01 / 02</span>
          </div>
          <div className="resume-panel">
            <div className="resume-panel-copy">
              <div className="home-icon-box" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M14 3.75v4h4M8.5 12h7M8.5 15.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Resume ATS Checker</h3>
              <p>Compare your resume with a target role. A job description gives the most useful skill-gap review.</p>
              <label className="resume-input-label" htmlFor="resume-target-role">TARGET ROLE</label>
              <input
                id="resume-target-role"
                className="resume-target-input"
                type="text"
                maxLength={160}
                placeholder="e.g. Frontend Developer"
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
              />
              <label className="resume-input-label" htmlFor="resume-job-description">JOB DESCRIPTION <span>OPTIONAL</span></label>
              <textarea
                id="resume-job-description"
                className="resume-job-description"
                rows={4}
                maxLength={18000}
                placeholder="Paste the job description to identify its required skills and compare them with evidence in your resume."
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
              />
              <label className="resume-upload-button">
                <input type="file" accept=".pdf,.docx" onChange={handleResumeUpload} disabled={uploading} />
                {uploading ? "Reviewing resume..." : resumeName ? "Upload A New Resume" : "Choose Resume"}
              </label>
              <span className="resume-file-hint">Supported formats: text-based PDF and DOCX · Maximum 8 MB</span>
              {uploadError && <p className="resume-upload-error" role="alert">{uploadError}</p>}
            </div>
            <div className="resume-status">
              <span className="resume-status-label">CURRENT RESUME</span>
              {resumeName ? (
                <>
                  <div className="resume-file-name">
                    <span className="resume-file-symbol">{resumeName.toLowerCase().endsWith(".docx") ? "DOCX" : "PDF"}</span>
                    <span title={resumeName}>{resumeName}</span>
                  </div>
                  <div className="resume-score">
                    <span>Latest Resume Estimate</span>
                    <strong>{atsScore}%</strong>
                    <div className="resume-score-track">
                      <div className="resume-score-fill" style={{ width: atsScore + "%" }} />
                    </div>
                    <small>{analysis?.score_basis || "Upload again to see the detailed resume review."}</small>
                  </div>
                  <button className="resume-report-link" onClick={() => navigate("/report")}>
                    View resume report <span aria-hidden="true">→</span>
                  </button>
                </>
              ) : (
                <div className="resume-empty-state">
                  <span className="resume-empty-dot" />
                  <strong>No resume uploaded yet</strong>
                  <p>Your selected resume will appear here.</p>
                </div>
              )}
            </div>
          </div>
          {analysis && <section className="resume-analysis" aria-live="polite">
            <div className="resume-analysis-heading">
              <div>
                <span className="home-eyebrow">PERSONALIZED REVIEW</span>
                <h3>RESUME ANALYSIS</h3>
                <p>{analysis.target_role ? `Target: ${analysis.target_role}` : "Resume review"}</p>
              </div>
              <strong className="resume-analysis-score">{analysis.ats_score}<span>/100</span></strong>
            </div>
            <p className="resume-score-note">{analysis.score_basis}</p>
            <div className="resume-breakdown-grid">
              <div><span>JOB SKILL MATCH</span><strong>{analysis.score_breakdown?.job_skill_match == null ? (analysis.job_description_provided ? "No verified skills" : "Add job description") : `${analysis.score_breakdown.job_skill_match}%`}</strong></div>
              <div><span>RESUME SECTIONS</span><strong>{analysis.score_breakdown?.resume_sections ?? 0}%</strong></div>
              <div><span>MEASURABLE IMPACT</span><strong>{analysis.score_breakdown?.measurable_impact ?? 0}%</strong></div>
            </div>
            {analysis.score_breakdown?.job_skill_match == null && <p className="resume-analysis-note">{analysis.job_description_provided ? "No requirements could be verified from this job description, so the review does not guess missing skills. Check the description and upload again." : "No job description was provided, so missing role skills are not guessed. Add one above and upload again for a targeted comparison."}</p>}
            <div className="resume-analysis-columns">
              <div className="resume-analysis-block">
                <h4>MATCHED SKILLS <span>{analysis.skills?.length || 0}</span></h4>
                {analysis.skills?.length ? <ul className="resume-skill-list">{analysis.skills.map((skill) => <li key={skill.name}><strong>{skill.name}</strong><small>Resume evidence: “{skill.resume_evidence}”</small></li>)}</ul> : <p>{analysis.job_description_provided ? "No evidenced matches are available for this description." : "No job-specific skill matches to show yet."}</p>}
              </div>
              <div className="resume-analysis-block">
                <h4>MISSING JOB SKILLS <span>{analysis.missing_skills?.length || 0}</span></h4>
                {analysis.missing_skills?.length ? <ul className="resume-skill-list">{analysis.missing_skills.map((skill) => <li key={skill.name}><strong>{skill.name}</strong><small>Job requirement: “{skill.job_evidence}” · {skill.priority} priority</small></li>)}</ul> : <p>{analysis.score_breakdown?.job_skill_match == null ? (analysis.job_description_provided ? "No verifiable requirements were found." : "Paste a target job description to reveal role-specific gaps.") : "No required skills were identified as missing."}</p>}
              </div>
            </div>
            <div className="resume-analysis-columns">
              <div className="resume-analysis-block">
                <h4>RESUME STRENGTHS</h4>
                {analysis.strengths?.length ? <ul className="resume-advice-list">{analysis.strengths.map((item, index) => <li key={`${item.title}-${index}`}><strong>{item.title}</strong><small>Evidence: “{item.evidence}”</small></li>)}</ul> : <p>Add clear project and experience details for stronger evidence.</p>}
              </div>
              <div className="resume-analysis-block">
                <h4>RECOMMENDED NEXT STEPS</h4>
                {analysis.improvements?.length ? <ol className="resume-advice-list">{analysis.improvements.map((item, index) => <li key={`${item.title}-${index}`}><strong>{item.title}</strong><small>{item.action}{item.section ? ` (${item.section})` : ""}</small></li>)}</ol> : <p>Keep tailoring your resume to each role.</p>}
              </div>
            </div>
            <p className="resume-analysis-disclaimer">This is an estimate, not a guarantee of an employer’s ATS result. Verify all suggestions and include only skills and achievements you can support honestly.</p>
          </section>}
        </section>

        <section className="home-section" id="companies">
          <div className="home-section-heading">
            <div>
              <span className="home-eyebrow">COMPANY PREPARATION</span>
              <h2>Prepare For Your Target Company.</h2>
              <p>Choose a preparation path that matches your placement goals.</p>
            </div>
            <span className="home-section-index">02 / 02</span>
          </div>
          <div className="home-company-grid">
            <button className="home-button home-button-secondary" onClick={() => navigate("/product-companies")}>
              Product-based companies <span aria-hidden="true">→</span>
            </button>
            <button className="home-button home-button-secondary" onClick={() => navigate("/service-companies")}>
              Service-based companies <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <footer className="home-footer">
          <span>InterviewIQ</span>
          <span>Prepare with purpose. Progress with practice.</span>
        </footer>
      </div>
    </main>
  );
}

export default Home;
