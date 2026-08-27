// Icon slugs from https://github.com/tandpfun/skill-icons#readme
export const SKILL_ICON_SLUGS: Record<string, string> = {
  React: "react",
  TypeScript: "ts",
  JavaScript: "js",
  AWS: "aws",
  "AWS Lambda": "aws",
  "Amazon RDS": "aws",
  "API Gateway": "aws",
  Lambda: "aws",
  "Node.js": "nodejs",
  Python: "py",
  Docker: "docker",
  PostgreSQL: "postgres",
  MySQL: "mysql",
  MongoDB: "mongodb",
  Java: "java",
  FastAPI: "fastapi",
  Jenkins: "jenkins",
  C: "c",
  "C++": "cpp",
  TailwindCSS: "tailwind",
  Express: "express",
  Django: "django",
  "Spring Boot": "spring",
  Git: "git",
  "CI/CD": "githubactions",
  HTML: "html",
  CSS: "css",
  Vite: "vite",
  npm: "npm",
  Linux: "linux",
  Figma: "figma",
  Kubernetes: "kubernetes",
};

export function skillIconUrl(slug: string, theme: "light" | "dark" = "dark") {
  return `https://skillicons.dev/icons?i=${slug}&theme=${theme}`;
}
