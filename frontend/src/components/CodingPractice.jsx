import "./CodingPractice.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CodingPractice() {
  const navigate = useNavigate();

  const [targetCompany, setTargetCompany] = useState(
    localStorage.getItem("targetCompany") || ""
  );

  const [targetTrack, setTargetTrack] = useState(
    localStorage.getItem("targetTrack") || ""
  );

  useEffect(() => {
    const updateTarget = () => {
      setTargetCompany(localStorage.getItem("targetCompany") || "");
      setTargetTrack(localStorage.getItem("targetTrack") || "");
    };

    updateTarget();

    window.addEventListener("storage", updateTarget);

    return () => {
      window.removeEventListener("storage", updateTarget);
    };
  }, []);

  const companyTopics = {
    Cognizant: [
      { name: "Arrays", problems: 20, link: "https://leetcode.com/tag/array/" },
      { name: "Strings", problems: 20, link: "https://leetcode.com/tag/string/" },
      { name: "SQL", problems: 25, link: "https://www.hackerrank.com/domains/sql" },
      { name: "Basic DSA", problems: 20, link: "https://leetcode.com/problemset/" },
      { name: "Problem Solving", problems: 15, link: "https://leetcode.com/problemset/" },
    ],

    TCS: [
      { name: "Arrays", problems: 20, link: "https://leetcode.com/tag/array/" },
      { name: "Strings", problems: 20, link: "https://leetcode.com/tag/string/" },
      { name: "SQL", problems: 25, link: "https://www.hackerrank.com/domains/sql" },
      { name: "Basic Programming", problems: 25, link: "https://leetcode.com/problemset/" },
      { name: "Aptitude", problems: 20, link: "https://www.indiabix.com/aptitude/questions-and-answers/" },
    ],

    Infosys: [
      { name: "Arrays", problems: 25, link: "https://leetcode.com/tag/array/" },
      { name: "Strings", problems: 20, link: "https://leetcode.com/tag/string/" },
      { name: "SQL", problems: 25, link: "https://www.hackerrank.com/domains/sql" },
      { name: "DSA", problems: 25, link: "https://leetcode.com/problemset/" },
      { name: "Problem Solving", problems: 20, link: "https://leetcode.com/problemset/" },
    ],

    Accenture: [
      { name: "Arrays", problems: 20, link: "https://leetcode.com/tag/array/" },
      { name: "Strings", problems: 20, link: "https://leetcode.com/tag/string/" },
      { name: "SQL", problems: 25, link: "https://www.hackerrank.com/domains/sql" },
      { name: "Pseudocode", problems: 20, link: "https://www.geeksforgeeks.org/pseudocode/" },
      { name: "Coding", problems: 20, link: "https://leetcode.com/problemset/" },
    ],

    Capgemini: [
      { name: "Arrays", problems: 20, link: "https://leetcode.com/tag/array/" },
      { name: "Strings", problems: 20, link: "https://leetcode.com/tag/string/" },
      { name: "SQL", problems: 25, link: "https://www.hackerrank.com/domains/sql" },
      { name: "OOP", problems: 15, link: "https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/" },
      { name: "Coding", problems: 20, link: "https://leetcode.com/problemset/" },
    ],

    Deloitte: [
      { name: "SQL", problems: 25, link: "https://www.hackerrank.com/domains/sql" },
      { name: "Arrays", problems: 20, link: "https://leetcode.com/tag/array/" },
      { name: "Problem Solving", problems: 20, link: "https://leetcode.com/problemset/" },
      { name: "Data Structures", problems: 20, link: "https://leetcode.com/problemset/" },
      { name: "Coding", problems: 20, link: "https://leetcode.com/problemset/" },
    ],

    Google: [
      { name: "Arrays", problems: 30, link: "https://leetcode.com/tag/array/" },
      { name: "Strings", problems: 25, link: "https://leetcode.com/tag/string/" },
      { name: "Trees", problems: 30, link: "https://leetcode.com/tag/tree/" },
      { name: "Graphs", problems: 30, link: "https://leetcode.com/tag/graph/" },
      { name: "Dynamic Programming", problems: 30, link: "https://leetcode.com/tag/dynamic-programming/" },
      { name: "Advanced DSA", problems: 35, link: "https://leetcode.com/problemset/" },
    ],

    Microsoft: [
      { name: "Arrays", problems: 25, link: "https://leetcode.com/tag/array/" },
      { name: "Strings", problems: 20, link: "https://leetcode.com/tag/string/" },
      { name: "Linked List", problems: 20, link: "https://leetcode.com/tag/linked-list/" },
      { name: "Trees", problems: 25, link: "https://leetcode.com/tag/tree/" },
      { name: "Graphs", problems: 25, link: "https://leetcode.com/tag/graph/" },
      { name: "Dynamic Programming", problems: 25, link: "https://leetcode.com/tag/dynamic-programming/" },
    ],

    Amazon: [
      { name: "Arrays", problems: 25, link: "https://leetcode.com/tag/array/" },
      { name: "Strings", problems: 20, link: "https://leetcode.com/tag/string/" },
      { name: "Trees", problems: 25, link: "https://leetcode.com/tag/tree/" },
      { name: "Graphs", problems: 20, link: "https://leetcode.com/tag/graph/" },
      { name: "Dynamic Programming", problems: 25, link: "https://leetcode.com/tag/dynamic-programming/" },
      { name: "Hash Table", problems: 20, link: "https://leetcode.com/tag/hash-table/" },
    ],

    Zoho: [
      { name: "Arrays and Strings", problems: 25, link: "https://leetcode.com/tag/array/" },
      { name: "Sorting and Searching", problems: 20, link: "https://leetcode.com/problemset/" },
      { name: "Problem Solving", problems: 25, link: "https://leetcode.com/problemset/" },
      { name: "SQL", problems: 20, link: "https://www.hackerrank.com/domains/sql" },
      { name: "Aptitude", problems: 20, link: "https://www.indiabix.com/aptitude/questions-and-answers/" },
    ],
    Swiggy: [
      { name: "Arrays and Hashing", problems: 25, link: "https://leetcode.com/tag/array/" },
      { name: "Trees and Graphs", problems: 25, link: "https://leetcode.com/tag/graph/" },
      { name: "Dynamic Programming", problems: 25, link: "https://leetcode.com/tag/dynamic-programming/" },
      { name: "Problem Solving", problems: 20, link: "https://leetcode.com/problemset/" },
      { name: "SQL", problems: 20, link: "https://www.hackerrank.com/domains/sql" },
    ],
    Adobe: [
      { name: "Arrays and Strings", problems: 25, link: "https://leetcode.com/tag/array/" },
      { name: "Trees and Graphs", problems: 25, link: "https://leetcode.com/tag/tree/" },
      { name: "Dynamic Programming", problems: 25, link: "https://leetcode.com/tag/dynamic-programming/" },
      { name: "Object-Oriented Design", problems: 15, link: "https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/" },
      { name: "Problem Solving", problems: 20, link: "https://leetcode.com/problemset/" },
    ],
  };

  const defaultTopics = [
    { name: "Arrays", problems: 25, link: "https://leetcode.com/tag/array/" },
    { name: "Strings", problems: 20, link: "https://leetcode.com/tag/string/" },
    { name: "Linked List", problems: 18, link: "https://leetcode.com/tag/linked-list/" },
    { name: "Trees", problems: 22, link: "https://leetcode.com/tag/tree/" },
    { name: "Graphs", problems: 16, link: "https://leetcode.com/tag/graph/" },
    { name: "Dynamic Programming", problems: 30, link: "https://leetcode.com/tag/dynamic-programming/" },
  ];

  const topics = companyTopics[targetCompany] || defaultTopics;

  const handlePractice = (topic) => {
    localStorage.setItem("codingTopic", topic.name);
    localStorage.setItem("codingCompany", targetCompany);
    localStorage.setItem("codingTrack", targetTrack);

    window.open(topic.link, "_blank", "noopener,noreferrer");
  };

  const backToCompany = () => {
    if (!targetCompany) {
      navigate("/service-companies");
      return;
    }

    navigate(`/company/${encodeURIComponent(targetCompany)}`);
  };

  return (
    <div className="coding-page">
      <div className="coding-container">
        <div className="coding-header">
          <div className="coding-icon"></div>

          <h1 className="coding-title">Coding Practice</h1>

          {targetCompany && (
            <h2 className="coding-company">{targetCompany}</h2>
          )}

          {targetTrack && (
            <p className="coding-track">Preparation Track: {targetTrack}</p>
          )}

          <p className="coding-subtitle">
            Practice topics selected for your company preparation.
          </p>
        </div>

        {targetCompany && (
          <div className="current-preparation">
            <span>Current Preparation</span>
            <strong>
              {targetCompany}
              {targetTrack ? ` • ${targetTrack}` : ""}
            </strong>
          </div>
        )}

        <div className="coding-grid">
          {topics.map((topic) => (
            <div className="coding-card" key={topic.name}>
              <h2>{topic.name}</h2>
              <p>{topic.problems} Problems</p>
              <button onClick={() => handlePractice(topic)}>
                Start Practice
              </button>
            </div>
          ))}
        </div>

        <div className="coding-actions">
          {targetCompany && (
            <button className="coding-back-btn" onClick={backToCompany}>
              ← Back to {targetCompany}
            </button>
          )}

          <button
            className="coding-company-btn"
            onClick={() =>
              navigate(
                targetCompany
                  ? `/company/${encodeURIComponent(targetCompany)}`
                  : "/service-companies"
              )
            }
          >
            Company Preparation
          </button>
        </div>
      </div>
    </div>
  );
}

export default CodingPractice;