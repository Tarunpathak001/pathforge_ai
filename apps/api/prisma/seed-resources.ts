export interface SeedResourceData {
  title: string;
  slug: string;
  description: string;
  resourceType: string;
  provider: string;
  url: string;
  difficulty: string;
  estimatedHours: number;
  language?: string;
  isFree: boolean;
  qualityScore: number;
  skills: {
    skillSlug: string;
    coverage: 'PRIMARY' | 'SUPPORTING' | 'MENTIONED';
  }[];
  prerequisites?: {
    skillSlug: string;
    requiredLevel: number;
  }[];
}

export const SEED_RESOURCES: SeedResourceData[] = [
  // ============================================================================
  // 1. REST APIs & Backend Web Services
  // ============================================================================
  {
    title: 'MDN Web Docs: RESTful Web APIs Guide',
    slug: 'mdn-restful-web-apis-guide',
    description: 'Comprehensive official guide explaining HTTP verbs, status codes, REST architecture constraints, headers, and resource modeling.',
    resourceType: 'DOCUMENTATION',
    provider: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/en-US/docs/Glossary/REST',
    difficulty: 'BEGINNER',
    estimatedHours: 4,
    isFree: true,
    qualityScore: 0.96,
    skills: [
      { skillSlug: 'rest-apis', coverage: 'PRIMARY' },
      { skillSlug: 'programming-fundamentals', coverage: 'SUPPORTING' },
    ],
  },
  {
    title: 'freeCodeCamp: REST API Design and Best Practices',
    slug: 'fcc-rest-api-design-course',
    description: 'Video course covering API idempotency, pagination, error contract formats, versioning strategies, and payload validation.',
    resourceType: 'VIDEO',
    provider: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/news/rest-api-best-practices-rest-endpoint-design-examples/',
    difficulty: 'BEGINNER',
    estimatedHours: 6,
    isFree: true,
    qualityScore: 0.94,
    skills: [
      { skillSlug: 'rest-apis', coverage: 'PRIMARY' },
    ],
  },
  {
    title: 'Building a Production REST API with Spring Boot',
    slug: 'spring-boot-rest-api-project',
    description: 'Hands-on practical guided project building enterprise REST endpoints with validation, JPA repositories, and exception handlers.',
    resourceType: 'PROJECT',
    provider: 'Spring.io Official Guides',
    url: 'https://spring.io/guides/tutorials/rest/',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 8,
    isFree: true,
    qualityScore: 0.98,
    skills: [
      { skillSlug: 'rest-apis', coverage: 'PRIMARY' },
      { skillSlug: 'spring-boot', coverage: 'PRIMARY' },
      { skillSlug: 'java', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'java', requiredLevel: 2 },
    ],
  },
  {
    title: 'FastAPI Official Tutorial: Building High-Performance REST APIs',
    slug: 'fastapi-official-tutorial',
    description: 'Interactive documentation covering asynchronous Python endpoints, Pydantic type validation, OpenAPI generation, and dependency injection.',
    resourceType: 'DOCUMENTATION',
    provider: 'FastAPI / Tiangolo',
    url: 'https://fastapi.tiangolo.com/tutorial/',
    difficulty: 'BEGINNER',
    estimatedHours: 10,
    isFree: true,
    qualityScore: 0.97,
    skills: [
      { skillSlug: 'rest-apis', coverage: 'PRIMARY' },
      { skillSlug: 'python', coverage: 'SUPPORTING' },
    ],
  },

  // ============================================================================
  // 2. Spring Boot & Java Ecosystem
  // ============================================================================
  {
    title: 'Spring Framework Documentation: Core Technologies',
    slug: 'spring-core-technologies-doc',
    description: 'The definitive architectural guide to Spring Inversion of Control (IoC), Dependency Injection containers, Beans, and Spring AOP.',
    resourceType: 'DOCUMENTATION',
    provider: 'Spring Framework / VMware',
    url: 'https://docs.spring.io/spring-framework/reference/core.html',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 12,
    isFree: true,
    qualityScore: 0.98,
    skills: [
      { skillSlug: 'spring-boot', coverage: 'PRIMARY' },
      { skillSlug: 'java', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'java', requiredLevel: 2 },
    ],
  },
  {
    title: 'Building a Microservice Backend with Spring Boot & Docker',
    slug: 'spring-boot-microservice-docker-project',
    description: 'End-to-end multi-service portfolio project deploying Spring Boot services communicating via REST and packaged in Docker containers.',
    resourceType: 'PROJECT',
    provider: 'Baeldung',
    url: 'https://www.baeldung.com/spring-boot-docker-start',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 14,
    isFree: true,
    qualityScore: 0.95,
    skills: [
      { skillSlug: 'spring-boot', coverage: 'PRIMARY' },
      { skillSlug: 'docker', coverage: 'SUPPORTING' },
      { skillSlug: 'microservices', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'java', requiredLevel: 2 },
      { skillSlug: 'spring-boot', requiredLevel: 2 },
    ],
  },
  {
    title: 'Effective Java (3rd Edition)',
    slug: 'effective-java-book',
    description: 'Joshua Bloch definitive handbook on modern Java best practices, memory management, immutability, generics, and concurrent programming.',
    resourceType: 'BOOK',
    provider: 'Addison-Wesley',
    url: 'https://www.oreilly.com/library/view/effective-java-3rd/9780134686097/',
    difficulty: 'ADVANCED',
    estimatedHours: 35,
    isFree: false,
    qualityScore: 0.99,
    skills: [
      { skillSlug: 'java', coverage: 'PRIMARY' },
      { skillSlug: 'programming-fundamentals', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'java', requiredLevel: 3 },
    ],
  },

  // ============================================================================
  // 3. Node.js, Express & JavaScript / TypeScript
  // ============================================================================
  {
    title: 'Node.js Official Documentation & Runtime Architecture',
    slug: 'nodejs-runtime-architecture-doc',
    description: 'Official deep dive into libuv, non-blocking I/O event loops, Buffer streams, Cluster workers, and async concurrency.',
    resourceType: 'DOCUMENTATION',
    provider: 'OpenJS Foundation',
    url: 'https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 8,
    isFree: true,
    qualityScore: 0.96,
    skills: [
      { skillSlug: 'node-js', coverage: 'PRIMARY' },
      { skillSlug: 'javascript', coverage: 'SUPPORTING' },
    ],
  },
  {
    title: 'Building a Production Node.js & Express REST API with TypeScript',
    slug: 'express-typescript-backend-project',
    description: 'Project guide for architecting typed controllers, middleware error handling, environment configs, and Prisma ORM integration.',
    resourceType: 'PROJECT',
    provider: 'LogRocket Engineering',
    url: 'https://blog.logrocket.com/how-to-set-up-node-typescript-express/',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 10,
    isFree: true,
    qualityScore: 0.94,
    skills: [
      { skillSlug: 'node-js', coverage: 'PRIMARY' },
      { skillSlug: 'typescript', coverage: 'PRIMARY' },
      { skillSlug: 'rest-apis', coverage: 'SUPPORTING' },
    ],
  },
  {
    title: 'TypeScript Handbook: The Official Type System Guide',
    slug: 'typescript-official-handbook',
    description: 'The canonical guide to static types, generics, conditional types, mapped types, utility types, and module resolution.',
    resourceType: 'DOCUMENTATION',
    provider: 'Microsoft TypeScript Team',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    difficulty: 'BEGINNER',
    estimatedHours: 12,
    isFree: true,
    qualityScore: 0.99,
    skills: [
      { skillSlug: 'typescript', coverage: 'PRIMARY' },
      { skillSlug: 'javascript', coverage: 'SUPPORTING' },
    ],
  },

  // ============================================================================
  // 4. Databases: SQL, PostgreSQL, MongoDB, Redis, Database Design
  // ============================================================================
  {
    title: 'PostgreSQL Official Tutorial: SQL & Relational Design',
    slug: 'postgresql-official-tutorial',
    description: 'Official PostgreSQL tutorial covering schema modeling, multi-table JOINs, window functions, indexes, and ACID transactions.',
    resourceType: 'DOCUMENTATION',
    provider: 'PostgreSQL Global Development Group',
    url: 'https://www.postgresql.org/docs/current/tutorial.html',
    difficulty: 'BEGINNER',
    estimatedHours: 12,
    isFree: true,
    qualityScore: 0.97,
    skills: [
      { skillSlug: 'sql', coverage: 'PRIMARY' },
      { skillSlug: 'postgresql', coverage: 'PRIMARY' },
      { skillSlug: 'database-design', coverage: 'SUPPORTING' },
    ],
  },
  {
    title: 'Use The Index, Luke! A Guide to Database Indexing & Query Tuning',
    slug: 'use-the-index-luke-indexing-guide',
    description: 'The acclaimed guide on B-tree indexes, execution plans (EXPLAIN ANALYZE), composite index ordering, and SQL performance tuning.',
    resourceType: 'BOOK',
    provider: 'Markus Winand',
    url: 'https://use-the-index-luke.com/',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 16,
    isFree: true,
    qualityScore: 0.98,
    skills: [
      { skillSlug: 'sql', coverage: 'SUPPORTING' },
      { skillSlug: 'postgresql', coverage: 'SUPPORTING' },
      { skillSlug: 'database-design', coverage: 'PRIMARY' },
    ],
    prerequisites: [
      { skillSlug: 'sql', requiredLevel: 2 },
    ],
  },
  {
    title: 'Redis University: Redis Data Structures & In-Memory Caching',
    slug: 'redis-university-caching-course',
    description: 'Interactive course covering strings, hashes, sets, sorted sets, bitfields, TTL expiration strategies, and distributed caching patterns.',
    resourceType: 'COURSE',
    provider: 'Redis University',
    url: 'https://university.redis.io/courses/ru101/',
    difficulty: 'BEGINNER',
    estimatedHours: 8,
    isFree: true,
    qualityScore: 0.96,
    skills: [
      { skillSlug: 'redis', coverage: 'PRIMARY' },
      { skillSlug: 'caching', coverage: 'PRIMARY' },
    ],
  },
  {
    title: 'MongoDB University: Schema Design for Scalable Applications',
    slug: 'mongodb-university-schema-design',
    description: 'Hands-on guide to document database modeling, embedding vs referencing, indexing strategies, and aggregation pipelines.',
    resourceType: 'COURSE',
    provider: 'MongoDB University',
    url: 'https://learn.mongodb.com/courses/m320-mongodb-data-modeling',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 10,
    isFree: true,
    qualityScore: 0.95,
    skills: [
      { skillSlug: 'mongodb', coverage: 'PRIMARY' },
      { skillSlug: 'database-design', coverage: 'SUPPORTING' },
    ],
  },

  // ============================================================================
  // 5. System Design, Distributed Systems, Architecture & Microservices
  // ============================================================================
  {
    title: 'System Design Primer: Scalable Systems for Large-Scale Applications',
    slug: 'system-design-primer-github',
    description: 'Widely recognized open-source blueprint covering load balancing, caching, sharding, replication, CAP theorem, and system design interviews.',
    resourceType: 'DOCUMENTATION',
    provider: 'Donne Martin / GitHub',
    url: 'https://github.com/donnemartin/system-design-primer',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 25,
    isFree: true,
    qualityScore: 0.99,
    skills: [
      { skillSlug: 'system-design', coverage: 'PRIMARY' },
      { skillSlug: 'distributed-systems', coverage: 'PRIMARY' },
      { skillSlug: 'caching', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'rest-apis', requiredLevel: 2 },
      { skillSlug: 'sql', requiredLevel: 2 },
    ],
  },
  {
    title: 'Designing Data-Intensive Applications',
    slug: 'designing-data-intensive-applications-book',
    description: 'Martin Kleppmann masterpiece exploring storage engines, distributed consensus, transactions, stream processing, and fault tolerance.',
    resourceType: 'BOOK',
    provider: "O'Reilly Media",
    url: 'https://dataintensive.net/',
    difficulty: 'ADVANCED',
    estimatedHours: 50,
    isFree: false,
    qualityScore: 1.0,
    skills: [
      { skillSlug: 'system-design', coverage: 'PRIMARY' },
      { skillSlug: 'distributed-systems', coverage: 'PRIMARY' },
      { skillSlug: 'database-design', coverage: 'SUPPORTING' },
      { skillSlug: 'message-queues', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'system-design', requiredLevel: 2 },
      { skillSlug: 'database-design', requiredLevel: 2 },
    ],
  },
  {
    title: 'Apache Kafka Official Quickstart & Event-Driven Architecture',
    slug: 'apache-kafka-quickstart-guide',
    description: 'Tutorial on topics, partitions, consumer groups, offsets, log compaction, and building event-driven asynchronous microservices.',
    resourceType: 'DOCUMENTATION',
    provider: 'Apache Software Foundation',
    url: 'https://kafka.apache.org/quickstart',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 8,
    isFree: true,
    qualityScore: 0.95,
    skills: [
      { skillSlug: 'message-queues', coverage: 'PRIMARY' },
      { skillSlug: 'microservices', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'rest-apis', requiredLevel: 2 },
    ],
  },
  {
    title: 'Building a Distributed Rate Limiter Project in Redis and Node.js',
    slug: 'distributed-rate-limiter-project',
    description: 'Hands-on architectural implementation of the Token Bucket and Sliding Window rate limiting algorithms across distributed nodes.',
    resourceType: 'PROJECT',
    provider: 'ByteByteGo',
    url: 'https://bytebytego.com/courses/system-design-interview/design-a-rate-limiter',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 6,
    isFree: true,
    qualityScore: 0.94,
    skills: [
      { skillSlug: 'system-design', coverage: 'SUPPORTING' },
      { skillSlug: 'redis', coverage: 'PRIMARY' },
      { skillSlug: 'caching', coverage: 'PRIMARY' },
    ],
    prerequisites: [
      { skillSlug: 'redis', requiredLevel: 2 },
    ],
  },

  // ============================================================================
  // 6. DevOps, Docker, Kubernetes, CI/CD & Linux
  // ============================================================================
  {
    title: 'Docker Getting Started: Container Fundamentals to Compose',
    slug: 'docker-official-getting-started',
    description: 'Official interactive tutorial covering Dockerfiles, multi-stage builds, layer caching, volumes, networks, and docker-compose orchestration.',
    resourceType: 'DOCUMENTATION',
    provider: 'Docker Documentation',
    url: 'https://docs.docker.com/get-started/',
    difficulty: 'BEGINNER',
    estimatedHours: 6,
    isFree: true,
    qualityScore: 0.97,
    skills: [
      { skillSlug: 'docker', coverage: 'PRIMARY' },
      { skillSlug: 'linux', coverage: 'SUPPORTING' },
    ],
  },
  {
    title: 'Kubernetes Official Interactive Basics & Pod Architecture',
    slug: 'kubernetes-official-basics-tutorial',
    description: 'Official interactive Katacoda tutorial on Pods, Deployments, ReplicaSets, Services, ConfigMaps, and Ingress routing.',
    resourceType: 'COURSE',
    provider: 'Cloud Native Computing Foundation (CNCF)',
    url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 14,
    isFree: true,
    qualityScore: 0.97,
    skills: [
      { skillSlug: 'kubernetes', coverage: 'PRIMARY' },
      { skillSlug: 'docker', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'docker', requiredLevel: 2 },
    ],
  },
  {
    title: 'GitHub Actions Documentation: Continuous Integration & Deployment',
    slug: 'github-actions-ci-cd-guide',
    description: 'Automating linting, automated unit testing, container build matrixes, and secure deployment pipelines to cloud environments.',
    resourceType: 'DOCUMENTATION',
    provider: 'GitHub Docs',
    url: 'https://docs.github.com/en/actions/quickstart',
    difficulty: 'BEGINNER',
    estimatedHours: 6,
    isFree: true,
    qualityScore: 0.96,
    skills: [
      { skillSlug: 'ci-cd', coverage: 'PRIMARY' },
      { skillSlug: 'git', coverage: 'SUPPORTING' },
    ],
  },
  {
    title: 'Linux Journey: Complete Command Line & Systems Administration',
    slug: 'linux-journey-online-guide',
    description: 'Interactive browser-based guide to Linux filesystem navigation, file permissions, process monitoring, systemd services, and networking.',
    resourceType: 'EXERCISE',
    provider: 'Linux Journey',
    url: 'https://linuxjourney.com/',
    difficulty: 'BEGINNER',
    estimatedHours: 10,
    isFree: true,
    qualityScore: 0.95,
    skills: [
      { skillSlug: 'linux', coverage: 'PRIMARY' },
    ],
  },

  // ============================================================================
  // 7. AI, Machine Learning, Deep Learning, LLMs & Vector Databases
  // ============================================================================
  {
    title: 'Fast.ai: Practical Deep Learning for Coders',
    slug: 'fastai-practical-deep-learning',
    description: 'Renowned top-down practical course on neural networks, PyTorch, computer vision, natural language processing, and model training.',
    resourceType: 'COURSE',
    provider: 'Fast.ai',
    url: 'https://course.fast.ai/',
    difficulty: 'BEGINNER',
    estimatedHours: 40,
    isFree: true,
    qualityScore: 0.99,
    skills: [
      { skillSlug: 'machine-learning', coverage: 'PRIMARY' },
      { skillSlug: 'deep-learning', coverage: 'PRIMARY' },
      { skillSlug: 'python', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'python', requiredLevel: 2 },
    ],
  },
  {
    title: 'Hugging Face NLP & Transformers Course',
    slug: 'hugging-face-nlp-transformers-course',
    description: 'Hands-on mastery of tokenization, fine-tuning pre-trained transformer models (BERT, GPT), pipelines, and text embeddings.',
    resourceType: 'COURSE',
    provider: 'Hugging Face',
    url: 'https://huggingface.co/learn/nlp-course/',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 20,
    isFree: true,
    qualityScore: 0.98,
    skills: [
      { skillSlug: 'natural-language-processing', coverage: 'PRIMARY' },
      { skillSlug: 'llms-and-prompt-engineering', coverage: 'PRIMARY' },
      { skillSlug: 'deep-learning', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'python', requiredLevel: 2 },
      { skillSlug: 'machine-learning', requiredLevel: 2 },
    ],
  },
  {
    title: 'DeepLearning.AI: LangChain for LLM Application Development',
    slug: 'deeplearning-ai-langchain-course',
    description: 'Short intensive course by Harrison Chase and Andrew Ng covering prompt templates, memory, document loaders, and semantic retrieval chains.',
    resourceType: 'COURSE',
    provider: 'DeepLearning.AI',
    url: 'https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/',
    difficulty: 'BEGINNER',
    estimatedHours: 4,
    isFree: true,
    qualityScore: 0.97,
    skills: [
      { skillSlug: 'llms-and-prompt-engineering', coverage: 'PRIMARY' },
      { skillSlug: 'python', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'python', requiredLevel: 2 },
    ],
  },
  {
    title: 'Building a Production RAG System with Chroma & Vector Embeddings',
    slug: 'production-rag-vector-db-project',
    description: 'Hands-on guided project building Retrieval-Augmented Generation using semantic vector embeddings, chunking strategies, and re-ranking.',
    resourceType: 'PROJECT',
    provider: 'Pinecone / Chroma Learn',
    url: 'https://www.pinecone.io/learn/series/rag/',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 12,
    isFree: true,
    qualityScore: 0.96,
    skills: [
      { skillSlug: 'vector-databases', coverage: 'PRIMARY' },
      { skillSlug: 'llms-and-prompt-engineering', coverage: 'PRIMARY' },
      { skillSlug: 'natural-language-processing', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'python', requiredLevel: 2 },
      { skillSlug: 'llms-and-prompt-engineering', requiredLevel: 2 },
    ],
  },

  // ============================================================================
  // 8. Security & Authentication
  // ============================================================================
  {
    title: 'Auth0: The Ultimate Guide to JWT and OAuth 2.0 / OpenID Connect',
    slug: 'auth0-oauth2-jwt-guide',
    description: 'Exhaustive industry guide to OAuth2 grant types, token verification, PKCE flow for SPAs, refresh token rotation, and RBAC.',
    resourceType: 'DOCUMENTATION',
    provider: 'Auth0 / Okta Developer',
    url: 'https://auth0.com/docs/authenticate/protocols/oauth-2',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 6,
    isFree: true,
    qualityScore: 0.96,
    skills: [
      { skillSlug: 'authentication-authorization', coverage: 'PRIMARY' },
      { skillSlug: 'rest-apis', coverage: 'SUPPORTING' },
    ],
  },
  {
    title: 'OWASP Top 10 Web Application Security Vulnerabilities Guide',
    slug: 'owasp-top-10-security-guide',
    description: 'The industry-standard reference for injection attacks, broken authentication, cryptographic failures, security misconfigurations, and prevention.',
    resourceType: 'DOCUMENTATION',
    provider: 'OWASP Foundation',
    url: 'https://owasp.org/www-project-top-ten/',
    difficulty: 'BEGINNER',
    estimatedHours: 8,
    isFree: true,
    qualityScore: 0.98,
    skills: [
      { skillSlug: 'authentication-authorization', coverage: 'SUPPORTING' },
      { skillSlug: 'web-security', coverage: 'PRIMARY' },
    ],
  },

  // ============================================================================
  // 9. Testing & Quality Assurance
  // ============================================================================
  {
    title: 'Martin Fowler: The Practical Test Pyramid & Integration Testing',
    slug: 'martin-fowler-practical-test-pyramid',
    description: 'Foundational architectural essay defining unit tests, service tests, UI tests, test doubles (mocks/stubs), and automated test execution.',
    resourceType: 'ARTICLE',
    provider: 'Martin Fowler',
    url: 'https://martinfowler.com/articles/practical-test-pyramid.html',
    difficulty: 'BEGINNER',
    estimatedHours: 3,
    isFree: true,
    qualityScore: 0.97,
    skills: [
      { skillSlug: 'unit-integration-testing', coverage: 'PRIMARY' },
    ],
  },
  {
    title: 'Testing JavaScript & TypeScript Applications with Vitest & Jest',
    slug: 'testing-javascript-typescript-course',
    description: 'Hands-on testing course building isolated unit tests, Supertest HTTP endpoint integration tests, and mock database fixtures.',
    resourceType: 'COURSE',
    provider: 'Vitest Official Guide',
    url: 'https://vitest.dev/guide/',
    difficulty: 'BEGINNER',
    estimatedHours: 8,
    isFree: true,
    qualityScore: 0.95,
    skills: [
      { skillSlug: 'unit-integration-testing', coverage: 'PRIMARY' },
      { skillSlug: 'typescript', coverage: 'SUPPORTING' },
      { skillSlug: 'rest-apis', coverage: 'SUPPORTING' },
    ],
  },

  // ============================================================================
  // 10. Frontend: React, Tailwind CSS, Modern UI
  // ============================================================================
  {
    title: 'React.dev: The Official React Documentation & Interactive Tutorials',
    slug: 'react-dev-official-documentation',
    description: 'The modern rewritten React guide covering hooks (useState, useEffect, useMemo), component lifecycle, unidirectional data flow, and state sharing.',
    resourceType: 'DOCUMENTATION',
    provider: 'React Core Team / Meta',
    url: 'https://react.dev/learn',
    difficulty: 'BEGINNER',
    estimatedHours: 16,
    isFree: true,
    qualityScore: 0.99,
    skills: [
      { skillSlug: 'react', coverage: 'PRIMARY' },
      { skillSlug: 'javascript', coverage: 'SUPPORTING' },
      { skillSlug: 'html-css', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'javascript', requiredLevel: 2 },
    ],
  },
  {
    title: 'Tailwind CSS Official Documentation & Design System Guide',
    slug: 'tailwind-css-official-guide',
    description: 'Mastering utility-first CSS styling, responsive breakpoints, flexbox/grid layout systems, dark mode palettes, and custom theme tokens.',
    resourceType: 'DOCUMENTATION',
    provider: 'Tailwind Labs',
    url: 'https://tailwindcss.com/docs/utility-first',
    difficulty: 'BEGINNER',
    estimatedHours: 6,
    isFree: true,
    qualityScore: 0.98,
    skills: [
      { skillSlug: 'tailwind-css', coverage: 'PRIMARY' },
      { skillSlug: 'html-css', coverage: 'PRIMARY' },
    ],
  },

  // ============================================================================
  // 11. Next.js & Modern Fullstack Frameworks
  // ============================================================================
  {
    title: 'Next.js App Router Official Course & Dashboard Project',
    slug: 'nextjs-official-dashboard-course',
    description: 'Build a production fullstack financial dashboard featuring Server Components, Server Actions, streaming SSR, and PostgreSQL integration.',
    resourceType: 'COURSE',
    provider: 'Vercel / Next.js',
    url: 'https://nextjs.org/learn',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 14,
    isFree: true,
    qualityScore: 0.99,
    skills: [
      { skillSlug: 'next-js', coverage: 'PRIMARY' },
      { skillSlug: 'react', coverage: 'SUPPORTING' },
      { skillSlug: 'typescript', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'react', requiredLevel: 2 },
    ],
  },
  {
    title: 'Full Stack Open: Deep Dive into Modern Web Development',
    slug: 'full-stack-open-helsinki',
    description: 'University of Helsinki comprehensive open course covering React, Redux, Node.js, Express, MongoDB, GraphQL, TypeScript, and CI/CD.',
    resourceType: 'COURSE',
    provider: 'University of Helsinki',
    url: 'https://fullstackopen.com/en/',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 60,
    isFree: true,
    qualityScore: 1.0,
    skills: [
      { skillSlug: 'react', coverage: 'PRIMARY' },
      { skillSlug: 'node-js', coverage: 'PRIMARY' },
      { skillSlug: 'typescript', coverage: 'SUPPORTING' },
      { skillSlug: 'rest-apis', coverage: 'SUPPORTING' },
    ],
  },

  // ============================================================================
  // 12. Python & Modern Scripting
  // ============================================================================
  {
    title: 'Python.org Official Tutorial: Language Fundamentals & Standard Library',
    slug: 'python-official-tutorial-guide',
    description: 'The official Python documentation covering control structures, list comprehensions, generators, object-oriented classes, and virtualenvs.',
    resourceType: 'DOCUMENTATION',
    provider: 'Python Software Foundation',
    url: 'https://docs.python.org/3/tutorial/',
    difficulty: 'BEGINNER',
    estimatedHours: 10,
    isFree: true,
    qualityScore: 0.98,
    skills: [
      { skillSlug: 'python', coverage: 'PRIMARY' },
      { skillSlug: 'programming-fundamentals', coverage: 'SUPPORTING' },
    ],
  },
  {
    title: 'Fluent Python (2nd Edition): Clear, Concise, and Effective Programming',
    slug: 'fluent-python-book',
    description: 'Luciano Ramalho definitive guide to Python data models, decorators, async/await with asyncio, metaprogramming, and type hints.',
    resourceType: 'BOOK',
    provider: "O'Reilly Media",
    url: 'https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/',
    difficulty: 'ADVANCED',
    estimatedHours: 40,
    isFree: false,
    qualityScore: 0.99,
    skills: [
      { skillSlug: 'python', coverage: 'PRIMARY' },
    ],
    prerequisites: [
      { skillSlug: 'python', requiredLevel: 3 },
    ],
  },

  // ============================================================================
  // 13. Go (Golang) Systems Programming
  // ============================================================================
  {
    title: 'A Tour of Go: Interactive Language Foundations',
    slug: 'tour-of-go-interactive',
    description: 'Interactive browser sandbox teaching Go syntax, structs, slices, maps, methods, interfaces, goroutines, and channels.',
    resourceType: 'EXERCISE',
    provider: 'Google / Go Team',
    url: 'https://go.dev/tour/welcome/1',
    difficulty: 'BEGINNER',
    estimatedHours: 6,
    isFree: true,
    qualityScore: 0.98,
    skills: [
      { skillSlug: 'go', coverage: 'PRIMARY' },
      { skillSlug: 'programming-fundamentals', coverage: 'SUPPORTING' },
    ],
  },
  {
    title: 'Go by Example: Hands-on Idiomatic Go Recipes',
    slug: 'go-by-example-recipes',
    description: 'Concise, annotated code examples covering channels, worker pools, rate limiting, JSON serialization, HTTP servers, and context.',
    resourceType: 'DOCUMENTATION',
    provider: 'Mark McGranaghan',
    url: 'https://gobyexample.com/',
    difficulty: 'BEGINNER',
    estimatedHours: 8,
    isFree: true,
    qualityScore: 0.97,
    skills: [
      { skillSlug: 'go', coverage: 'PRIMARY' },
    ],
  },

  // ============================================================================
  // 14. GraphQL & Modern API Paradigms
  // ============================================================================
  {
    title: 'How to GraphQL: The Fullstack Tutorial for GraphQL',
    slug: 'how-to-graphql-tutorial',
    description: 'Comprehensive tutorial on GraphQL schemas, queries, mutations, subscriptions, Apollo Server, and schema-first API design.',
    resourceType: 'COURSE',
    provider: 'Prisma / Apollo',
    url: 'https://www.howtographql.com/',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 10,
    isFree: true,
    qualityScore: 0.96,
    skills: [
      { skillSlug: 'graphql', coverage: 'PRIMARY' },
      { skillSlug: 'rest-apis', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'rest-apis', requiredLevel: 2 },
    ],
  },

  // ============================================================================
  // 15. Cloud Computing & AWS
  // ============================================================================
  {
    title: 'AWS Skill Builder: AWS Cloud Practitioner Essentials',
    slug: 'aws-cloud-practitioner-essentials',
    description: 'Official Amazon Web Services foundational course explaining compute (EC2/Lambda), storage (S3/EBS), VPC networking, and IAM security.',
    resourceType: 'COURSE',
    provider: 'Amazon Web Services',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials',
    difficulty: 'BEGINNER',
    estimatedHours: 6,
    isFree: true,
    qualityScore: 0.97,
    skills: [
      { skillSlug: 'aws', coverage: 'PRIMARY' },
      { skillSlug: 'cloud-computing', coverage: 'PRIMARY' },
    ],
  },
  {
    title: 'Building a Serverless Backend on AWS Lambda, API Gateway & DynamoDB',
    slug: 'aws-serverless-backend-project',
    description: 'Hands-on practical deployment creating serverless microservices with automated Infrastructure-as-Code via AWS CDK / SAM.',
    resourceType: 'PROJECT',
    provider: 'AWS Samples / GitHub',
    url: 'https://aws.amazon.com/getting-started/hands-on/build-serverless-web-app-lambda-apigateway-s3-dynamodb-cognito/',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 10,
    isFree: true,
    qualityScore: 0.95,
    skills: [
      { skillSlug: 'aws', coverage: 'PRIMARY' },
      { skillSlug: 'cloud-computing', coverage: 'SUPPORTING' },
      { skillSlug: 'rest-apis', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'aws', requiredLevel: 2 },
    ],
  },

  // ============================================================================
  // 16. Data Science, Pandas, Data Engineering & Analytics
  // ============================================================================
  {
    title: 'Kaggle: Python Pandas Data Manipulation & Transformation',
    slug: 'kaggle-pandas-interactive-course',
    description: 'Interactive micro-courses on indexing, grouping, multi-table merging, missing data handling, and exploratory data analysis.',
    resourceType: 'EXERCISE',
    provider: 'Kaggle Learn',
    url: 'https://www.kaggle.com/learn/pandas',
    difficulty: 'BEGINNER',
    estimatedHours: 5,
    isFree: true,
    qualityScore: 0.96,
    skills: [
      { skillSlug: 'pandas', coverage: 'PRIMARY' },
      { skillSlug: 'data-analysis', coverage: 'PRIMARY' },
      { skillSlug: 'python', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'python', requiredLevel: 1 },
    ],
  },
  {
    title: 'Scikit-Learn Machine Learning in Python: Official User Guide',
    slug: 'scikit-learn-official-user-guide',
    description: 'Official tutorial on classification, regression, clustering (k-means), feature scaling, cross-validation, and hyperparameter grid search.',
    resourceType: 'DOCUMENTATION',
    provider: 'Scikit-Learn Developers',
    url: 'https://scikit-learn.org/stable/user_guide.html',
    difficulty: 'BEGINNER',
    estimatedHours: 15,
    isFree: true,
    qualityScore: 0.98,
    skills: [
      { skillSlug: 'machine-learning', coverage: 'PRIMARY' },
      { skillSlug: 'python', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'python', requiredLevel: 2 },
    ],
  },
  {
    title: 'Data Engineering with Apache Spark & PySpark',
    slug: 'apache-spark-pyspark-data-engineering',
    description: 'Big data processing pipelines, Resilient Distributed Datasets (RDDs), Spark SQL DataFrames, partitioned Parquet storage, and cluster execution.',
    resourceType: 'COURSE',
    provider: 'Databricks Academy',
    url: 'https://www.databricks.com/learn/training/spark-fundamentals',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 16,
    isFree: true,
    qualityScore: 0.96,
    skills: [
      { skillSlug: 'data-engineering', coverage: 'PRIMARY' },
      { skillSlug: 'python', coverage: 'SUPPORTING' },
      { skillSlug: 'sql', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'python', requiredLevel: 2 },
      { skillSlug: 'sql', requiredLevel: 2 },
    ],
  },

  // ============================================================================
  // 17. MLOps & Production Machine Learning
  // ============================================================================
  {
    title: 'Made With ML: Production MLOps Course from Design to Deployment',
    slug: 'made-with-ml-production-mlops',
    description: 'End-to-end open-source guide covering experiment tracking (MLflow), data versioning (DVC), model packaging (FastAPI + Docker), and CI/CD pipelines.',
    resourceType: 'COURSE',
    provider: 'Goku Mohandas / Made With ML',
    url: 'https://madewithml.com/',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 25,
    isFree: true,
    qualityScore: 0.99,
    skills: [
      { skillSlug: 'mlops', coverage: 'PRIMARY' },
      { skillSlug: 'machine-learning', coverage: 'SUPPORTING' },
      { skillSlug: 'docker', coverage: 'SUPPORTING' },
    ],
    prerequisites: [
      { skillSlug: 'machine-learning', requiredLevel: 2 },
      { skillSlug: 'docker', requiredLevel: 2 },
    ],
  },

  // ============================================================================
  // 18. Algorithms, Data Structures & CS Fundamentals
  // ============================================================================
  {
    title: 'MIT OpenCourseWare 6.006: Introduction to Algorithms',
    slug: 'mit-ocw-6006-algorithms-course',
    description: 'World-renowned university lecture series by Erik Demaine covering sorting, binary search trees, hash tables, dynamic programming, and Dijkstra graphs.',
    resourceType: 'COURSE',
    provider: 'MIT OpenCourseWare',
    url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 35,
    isFree: true,
    qualityScore: 1.0,
    skills: [
      { skillSlug: 'data-structures-algorithms', coverage: 'PRIMARY' },
      { skillSlug: 'programming-fundamentals', coverage: 'PRIMARY' },
    ],
  },
  {
    title: 'NeetCode 150: Algorithmic Problem Solving & Data Structures Practice',
    slug: 'neetcode-150-dsa-practice',
    description: 'Structured curated video solutions and coding challenges categorized by pattern: Two Pointers, Sliding Window, Trees, Graphs, and DP.',
    resourceType: 'EXERCISE',
    provider: 'NeetCode.io',
    url: 'https://neetcode.io/practice',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 40,
    isFree: true,
    qualityScore: 0.98,
    skills: [
      { skillSlug: 'data-structures-algorithms', coverage: 'PRIMARY' },
    ],
  },

  // ============================================================================
  // 19. Security: Web Security & Ethical Hacking
  // ============================================================================
  {
    title: 'PortSwigger Web Security Academy: Free Online Web Security Training',
    slug: 'portswigger-web-security-academy',
    description: 'Interactive labs with real vulnerable targets covering SQL injection, Cross-Site Scripting (XSS), CSRF, Server-Side Request Forgery (SSRF), and JWT flaws.',
    resourceType: 'EXERCISE',
    provider: 'PortSwigger / Burp Suite',
    url: 'https://portswigger.net/web-security',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 30,
    isFree: true,
    qualityScore: 0.99,
    skills: [
      { skillSlug: 'web-security', coverage: 'PRIMARY' },
      { skillSlug: 'authentication-authorization', coverage: 'SUPPORTING' },
    ],
  },

  // ============================================================================
  // 20. Clean Code, Software Engineering & Best Practices
  // ============================================================================
  {
    title: 'Refactoring.Guru: Design Patterns & Code Refactoring Catalog',
    slug: 'refactoring-guru-design-patterns',
    description: 'Visual, deeply illustrated interactive guide to Creational (Factory, Singleton), Structural (Adapter, Facade), and Behavioral (Observer, Strategy) patterns.',
    resourceType: 'DOCUMENTATION',
    provider: 'Refactoring.Guru / Alexander Shvets',
    url: 'https://refactoring.guru/design-patterns',
    difficulty: 'BEGINNER',
    estimatedHours: 12,
    isFree: true,
    qualityScore: 0.98,
    skills: [
      { skillSlug: 'design-patterns', coverage: 'PRIMARY' },
      { skillSlug: 'clean-code', coverage: 'PRIMARY' },
      { skillSlug: 'programming-fundamentals', coverage: 'SUPPORTING' },
    ],
  },
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    slug: 'clean-code-book',
    description: 'Robert C. Martin seminal book on naming conventions, function cohesion, SOLID principles, error handling, and writing maintainable software.',
    resourceType: 'BOOK',
    provider: 'Prentice Hall',
    url: 'https://www.oreilly.com/library/view/clean-code-a/9780136083238/',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 25,
    isFree: false,
    qualityScore: 0.96,
    skills: [
      { skillSlug: 'clean-code', coverage: 'PRIMARY' },
      { skillSlug: 'design-patterns', coverage: 'SUPPORTING' },
    ],
  },
];

