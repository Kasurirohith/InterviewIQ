
import { useNavigate } from "react-router-dom";
import "./Companies.css";

function Companies() {
  const navigate = useNavigate();

  const companies = [
    {
      name: "Google",
      category: "Product Based",
      description: "Software engineering, algorithms, data structures, and system design.",
    },
    {
      name: "Microsoft",
      category: "Product Based",
      description: "Programming, DSA, object-oriented design, and technical interviews.",
    },
    {
      name: "Amazon",
      category: "Product Based",
      description: "Coding, problem-solving, system design, and behavioral interviews.",
    },
    {
      name: "Infosys",
      category: "Service Based",
      description: "Programming, SQL, data structures, and technical assessments.",
    },
    {
      name: "TCS",
      category: "Service Based",
      description: "Ninja, Digital, and Prime recruitment preparation.",
    },
    {
      name: "Accenture",
      category: "Service Based",
      description: "Pseudocode, programming, SQL, aptitude, and problem-solving.",
    },
    {
      name: "Capgemini",
      category: "Service Based",
      description: "Coding assessments, SQL, OOP, and technical interviews.",
    },
    {
      name: "Deloitte",
      category: "Service Based",
      description: "Analyst and software engineering interview preparation.",
    },
    {
      name: "Zoho",
      category: "Product Based",
      description: "Programming fundamentals, problem-solving, SQL, and technical interviews.",
    },
    {
      name: "Swiggy",
      category: "Product Based",
      description: "Coding, backend engineering, system design, and behavioral interviews.",
    },
    {
      name: "Adobe",
      category: "Product Based",
      description: "Data structures, algorithms, object-oriented design, and system design.",
    },
  ];

  const openCompany = (company) => {
    localStorage.setItem("selectedCompany", company.name);
    localStorage.setItem("targetCompany", company.name);
    localStorage.setItem("companyCategory", company.category);

    navigate(`/company/${encodeURIComponent(company.name)}`);
  };

  return (
    <main className="companies-overview">
      <header className="companies-overview-header">
        <span className="companies-overview-eyebrow">
          CAREER PREPARATION
        </span>

        <h1>Explore Companies</h1>

        <p>
          Prepare for technical assessments, coding rounds, and interviews
          with structured company-specific practice.
        </p>
      </header>

      <section className="companies-overview-grid">
        {companies.map((company) => (
          <article className="company-card" key={company.name}>
            <div className="company-overview-content">
              <span className="company-overview-category">
                {company.category}
              </span>

              <h2>{company.name}</h2>

              <p>{company.description}</p>
            </div>

            <button
              type="button"
              className="company-overview-button"
              onClick={() => openCompany(company)}
            >
              View Preparation
              <span aria-hidden="true">→</span>
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}

export default Companies;
