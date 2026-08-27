export const journey = [
  {
    type: "education" as const,
    period: "Jan 2025 – Dec 2026",
    title: "Master of Engineering, Computer Science",
    org: "Virginia Tech — Alexandria, VA, USA",
    body: "Graduate coursework across systems, distributed computing, and software engineering.",
  },
  {
    type: "work" as const,
    period: "Jan 2024 – Nov 2024",
    title: "Full Stack Developer",
    org: "Bharat Tech — India",
    body: "Architected and deployed interactive, responsive web application interfaces that let non-technical stakeholders intuitively explore and filter complex datasets. Engineered production-ready microservices and REST API endpoints to stream, process, and render backend survey and transactional data into live frontend views. Optimized the frontend architecture through code splitting, lazy loading, and state memoization, cutting page load times by 30% while keeping performance high during dynamic data rendering.",
  },
  {
    type: "work" as const,
    period: "Oct 2023 – Jan 2024",
    title: "Front-end Developer Intern",
    org: "Bharat Tech — India",
    body: "Collaborated with senior developers to design and implement responsive UIs in HTML, CSS, and JavaScript, improving the user experience of core web applications. Converted static design mockups into interactive pages with ReactJS and integrated them with backend APIs for seamless data flow. Built a strong foundation in modern frontend practices with hands-on work in React, TailwindCSS, and Webpack.",
  },
  {
    type: "break" as const,
    period: "Sep 2021 – Oct 2023",
    title: "Career break",
    org: "Family care",
    body: "Paused my career to care for my family full-time after my father's accident. It wasn't part of the plan, but it taught me more about resilience and priorities than any project could have.",
  },
  {
    type: "education" as const,
    period: "Aug 2017 – Sep 2021",
    title: "Bachelor of Technology, Computer Science Engineering",
    org: "Malla Reddy College of Engineering & Technology — Hyderabad, India",
    body: "Foundational coursework in data structures, algorithms, databases, and software development.",
  },
];

export const splitItLink = "https://split-it-nine.vercel.app/";

export const splitItStack = [
  "React",
  "TypeScript",
  "TailwindCSS",
  "Gemini API",
  "Express",
  "Node.js",
];

export const otherProjects = [
  {
    name: "The Infinite Shelf",
    body: "A full-stack online bookstore with book previews and an integrated marketplace. A serverless REST API on AWS Lambda, RDS, and API Gateway handles every CRUD and transaction operation, backed by a relational schema designed for efficient retrieval across endpoints, plus a secure end-to-end payment flow for purchases.",
    stack: ["Spring Boot", "JSP", "React", "AWS Lambda", "RDS", "API Gateway"],
    link: "https://github.com/chaoentropeq",
    linkLabel: "GitHub",
  },
];

export const skillGroups = [
  {
    name: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "C", "C++", "Java"],
  },
  {
    name: "Web & frameworks",
    items: [
      "HTML",
      "CSS",
      "React",
      "Node.js",
      "Express",
      "TailwindCSS",
      "FastAPI",
      "Django",
      "Spring Boot",
      "Vite",
    ],
  },
  { name: "Databases", items: ["PostgreSQL", "MySQL", "MongoDB"] },
  {
    name: "Cloud & DevOps",
    items: [
      "AWS Lambda",
      "Amazon RDS",
      "API Gateway",
      "Jenkins",
      "Docker",
      "Kubernetes",
      "Linux",
    ],
  },
  {
    name: "Practices",
    items: [
      "System design",
      "REST APIs",
      "Testing",
      "Performance",
      "Git",
      "npm",
      "Figma",
    ],
  },
];


export const posts = [
  {
    title: "Why I stopped treating the frontend and the infra as two jobs",
    meta: "draft",
  },
  {
    title: "Parsing receipts with an LLM without trusting the output",
    meta: "draft",
  },
  { title: "A small Lambda pattern that saved me a database", meta: "draft" },
];

export const certs = [
  { name: "AWS certification", meta: "add name + year" },
  { name: "Add certification", meta: "add issuer + year" },
  { name: "Add certification", meta: "add issuer + year" },
];

export const contacts = [
  {
    label: "Email",
    value: "guptasushant393@gmail.com",
    href: "mailto:guptasushant393@gmail.com",
  },
  {
    label: "GitHub",
    value: "github.com/chaoentropeq",
    href: "https://github.com/chaoentropeq",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/sushant393",
    href: "https://linkedin.com/in/sushant393",
  },
  { label: "Location", value: "Washington, DC", href: "#/contact" },
];
