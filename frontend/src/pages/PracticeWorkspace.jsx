import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PracticeWorkspace.css";

const starterCode = {
  python: `def solve():
    # Write your solution here
    pass

if __name__ == "__main__":
    solve()`,

  javascript: `function solve() {
    // Write your solution here
}

solve();`,

  sql: `-- Write your SQL query here
SELECT * FROM table_name;`,

  html: `<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>`
};

const getDefaultLanguage = (moduleName) => {
  if (moduleName === "SQL" || moduleName === "SQL Practice") {
    return "sql";
  }

  if (moduleName === "Web Technologies") {
    return "javascript";
  }

  return "python";
};

const fallbackQuestions = {
  sql: [
    {
      title: "Find the highest salary",
      topic: "SQL",
      difficulty: "Easy",
      description: "Given an Employees table with EmployeeID, Name, and Salary, write a query to find the highest salary.",
      example: "Table: Employees\n\nEmployeeID | Name | Salary\n1 | Ravi | 30000\n2 | Priya | 45000\n3 | Arun | 40000\n\nExpected output:\n45000"
    },
    {
      title: "Find duplicate records",
      topic: "SQL",
      difficulty: "Medium",
      description: "Given an Employees table, write a query to find department names that appear more than once.",
      example: "Table: Employees\n\nName | Department\nRavi | IT\nPriya | HR\nArun | IT\n\nExpected output:\nIT"
    },
    {
      title: "Calculate department salaries",
      topic: "SQL",
      difficulty: "Medium",
      description: "Write a query to calculate the total salary for each department.",
      example: "Table: Employees\n\nName | Department | Salary\nRavi | IT | 30000\nPriya | HR | 40000\nArun | IT | 35000\n\nExpected output:\nIT | 65000\nHR | 40000"
    },
    {
      title: "Join two tables",
      topic: "SQL",
      difficulty: "Medium",
      description: "Given Employees(EmployeeID, Name, DepartmentID) and Departments(DepartmentID, DepartmentName), display each employee's name and department name.",
      example: "Expected columns:\nName | DepartmentName\n\nUse an INNER JOIN."
    },
    {
      title: "Find the second-highest salary",
      topic: "SQL",
      difficulty: "Medium",
      description: "Write a query to find the second-highest distinct salary in the Employees table.",
      example: "Salaries: 30000, 45000, 40000, 45000\n\nExpected output:\n40000"
    }
  ],

  web: [
    {
      title: "Validate an email form",
      topic: "Web Technologies",
      difficulty: "Easy",
      description: "Create an HTML form with an email field and a submit button. Use JavaScript to prevent submission when the email is empty or invalid.",
      example: "Input: student@example.com\nExpected: Form accepted\n\nInput: invalid-email\nExpected: Display an error message"
    },
    {
      title: "Change text using the DOM",
      topic: "Web Technologies",
      difficulty: "Easy",
      description: "Create a button that changes the text of a paragraph to 'Welcome!' when clicked.",
      example: "Before click: Hello\nAfter click: Welcome!"
    },
    {
      title: "Create a responsive layout",
      topic: "Web Technologies",
      difficulty: "Medium",
      description: "Use HTML and CSS to create a two-column layout that changes to one column on screens narrower than 600px.",
      example: "Desktop: Two columns\nMobile: One column"
    },
    {
      title: "Validate a password",
      topic: "Web Technologies",
      difficulty: "Medium",
      description: "Write JavaScript validation that requires a password of at least eight characters containing an uppercase letter, a lowercase letter, and a number.",
      example: "Password: Abcdef12 → Valid\nPassword: abc → Invalid"
    },
    {
      title: "Build a task list",
      topic: "Web Technologies",
      difficulty: "Medium",
      description: "Create a simple task list using HTML and JavaScript. Allow users to add a task to the page when they click an Add button.",
      example: "Input: Complete assignment\nExpected: The task appears in the list"
    }
  ],

  programming: [
    {
      title: "Find the highest number",
      topic: "Python",
      difficulty: "Easy",
      description: "Use a loop to find the largest number in a list without using max().",
      example: "Input: [12, 45, 7, 89, 23]\nExpected output: 89"
    },
    {
      title: "Find the lowest number",
      topic: "Python",
      difficulty: "Easy",
      description: "Use a loop to find the smallest number in a list without using min().",
      example: "Input: [12, 45, 7, 89, 23]\nExpected output: 7"
    },
    {
      title: "Count even numbers",
      topic: "Python",
      difficulty: "Easy",
      description: "Count how many even numbers are present in a list using a loop.",
      example: "Input: [2, 5, 8, 11, 14]\nExpected output: 3"
    },
    {
      title: "Calculate the sum",
      topic: "Python",
      difficulty: "Easy",
      description: "Calculate the sum of all numbers in a list using a loop.",
      example: "Input: [10, 20, 30, 40]\nExpected output: 100"
    },
    {
      title: "Reverse a string",
      topic: "Python",
      difficulty: "Easy",
      description: "Reverse a string without using slicing or a built-in reverse function.",
      example: "Input: hello\nExpected output: olleh"
    }
  ],

  dsa: [
    {
      title: "Two Sum",
      topic: "DSA",
      difficulty: "Easy",
      description: "Given an array of integers and a target, find the indices of two numbers whose sum equals the target.",
      example: "Input: nums = [2, 7, 11, 15], target = 9\nExpected output: [0, 1]"
    },
    {
      title: "Binary Search",
      topic: "DSA",
      difficulty: "Easy",
      description: "Find the index of a target value in a sorted array using binary search. Return -1 if it is absent.",
      example: "Input: nums = [1, 3, 5, 7, 9], target = 7\nExpected output: 3"
    },
    {
      title: "Check a palindrome",
      topic: "DSA",
      difficulty: "Easy",
      description: "Determine whether a string reads the same forward and backward.",
      example: "Input: level\nExpected output: True"
    },
    {
      title: "Find the missing number",
      topic: "DSA",
      difficulty: "Easy",
      description: "An array contains distinct numbers from 0 through n with one number missing. Find the missing number.",
      example: "Input: [3, 0, 1]\nExpected output: 2"
    },
    {
      title: "Maximum subarray sum",
      topic: "DSA",
      difficulty: "Medium",
      description: "Find the largest sum of a non-empty contiguous subarray.",
      example: "Input: [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nExpected output: 6"
    }
  ],

  aptitude: [
    { title: "Discounted price", topic: "Percentages", difficulty: "Easy", description: "A jacket costs ₹1,500. A shop gives a 20% discount. What is the selling price?", example: "Choose one answer.", options: ["₹1,000", "₹1,200", "₹1,250", "₹1,300"], correctAnswer: "₹1,200", explanation: "20% of ₹1,500 is ₹300. Subtract the discount: ₹1,500 − ₹300 = ₹1,200." },
    { title: "Divide in a ratio", topic: "Ratios", difficulty: "Easy", description: "A class has 64 students. The ratio of boys to girls is 3:5. How many girls are there?", example: "Choose one answer.", options: ["24", "32", "40", "48"], correctAnswer: "40", explanation: "There are 8 equal parts. Each part is 64 ÷ 8 = 8, so there are 5 × 8 = 40 girls." },
    { title: "Average speed", topic: "Speed, time and distance", difficulty: "Easy", description: "A bus travels 180 km in 3 hours at a constant speed. What is its average speed?", example: "Choose one answer.", options: ["45 km/h", "50 km/h", "60 km/h", "90 km/h"], correctAnswer: "60 km/h", explanation: "Average speed = distance ÷ time = 180 ÷ 3 = 60 km/h." },
    { title: "Calculate profit percentage", topic: "Profit and loss", difficulty: "Easy", description: "A shopkeeper buys a bag for ₹500 and sells it for ₹575. What is the profit percentage?", example: "Choose one answer.", options: ["10%", "12%", "15%", "20%"], correctAnswer: "15%", explanation: "Profit = ₹75. Profit percentage = 75 ÷ 500 × 100 = 15%." },
    { title: "Two people complete a job", topic: "Time and work", difficulty: "Medium", description: "Worker A can finish a job in 12 days and worker B in 18 days. How long will they take working together at the same rates?", example: "Choose one answer.", options: ["6 days", "7.2 days", "8 days", "15 days"], correctAnswer: "7.2 days", explanation: "Their combined daily rate is 1/12 + 1/18 = 5/36 of the job. The time is 36/5 = 7.2 days." },
    { title: "Find the average score", topic: "Averages", difficulty: "Easy", description: "A student scores 12, 18, 20, 25 and 25 points in five tests. What is the average score?", example: "Choose one answer.", options: ["18", "20", "21", "22"], correctAnswer: "20", explanation: "The total is 100. Divide by 5 tests to get an average of 20." },
    { title: "Continue the number pattern", topic: "Number series", difficulty: "Medium", description: "What number comes next in this sequence? 3, 8, 15, 24, 35, …", example: "Choose one answer.", options: ["42", "46", "48", "50"], correctAnswer: "48", explanation: "The differences are 5, 7, 9 and 11. The next difference is 13, so 35 + 13 = 48." },
    { title: "Simple interest", topic: "Interest", difficulty: "Medium", description: "What simple interest is earned on ₹8,000 at 7% per year for 3 years?", example: "Choose one answer.", options: ["₹1,120", "₹1,480", "₹1,680", "₹2,080"], correctAnswer: "₹1,680", explanation: "Simple interest = 8,000 × 7 × 3 ÷ 100 = ₹1,680." },
    { title: "Probability of an even number", topic: "Probability", difficulty: "Easy", description: "A fair six-sided die is rolled once. What is the probability of getting an even number?", example: "Choose one answer.", options: ["1/6", "1/3", "1/2", "2/3"], correctAnswer: "1/2", explanation: "The even outcomes are 2, 4 and 6: 3 out of 6 equally likely outcomes. 3/6 = 1/2." },
    { title: "Read a small data set", topic: "Data interpretation", difficulty: "Medium", description: "A store sells 120, 150, 180, 150 and 200 notebooks from Monday to Friday. What is the average number sold per day?", example: "Choose one answer.", options: ["150", "155", "160", "170"], correctAnswer: "160", explanation: "Total sales are 800. Divide by 5 days: 800 ÷ 5 = 160." }
  ]
};

function getFallbackQuestions(moduleName) {
  const name = moduleName.toLowerCase();

  if (name.includes("sql") || name.includes("database")) {
    return fallbackQuestions.sql;
  }

  if (name.includes("aptitude")) {
    return fallbackQuestions.aptitude;
  }

  if (name.includes("web") || name.includes("html") ||
      name.includes("javascript")) {
    return fallbackQuestions.web;
  }

  if (name.includes("dsa") || name.includes("data structure") ||
      name.includes("algorithm")) {
    return fallbackQuestions.dsa;
  }

  return fallbackQuestions.programming;
}

function PracticeWorkspace() {
  const navigate = useNavigate();
  const { company, module } = useParams();

  const moduleName = decodeURIComponent(module || "DSA Practice");

  const defaultLang = getDefaultLanguage(moduleName);

  const [questions, setQuestions] = useState([]);
  const [selectedId, setSelectedId] = useState(0);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [questionError, setQuestionError] = useState("");

  const [language, setLanguage] = useState(defaultLang);
  const [code, setCode] = useState(starterCode[defaultLang] || starterCode.python);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const isAptitude = moduleName.toLowerCase().includes("aptitude");

  // Update default language and template if the module changes
  useEffect(() => {
    const newDefaultLang = getDefaultLanguage(moduleName);
    setLanguage(newDefaultLang);
    setCode(starterCode[newDefaultLang] || starterCode.python);
  }, [moduleName]);

  useEffect(() => {
    let cancelled = false;

    async function loadQuestions() {
      setQuestionLoading(true);
      setQuestionError("");
      setQuestions([]);
      setSelectedId(0);

      if (moduleName.toLowerCase().includes("aptitude")) {
        setQuestions(fallbackQuestions.aptitude.map((item, index) => ({ ...item, id: index })));
        setQuestionLoading(false);
        return;
      }

      try {
        const API_URL =
          import.meta.env.VITE_API_URL ||
          "https://interviewiq-api-3ww1.onrender.com";

        const historyKey = `practiceQuestions:${moduleName}`;
        const previousQuestions = JSON.parse(
          localStorage.getItem(historyKey) || "[]"
        );

        const response = await fetch(`${API_URL}/generate-questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: company || "General",
            topic: moduleName,
            category: "Coding",
            difficulty: "Mixed",
            count: 5,
            previous_questions: previousQuestions,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.detail || "Unable to generate practice questions."
          );
        }

        if (!Array.isArray(result.questions) || result.questions.length === 0) {
          throw new Error("The AI did not return any questions.");
        }

        if (cancelled) return;

        const formattedQuestions = result.questions.map((item, index) => {
          const text =
            typeof item === "string" ? item : item.question || "";

          return {
            id: index,
            title: item.title || `${moduleName} — Problem ${index + 1}`,
            topic: item.topic || moduleName,
            difficulty: item.difficulty || "Mixed",
            description: text,
            example: item.example || "See the problem statement above.",
          };
        });

        setQuestions(formattedQuestions);

        const generated = formattedQuestions
          .map((item) => item.description)
          .filter(Boolean);

        localStorage.setItem(
          historyKey,
          JSON.stringify([...previousQuestions, ...generated].slice(-50))
        );
      } catch (error) {
        if (!cancelled) {
          console.warn("API question generation failed, using fallback questions:", error);
          const fallbacks = getFallbackQuestions(moduleName);
          const formattedFallbacks = fallbacks.map((item, index) => ({
            id: index,
            title: item.title,
            topic: item.topic,
            difficulty: item.difficulty,
            description: item.description,
            example: item.example,
          }));
          setQuestions(formattedFallbacks);
        }
      } finally {
        if (!cancelled) {
          setQuestionLoading(false);
        }
      }
    }

    loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [company, moduleName]);

  const selectedQuestion =
    questions.find((question) => question.id === selectedId) ||
    questions[0];

  const chooseLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setCode(starterCode[nextLanguage] || starterCode.python);
    setOutput("");
  };

  const checkAptitudeAnswer = () => {
    if (!selectedAnswer || !selectedQuestion) return;
    const correct = selectedAnswer === selectedQuestion.correctAnswer;
    setAnswerFeedback({
      correct,
      message: correct
        ? `Correct. ${selectedQuestion.explanation}`
        : `Not quite. The correct answer is ${selectedQuestion.correctAnswer}. ${selectedQuestion.explanation}`,
    });
  };

  const reviewCode = async () => {
    if (!code.trim()) {
      setOutput("Enter your code before submitting.");
      return;
    }

    if (!selectedQuestion) {
      setOutput("No active question selected for review.");
      return;
    }

    setLoading(true);
    setOutput("");

    try {
      const API_URL =
        import.meta.env.VITE_API_URL ||
        "https://interviewiq-api-3ww1.onrender.com";

      const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `${selectedQuestion.description}\n${selectedQuestion.example}`,
          answer: code,
          category: "Coding",
          company: company || "",
          language,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Code review failed.");
      }

      setOutput(
        `AI Code Review\n\nScore: ${result.score}/100\nResult: ${result.result}\n\n${result.feedback}\n\nImprovements:\n${(result.improvements || []).map((item) => `- ${item}`).join("\n")}`
      );
    } catch (error) {
      setOutput(error.message || "Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="practice-workspace">
      <header className="workspace-header">
        <button
          className="workspace-back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div>
          <span className="workspace-eyebrow">
            {company ? `${decodeURIComponent(company)} PREPARATION` : "PRACTICE"}
          </span>
          <h1>{moduleName}</h1>
          <p>{isAptitude ? "Practice quantitative aptitude with clear multiple-choice questions and explanations." : "Practice problems in a dedicated workspace."}</p>
        </div>
      </header>

      <div className={`workspace-layout${isAptitude ? " is-aptitude" : ""}`}>
        <aside className="workspace-sidebar">
          <h2>Questions</h2>

          {questionLoading && <p>Generating fresh questions...</p>}
          {questionError && <p role="alert" style={{ color: "red" }}>{questionError}</p>}

          {questions.map((question) => (
            <button
              key={question.id}
              className={`workspace-question ${
                selectedId === question.id ? "active" : ""
              }`}
              onClick={() => {
                setSelectedId(question.id);
                setOutput("");
                setSelectedAnswer("");
                setAnswerFeedback(null);
              }}
            >
              <strong>{question.title}</strong>
              <span>{question.topic} · {question.difficulty}</span>
            </button>
          ))}
        </aside>

        {selectedQuestion && (
          <section className="workspace-problem">
            <span className="workspace-difficulty">
              {selectedQuestion.difficulty}
            </span>
            <h2>{selectedQuestion.title}</h2>
            <p>{selectedQuestion.description}</p>
            {isAptitude ? (
              <div className="aptitude-answer-area">
                <h3>Select your answer</h3>
                <fieldset className="aptitude-options">
                  <legend className="sr-only">Answer choices</legend>
                  {selectedQuestion.options.map((option) => (
                    <label className={selectedAnswer === option ? "selected" : ""} key={option}>
                      <input
                        type="radio"
                        name={`aptitude-answer-${selectedQuestion.id}`}
                        value={option}
                        checked={selectedAnswer === option}
                        onChange={() => {
                          setSelectedAnswer(option);
                          setAnswerFeedback(null);
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </fieldset>
                <button className="workspace-submit" type="button" disabled={!selectedAnswer} onClick={checkAptitudeAnswer}>
                  Check answer
                </button>
                {answerFeedback && (
                  <p className={`aptitude-feedback ${answerFeedback.correct ? "correct" : "incorrect"}`} role="status">
                    {answerFeedback.message}
                  </p>
                )}
              </div>
            ) : (
              <>
                <h3>Example</h3>
                <pre>{selectedQuestion.example}</pre>
                <p className="workspace-note">
                  Submit your solution for AI review. Code execution and automated
                  test-case verification are not enabled.
                </p>
              </>
            )}
          </section>
        )}

        {!isAptitude && <section className="workspace-editor">
          <div className="editor-toolbar">
            <label htmlFor="language-select">Language</label>
            <select
              id="language-select"
              value={language}
              onChange={(event) => chooseLanguage(event.target.value)}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="sql">SQL</option>
              <option value="html">HTML</option>
            </select>
          </div>

          <textarea
            className="code-editor"
            aria-label="Code editor"
            spellCheck={false}
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />

          <button
            className="workspace-submit"
            onClick={reviewCode}
            disabled={loading || !selectedQuestion}
          >
            {loading ? "Reviewing..." : "Submit for AI Review"}
          </button>

          {output && (
            <pre className="workspace-output">{output}</pre>
          )}
        </section>}
      </div>
    </main>
  );
}

export default PracticeWorkspace;

