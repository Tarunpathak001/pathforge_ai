/**
 * Canonical skill dictionary mapping normalized lower-case search keys to standard display names.
 */
const CANONICAL_SKILL_MAP: Record<string, string> = {
  // Programming Languages
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  py: 'Python',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  'c#': 'C#',
  cpp: 'C++',
  'c++': 'C++',
  c: 'C',
  golang: 'Go',
  go: 'Go',
  rust: 'Rust',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  scala: 'Scala',
  r: 'R',
  dart: 'Dart',
  sql: 'SQL',
  html: 'HTML',
  html5: 'HTML5',
  css: 'CSS',
  css3: 'CSS3',

  // Frontend Frameworks & Libraries
  react: 'React',
  reactjs: 'React',
  'react.js': 'React',
  'react js': 'React',
  vue: 'Vue.js',
  vuejs: 'Vue.js',
  'vue.js': 'Vue.js',
  angular: 'Angular',
  angularjs: 'Angular',
  svelte: 'Svelte',
  nextjs: 'Next.js',
  'next.js': 'Next.js',
  next: 'Next.js',
  remix: 'Remix',
  tailwind: 'Tailwind CSS',
  tailwindcss: 'Tailwind CSS',
  bootstrap: 'Bootstrap',
  redux: 'Redux',
  zustand: 'Zustand',

  // Backend Frameworks & Runtimes
  node: 'Node.js',
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  'node js': 'Node.js',
  express: 'Express',
  expressjs: 'Express',
  'express.js': 'Express',
  nestjs: 'NestJS',
  'nest.js': 'NestJS',
  spring: 'Spring Boot',
  'spring boot': 'Spring Boot',
  springboot: 'Spring Boot',
  django: 'Django',
  flask: 'Flask',
  fastapi: 'FastAPI',
  laravel: 'Laravel',
  aspnet: 'ASP.NET Core',
  'asp.net': 'ASP.NET Core',

  // Databases & ORMs
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  psql: 'PostgreSQL',
  mysql: 'MySQL',
  mongodb: 'MongoDB',
  mongo: 'MongoDB',
  redis: 'Redis',
  sqlite: 'SQLite',
  dynamodb: 'DynamoDB',
  cassandra: 'Cassandra',
  prisma: 'Prisma',
  typeorm: 'TypeORM',
  drizzle: 'Drizzle ORM',
  hibernate: 'Hibernate',

  // Cloud & DevOps
  docker: 'Docker',
  k8s: 'Kubernetes',
  kubernetes: 'Kubernetes',
  aws: 'Amazon Web Services (AWS)',
  'amazon web services': 'Amazon Web Services (AWS)',
  gcp: 'Google Cloud Platform (GCP)',
  'google cloud': 'Google Cloud Platform (GCP)',
  azure: 'Microsoft Azure',
  terraform: 'Terraform',
  ansible: 'Ansible',
  git: 'Git',
  github: 'GitHub',
  gitlab: 'GitLab',
  cicd: 'CI/CD',
  'ci/cd': 'CI/CD',
  jenkins: 'Jenkins',
  linux: 'Linux',
  graphql: 'GraphQL',
  rest: 'REST APIs',
  'rest api': 'REST APIs',
  'restful apis': 'REST APIs',
};

/**
 * Normalizes a raw skill name to its canonical display form and provides a lowercased unique key.
 */
export function normalizeSkill(rawName: string): { normalizedName: string; key: string } {
  const trimmed = (rawName || '').trim();
  if (!trimmed) {
    return { normalizedName: '', key: '' };
  }

  // Sanitize key for lookup: lowercase, replace multiple spaces with single space
  const lookupKey = trimmed.toLowerCase().replace(/\s+/g, ' ');

  if (CANONICAL_SKILL_MAP[lookupKey]) {
    const canonical = CANONICAL_SKILL_MAP[lookupKey]!;
    return {
      normalizedName: canonical,
      key: canonical.toLowerCase(),
    };
  }

  // Capitalize words nicely as fallback
  const fallback = trimmed
    .split(' ')
    .map(word => (word.length > 0 ? word[0]!.toUpperCase() + word.slice(1) : ''))
    .join(' ');

  return {
    normalizedName: fallback,
    key: fallback.toLowerCase(),
  };
}

/**
 * Deduplicates a list of skills by normalized key, keeping the highest self-reported level.
 */
export function deduplicateSkills<T extends { name: string; selfReportedLevel?: number }>(
  skills: T[]
): T[] {
  const map = new Map<string, T>();

  for (const skill of skills) {
    const { key, normalizedName } = normalizeSkill(skill.name);
    if (!key) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...skill, name: normalizedName });
    } else {
      // Keep higher level and preserve evidence if available
      const highestLevel = Math.max(existing.selfReportedLevel || 3, skill.selfReportedLevel || 3);
      map.set(key, {
        ...existing,
        ...skill,
        name: normalizedName,
        selfReportedLevel: highestLevel,
      });
    }
  }

  return Array.from(map.values());
}
