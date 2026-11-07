
import { useNavigate } from "react-router-dom";
import "./Companies.css";

function ProductCompanies() {
  const navigate = useNavigate();

  const companies = [
    {
      name: "Google",
      difficulty: "Hard",
      description:
        "Prepare for software engineering interviews covering algorithms, data structures, and system design.",
    },
    {
      name: "Microsoft",
      difficulty: "Hard",
      description:
        "Prepare for technical interviews covering programming, DSA, OOP, and system design.",
    },
    {
      name: "Amazon",
      difficulty: "Medium-Hard",
      description:
        "Prepare for coding, problem-solving, system design, and behavioral interviews.",
    },
    {
      name: "Zoho",
      difficulty: "Medium-Hard",
      description:
        "Practice programming fundamentals, problem-solving, SQL, and technical interview questions.",
    },
    {
      name: "Swiggy",
      difficulty: "Hard",
      description:
        "Prepare for software engineering interviews with coding, backend, system design, and behavioral practice.",
    },
    {
      name: "Adobe",
      difficulty: "Hard",
      description:
        "Build interview readiness with data structures, algorithms, object-oriented design, and system design.",
    },
  ];

  const openCompany = (company) => {
    localStorage.setItem("selectedCompany", company.name);
    localStorage.setItem("targetCompany", company.name);
    localStorage.setItem("companyCategory", "Product Based");

    navigate(`/company/${encodeURIComponent(company.name)}`);
  };

  return (
    <main className="companies-page">
      <header className="companies-header">
        <span className="companies-eyebrow">COMPANY PREPARATION</span>
        <h1>Product-Based Companies</h1>
        <p>
          Select a company to explore its interview preparation details.
        </p>
      </header>

      <section className="companies-grid">
        {companies.map((company) => (
          <article className="company-card" key={company.name}>
            <div>
              <span className="company-type">Product Based</span>
              <h2>{company.name}</h2>
              <p className="company-description">
                {company.description}
              </p>
            </div>

            <div className="company-difficulty">
              <span>Interview Difficulty</span>
              <strong>{company.difficulty}</strong>
            </div>

            <button
              type="button"
              className="company-button"
              onClick={() => openCompany(company)}
            >
              View Details <span aria-hidden="true">→</span>
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}

export default ProductCompanies;
