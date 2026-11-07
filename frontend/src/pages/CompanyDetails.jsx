import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://interviewiq-api-3ww1.onrender.com";

function CompanyDetails() {
  const { name } = useParams();
  const navigate = useNavigate();

  const practiceRef = useRef(null);

  const companyData = {
    Cognizant: {
      type: "Service-Based",
      role: "GenC / GenC Pro / GenC Next",
      salary: "₹4 - 7 LPA",
      difficulty: "Medium",
      focus: [
        "SQL",
        "Java / Python",
        "HTML / CSS / JavaScript",
        "Communication",
        "Coding",
      ],
      tracks: [
        { name: "GenC", package: "₹4 - 5 LPA" },
        { name: "GenC Pro", package: "₹5 - 6 LPA" },
        { name: "GenC Next", package: "₹6 - 7 LPA" },
      ],
    },

    TCS: {
      type: "Service-Based",
      role: "Ninja / Digital / Prime",
      salary: "₹3.3 - 9 LPA",
      difficulty: "Easy-Medium",
      focus: [
        "Coding",
        "SQL",
        "Java / Python",
        "Core CS",
        "Aptitude",
      ],
      tracks: [
        { name: "Ninja", package: "₹3.3 - 4 LPA" },
        { name: "Digital", package: "₹7 - 7.5 LPA" },
        { name: "Prime", package: "₹9 LPA+" },
      ],
    },

    Infosys: {
      type: "Service-Based",
      role: "System Engineer / Specialist Programmer",
      salary: "₹3.6 - 9.5 LPA",
      difficulty: "Medium",
      focus: [
        "Java / Python",
        "SQL",
        "DBMS",
        "DSA",
        "Operating Systems",
      ],
      tracks: [
        {
          name: "System Engineer",
          package: "₹3.6 - 4.5 LPA",
        },
        {
          name: "Specialist Programmer",
          package: "₹9 - 9.5 LPA",
        },
      ],
    },

    Accenture: {
      type: "Service-Based",
      role: "ASE / FSE",
      salary: "₹4.5 - 6.5 LPA",
      difficulty: "Easy-Medium",
      focus: [
        "Pseudocode",
        "SQL",
        "Java",
        "Problem Solving",
        "Communication",
      ],
      tracks: [
        { name: "ASE", package: "₹4.5 - 5 LPA" },
        { name: "FSE", package: "₹5.5 - 6.5 LPA" },
      ],
    },

    Capgemini: {
      type: "Service-Based",
      role: "Software Engineer / Analyst",
      salary: "₹4 - 7.5 LPA",
      difficulty: "Medium",
      focus: [
        "Java / C++",
        "SQL",
        "OOP",
        "Coding",
        "Communication",
      ],
      tracks: [
        {
          name: "Software Engineer",
          package: "₹4 - 5 LPA",
        },
        {
          name: "Analyst",
          package: "₹6 - 7.5 LPA",
        },
      ],
    },

    Deloitte: {
      type: "Service-Based",
      role: "Analyst / Software Engineer",
      salary: "₹6 - 9 LPA",
      difficulty: "Medium",
      focus: [
        "SQL",
        "Problem Solving",
        "Coding",
        "CS Fundamentals",
        "Communication",
      ],
      tracks: [
        { name: "Analyst", package: "₹6 - 7 LPA" },
        {
          name: "Software Engineer",
          package: "₹7 - 9 LPA",
        },
      ],
    },

    Google: {
      type: "Product-Based",
      role: "Software Engineer / SDE",
      salary: "₹35 - 45 LPA",
      difficulty: "Hard",
      focus: [
        "Advanced DSA",
        "Algorithms",
        "System Design",
        "Problem Solving",
      ],
      tracks: [
        {
          name: "Software Engineer",
          package: "₹35 - 45 LPA",
        },
        {
          name: "SDE",
          package: "₹35 - 45 LPA",
        },
      ],
    },

    Microsoft: {
      type: "Product-Based",
      role: "Software Engineer / SDE",
      salary: "₹40 - 50 LPA",
      difficulty: "Hard",
      focus: [
        "DSA",
        "Algorithms",
        "OOP",
        "System Design",
      ],
      tracks: [
        {
          name: "Software Engineer",
          package: "₹40 - 50 LPA",
        },
        {
          name: "SDE",
          package: "₹40 - 50 LPA",
        },
      ],
    },

    Amazon: {
      type: "Product-Based",
      role: "SDE-1",
      salary: "₹28 - 32 LPA",
      difficulty: "Medium-Hard",
      focus: [
        "DSA",
        "Problem Solving",
        "OOP",
        "Leadership Principles",
      ],
      tracks: [
        {
          name: "SDE-1",
          package: "₹28 - 32 LPA",
        },
        {
          name: "Software Development",
          package: "₹28 - 32 LPA",
        },
      ],
    },
    Zoho: {
      type: "Product-Based",
      role: "Software Developer / Product Engineer",
      salary: "Varies by role and location",
      difficulty: "Medium-Hard",
      focus: ["Programming Fundamentals", "Problem Solving", "Data Structures and Algorithms", "SQL", "Aptitude"],
      tracks: [
        { name: "Software Developer", package: "Varies by role" },
        { name: "Product Engineer", package: "Varies by role" },
      ],
    },
    Swiggy: {
      type: "Product-Based",
      role: "Software Engineer / Backend Engineer",
      salary: "Varies by role and location",
      difficulty: "Hard",
      focus: ["Data Structures and Algorithms", "Backend Development", "System Design", "Databases and SQL", "Behavioral Interviews"],
      tracks: [
        { name: "Software Engineer", package: "Varies by role" },
        { name: "Backend Engineer", package: "Varies by role" },
      ],
    },
    Adobe: {
      type: "Product-Based",
      role: "Software Engineer",
      salary: "Varies by role and location",
      difficulty: "Hard",
      focus: ["Data Structures and Algorithms", "Object-Oriented Programming", "Problem Solving", "System Design", "Behavioral Interviews"],
      tracks: [
        { name: "Software Engineer", package: "Varies by role" },
        { name: "Software Engineer Intern", package: "Varies by role" },
      ],
    },
  };

  const matchedKey = Object.keys(companyData).find(
    (key) =>
      key.toLowerCase() ===
      decodeURIComponent(name || "").toLowerCase()
  );

  const company = matchedKey
    ? companyData[matchedKey]
    : null;

  const [selectedTrack, setSelectedTrack] = useState("");
  const [activeModule, setActiveModule] = useState(null);
  const [completedModules, setCompletedModules] = useState([]);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState("");
  const [practiceScore, setPracticeScore] = useState(null);
  const [practiceLoading, setPracticeLoading] = useState(false);

  useEffect(() => {
    if (!company) return;
    setSelectedTrack(company.tracks[0].name);
  }, [matchedKey]);

  useEffect(() => {
    if (!matchedKey || !selectedTrack) return;

    localStorage.setItem("targetCompany", matchedKey);
    localStorage.setItem("targetTrack", selectedTrack);

    const key = `progress_${matchedKey}_${selectedTrack}`;
    const saved = JSON.parse(localStorage.getItem(key)) || [];
    setCompletedModules(saved);
  }, [matchedKey, selectedTrack]);

  if (!company) {
    return (
      <div className="company-details-page" style={notFound}>
        <h1>Company Not Found</h1>
        <button onClick={() => navigate("/")} style={primaryButton}>
          Back Home
        </button>
      </div>
    );
  }

  const modules = getModules(matchedKey, selectedTrack);

  const progress =
    modules.length === 0
      ? 0
      : Math.round(
          (completedModules.length / modules.length) * 100
        );

  const selectModule = (module) => {
    const comp = encodeURIComponent(matchedKey);
    const moduleName = String(module.title || "").toLowerCase();

    if (
      moduleName.includes("communication") ||
      moduleName.includes("behavioral") ||
      moduleName.includes("behavioural") ||
      moduleName.includes("hr")
    ) {
      navigate(`/interview/${comp}`);
      return;
    }

    navigate(
      `/practice/${comp}/${encodeURIComponent(module.title)}`
    );
  };

  const submitPractice = async () => {
    if (!practiceAnswer.trim()) {
      alert("Please enter your answer.");
      return;
    }

    try {
      setPracticeLoading(true);

      const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answer: practiceAnswer,
        }),
      });

      const result = await response.json();

      setPracticeFeedback(
        result.feedback || "Answer evaluated successfully."
      );

      setPracticeScore(Number(result.score) || 0);
    } catch (error) {
      console.error(error);
      setPracticeFeedback(
        "Backend connection failed. Please make sure the backend is running."
      );
    } finally {
      setPracticeLoading(false);
    }
  };

  const completeModule = () => {
    if (!activeModule) return;

    if (completedModules.includes(activeModule.id)) {
      return;
    }

    const updated = [...completedModules, activeModule.id];
    setCompletedModules(updated);

    const key = `progress_${matchedKey}_${selectedTrack}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const openInterview = () => {
    localStorage.setItem("targetCompany", matchedKey);
    localStorage.setItem("targetTrack", selectedTrack);
    navigate(`/interview/${encodeURIComponent(matchedKey)}`);
  };

  const openCoding = () => {
    localStorage.setItem("targetCompany", matchedKey);
    localStorage.setItem("targetTrack", selectedTrack);
    navigate("/coding");
  };

  return (
    <div className="company-details-page" style={page}>
      <div style={container}>
        <button
          onClick={() =>
            navigate(
              company.type === "Product-Based"
                ? "/product-companies"
                : "/service-companies"
            )
          }
          style={backButton}
        >
          ← Back to Companies
        </button>

        {/* HEADER */}
        <div style={hero}>
          <div>
            <span style={badge}>{company.type}</span>
            <h1 style={heroTitle}>{matchedKey}</h1>
            <p style={muted}>
              Company-specific AI Interview Preparation
            </p>
          </div>

          <div style={heroScore}>
            <span>Preparation</span>
            <strong>{progress}%</strong>
            <small>
              {completedModules.length} / {modules.length} modules
            </small>
          </div>
        </div>

        {/* INFO */}
        <div style={infoGrid}>
          <InfoCard title="Target Role" value={company.role} />
          <InfoCard title="Package Range" value={company.salary} />
          <InfoCard title="Difficulty" value={company.difficulty} />
          <InfoCard
            title="ATS Score"
            value={
              localStorage.getItem("atsScore")
                ? `${localStorage.getItem("atsScore")}%`
                : "Not Checked"
            }
          />
        </div>

        {/* ACTIONS */}
        <section style={section}>
          <h2>What do you want to prepare?</h2>

          <div style={actionGrid}>
            <button
              onClick={openInterview}
              style={actionButton}
            >
              Interview Practice
              <small style={actionButtonSmall}>
                Technical + HR + Behavioral
              </small>
            </button>

            <button onClick={openCoding} style={actionButton}>
              Coding Practice
              <small style={actionButtonSmall}>
                Company-specific coding
              </small>
            </button>
          </div>
        </section>

        {/* TRACK */}
        <section style={section}>
          <h2>Choose Your Preparation Track</h2>

          <div style={trackGrid}>
            {company.tracks.map((track) => (
              <button
                key={track.name}
                onClick={() => {
                  setSelectedTrack(track.name);
                  setActiveModule(null);
                }}
                style={{
                  ...trackButton,
                  background: "#ffffff",
                  color: "#171717",
                  border: "1px solid #e5e5e5",
                }}
              >
                <strong>{track.name}</strong>
                <span>{track.package}</span>
              </button>
            ))}
          </div>
        </section>

        {/* DAILY PREPARATION */}
        <section style={section}>
          <h2>Daily Preparation</h2>
          <p style={muted}>
            Practice modules tailored to <strong>{matchedKey}</strong> and{" "}
            <strong>{selectedTrack}</strong>.
          </p>

          <div style={moduleGrid}>
            {modules.map((module) => {
              const completed = completedModules.includes(module.id);
              const selected = activeModule?.id === module.id;

              return (
                <div
                  key={module.id}
                  style={{
                    ...moduleCard,
                    border: selected
                      ? "2px solid #171717"
                      : "1px solid #e5e5e5",
                  }}
                >
                  <div style={moduleIcon}>{module.icon}</div>
                  <h3>{module.title}</h3>
                  <p style={moduleDescription}>{module.description}</p>

                  <button
                    onClick={() => selectModule(module)}
                    style={practiceButton}
                  >
                    {completed ? "Practice Again" : "Open Practice →"}
                  </button>

                  {completed && (
                    <span
                      style={{
                        color: "#171717",
                        fontSize: "13px",
                        marginTop: "8px",
                        fontWeight: "600",
                      }}
                    >
                      ✓ Completed
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* PRACTICE AREA */}
        {activeModule && (
          <section ref={practiceRef} style={practicePanel}>
            <div style={practiceHeader}>
              <div>
                <div style={moduleIcon}>{activeModule.icon}</div>
                <h2>{activeModule.title}</h2>
                <p style={muted}>{activeModule.description}</p>
              </div>

              <button
                onClick={() => setActiveModule(null)}
                style={closeButton}
              >
                ✕ Close
              </button>
            </div>

            <div style={questionBox}>
              <span style={questionLabel}>Practice Question</span>
              <h3>{activeModule.question}</h3>

              <textarea
                value={practiceAnswer}
                onChange={(e) => setPracticeAnswer(e.target.value)}
                placeholder={"Write your answer here..."}
                style={textarea}
              />

              <div style={practiceActions}>
                <button
                  onClick={submitPractice}
                  disabled={practiceLoading}
                  style={primaryButton}
                >
                  {practiceLoading ? "Evaluating..." : "Submit Answer"}
                </button>
              </div>
            </div>

            {practiceFeedback && (
              <div style={feedbackBox}>
                <div>
                  <strong>AI Feedback</strong>
                  {practiceScore !== null && (
                    <span style={score}>{practiceScore}/10</span>
                  )}
                </div>
                <p>{practiceFeedback}</p>
              </div>
            )}

            {practiceFeedback && (
              <button onClick={completeModule} style={completeButton}>
                ✓ Mark Module Complete
              </button>
            )}
          </section>
        )}

        {/* FOCUS */}
        <section style={section}>
          <h2>Main Preparation Areas</h2>

          <div style={focusGrid}>
            {company.focus.map((item) => (
              <div key={item} style={focusCard}>
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================
   MODULE DATA
========================= */

function getModules(company, track) {
  const sql = {
    id: "sql",
    icon: "🗄️",
    title: "SQL Practice",
    description: "Practice SQL queries, joins, grouping and subqueries.",
    question:
      "Write a SQL query to find employees whose salary is greater than the average salary.",
  };

  const programming = {
    id: "programming",
    icon: "💻",
    title: "Programming",
    description: "Practice Java, Python and programming concepts.",
    question:
      "Explain the difference between an array and a linked list. Give one practical use case for each.",
  };

  const web = {
    id: "web",
    icon: "🌐",
    title: "Web Technologies",
    description: "Practice HTML, CSS and JavaScript.",
    question:
      "Explain the difference between HTML, CSS and JavaScript and describe how they work together.",
  };

  const coding = {
    id: "coding",
    icon: "🧠",
    title: "Coding Practice",
    description: "Solve company-level coding questions.",
    question:
      "Write a program to find the largest element in an array and explain its time complexity.",
  };

  const dsa = {
    id: "dsa",
    icon: "🌳",
    title: "DSA Practice",
    description: "Practice arrays, strings, trees and algorithms.",
    question: "Explain binary search and its time complexity.",
  };

  const communication = {
    id: "communication",
    icon: "🎤",
    title: "Communication",
    description: "Practice HR and technical communication.",
    question:
      "Tell me about yourself and explain one important technical project you completed.",
  };

  const aptitude = {
    id: "aptitude",
    icon: "🧮",
    title: "Aptitude Practice",
    description: "Practice quantitative and logical reasoning.",
    question: "A train travels 120 km in 2 hours. What is its average speed?",
  };

  const pseudocode = {
    id: "pseudocode",
    icon: "🧩",
    title: "Pseudocode",
    description: "Practice logical thinking and pseudocode.",
    question:
      "What will be the output of a loop that prints all even numbers from 1 to 10?",
  };

  const system = {
    id: "system",
    icon: "🏗️",
    title: "System Design",
    description: "Practice architecture and scalable systems.",
    question: "Explain how you would design a scalable online interview platform.",
  };

  const behavioral = {
    id: "behavioral",
    icon: "🎯",
    title: "Behavioral",
    description: "Practice behavioral interview questions.",
    question:
      "Tell me about a difficult problem you faced and how you solved it.",
  };

  if (company === "Cognizant") {
    if (track === "GenC") {
      return [sql, programming, web, communication];
    }
    if (track === "GenC Pro") {
      return [sql, programming, dsa, communication];
    }
    return [dsa, programming, sql, communication];
  }

  if (company === "TCS") {
    if (track === "Ninja") {
      return [aptitude, programming, sql, communication];
    }
    return [programming, dsa, sql, communication];
  }

  if (company === "Infosys") {
    return [programming, sql, dsa, communication];
  }

  if (company === "Accenture") {
    return [pseudocode, sql, programming, communication];
  }

  if (company === "Google") {
    return [dsa, system, programming, behavioral];
  }

  if (company === "Microsoft") {
    return [dsa, programming, system, communication];
  }

  if (company === "Amazon") {
    return [dsa, programming, system, behavioral];
  }

  if (company === "Zoho") return [aptitude, programming, dsa, sql];
  if (company === "Swiggy") return [dsa, programming, system, behavioral];
  if (company === "Adobe") return [dsa, programming, system, communication];

  return [programming, sql, communication];
}

/* =========================
   COMPONENT
========================= */

function InfoCard({ title, value }) {
  return (
    <div style={infoCard}>
      <small style={{ color: "#737373" }}>{title}</small>
      <strong style={{ color: "#171717" }}>{value}</strong>
    </div>
  );
}

/* =========================
   STYLES
========================= */

const page = {
  minHeight: "100vh",
  padding: "40px 20px",
  background: "#ffffff",
  color: "#171717",
  boxSizing: "border-box",
};

const container = {
  width: "95%",
  maxWidth: "1150px",
  margin: "0 auto",
};

const section = {
  background: "#ffffff",
  color: "#171717",
  border: "1px solid #e5e5e5",
  borderRadius: "16px",
  padding: "25px",
  marginTop: "20px",
};

const hero = {
  background: "#ffffff",
  color: "#171717",
  border: "1px solid #e5e5e5",
  borderRadius: "20px",
  padding: "30px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  flexWrap: "wrap",
};

const heroTitle = {
  color: "#171717",
  fontSize: "clamp(2rem, 5vw, 3.2rem)",
  margin: "15px 0 8px",
};

const heroScore = {
  background: "#f7f7f7",
  color: "#171717",
  padding: "20px",
  border: "1px solid #e5e5e5",
  borderRadius: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};

const badge = {
  background: "#f5f5f5",
  color: "#171717",
  border: "1px solid #dedede",
  padding: "7px 14px",
  borderRadius: "20px",
  fontSize: "13px",
  fontWeight: "700",
};

const muted = {
  color: "#737373",
  lineHeight: "1.6",
};

const infoGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: "15px",
  marginTop: "20px",
};

const infoCard = {
  background: "#ffffff",
  color: "#171717",
  border: "1px solid #e5e5e5",
  borderRadius: "14px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const actionGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
  gap: "15px",
  marginTop: "20px",
};

const actionButton = {
  background: "#ffffff",
  color: "#171717",
  border: "1px solid #e5e5e5",
  padding: "18px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "15px",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  textAlign: "left",
};

const actionButtonSmall = {
  color: "#737373",
  background: "transparent",
  fontSize: "13px",
  fontWeight: "400",
};

const trackGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: "12px",
  marginTop: "20px",
};

const trackButton = {
  border: "1px solid #e5e5e5",
  padding: "18px",
  borderRadius: "12px",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  textAlign: "left",
};

const moduleGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
  gap: "20px",
  marginTop: "25px",
};

const moduleCard = {
  background: "#ffffff",
  color: "#171717",
  border: "1px solid #e5e5e5",
  borderRadius: "16px",
  padding: "25px",
  minHeight: "230px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
};

const moduleIcon = {
  fontSize: "42px",
  marginBottom: "10px",
};

const moduleDescription = {
  color: "#737373",
  lineHeight: "1.5",
  minHeight: "50px",
};

const practiceButton = {
  width: "100%",
  marginTop: "auto",
  padding: "13px",
  background: "#171717",
  color: "white",
  border: "1px solid #171717",
  borderRadius: "9px",
  cursor: "pointer",
  fontWeight: "700",
};

const practicePanel = {
  background: "#ffffff",
  color: "#171717",
  border: "2px solid #171717",
  borderRadius: "18px",
  padding: "30px",
  marginTop: "25px",
  scrollMarginTop: "30px",
};

const practiceHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
};

const closeButton = {
  background: "#f7f7f7",
  color: "#171717",
  border: "1px solid #e5e5e5",
  padding: "9px 15px",
  borderRadius: "8px",
  cursor: "pointer",
};

const questionBox = {
  background: "#f7f7f7",
  color: "#171717",
  border: "1px solid #e5e5e5",
  borderRadius: "14px",
  padding: "25px",
  marginTop: "20px",
};

const questionLabel = {
  color: "#171717",
  fontWeight: "700",
};

const textarea = {
  width: "100%",
  minHeight: "180px",
  boxSizing: "border-box",
  marginTop: "20px",
  padding: "15px",
  background: "#ffffff",
  color: "#171717",
  border: "1px solid #e5e5e5",
  borderRadius: "10px",
  resize: "vertical",
  fontFamily: "inherit",
  fontSize: "15px",
};

const practiceActions = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "15px",
};

const feedbackBox = {
  background: "#f7f7f7",
  border: "1px solid #e5e5e5",
  borderRadius: "12px",
  padding: "20px",
  marginTop: "20px",
  color: "#171717",
};

const score = {
  float: "right",
  color: "#171717",
  fontSize: "20px",
  fontWeight: "800",
};

const completeButton = {
  marginTop: "15px",
  padding: "12px 20px",
  background: "#171717",
  color: "white",
  border: "1px solid #171717",
  borderRadius: "9px",
  cursor: "pointer",
  fontWeight: "700",
};

const focusGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "20px",
};

const focusCard = {
  background: "#f7f7f7",
  color: "#171717",
  border: "1px solid #e5e5e5",
  padding: "12px 16px",
  borderRadius: "10px",
};

const primaryButton = {
  background: "#171717",
  color: "white",
  border: "1px solid #171717",
  padding: "13px 20px",
  borderRadius: "9px",
  cursor: "pointer",
  fontWeight: "700",
};

const backButton = {
  background: "#f7f7f7",
  color: "#171717",
  border: "1px solid #e5e5e5",
  padding: "10px 18px",
  borderRadius: "9px",
  cursor: "pointer",
  marginBottom: "25px",
};

const notFound = {
  minHeight: "60vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "15px",
};

export default CompanyDetails;

