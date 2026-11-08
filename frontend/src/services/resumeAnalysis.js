const SKILL_CATALOG = [
  ["Python", ["python"]], ["Java", ["java"]], ["JavaScript", ["javascript", "js"]],
  ["TypeScript", ["typescript"]], ["C", ["c language"]], ["C++", ["c++", "cpp"]],
  ["C#", ["c#", "c sharp"]], ["Go", ["golang", "go language"]], ["Kotlin", ["kotlin"]],
  ["PHP", ["php"]], ["Ruby", ["ruby"]], ["Swift", ["swift"]],
  ["React", ["react", "react.js", "reactjs"]], ["Angular", ["angular"]],
  ["Vue", ["vue", "vue.js", "vuejs"]], ["Next.js", ["next.js", "nextjs"]],
  ["HTML", ["html"]], ["CSS", ["css"]], ["Tailwind CSS", ["tailwind", "tailwind css"]],
  ["Redux", ["redux"]], ["Node.js", ["node.js", "nodejs", "node js"]],
  ["Express", ["express", "express.js"]], ["FastAPI", ["fastapi"]],
  ["Django", ["django"]], ["Flask", ["flask"]], ["Spring Boot", ["spring boot"]],
  [".NET", [".net", "dotnet"]], ["REST APIs", ["rest api", "rest apis", "restful api", "restful apis"]],
  ["GraphQL", ["graphql"]], ["Microservices", ["microservices", "microservice architecture"]],
  ["SQL", ["sql", "structured query language"]], ["PostgreSQL", ["postgresql", "postgres"]],
  ["MySQL", ["mysql"]], ["MongoDB", ["mongodb", "mongo db"]], ["Redis", ["redis"]],
  ["Firebase", ["firebase"]], ["Supabase", ["supabase"]], ["DynamoDB", ["dynamodb"]],
  ["AWS", ["aws", "amazon web services"]], ["Azure", ["azure", "microsoft azure"]],
  ["Google Cloud", ["google cloud", "gcp"]], ["Docker", ["docker", "containerization"]],
  ["Kubernetes", ["kubernetes", "k8s"]], ["Terraform", ["terraform"]],
  ["Jenkins", ["jenkins"]], ["GitHub Actions", ["github actions"]],
  ["CI/CD", ["ci/cd", "continuous integration", "continuous delivery"]],
  ["Linux", ["linux"]], ["Git", ["git", "version control"]],
  ["Data Structures and Algorithms", ["data structures", "algorithms", "dsa"]],
  ["Object-Oriented Programming", ["object-oriented programming", "oop"]],
  ["System Design", ["system design"]], ["Agile", ["agile"]], ["Scrum", ["scrum"]],
  ["Unit Testing", ["unit testing", "unit tests"]], ["Automated Testing", ["automated testing", "test automation"]],
  ["Debugging", ["debugging"]], ["Cybersecurity", ["cybersecurity", "information security"]],
  ["Networking", ["computer networks", "networking"]], ["Machine Learning", ["machine learning", "ml"]],
  ["Deep Learning", ["deep learning"]], ["NLP", ["natural language processing", "nlp"]],
  ["TensorFlow", ["tensorflow"]], ["PyTorch", ["pytorch"]], ["scikit-learn", ["scikit-learn", "sklearn"]],
  ["Pandas", ["pandas"]], ["NumPy", ["numpy"]], ["Data Analysis", ["data analysis", "data analytics"]],
  ["Power BI", ["power bi"]], ["Tableau", ["tableau"]], ["Excel", ["microsoft excel", "excel"]],
  ["ETL", ["etl", "extract transform load"]], ["Communication", ["communication skills", "communication"]],
  ["Problem Solving", ["problem solving", "problem-solving"]], ["Leadership", ["leadership"]],
  ["Project Management", ["project management"]], ["Customer Support", ["customer support", "customer service"]],
];

const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").trim();

function containsPhrase(text, phrase) {
  const normalizedText = ` ${normalize(text)} `;
  const normalizedPhrase = normalize(phrase);
  return Boolean(normalizedPhrase) && normalizedText.includes(` ${normalizedPhrase} `);
}

function findEvidence(text, aliases) {
  return String(text || "").split(/\r?\n/).map((line) => line.trim()).find((line) =>
    line && aliases.some((alias) => containsPhrase(line, alias))
  ) || "";
}

function sectionPresence(resumeText) {
  const text = String(resumeText || "").toLowerCase();
  return {
    "Contact Details": /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text),
    Experience: /\b(experience|employment|internship|work history)\b/.test(text),
    Projects: /\bprojects?\b/.test(text),
    Education: /\b(education|academic|university|college)\b/.test(text),
    Skills: /\b(skills|technologies|technical proficiencies)\b/.test(text),
  };
}

export function analyzeResumeText(resumeText, targetRole = "", jobDescription = "") {
  const source = String(resumeText || "");
  const hasJobDescription = Boolean(String(jobDescription || "").trim());
  const required = hasJobDescription
    ? SKILL_CATALOG.filter(([, aliases]) => aliases.some((alias) => containsPhrase(jobDescription, alias)))
    : [];
  const skills = required
    .filter(([, aliases]) => aliases.some((alias) => containsPhrase(source, alias)))
    .map(([name, aliases]) => ({ name, resume_evidence: findEvidence(source, aliases).slice(0, 220) }));
  const matchedNames = new Set(skills.map((skill) => skill.name));
  const missingSkills = required.filter(([name]) => !matchedNames.has(name)).map(([name, aliases]) => ({
    name,
    priority: "Review",
    job_evidence: findEvidence(jobDescription, aliases).slice(0, 300),
  }));

  const sections = sectionPresence(source);
  const sectionScore = Math.round(Object.values(sections).filter(Boolean).length / Object.keys(sections).length * 100);
  const quantifiedLines = source.split(/\r?\n/).filter((line) => /\d+(?:\.\d+)?\s*%?/.test(line)).length;
  const impactScore = Math.min(100, quantifiedLines * 25);
  const skillScore = required.length ? Math.round(skills.length / required.length * 100) : null;
  const score = skillScore === null
    ? Math.round(sectionScore * 0.75 + impactScore * 0.25)
    : Math.round(skillScore * 0.7 + sectionScore * 0.15 + impactScore * 0.15);

  const strengths = [];
  for (const [section, present] of Object.entries(sections)) {
    if (present) strengths.push({ title: `${section} details detected`, evidence: "Found in extracted resume text" });
  }
  if (quantifiedLines) strengths.push({ title: "Measurable results included", evidence: `${quantifiedLines} resume line(s) contain numbers` });

  const improvements = [];
  for (const [section, present] of Object.entries(sections)) {
    if (!present) improvements.push({
      title: `Add a clear ${section.toLowerCase()} section`,
      action: `Include this section if it applies to your background, using a standard heading so resume screeners can find it.`,
      section,
    });
  }
  if (!quantifiedLines) improvements.push({
    title: "Show the impact of your work",
    action: "Where you have real results, add truthful numbers such as time saved, users supported, or project performance improved. Never invent metrics.",
    section: "Experience or Projects",
  });
  for (const skill of missingSkills) improvements.push({
    title: `Develop ${skill.name}`,
    action: `Practise ${skill.name} and build a small project before adding it to your resume. Include it only when you can explain your experience honestly.`,
    section: "Skills or Projects",
  });

  return {
    target_role: String(targetRole || "").trim() || "Target role not specified",
    ats_score: score,
    job_description_provided: hasJobDescription,
    score_basis: skillScore === null
      ? "Resume structure estimate only. Add a job description for a role-specific keyword comparison."
      : `Keyword estimate: ${skills.length} of ${required.length} recognized job skills appear in the resume. ATS scoring varies by employer and system.`,
    score_breakdown: {
      job_skill_match: skillScore,
      resume_sections: sectionScore,
      measurable_impact: impactScore,
      matched_skill_count: skills.length,
      required_skill_count: required.length,
    },
    skills,
    missing_skills: missingSkills,
    strengths,
    improvements: improvements.slice(0, 10),
    sections,
  };
}

