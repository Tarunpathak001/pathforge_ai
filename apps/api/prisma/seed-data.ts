export interface SeedCareer {
  slug: string;
  name: string;
  category: string;
  description: string;
  difficulty: 'ENTRY' | 'INTERMEDIATE' | 'ADVANCED';
  typicalExperience: string;
  demandLevel: 'HIGH' | 'VERY_HIGH' | 'MODERATE';
}

export interface SeedSkill {
  slug: string;
  name: string;
  category: string;
  skillType: 'Technical' | 'Tool' | 'Concept' | 'SoftSkill';
  description: string;
  aliases: string[];
}

export interface SeedPrerequisite {
  skillSlug: string; // The dependent skill (requires the prerequisite)
  prerequisiteSlug: string; // The foundational skill needed first
  strength: 'REQUIRED' | 'RECOMMENDED' | 'HELPFUL';
  rationale: string;
}

export interface SeedCareerSkill {
  careerSlug: string;
  skillSlug: string;
  importance: 'CORE' | 'HIGH' | 'MEDIUM' | 'OPTIONAL';
  requiredLevel: number; // 1 to 5
  priority: number;
  isCore: boolean;
  rationale: string;
}

export const SEED_CAREERS: SeedCareer[] = [
  {
    slug: 'backend-engineer',
    name: 'Backend Engineer',
    category: 'Engineering',
    description:
      'Designs, builds, and maintains server-side applications, data pipelines, and business logic that power modern web and mobile platforms.',
    difficulty: 'INTERMEDIATE',
    typicalExperience: '2-4 years',
    demandLevel: 'VERY_HIGH',
  },
  {
    slug: 'frontend-engineer',
    name: 'Frontend Engineer',
    category: 'Engineering',
    description:
      'Creates responsive, performant, and accessible user interfaces and interactive experiences using modern web technologies.',
    difficulty: 'INTERMEDIATE',
    typicalExperience: '1-3 years',
    demandLevel: 'VERY_HIGH',
  },
  {
    slug: 'full-stack-engineer',
    name: 'Full Stack Engineer',
    category: 'Engineering',
    description:
      'Bridges frontend client experiences and robust backend systems, delivering end-to-end features and product capabilities.',
    difficulty: 'INTERMEDIATE',
    typicalExperience: '2-5 years',
    demandLevel: 'VERY_HIGH',
  },
  {
    slug: 'software-engineer',
    name: 'Software Engineer',
    category: 'Engineering',
    description:
      'Applies foundational computer science principles, data structures, and software design patterns to develop robust software systems.',
    difficulty: 'ENTRY',
    typicalExperience: '0-3 years',
    demandLevel: 'HIGH',
  },
  {
    slug: 'devops-engineer',
    name: 'DevOps Engineer',
    category: 'DevOps & Cloud',
    description:
      'Automates deployment pipelines, manages infrastructure as code, and ensures high availability, scalability, and operational reliability.',
    difficulty: 'ADVANCED',
    typicalExperience: '3-6 years',
    demandLevel: 'VERY_HIGH',
  },
  {
    slug: 'cloud-engineer',
    name: 'Cloud Engineer',
    category: 'DevOps & Cloud',
    description:
      'Architects and deploys secure, resilient, and cost-effective cloud infrastructure on platforms like AWS, Azure, and GCP.',
    difficulty: 'INTERMEDIATE',
    typicalExperience: '2-5 years',
    demandLevel: 'HIGH',
  },
  {
    slug: 'data-engineer',
    name: 'Data Engineer',
    category: 'Data & AI',
    description:
      'Builds scalable data ingestion, transformation, and storage systems that power enterprise analytics and machine learning workflows.',
    difficulty: 'ADVANCED',
    typicalExperience: '2-5 years',
    demandLevel: 'VERY_HIGH',
  },
  {
    slug: 'data-scientist',
    name: 'Data Scientist',
    category: 'Data & AI',
    description:
      'Extracts actionable business insights and builds predictive statistical models from complex, structured, and unstructured datasets.',
    difficulty: 'ADVANCED',
    typicalExperience: '2-5 years',
    demandLevel: 'HIGH',
  },
  {
    slug: 'machine-learning-engineer',
    name: 'Machine Learning Engineer',
    category: 'Data & AI',
    description:
      'Designs, trains, and deploys production machine learning models, optimizing inference performance and scalable model serving pipelines.',
    difficulty: 'ADVANCED',
    typicalExperience: '3-6 years',
    demandLevel: 'VERY_HIGH',
  },
  {
    slug: 'ai-engineer',
    name: 'AI Engineer',
    category: 'Data & AI',
    description:
      'Builds next-generation intelligent applications using large language models, retrieval-augmented generation (RAG), and vector databases.',
    difficulty: 'ADVANCED',
    typicalExperience: '2-5 years',
    demandLevel: 'VERY_HIGH',
  },
  {
    slug: 'cybersecurity-analyst',
    name: 'Cybersecurity Analyst',
    category: 'Security',
    description:
      'Monitors, protects, and defends digital assets and networks against security breaches, vulnerabilities, and cyber threats.',
    difficulty: 'INTERMEDIATE',
    typicalExperience: '1-4 years',
    demandLevel: 'VERY_HIGH',
  },
  {
    slug: 'mobile-app-developer',
    name: 'Mobile Application Developer',
    category: 'Engineering',
    description:
      'Develops intuitive and high-performing mobile applications for iOS and Android platforms with seamless offline and native device support.',
    difficulty: 'INTERMEDIATE',
    typicalExperience: '1-4 years',
    demandLevel: 'HIGH',
  },
  {
    slug: 'qa-automation-engineer',
    name: 'QA & Automation Engineer',
    category: 'Quality Assurance',
    description:
      'Designs automated testing frameworks, executes regression test suites, and ensures enterprise software reliability and performance.',
    difficulty: 'INTERMEDIATE',
    typicalExperience: '1-4 years',
    demandLevel: 'HIGH',
  },
  {
    slug: 'data-analyst',
    name: 'Data Analyst',
    category: 'Product & Analytics',
    description:
      'Translates data into business intelligence, reports, and visual dashboards to enable evidence-based strategic decision making.',
    difficulty: 'ENTRY',
    typicalExperience: '0-3 years',
    demandLevel: 'HIGH',
  },
  {
    slug: 'product-analyst',
    name: 'Product Analyst',
    category: 'Product & Analytics',
    description:
      'Analyzes user behavior, product telemetry, and feature adoption metrics to guide product experimentation and roadmap planning.',
    difficulty: 'INTERMEDIATE',
    typicalExperience: '1-4 years',
    demandLevel: 'MODERATE',
  },
];

export const SEED_SKILLS: SeedSkill[] = [
  // Programming Fundamentals & Languages
  {
    slug: 'programming-fundamentals',
    name: 'Programming Fundamentals',
    category: 'Programming',
    skillType: 'Concept',
    description:
      'Core concepts including variables, control structures, loops, functions, memory management, and basic problem solving.',
    aliases: ['Coding Basics', 'CS Fundamentals', 'Programming Logic'],
  },
  {
    slug: 'data-structures-algorithms',
    name: 'Data Structures & Algorithms',
    category: 'Programming',
    skillType: 'Concept',
    description:
      'Core data structures (arrays, linked lists, trees, graphs, hash maps) and algorithmic paradigms (sorting, searching, recursion, DP).',
    aliases: ['DSA', 'Algorithms', 'Data Structures'],
  },
  {
    slug: 'python',
    name: 'Python',
    category: 'Programming',
    skillType: 'Technical',
    description:
      'High-level, interpreted programming language widely used in backend services, data science, machine learning, and automation.',
    aliases: ['Py', 'Python 3', 'Python3'],
  },
  {
    slug: 'javascript',
    name: 'JavaScript',
    category: 'Programming',
    skillType: 'Technical',
    description:
      'Dynamic scripting language powering interactive web applications and modern server-side runtimes.',
    aliases: ['JS', 'ES6', 'ECMAScript', 'Javascript'],
  },
  {
    slug: 'typescript',
    name: 'TypeScript',
    category: 'Programming',
    skillType: 'Technical',
    description:
      'Typed superset of JavaScript providing static type checking, interfaces, and enhanced developer tooling for large applications.',
    aliases: ['TS', 'Typescript'],
  },
  {
    slug: 'java',
    name: 'Java',
    category: 'Programming',
    skillType: 'Technical',
    description:
      'Enterprise-grade object-oriented programming language designed for portability, concurrency, and high-performance server systems.',
    aliases: ['Java SE', 'Core Java', 'JDK'],
  },
  {
    slug: 'go',
    name: 'Go',
    category: 'Programming',
    skillType: 'Technical',
    description:
      'Statically typed, compiled language developed by Google, renowned for high concurrency, fast compile times, and microservices.',
    aliases: ['Golang', 'Go Language'],
  },
  {
    slug: 'cpp',
    name: 'C++',
    category: 'Programming',
    skillType: 'Technical',
    description:
      'High-performance compiled language with low-level memory control, extensively used in system software, game engines, and robotics.',
    aliases: ['C plus plus', 'C/C++'],
  },
  {
    slug: 'sql',
    name: 'SQL',
    category: 'Database',
    skillType: 'Technical',
    description:
      'Standard declarative language for relational database query formulation, data manipulation, and relational schema definition.',
    aliases: ['Structured Query Language', 'ANSI SQL'],
  },

  // Frontend & Web
  {
    slug: 'html-css',
    name: 'HTML & CSS',
    category: 'Frontend',
    skillType: 'Technical',
    description:
      'Building blocks of web interfaces: semantic markup structure and modern CSS styling with Flexbox and CSS Grid.',
    aliases: ['HTML5', 'CSS3', 'HTML', 'CSS', 'Web Layouts'],
  },
  {
    slug: 'react',
    name: 'React',
    category: 'Frontend',
    skillType: 'Technical',
    description:
      'Declarative component-based JavaScript library for building responsive and interactive user interfaces.',
    aliases: ['React.js', 'ReactJS', 'React js'],
  },
  {
    slug: 'nextjs',
    name: 'Next.js',
    category: 'Frontend',
    skillType: 'Technical',
    description:
      'Production React framework enabling server-side rendering (SSR), static site generation (SSG), and API routes.',
    aliases: ['Next', 'Next.JS', 'NextJS'],
  },
  {
    slug: 'vuejs',
    name: 'Vue.js',
    category: 'Frontend',
    skillType: 'Technical',
    description:
      'Progressive JavaScript framework for building user interfaces with reactive data binding and single-file components.',
    aliases: ['Vue', 'VueJS', 'Vue 3'],
  },
  {
    slug: 'tailwind-css',
    name: 'Tailwind CSS',
    category: 'Frontend',
    skillType: 'Tool',
    description:
      'Utility-first CSS framework for rapidly building custom modern designs directly within component markup.',
    aliases: ['Tailwind', 'TailwindCSS'],
  },
  {
    slug: 'web-performance',
    name: 'Web Performance Optimization',
    category: 'Frontend',
    skillType: 'Concept',
    description:
      'Techniques for minimizing page load times, optimizing Core Web Vitals, code splitting, and browser asset caching.',
    aliases: ['Frontend Performance', 'Web Vitals', 'PageSpeed'],
  },
  {
    slug: 'state-management',
    name: 'Frontend State Management',
    category: 'Frontend',
    skillType: 'Concept',
    description:
      'Managing complex client application state using tools and patterns like Redux, Zustand, React Context, and TanStack Query.',
    aliases: ['Redux', 'Zustand', 'State Management', 'Client State'],
  },

  // Backend & Networking
  {
    slug: 'networking-basics',
    name: 'Networking Basics',
    category: 'Backend',
    skillType: 'Concept',
    description:
      'Fundamental networking concepts: TCP/IP stack, DNS resolution, sockets, ports, subnets, and routing protocols.',
    aliases: ['Computer Networks', 'TCP/IP', 'Networking Fundamentals'],
  },
  {
    slug: 'http-protocols',
    name: 'HTTP & Web Fundamentals',
    category: 'Backend',
    skillType: 'Concept',
    description:
      'Understanding HTTP methods, headers, status codes, HTTPS encryption, TLS handshakes, CORS, and cookies.',
    aliases: ['HTTP', 'HTTPS', 'HTTP/2', 'Web Protocols'],
  },
  {
    slug: 'rest-apis',
    name: 'REST APIs',
    category: 'Backend',
    skillType: 'Technical',
    description:
      'Designing, implementing, and consuming stateless RESTful web services and adhering to HTTP standards.',
    aliases: ['REST', 'RESTful API', 'RESTful Services', 'Web APIs'],
  },
  {
    slug: 'api-design',
    name: 'API Design & Documentation',
    category: 'Backend',
    skillType: 'Concept',
    description:
      'Creating robust, versioned, and intuitive API contracts with OpenAPI / Swagger specifications and pagination standards.',
    aliases: ['OpenAPI', 'Swagger', 'API Architecture', 'Contract First API'],
  },
  {
    slug: 'nodejs',
    name: 'Node.js',
    category: 'Backend',
    skillType: 'Technical',
    description:
      'Asynchronous event-driven JavaScript runtime built on Chrome V8 engine for building scalable server-side systems.',
    aliases: ['Node', 'NodeJS', 'Node JS'],
  },
  {
    slug: 'express',
    name: 'Express',
    category: 'Backend',
    skillType: 'Technical',
    description:
      'Minimalist and flexible Node.js web application framework providing essential features for web and mobile APIs.',
    aliases: ['Express.js', 'ExpressJS'],
  },
  {
    slug: 'spring-boot',
    name: 'Spring Boot',
    category: 'Backend',
    skillType: 'Technical',
    description:
      'Comprehensive enterprise Java framework for building stand-alone, production-ready microservices and REST backends.',
    aliases: ['Spring', 'SpringBoot', 'Spring Framework'],
  },
  {
    slug: 'fastapi',
    name: 'FastAPI',
    category: 'Backend',
    skillType: 'Technical',
    description:
      'Modern, high-performance Python web framework for building APIs with automatic OpenAPI docs and Pydantic validation.',
    aliases: ['Fast API', 'FastAPI Python'],
  },
  {
    slug: 'django',
    name: 'Django',
    category: 'Backend',
    skillType: 'Technical',
    description:
      'High-level Python web framework encouraging rapid development and clean, pragmatic design with built-in ORM and admin.',
    aliases: ['Django Framework', 'Django REST'],
  },
  {
    slug: 'graphql',
    name: 'GraphQL',
    category: 'Backend',
    skillType: 'Technical',
    description:
      'Query language for APIs and runtime for executing queries against type systems, preventing over-fetching.',
    aliases: ['GQL', 'GraphQL API'],
  },
  {
    slug: 'authentication-authorization',
    name: 'Authentication & Authorization',
    category: 'Backend',
    skillType: 'Concept',
    description:
      'Securing applications via JWT tokens, OAuth 2.0, OpenID Connect, session management, RBAC, and PBAC.',
    aliases: ['Auth', 'OAuth2', 'JWT', 'User Authentication', 'IAM'],
  },

  // Databases & Storage
  {
    slug: 'database-design',
    name: 'Database Design & Normalization',
    category: 'Database',
    skillType: 'Concept',
    description:
      'Schema modeling, relational entity design, foreign keys, 3NF normalization, and transaction ACID properties.',
    aliases: ['Data Modeling', 'Relational Modeling', 'Schema Design'],
  },
  {
    slug: 'postgresql',
    name: 'PostgreSQL',
    category: 'Database',
    skillType: 'Technical',
    description:
      'Advanced open-source object-relational database system with support for complex queries, JSONB, and concurrency.',
    aliases: ['Postgres', 'Postgre SQL', 'psql'],
  },
  {
    slug: 'mysql',
    name: 'MySQL',
    category: 'Database',
    skillType: 'Technical',
    description:
      'Widely used open-source relational database management system known for speed, reliability, and ease of use.',
    aliases: ['MariaDB', 'My SQL'],
  },
  {
    slug: 'mongodb',
    name: 'MongoDB',
    category: 'Database',
    skillType: 'Technical',
    description:
      'Document-oriented NoSQL database designed for high availability, flexible JSON-like schemas, and horizontal scaling.',
    aliases: ['Mongo', 'NoSQL Mongo', 'MongoDB Atlas'],
  },
  {
    slug: 'redis',
    name: 'Redis',
    category: 'Database',
    skillType: 'Technical',
    description:
      'In-memory key-value data store used as a high-speed cache, message broker, and real-time session store.',
    aliases: ['Redis Cache', 'In-Memory DB'],
  },
  {
    slug: 'query-optimization',
    name: 'SQL Query Optimization',
    category: 'Database',
    skillType: 'Concept',
    description:
      'Indexing strategies (B-Tree, Hash, GIN), analyzing EXPLAIN plans, partitioning, and resolving N+1 query bottlenecks.',
    aliases: ['Database Indexing', 'Query Tuning', 'SQL Performance'],
  },

  // Architecture & Systems
  {
    slug: 'object-oriented-design',
    name: 'Object-Oriented Design',
    category: 'Architecture',
    skillType: 'Concept',
    description:
      'SOLID principles, design patterns (Factory, Singleton, Observer, Strategy), encapsulation, and clean code architecture.',
    aliases: ['OOD', 'OOP', 'SOLID Principles', 'Design Patterns'],
  },
  {
    slug: 'system-design',
    name: 'System Design',
    category: 'Architecture',
    skillType: 'Concept',
    description:
      'Architecting scalable, fault-tolerant distributed software systems, load balancers, CDN caching, and data partitioning.',
    aliases: ['Distributed System Design', 'High Level Design', 'HLD'],
  },
  {
    slug: 'microservices',
    name: 'Microservices Architecture',
    category: 'Architecture',
    skillType: 'Concept',
    description:
      'Decomposing monolithic architectures into independently deployable, loosely coupled services communicating via APIs/queues.',
    aliases: ['Microservices', 'SOA', 'Distributed Services'],
  },
  {
    slug: 'caching-strategies',
    name: 'Caching Strategies',
    category: 'Architecture',
    skillType: 'Concept',
    description:
      'Cache-aside, write-through, cache invalidation, TTL management, CDN caching, and distributed cache coherence.',
    aliases: ['Caching', 'Distributed Cache', 'Redis Caching'],
  },
  {
    slug: 'message-queues',
    name: 'Message Queues & Event Streaming',
    category: 'Architecture',
    skillType: 'Technical',
    description:
      'Asynchronous event-driven architecture using Kafka, RabbitMQ, AWS SQS for pub/sub messaging and decoupled processing.',
    aliases: ['Kafka', 'RabbitMQ', 'Event Driven Architecture', 'PubSub'],
  },

  // DevOps & Cloud
  {
    slug: 'linux-fundamentals',
    name: 'Linux Administration & Shell',
    category: 'DevOps',
    skillType: 'Technical',
    description:
      'Command-line proficiency, Bash scripting, process management, file permissions, cron jobs, and SSH server administration.',
    aliases: ['Linux', 'Bash', 'Shell Scripting', 'Unix'],
  },
  {
    slug: 'git-version-control',
    name: 'Git & Version Control',
    category: 'DevOps',
    skillType: 'Tool',
    description:
      'Branching models, Git workflows, rebasing, pull requests, resolving merge conflicts, and repository management.',
    aliases: ['Git', 'GitHub', 'GitLab', 'Version Control'],
  },
  {
    slug: 'docker',
    name: 'Docker & Containerization',
    category: 'DevOps',
    skillType: 'Technical',
    description:
      'Creating Dockerfiles, multi-stage builds, container isolation, Docker Compose orchestration, and image optimization.',
    aliases: ['Docker', 'Containers', 'Containerization'],
  },
  {
    slug: 'kubernetes',
    name: 'Kubernetes',
    category: 'DevOps',
    skillType: 'Technical',
    description:
      'Container orchestration, Pods, Deployments, Services, Ingress, auto-scaling, Helm charts, and cluster management.',
    aliases: ['K8s', 'Kubernetes Orchestration', 'K8s Cluster'],
  },
  {
    slug: 'ci-cd-pipelines',
    name: 'CI/CD Pipelines',
    category: 'DevOps',
    skillType: 'Technical',
    description:
      'Automated continuous integration and deployment pipelines using GitHub Actions, GitLab CI, or Jenkins.',
    aliases: ['CI/CD', 'GitHub Actions', 'Continuous Integration', 'Automated Deployment'],
  },
  {
    slug: 'terraform',
    name: 'Terraform & Infrastructure as Code',
    category: 'DevOps',
    skillType: 'Technical',
    description:
      'Declarative infrastructure provisioning using HashiCorp Terraform modules, state management, and cloud automation.',
    aliases: ['Terraform', 'IaC', 'Infrastructure as Code'],
  },
  {
    slug: 'aws',
    name: 'Amazon Web Services (AWS)',
    category: 'Cloud',
    skillType: 'Technical',
    description:
      'Core cloud services including EC2, S3, RDS, Lambda, VPC, IAM, CloudWatch, and API Gateway.',
    aliases: ['AWS', 'Amazon Cloud', 'AWS Cloud'],
  },
  {
    slug: 'cloud-fundamentals',
    name: 'Cloud Architecture Fundamentals',
    category: 'Cloud',
    skillType: 'Concept',
    description:
      'IaaS vs PaaS vs SaaS, high availability regions, multi-zone redundancy, serverless models, and cloud cost management.',
    aliases: ['Cloud Computing', 'Cloud Architecture', 'Cloud Basics'],
  },

  // AI, Machine Learning & LLMs
  {
    slug: 'statistics-probability',
    name: 'Statistics & Probability',
    category: 'Data',
    skillType: 'Concept',
    description:
      'Descriptive statistics, hypothesis testing, probability distributions, regression analysis, and p-values.',
    aliases: ['Statistics', 'Applied Statistics', 'Probability'],
  },
  {
    slug: 'data-analysis-pandas',
    name: 'Data Analysis with Pandas & NumPy',
    category: 'Data',
    skillType: 'Technical',
    description:
      'Data wrangling, filtering, aggregation, exploratory data analysis (EDA), and numerical computing in Python.',
    aliases: ['Pandas', 'NumPy', 'Data Wrangling', 'EDA'],
  },
  {
    slug: 'data-visualization',
    name: 'Data Visualization & BI',
    category: 'Data',
    skillType: 'Technical',
    description:
      'Presenting analytical insights using Tableau, Power BI, Matplotlib, Seaborn, and interactive dashboards.',
    aliases: ['Tableau', 'Power BI', 'Matplotlib', 'Dashboarding'],
  },
  {
    slug: 'machine-learning-fundamentals',
    name: 'Machine Learning Fundamentals',
    category: 'AI/ML',
    skillType: 'Concept',
    description:
      'Supervised and unsupervised learning, classification, regression, clustering, model evaluation metrics, and bias-variance tradeoff.',
    aliases: ['ML', 'Machine Learning', 'Scikit-Learn', 'Supervised Learning'],
  },
  {
    slug: 'deep-learning',
    name: 'Deep Learning & Neural Networks',
    category: 'AI/ML',
    skillType: 'Technical',
    description:
      'Neural network architectures (CNNs, RNNs, MLPs), backpropagation, gradient descent, PyTorch, and TensorFlow.',
    aliases: ['Neural Networks', 'PyTorch', 'TensorFlow', 'Deep Learning'],
  },
  {
    slug: 'nlp',
    name: 'Natural Language Processing (NLP)',
    category: 'AI/ML',
    skillType: 'Technical',
    description:
      'Text preprocessing, tokenization, word embeddings (Word2Vec, GloVe), sentiment analysis, and sequence modeling.',
    aliases: ['NLP', 'Text Analytics', 'Language Processing'],
  },
  {
    slug: 'transformers-llms',
    name: 'Transformers & Large Language Models',
    category: 'AI/ML',
    skillType: 'Technical',
    description:
      'Attention mechanisms, Transformer architectures (GPT, BERT, Llama), fine-tuning, and model evaluation.',
    aliases: ['Transformers', 'LLMs', 'Large Language Models', 'Generative AI'],
  },
  {
    slug: 'prompt-engineering',
    name: 'Prompt Engineering & LLM Orchestration',
    category: 'AI/ML',
    skillType: 'Technical',
    description:
      'Few-shot prompting, chain-of-thought, function calling, LangChain, LlamaIndex, and structured JSON output generation.',
    aliases: ['Prompt Engineering', 'LangChain', 'LlamaIndex', 'LLM Chains'],
  },
  {
    slug: 'vector-databases',
    name: 'Vector Databases & Embeddings',
    category: 'AI/ML',
    skillType: 'Technical',
    description:
      'High-dimensional embeddings, semantic search, vector indexing (HNSW), Pinecone, Milvus, Qdrant, and RAG architectures.',
    aliases: ['Vector DB', 'Embeddings', 'RAG', 'Retrieval Augmented Generation', 'Pinecone'],
  },
  {
    slug: 'mlops',
    name: 'MLOps & Model Deployment',
    category: 'AI/ML',
    skillType: 'Technical',
    description:
      'Model versioning (MLflow), tracking, containerized model serving (Triton, FastAPI), drift monitoring, and CI/CD for ML.',
    aliases: ['MLOps', 'Model Serving', 'MLflow', 'Model Monitoring'],
  },

  // Data Engineering
  {
    slug: 'etl-pipelines',
    name: 'ETL & Data Pipelines',
    category: 'Data',
    skillType: 'Technical',
    description:
      'Designing extract, transform, and load workflows, batch processing, data cleansing, and workflow orchestrators like Airflow.',
    aliases: ['ETL', 'ELT', 'Apache Airflow', 'Data Ingestion'],
  },
  {
    slug: 'data-warehousing',
    name: 'Data Warehousing & Dimensional Modeling',
    category: 'Data',
    skillType: 'Concept',
    description:
      'Star/Snowflake schemas, fact and dimension tables, Snowflake, BigQuery, and Databricks lakehouse patterns.',
    aliases: ['Snowflake', 'BigQuery', 'Data Warehouse', 'Dimensional Modeling'],
  },
  {
    slug: 'distributed-data-spark',
    name: 'Distributed Data Processing (Spark)',
    category: 'Data',
    skillType: 'Technical',
    description:
      'Big data processing with Apache Spark, PySpark, resilient distributed datasets (RDDs), and data streaming.',
    aliases: ['Spark', 'PySpark', 'Apache Spark', 'Big Data'],
  },

  // Security
  {
    slug: 'web-security-owasp',
    name: 'Web Security & OWASP Top 10',
    category: 'Security',
    skillType: 'Concept',
    description:
      'Mitigating vulnerabilities like SQL injection, XSS, CSRF, SSRF, security misconfigurations, and secure coding practices.',
    aliases: ['OWASP', 'Web Security', 'AppSec', 'Vulnerability Mitigation'],
  },
  {
    slug: 'network-security',
    name: 'Network Security & Firewalls',
    category: 'Security',
    skillType: 'Technical',
    description:
      'Intrusion detection (IDS/IPS), firewalls, VPNs, packet inspection (Wireshark), network segmentation, and zero trust.',
    aliases: ['NetSec', 'Firewalls', 'Network Defense', 'Wireshark'],
  },
  {
    slug: 'cryptography-fundamentals',
    name: 'Cryptography Fundamentals',
    category: 'Security',
    skillType: 'Concept',
    description:
      'Symmetric and asymmetric encryption (AES, RSA), hashing algorithms (SHA-256), digital signatures, and public key infrastructure (PKI).',
    aliases: ['Cryptography', 'Encryption', 'PKI', 'Hashing'],
  },
  {
    slug: 'security-monitoring-siem',
    name: 'Security Operations & SIEM',
    category: 'Security',
    skillType: 'Tool',
    description:
      'Log analysis, threat detection, incident response, and security event correlation using Splunk or Elastic Security.',
    aliases: ['SIEM', 'SOC', 'Splunk', 'Threat Detection'],
  },

  // Testing & Quality Assurance
  {
    slug: 'unit-integration-testing',
    name: 'Unit & Integration Testing',
    category: 'Tools',
    skillType: 'Technical',
    description:
      'Writing automated unit and integration tests using frameworks like JUnit, Jest, PyTest, mocks, and test coverage analysis.',
    aliases: ['Unit Testing', 'Integration Testing', 'PyTest', 'Jest', 'JUnit'],
  },
  {
    slug: 'automated-e2e-testing',
    name: 'Automated E2E Testing',
    category: 'Tools',
    skillType: 'Technical',
    description:
      'End-to-end browser automation and testing frameworks such as Playwright, Cypress, and Selenium.',
    aliases: ['Playwright', 'Cypress', 'Selenium', 'E2E Testing'],
  },
  {
    slug: 'performance-load-testing',
    name: 'Performance & Load Testing',
    category: 'Tools',
    skillType: 'Technical',
    description:
      'Simulating high concurrency traffic and benchmarking response latencies using k6, JMeter, or Locust.',
    aliases: ['Load Testing', 'k6', 'JMeter', 'Stress Testing'],
  },

  // Mobile Development
  {
    slug: 'react-native',
    name: 'React Native',
    category: 'Frontend',
    skillType: 'Technical',
    description:
      'Cross-platform mobile app development framework for iOS and Android using React and native bridge APIs.',
    aliases: ['React Native Mobile', 'Expo', 'RN'],
  },
  {
    slug: 'flutter',
    name: 'Flutter & Dart',
    category: 'Frontend',
    skillType: 'Technical',
    description:
      'Google UI toolkit for crafting natively compiled applications for mobile, web, and desktop from a single codebase.',
    aliases: ['Flutter', 'Dart', 'Flutter Mobile'],
  },
  {
    slug: 'mobile-app-architecture',
    name: 'Mobile App Architecture & State',
    category: 'Architecture',
    skillType: 'Concept',
    description:
      'Mobile design patterns (MVVM, Clean Architecture), offline caching, push notifications, and app store deployment.',
    aliases: ['Mobile Architecture', 'MVVM', 'Offline First'],
  },

  // Soft Skills & Methodology
  {
    slug: 'agile-scrum',
    name: 'Agile & Scrum Methodologies',
    category: 'Soft Skills',
    skillType: 'SoftSkill',
    description:
      'Sprint planning, backlog grooming, daily standups, retrospectives, and iterative software delivery.',
    aliases: ['Agile', 'Scrum', 'Sprint Planning', 'Kanban'],
  },
  {
    slug: 'technical-communication',
    name: 'Technical Communication & Documentation',
    category: 'Soft Skills',
    skillType: 'SoftSkill',
    description:
      'Writing clear technical design docs (RFCs), code review feedback, and explaining complex concepts to non-technical stakeholders.',
    aliases: ['Technical Writing', 'RFCs', 'Design Docs', 'Communication'],
  },
  {
    slug: 'product-metrics-analytics',
    name: 'Product Metrics & A/B Testing',
    category: 'Data',
    skillType: 'Concept',
    description:
      'Defining KPIs, North Star metrics, funnel conversion tracking, cohort retention, and hypothesis-driven A/B testing.',
    aliases: ['A/B Testing', 'Product Analytics', 'KPIs', 'Conversion Rate'],
  },
];

export const SEED_PREREQUISITES: SeedPrerequisite[] = [
  // Programming & DSA
  {
    skillSlug: 'data-structures-algorithms',
    prerequisiteSlug: 'programming-fundamentals',
    strength: 'REQUIRED',
    rationale:
      'Algorithms and complex data structures build upon core programming syntax and control flow.',
  },
  {
    skillSlug: 'python',
    prerequisiteSlug: 'programming-fundamentals',
    strength: 'REQUIRED',
    rationale:
      'Understanding basic programming concepts is essential before learning Python syntax and idioms.',
  },
  {
    skillSlug: 'javascript',
    prerequisiteSlug: 'programming-fundamentals',
    strength: 'REQUIRED',
    rationale: 'Core programming logic is needed to write effective JavaScript.',
  },
  {
    skillSlug: 'typescript',
    prerequisiteSlug: 'javascript',
    strength: 'REQUIRED',
    rationale:
      'TypeScript is a typed superset of JavaScript, requiring solid JavaScript foundations.',
  },
  {
    skillSlug: 'java',
    prerequisiteSlug: 'programming-fundamentals',
    strength: 'REQUIRED',
    rationale: 'Java builds on core programming logic and object-oriented syntax.',
  },
  {
    skillSlug: 'go',
    prerequisiteSlug: 'programming-fundamentals',
    strength: 'REQUIRED',
    rationale:
      'Go requires foundational understanding of functions, structs, and control structures.',
  },
  {
    skillSlug: 'cpp',
    prerequisiteSlug: 'programming-fundamentals',
    strength: 'REQUIRED',
    rationale: 'C++ memory management and syntax require solid programming basics.',
  },

  // Frontend
  {
    skillSlug: 'react',
    prerequisiteSlug: 'javascript',
    strength: 'REQUIRED',
    rationale:
      'React relies heavily on modern JavaScript features like ES6 modules, destructuring, and closures.',
  },
  {
    skillSlug: 'react',
    prerequisiteSlug: 'html-css',
    strength: 'REQUIRED',
    rationale:
      'JSX generates HTML DOM elements and requires understanding of web layout and CSS styling.',
  },
  {
    skillSlug: 'nextjs',
    prerequisiteSlug: 'react',
    strength: 'REQUIRED',
    rationale:
      'Next.js is a meta-framework built directly on top of React components and conventions.',
  },
  {
    skillSlug: 'vuejs',
    prerequisiteSlug: 'javascript',
    strength: 'REQUIRED',
    rationale: 'Vue.js components require solid JavaScript and DOM understanding.',
  },
  {
    skillSlug: 'tailwind-css',
    prerequisiteSlug: 'html-css',
    strength: 'REQUIRED',
    rationale:
      'Tailwind utility classes map directly to underlying CSS properties and box model principles.',
  },
  {
    skillSlug: 'state-management',
    prerequisiteSlug: 'react',
    strength: 'RECOMMENDED',
    rationale:
      'Complex state management libraries solve state sharing problems encountered in React applications.',
  },
  {
    skillSlug: 'web-performance',
    prerequisiteSlug: 'html-css',
    strength: 'RECOMMENDED',
    rationale:
      'Optimizing web performance requires understanding browser rendering pipelines and asset loading.',
  },

  // Backend & Networking
  {
    skillSlug: 'http-protocols',
    prerequisiteSlug: 'networking-basics',
    strength: 'REQUIRED',
    rationale:
      'HTTP is an application layer protocol that operates over the TCP/IP networking stack.',
  },
  {
    skillSlug: 'rest-apis',
    prerequisiteSlug: 'http-protocols',
    strength: 'REQUIRED',
    rationale:
      'REST APIs leverage HTTP methods, status codes, headers, and request/response payloads.',
  },
  {
    skillSlug: 'api-design',
    prerequisiteSlug: 'rest-apis',
    strength: 'REQUIRED',
    rationale:
      'Enterprise API design standards build upon RESTful architecture and client contract principles.',
  },
  {
    skillSlug: 'nodejs',
    prerequisiteSlug: 'javascript',
    strength: 'REQUIRED',
    rationale: 'Node.js is a server-side execution runtime for JavaScript.',
  },
  {
    skillSlug: 'express',
    prerequisiteSlug: 'nodejs',
    strength: 'REQUIRED',
    rationale: 'Express is a web routing framework built specifically for the Node.js runtime.',
  },
  {
    skillSlug: 'express',
    prerequisiteSlug: 'rest-apis',
    strength: 'RECOMMENDED',
    rationale: 'Express is primarily used to build RESTful web services and API endpoints.',
  },
  {
    skillSlug: 'spring-boot',
    prerequisiteSlug: 'java',
    strength: 'REQUIRED',
    rationale: 'Spring Boot is an enterprise Java framework relying on Java OOP and annotations.',
  },
  {
    skillSlug: 'fastapi',
    prerequisiteSlug: 'python',
    strength: 'REQUIRED',
    rationale: 'FastAPI uses Python type hints and asynchronous async/await language constructs.',
  },
  {
    skillSlug: 'django',
    prerequisiteSlug: 'python',
    strength: 'REQUIRED',
    rationale: 'Django is a full-featured web framework built using Python OOP patterns.',
  },
  {
    skillSlug: 'graphql',
    prerequisiteSlug: 'http-protocols',
    strength: 'RECOMMENDED',
    rationale: 'GraphQL servers operate over HTTP POST requests and type schema definitions.',
  },
  {
    skillSlug: 'authentication-authorization',
    prerequisiteSlug: 'http-protocols',
    strength: 'REQUIRED',
    rationale:
      'Auth mechanisms rely on HTTP headers (Authorization, Bearer), cookies, and secure sessions.',
  },

  // Databases
  {
    skillSlug: 'database-design',
    prerequisiteSlug: 'sql',
    strength: 'REQUIRED',
    rationale:
      'Database schema normalization requires understanding relational tables and SQL queries.',
  },
  {
    skillSlug: 'postgresql',
    prerequisiteSlug: 'sql',
    strength: 'REQUIRED',
    rationale: 'PostgreSQL uses standard SQL dialect with advanced transactional extensions.',
  },
  {
    skillSlug: 'mysql',
    prerequisiteSlug: 'sql',
    strength: 'REQUIRED',
    rationale: 'MySQL is a relational database queried using SQL syntax.',
  },
  {
    skillSlug: 'query-optimization',
    prerequisiteSlug: 'database-design',
    strength: 'REQUIRED',
    rationale:
      'Tuning query performance requires understanding table schemas, keys, and relational indexes.',
  },
  {
    skillSlug: 'query-optimization',
    prerequisiteSlug: 'sql',
    strength: 'REQUIRED',
    rationale: 'Analyzing execution plans requires deep fluency in SQL queries and joins.',
  },
  {
    skillSlug: 'redis',
    prerequisiteSlug: 'networking-basics',
    strength: 'HELPFUL',
    rationale: 'Redis connects over TCP sockets as an in-memory networked key-value data store.',
  },

  // Architecture
  {
    skillSlug: 'object-oriented-design',
    prerequisiteSlug: 'programming-fundamentals',
    strength: 'REQUIRED',
    rationale:
      'OOD patterns build on object-oriented programming language features like classes and interfaces.',
  },
  {
    skillSlug: 'microservices',
    prerequisiteSlug: 'rest-apis',
    strength: 'REQUIRED',
    rationale: 'Microservices communicate through REST, gRPC, or messaging contracts.',
  },
  {
    skillSlug: 'caching-strategies',
    prerequisiteSlug: 'redis',
    strength: 'RECOMMENDED',
    rationale: 'Implementing caching patterns typically utilizes in-memory stores like Redis.',
  },
  {
    skillSlug: 'system-design',
    prerequisiteSlug: 'microservices',
    strength: 'REQUIRED',
    rationale:
      'System design synthesizes microservices, load balancers, databases, and caching layers.',
  },
  {
    skillSlug: 'system-design',
    prerequisiteSlug: 'database-design',
    strength: 'REQUIRED',
    rationale:
      'Architecting scalable systems requires understanding database throughput and consistency tradeoffs.',
  },
  {
    skillSlug: 'message-queues',
    prerequisiteSlug: 'networking-basics',
    strength: 'RECOMMENDED',
    rationale: 'Event brokers manage distributed network socket connections and consumer groups.',
  },

  // DevOps & Cloud
  {
    skillSlug: 'docker',
    prerequisiteSlug: 'linux-fundamentals',
    strength: 'REQUIRED',
    rationale:
      'Docker containers use Linux kernel features such as cgroups, namespaces, and file systems.',
  },
  {
    skillSlug: 'kubernetes',
    prerequisiteSlug: 'docker',
    strength: 'REQUIRED',
    rationale: 'Kubernetes orchestrates containerized workloads packaged as Docker images.',
  },
  {
    skillSlug: 'ci-cd-pipelines',
    prerequisiteSlug: 'git-version-control',
    strength: 'REQUIRED',
    rationale: 'Continuous integration triggers on Git events (pushes, pull requests, tags).',
  },
  {
    skillSlug: 'aws',
    prerequisiteSlug: 'cloud-fundamentals',
    strength: 'REQUIRED',
    rationale: 'AWS services implement foundational cloud architecture models (IaaS, PaaS, VPCs).',
  },
  {
    skillSlug: 'terraform',
    prerequisiteSlug: 'cloud-fundamentals',
    strength: 'REQUIRED',
    rationale: 'Terraform automates provisioning of underlying cloud provider resources.',
  },

  // AI & Data Science
  {
    skillSlug: 'data-analysis-pandas',
    prerequisiteSlug: 'python',
    strength: 'REQUIRED',
    rationale:
      'Pandas and NumPy are Python libraries for dataframe manipulation and vectorized math.',
  },
  {
    skillSlug: 'data-visualization',
    prerequisiteSlug: 'statistics-probability',
    strength: 'RECOMMENDED',
    rationale:
      'Interpreting visual distributions and charts requires basic statistical understanding.',
  },
  {
    skillSlug: 'machine-learning-fundamentals',
    prerequisiteSlug: 'statistics-probability',
    strength: 'REQUIRED',
    rationale:
      'ML cost functions, regression, and loss metrics are rooted in statistical probability.',
  },
  {
    skillSlug: 'machine-learning-fundamentals',
    prerequisiteSlug: 'data-analysis-pandas',
    strength: 'REQUIRED',
    rationale: 'Feature engineering and dataset preparation rely heavily on Pandas and NumPy.',
  },
  {
    skillSlug: 'deep-learning',
    prerequisiteSlug: 'machine-learning-fundamentals',
    strength: 'REQUIRED',
    rationale:
      'Neural networks extend foundational supervised learning and gradient descent concepts.',
  },
  {
    skillSlug: 'nlp',
    prerequisiteSlug: 'machine-learning-fundamentals',
    strength: 'REQUIRED',
    rationale:
      'NLP models use feature extraction, classification, and statistical language modeling.',
  },
  {
    skillSlug: 'transformers-llms',
    prerequisiteSlug: 'deep-learning',
    strength: 'REQUIRED',
    rationale: 'Transformers are deep attention-based neural network architectures.',
  },
  {
    skillSlug: 'transformers-llms',
    prerequisiteSlug: 'nlp',
    strength: 'RECOMMENDED',
    rationale: 'LLMs are trained to solve sequence-to-sequence and token generation NLP tasks.',
  },
  {
    skillSlug: 'prompt-engineering',
    prerequisiteSlug: 'transformers-llms',
    strength: 'REQUIRED',
    rationale:
      'Effective prompting requires understanding tokenization, context windows, and model behavior.',
  },
  {
    skillSlug: 'vector-databases',
    prerequisiteSlug: 'prompt-engineering',
    strength: 'RECOMMENDED',
    rationale: 'Vector search is utilized in RAG pipelines to supply relevant context to LLMs.',
  },
  {
    skillSlug: 'mlops',
    prerequisiteSlug: 'docker',
    strength: 'REQUIRED',
    rationale: 'Production ML models are packaged and served inside standardized containers.',
  },
  {
    skillSlug: 'mlops',
    prerequisiteSlug: 'machine-learning-fundamentals',
    strength: 'REQUIRED',
    rationale: 'Model tracking and drift detection monitor ML evaluation metrics in production.',
  },

  // Data Engineering
  {
    skillSlug: 'etl-pipelines',
    prerequisiteSlug: 'sql',
    strength: 'REQUIRED',
    rationale:
      'Data extraction and transformation logic heavily utilizes SQL queries and data schemas.',
  },
  {
    skillSlug: 'data-warehousing',
    prerequisiteSlug: 'database-design',
    strength: 'REQUIRED',
    rationale:
      'Dimensional modeling extends relational schema concepts into star and snowflake schemas.',
  },
  {
    skillSlug: 'distributed-data-spark',
    prerequisiteSlug: 'data-analysis-pandas',
    strength: 'REQUIRED',
    rationale:
      'PySpark DataFrame APIs mirror Pandas operations scaled across distributed clusters.',
  },

  // Security
  {
    skillSlug: 'web-security-owasp',
    prerequisiteSlug: 'http-protocols',
    strength: 'REQUIRED',
    rationale: 'Web security exploits target HTTP parameters, headers, cookies, and DOM execution.',
  },
  {
    skillSlug: 'network-security',
    prerequisiteSlug: 'networking-basics',
    strength: 'REQUIRED',
    rationale:
      'Securing networks requires understanding packet routing, ports, subnets, and protocols.',
  },
  {
    skillSlug: 'security-monitoring-siem',
    prerequisiteSlug: 'network-security',
    strength: 'RECOMMENDED',
    rationale: 'SIEM rules analyze firewall, DNS, and server authentication logs for anomalies.',
  },

  // Mobile
  {
    skillSlug: 'react-native',
    prerequisiteSlug: 'react',
    strength: 'REQUIRED',
    rationale: 'React Native uses React declarative component model and JSX syntax.',
  },
  {
    skillSlug: 'react-native',
    prerequisiteSlug: 'mobile-app-architecture',
    strength: 'RECOMMENDED',
    rationale:
      'Mobile apps require handling mobile navigation, hardware permissions, and lifecycle events.',
  },
  {
    skillSlug: 'flutter',
    prerequisiteSlug: 'programming-fundamentals',
    strength: 'REQUIRED',
    rationale: 'Dart is an object-oriented language requiring solid programming fundamentals.',
  },

  // Testing
  {
    skillSlug: 'unit-integration-testing',
    prerequisiteSlug: 'programming-fundamentals',
    strength: 'REQUIRED',
    rationale:
      'Writing unit test assertions requires understanding functions, objects, and return values.',
  },
  {
    skillSlug: 'automated-e2e-testing',
    prerequisiteSlug: 'html-css',
    strength: 'REQUIRED',
    rationale: 'E2E browser tests locate DOM selectors and inspect rendered web elements.',
  },
  {
    skillSlug: 'performance-load-testing',
    prerequisiteSlug: 'http-protocols',
    strength: 'REQUIRED',
    rationale: 'Load testing tools simulate concurrent HTTP requests to measure endpoint latency.',
  },
];

export const SEED_CAREER_SKILLS: SeedCareerSkill[] = [
  // 1. Backend Engineer
  {
    careerSlug: 'backend-engineer',
    skillSlug: 'programming-fundamentals',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 1,
    isCore: true,
    rationale:
      'Deep mastery of data structures, algorithmic complexity, and control flow is essential for server-side logic.',
  },
  {
    careerSlug: 'backend-engineer',
    skillSlug: 'rest-apis',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 2,
    isCore: true,
    rationale:
      'Building robust, standardized REST endpoints is the primary interface between clients and server systems.',
  },
  {
    careerSlug: 'backend-engineer',
    skillSlug: 'sql',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 3,
    isCore: true,
    rationale:
      'Formulating efficient SQL queries and relational operations is required for persistent data management.',
  },
  {
    careerSlug: 'backend-engineer',
    skillSlug: 'postgresql',
    importance: 'HIGH',
    requiredLevel: 4,
    priority: 4,
    isCore: false,
    rationale:
      'PostgreSQL is the industry-standard relational database for high-throughput enterprise backends.',
  },
  {
    careerSlug: 'backend-engineer',
    skillSlug: 'database-design',
    importance: 'HIGH',
    requiredLevel: 4,
    priority: 5,
    isCore: false,
    rationale:
      'Proper schema normalization and indexing ensure data integrity and query efficiency under heavy load.',
  },
  {
    careerSlug: 'backend-engineer',
    skillSlug: 'authentication-authorization',
    importance: 'HIGH',
    requiredLevel: 4,
    priority: 6,
    isCore: false,
    rationale:
      'Protecting sensitive endpoints with JWT, OAuth2, and role-based access control is a baseline requirement.',
  },
  {
    careerSlug: 'backend-engineer',
    skillSlug: 'system-design',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 7,
    isCore: false,
    rationale:
      'Architecting scalable, fault-tolerant backend services capable of handling growing traffic demands.',
  },
  {
    careerSlug: 'backend-engineer',
    skillSlug: 'redis',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 8,
    isCore: false,
    rationale:
      'Redis is commonly used for caching, session storage, and rate limiting to reduce database pressure.',
  },
  {
    careerSlug: 'backend-engineer',
    skillSlug: 'docker',
    importance: 'MEDIUM',
    requiredLevel: 3,
    priority: 9,
    isCore: false,
    rationale:
      'Containerizing backend services ensures consistent execution across development and production environments.',
  },
  {
    careerSlug: 'backend-engineer',
    skillSlug: 'microservices',
    importance: 'MEDIUM',
    requiredLevel: 3,
    priority: 10,
    isCore: false,
    rationale:
      'Decomposing complex business domains into modular, independently deployable microservices.',
  },
  {
    careerSlug: 'backend-engineer',
    skillSlug: 'unit-integration-testing',
    importance: 'HIGH',
    requiredLevel: 4,
    priority: 11,
    isCore: false,
    rationale:
      'Automated unit and integration testing prevent regressions and ensure business logic correctness.',
  },
  {
    careerSlug: 'backend-engineer',
    skillSlug: 'message-queues',
    importance: 'MEDIUM',
    requiredLevel: 3,
    priority: 12,
    isCore: false,
    rationale:
      'Message brokers enable asynchronous background processing and event-driven decoupling.',
  },
  {
    careerSlug: 'backend-engineer',
    skillSlug: 'aws',
    importance: 'OPTIONAL',
    requiredLevel: 2,
    priority: 13,
    isCore: false,
    rationale:
      'Deploying and integrating backend services with cloud infrastructure like AWS S3 and RDS.',
  },

  // 2. Frontend Engineer
  {
    careerSlug: 'frontend-engineer',
    skillSlug: 'javascript',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 1,
    isCore: true,
    rationale:
      'JavaScript is the fundamental execution language of modern client-side web applications.',
  },
  {
    careerSlug: 'frontend-engineer',
    skillSlug: 'typescript',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 2,
    isCore: true,
    rationale:
      'TypeScript provides static typing and interface contracts, critical for scalable frontend codebases.',
  },
  {
    careerSlug: 'frontend-engineer',
    skillSlug: 'html-css',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 3,
    isCore: true,
    rationale:
      'Semantic HTML markup and responsive CSS layout design form the structural foundation of the UI.',
  },
  {
    careerSlug: 'frontend-engineer',
    skillSlug: 'react',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 4,
    isCore: true,
    rationale: 'React is the dominant component-driven UI library in the enterprise web ecosystem.',
  },
  {
    careerSlug: 'frontend-engineer',
    skillSlug: 'tailwind-css',
    importance: 'HIGH',
    requiredLevel: 4,
    priority: 5,
    isCore: false,
    rationale:
      'Tailwind CSS accelerates responsive UI styling while maintaining strict design system consistency.',
  },
  {
    careerSlug: 'frontend-engineer',
    skillSlug: 'nextjs',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 6,
    isCore: false,
    rationale:
      'Next.js delivers server-side rendering, SEO optimization, and fast static page generation.',
  },
  {
    careerSlug: 'frontend-engineer',
    skillSlug: 'web-performance',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 7,
    isCore: false,
    rationale:
      'Optimizing Core Web Vitals, asset bundles, and rendering performance ensures smooth user experiences.',
  },
  {
    careerSlug: 'frontend-engineer',
    skillSlug: 'state-management',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 8,
    isCore: false,
    rationale:
      'Managing complex asynchronous state across large component hierarchies requires dedicated state stores.',
  },
  {
    careerSlug: 'frontend-engineer',
    skillSlug: 'rest-apis',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 9,
    isCore: false,
    rationale:
      'Frontend clients consume backend REST APIs to fetch, mutate, and display application data.',
  },
  {
    careerSlug: 'frontend-engineer',
    skillSlug: 'automated-e2e-testing',
    importance: 'MEDIUM',
    requiredLevel: 3,
    priority: 10,
    isCore: false,
    rationale: 'E2E test automation with Playwright/Cypress validates critical user journeys.',
  },

  // 3. Full Stack Engineer
  {
    careerSlug: 'full-stack-engineer',
    skillSlug: 'javascript',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 1,
    isCore: true,
    rationale: 'JavaScript is used across both frontend interfaces and Node.js backend services.',
  },
  {
    careerSlug: 'full-stack-engineer',
    skillSlug: 'typescript',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 2,
    isCore: true,
    rationale:
      'TypeScript allows end-to-end type safety between frontend UI and backend API layers.',
  },
  {
    careerSlug: 'full-stack-engineer',
    skillSlug: 'react',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 3,
    isCore: true,
    rationale: 'Core library for delivering modern, reactive single-page user interfaces.',
  },
  {
    careerSlug: 'full-stack-engineer',
    skillSlug: 'nodejs',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 4,
    isCore: true,
    rationale:
      'Node.js enables JavaScript developers to build high-concurrency backend services and APIs.',
  },
  {
    careerSlug: 'full-stack-engineer',
    skillSlug: 'rest-apis',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 5,
    isCore: true,
    rationale:
      'Designing and integrating RESTful contracts between client and server architectures.',
  },
  {
    careerSlug: 'full-stack-engineer',
    skillSlug: 'sql',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 6,
    isCore: false,
    rationale: 'Relational querying and database schema modeling for application persistence.',
  },
  {
    careerSlug: 'full-stack-engineer',
    skillSlug: 'html-css',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 7,
    isCore: false,
    rationale: 'Foundational markup and styling for responsive web layouts.',
  },
  {
    careerSlug: 'full-stack-engineer',
    skillSlug: 'docker',
    importance: 'MEDIUM',
    requiredLevel: 3,
    priority: 8,
    isCore: false,
    rationale: 'Containerizing full stack apps for local development and CI/CD deployment.',
  },
  {
    careerSlug: 'full-stack-engineer',
    skillSlug: 'authentication-authorization',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 9,
    isCore: false,
    rationale: 'Implementing secure login, token management, and permission guards across stack.',
  },

  // 4. Software Engineer
  {
    careerSlug: 'software-engineer',
    skillSlug: 'programming-fundamentals',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 1,
    isCore: true,
    rationale: 'Core algorithmic problem solving, syntax fluency, and memory fundamentals.',
  },
  {
    careerSlug: 'software-engineer',
    skillSlug: 'data-structures-algorithms',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 2,
    isCore: true,
    rationale:
      'Essential for writing computationally efficient code and passing technical evaluations.',
  },
  {
    careerSlug: 'software-engineer',
    skillSlug: 'object-oriented-design',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 3,
    isCore: false,
    rationale: 'Writing maintainable, modular code adhering to SOLID principles.',
  },
  {
    careerSlug: 'software-engineer',
    skillSlug: 'git-version-control',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 4,
    isCore: false,
    rationale:
      'Collaborating effectively within engineering teams via Git branches and pull requests.',
  },
  {
    careerSlug: 'software-engineer',
    skillSlug: 'unit-integration-testing',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 5,
    isCore: false,
    rationale: 'Ensuring code reliability with thorough automated test coverage.',
  },

  // 5. DevOps Engineer
  {
    careerSlug: 'devops-engineer',
    skillSlug: 'linux-fundamentals',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 1,
    isCore: true,
    rationale:
      'Linux is the operating system powering virtually all cloud and container infrastructure.',
  },
  {
    careerSlug: 'devops-engineer',
    skillSlug: 'docker',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 2,
    isCore: true,
    rationale: 'Standardizing application packaging into isolated container images.',
  },
  {
    careerSlug: 'devops-engineer',
    skillSlug: 'kubernetes',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 3,
    isCore: true,
    rationale:
      'Managing container orchestration, auto-scaling, and cluster networking in production.',
  },
  {
    careerSlug: 'devops-engineer',
    skillSlug: 'ci-cd-pipelines',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 4,
    isCore: true,
    rationale: 'Automating testing, security scanning, and deployment pipelines.',
  },
  {
    careerSlug: 'devops-engineer',
    skillSlug: 'terraform',
    importance: 'HIGH',
    requiredLevel: 4,
    priority: 5,
    isCore: false,
    rationale: 'Provisioning multi-cloud resources declaratively using Infrastructure as Code.',
  },
  {
    careerSlug: 'devops-engineer',
    skillSlug: 'aws',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 6,
    isCore: false,
    rationale: 'Deploying and managing cloud VPCs, compute instances, and IAM security.',
  },

  // 6. Cloud Engineer
  {
    careerSlug: 'cloud-engineer',
    skillSlug: 'cloud-fundamentals',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 1,
    isCore: true,
    rationale: 'Understanding cloud computing models, multi-region redundancy, and availability.',
  },
  {
    careerSlug: 'cloud-engineer',
    skillSlug: 'aws',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 2,
    isCore: true,
    rationale: 'Architecting scalable enterprise infrastructure on Amazon Web Services.',
  },
  {
    careerSlug: 'cloud-engineer',
    skillSlug: 'terraform',
    importance: 'HIGH',
    requiredLevel: 4,
    priority: 3,
    isCore: false,
    rationale: 'Automating cloud resource lifecycle and configuration via code.',
  },
  {
    careerSlug: 'cloud-engineer',
    skillSlug: 'docker',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 4,
    isCore: false,
    rationale: 'Deploying containerized workloads to cloud compute clusters.',
  },
  {
    careerSlug: 'cloud-engineer',
    skillSlug: 'networking-basics',
    importance: 'HIGH',
    requiredLevel: 4,
    priority: 5,
    isCore: false,
    rationale: 'Designing cloud subnets, CIDR blocks, security groups, and routing tables.',
  },

  // 7. Data Engineer
  {
    careerSlug: 'data-engineer',
    skillSlug: 'sql',
    importance: 'CORE',
    requiredLevel: 5,
    priority: 1,
    isCore: true,
    rationale: 'Authoring complex SQL transformations, window functions, and analytics queries.',
  },
  {
    careerSlug: 'data-engineer',
    skillSlug: 'python',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 2,
    isCore: true,
    rationale: 'Developing custom ETL scripts, data processing workflows, and API ingestors.',
  },
  {
    careerSlug: 'data-engineer',
    skillSlug: 'etl-pipelines',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 3,
    isCore: true,
    rationale: 'Orchestrating batch and streaming ingestion pipelines with tools like Airflow.',
  },
  {
    careerSlug: 'data-engineer',
    skillSlug: 'data-warehousing',
    importance: 'HIGH',
    requiredLevel: 4,
    priority: 4,
    isCore: false,
    rationale:
      'Designing dimensional data models and managing enterprise Snowflake/BigQuery warehouses.',
  },
  {
    careerSlug: 'data-engineer',
    skillSlug: 'distributed-data-spark',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 5,
    isCore: false,
    rationale: 'Processing massive distributed datasets across Apache Spark compute clusters.',
  },
  {
    careerSlug: 'data-engineer',
    skillSlug: 'database-design',
    importance: 'HIGH',
    requiredLevel: 4,
    priority: 6,
    isCore: false,
    rationale: 'Designing optimized relational and columnar storage schemas.',
  },

  // 8. Data Scientist
  {
    careerSlug: 'data-scientist',
    skillSlug: 'python',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 1,
    isCore: true,
    rationale: 'Primary language for statistical computing, data wrangling, and modeling.',
  },
  {
    careerSlug: 'data-scientist',
    skillSlug: 'statistics-probability',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 2,
    isCore: true,
    rationale:
      'Hypothesis testing, probability distributions, and statistical validation of insights.',
  },
  {
    careerSlug: 'data-scientist',
    skillSlug: 'data-analysis-pandas',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 3,
    isCore: true,
    rationale: 'Wrangling, cleaning, and transforming tabular datasets with Pandas.',
  },
  {
    careerSlug: 'data-scientist',
    skillSlug: 'machine-learning-fundamentals',
    importance: 'HIGH',
    requiredLevel: 4,
    priority: 4,
    isCore: false,
    rationale: 'Training predictive supervised and unsupervised models using Scikit-Learn.',
  },
  {
    careerSlug: 'data-scientist',
    skillSlug: 'sql',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 5,
    isCore: false,
    rationale: 'Extracting raw datasets directly from enterprise relational databases.',
  },
  {
    careerSlug: 'data-scientist',
    skillSlug: 'data-visualization',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 6,
    isCore: false,
    rationale: 'Communicating model findings and distributions to business stakeholders.',
  },

  // 9. Machine Learning Engineer
  {
    careerSlug: 'machine-learning-engineer',
    skillSlug: 'python',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 1,
    isCore: true,
    rationale: 'Developing ML training pipelines, data preprocessing, and model serving.',
  },
  {
    careerSlug: 'machine-learning-engineer',
    skillSlug: 'machine-learning-fundamentals',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 2,
    isCore: true,
    rationale: 'Understanding algorithmic loss functions, regularization, and model evaluation.',
  },
  {
    careerSlug: 'machine-learning-engineer',
    skillSlug: 'deep-learning',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 3,
    isCore: true,
    rationale: 'Building and fine-tuning neural network architectures with PyTorch.',
  },
  {
    careerSlug: 'machine-learning-engineer',
    skillSlug: 'mlops',
    importance: 'HIGH',
    requiredLevel: 4,
    priority: 4,
    isCore: false,
    rationale: 'Deploying, versioning, and monitoring production ML models at scale.',
  },
  {
    careerSlug: 'machine-learning-engineer',
    skillSlug: 'docker',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 5,
    isCore: false,
    rationale: 'Containerizing inference environments with GPU acceleration.',
  },

  // 10. AI Engineer
  {
    careerSlug: 'ai-engineer',
    skillSlug: 'python',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 1,
    isCore: true,
    rationale: 'Core programming language for LLM frameworks, APIs, and data wrangling.',
  },
  {
    careerSlug: 'ai-engineer',
    skillSlug: 'transformers-llms',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 2,
    isCore: true,
    rationale:
      'Mastering Transformer architectures, tokenization, context windows, and model fine-tuning.',
  },
  {
    careerSlug: 'ai-engineer',
    skillSlug: 'prompt-engineering',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 3,
    isCore: true,
    rationale: 'Constructing robust prompt pipelines, few-shot prompts, and LangChain agents.',
  },
  {
    careerSlug: 'ai-engineer',
    skillSlug: 'vector-databases',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 4,
    isCore: true,
    rationale:
      'Implementing Retrieval-Augmented Generation (RAG) using Pinecone, Milvus, and embeddings.',
  },
  {
    careerSlug: 'ai-engineer',
    skillSlug: 'rest-apis',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 5,
    isCore: false,
    rationale: 'Exposing AI capabilities as robust REST APIs for frontend and client consumption.',
  },

  // 11. Cybersecurity Analyst
  {
    careerSlug: 'cybersecurity-analyst',
    skillSlug: 'network-security',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 1,
    isCore: true,
    rationale:
      'Defending network perimeters, analyzing traffic packets, and configuring firewalls.',
  },
  {
    careerSlug: 'cybersecurity-analyst',
    skillSlug: 'web-security-owasp',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 2,
    isCore: true,
    rationale:
      'Identifying and remediating application security vulnerabilities like SQLi and XSS.',
  },
  {
    careerSlug: 'cybersecurity-analyst',
    skillSlug: 'cryptography-fundamentals',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 3,
    isCore: false,
    rationale: 'Applying encryption algorithms and managing public key certificates.',
  },
  {
    careerSlug: 'cybersecurity-analyst',
    skillSlug: 'security-monitoring-siem',
    importance: 'HIGH',
    requiredLevel: 4,
    priority: 4,
    isCore: false,
    rationale: 'Monitoring security event logs in SIEM platforms to detect intrusions.',
  },
  {
    careerSlug: 'cybersecurity-analyst',
    skillSlug: 'linux-fundamentals',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 5,
    isCore: false,
    rationale: 'Auditing server configurations and inspecting Linux auth logs.',
  },

  // 12. Mobile Application Developer
  {
    careerSlug: 'mobile-app-developer',
    skillSlug: 'javascript',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 1,
    isCore: true,
    rationale: 'Writing business logic and component handlers for mobile apps.',
  },
  {
    careerSlug: 'mobile-app-developer',
    skillSlug: 'react-native',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 2,
    isCore: true,
    rationale: 'Developing cross-platform iOS and Android apps with React Native.',
  },
  {
    careerSlug: 'mobile-app-developer',
    skillSlug: 'mobile-app-architecture',
    importance: 'HIGH',
    requiredLevel: 4,
    priority: 3,
    isCore: false,
    rationale: 'Designing responsive mobile navigation, local caching, and lifecycle management.',
  },
  {
    careerSlug: 'mobile-app-developer',
    skillSlug: 'rest-apis',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 4,
    isCore: false,
    rationale: 'Fetching and synchronizing data between mobile clients and backend servers.',
  },

  // 13. QA / Automation Engineer
  {
    careerSlug: 'qa-automation-engineer',
    skillSlug: 'automated-e2e-testing',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 1,
    isCore: true,
    rationale: 'Authoring automated end-to-end browser test suites with Playwright and Cypress.',
  },
  {
    careerSlug: 'qa-automation-engineer',
    skillSlug: 'unit-integration-testing',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 2,
    isCore: true,
    rationale: 'Structuring integration test frameworks and validating API contracts.',
  },
  {
    careerSlug: 'qa-automation-engineer',
    skillSlug: 'javascript',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 3,
    isCore: false,
    rationale: 'Writing test automation scripts in JavaScript/TypeScript.',
  },
  {
    careerSlug: 'qa-automation-engineer',
    skillSlug: 'ci-cd-pipelines',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 4,
    isCore: false,
    rationale: 'Integrating automated test suites into CI/CD build gates.',
  },
  {
    careerSlug: 'qa-automation-engineer',
    skillSlug: 'performance-load-testing',
    importance: 'MEDIUM',
    requiredLevel: 3,
    priority: 5,
    isCore: false,
    rationale: 'Executing load tests with k6 to measure server performance under stress.',
  },

  // 14. Data Analyst
  {
    careerSlug: 'data-analyst',
    skillSlug: 'sql',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 1,
    isCore: true,
    rationale: 'Querying relational databases to extract business data and calculate metrics.',
  },
  {
    careerSlug: 'data-analyst',
    skillSlug: 'data-visualization',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 2,
    isCore: true,
    rationale: 'Building interactive business dashboards in Tableau and Power BI.',
  },
  {
    careerSlug: 'data-analyst',
    skillSlug: 'data-analysis-pandas',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 3,
    isCore: false,
    rationale: 'Cleaning and exploring data files with Python and Pandas.',
  },
  {
    careerSlug: 'data-analyst',
    skillSlug: 'statistics-probability',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 4,
    isCore: false,
    rationale: 'Applying statistical testing to validate business hypotheses.',
  },

  // 15. Product Analyst
  {
    careerSlug: 'product-analyst',
    skillSlug: 'sql',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 1,
    isCore: true,
    rationale: 'Querying user activity logs to calculate product retention and adoption.',
  },
  {
    careerSlug: 'product-analyst',
    skillSlug: 'product-metrics-analytics',
    importance: 'CORE',
    requiredLevel: 4,
    priority: 2,
    isCore: true,
    rationale: 'Designing A/B test experiments and tracking conversion funnel metrics.',
  },
  {
    careerSlug: 'product-analyst',
    skillSlug: 'data-visualization',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 3,
    isCore: false,
    rationale: 'Creating executive summaries and visual charts of product experiments.',
  },
  {
    careerSlug: 'product-analyst',
    skillSlug: 'statistics-probability',
    importance: 'HIGH',
    requiredLevel: 3,
    priority: 4,
    isCore: false,
    rationale: 'Calculating statistical significance and confidence intervals for A/B tests.',
  },
];
