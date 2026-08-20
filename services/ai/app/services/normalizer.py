from typing import Tuple

CANONICAL_SKILL_MAP = {
    # Languages
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python": "Python",
    "java": "Java",
    "c#": "C#",
    "csharp": "C#",
    "c++": "C++",
    "cpp": "C++",
    "c": "C",
    "go": "Go",
    "golang": "Go",
    "rust": "Rust",
    "ruby": "Ruby",
    "php": "PHP",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "sql": "SQL",
    "html": "HTML",
    "html5": "HTML5",
    "css": "CSS",
    "css3": "CSS3",

    # Frameworks & Libraries
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "react js": "React",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "angular": "Angular",
    "angularjs": "Angular",
    "next": "Next.js",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "node js": "Node.js",
    "express": "Express",
    "expressjs": "Express",
    "nestjs": "NestJS",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "springboot": "Spring Boot",
    "django": "Django",
    "flask": "Flask",
    "fastapi": "FastAPI",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",

    # Databases
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "psql": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "redis": "Redis",
    "sqlite": "SQLite",

    # Cloud / DevOps / Systems
    "docker": "Docker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "aws": "Amazon Web Services (AWS)",
    "gcp": "Google Cloud Platform (GCP)",
    "azure": "Microsoft Azure",
    "git": "Git",
    "github": "GitHub",
    "linux": "Linux",
    "graphql": "GraphQL",
    "rest": "REST APIs",
}

def normalize_skill_name(raw_name: str) -> Tuple[str, str]:
    """
    Returns (canonical_display_name, normalized_key)
    """
    clean = (raw_name or "").strip()
    if not clean:
        return "", ""

    key = clean.lower().replace("  ", " ")
    if key in CANONICAL_SKILL_MAP:
        canonical = CANONICAL_SKILL_MAP[key]
        return canonical, canonical.lower()

    # Fallback to title-casing words
    canonical = " ".join([word.capitalize() for word in clean.split(" ") if word])
    return canonical, canonical.lower()
