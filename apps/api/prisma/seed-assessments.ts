import prisma from '../src/db/client.js';

export interface SeedQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  skillSlug: string;
}

export interface SeedAssessment {
  title: string;
  slug: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedMinutes: number;
  passingScore: number;
  skillSlugs: string[];
  questions: SeedQuestion[];
}

export const CURATED_ASSESSMENTS: SeedAssessment[] = [
  {
    title: 'REST API Architecture & Protocol Mastery',
    slug: 'rest-api-assessment',
    description:
      'Evaluate your understanding of HTTP semantics, REST architectural constraints, idempotent operations, resource modeling, and error handling.',
    difficulty: 'INTERMEDIATE',
    estimatedMinutes: 15,
    passingScore: 70,
    skillSlugs: ['rest-apis'],
    questions: [
      {
        question:
          'Which HTTP method is specifically intended for applying partial modifications to a resource according to RFC 5789?',
        options: ['PUT', 'POST', 'PATCH', 'UPDATE'],
        correctAnswer: 2,
        explanation:
          'PATCH is defined in RFC 5789 for partial resource updates, whereas PUT is designed to replace the entire target resource representation.',
        difficulty: 'BEGINNER',
        skillSlug: 'rest-apis',
      },
      {
        question:
          'An API client executes a request to delete an already deleted user (`DELETE /users/42`). Which HTTP status code is most standards-compliant for subsequent identical requests?',
        options: [
          '400 Bad Request',
          '404 Not Found or 204 No Content',
          '500 Internal Server Error',
          '409 Conflict',
        ],
        correctAnswer: 1,
        explanation:
          'DELETE is an idempotent operation. When the resource is no longer present, either 404 (Not Found) or 204 (No Content) communicates that the resource does not exist without error.',
        difficulty: 'INTERMEDIATE',
        skillSlug: 'rest-apis',
      },
      {
        question:
          'What is the primary architectural purpose of the HATEOAS (Hypermedia As The Engine Of Application State) constraint in REST?',
        options: [
          'To encrypt JSON payloads over HTTPS',
          'To allow clients to dynamically discover available actions and state transitions via embedded hypermedia links',
          'To enforce relational foreign keys across microservices',
          'To compress response payloads using Brotli or Gzip',
        ],
        correctAnswer: 1,
        explanation:
          'HATEOAS enables decoupled REST clients to navigate application workflows dynamically by following hypermedia links provided in response representations.',
        difficulty: 'ADVANCED',
        skillSlug: 'rest-apis',
      },
      {
        question:
          'Which HTTP header is used by REST APIs to support optimistic concurrency control and prevent the "Lost Update" problem?',
        options: [
          'If-Match with ETag',
          'Cache-Control: no-cache',
          'X-Rate-Limit-Remaining',
          'Accept-Encoding',
        ],
        correctAnswer: 0,
        explanation:
          'Clients transmit the `If-Match` header containing an entity tag (ETag). If another transaction altered the resource in the interim, the server returns 412 Precondition Failed.',
        difficulty: 'ADVANCED',
        skillSlug: 'rest-apis',
      },
      {
        question:
          'When designing pagination for high-volume, frequently updated feeds, why is keyset (cursor-based) pagination preferred over offset/limit pagination?',
        options: [
          'Offset pagination consumes more client memory',
          'Keyset pagination avoids page-drift anomalies and scans only matching index entries rather than scanning and discarding $N$ offset rows',
          'Offset pagination only works with NoSQL databases',
          'Keyset pagination eliminates the need for database indexes',
        ],
        correctAnswer: 1,
        explanation:
          'Cursor-based pagination utilizes constant-time index lookups ($O(1)$) and avoids skipped or duplicated records when new rows are inserted during pagination.',
        difficulty: 'INTERMEDIATE',
        skillSlug: 'rest-apis',
      },
    ],
  },
  {
    title: 'Spring Boot Backend Framework Competency',
    slug: 'spring-boot-assessment',
    description:
      'Assess your knowledge of Spring core dependency injection, Spring MVC controllers, Spring Data JPA persistence, and production configurations.',
    difficulty: 'INTERMEDIATE',
    estimatedMinutes: 15,
    passingScore: 70,
    skillSlugs: ['spring-boot'],
    questions: [
      {
        question:
          'Why is constructor-based dependency injection recommended over field injection (`@Autowired` on private fields) in Spring Boot?',
        options: [
          'Field injection is deprecated in Java 17',
          'Constructor injection enables immutability (`final` fields), guarantees required dependencies at initialization, and facilitates easy unit testing without reflection',
          'Constructor injection is automatically multithreaded',
          'Field injection slows down HTTP request routing',
        ],
        correctAnswer: 1,
        explanation:
          'Constructor injection enforces explicit dependencies, permits `final` field declaration for thread safety, and allows straightforward instantiation in isolated unit tests without Spring context.',
        difficulty: 'INTERMEDIATE',
        skillSlug: 'spring-boot',
      },
      {
        question:
          'In Spring Data JPA, what is the standard solution to resolve the infamous N+1 query problem when fetching entity relationships?',
        options: [
          'Annotate all fields with `@Transient`',
          'Use `JOIN FETCH` in JPQL, an `@EntityGraph`, or batch fetching (`hibernate.default_batch_fetch_size`)',
          'Switch from PostgreSQL to SQLite',
          'Increase the connection pool maximum size in HikariCP',
        ],
        correctAnswer: 1,
        explanation:
          '`JOIN FETCH` or JPA 2.1 `@EntityGraph` forces Hibernate to retrieve the parent and its associated child entities in a single SQL join query rather than emitting $N$ separate select queries.',
        difficulty: 'ADVANCED',
        skillSlug: 'spring-boot',
      },
      {
        question:
          'What happens by default when an unchecked runtime exception (`RuntimeException`) is thrown inside a `@Transactional` annotated Spring service method?',
        options: [
          'The transaction commits and ignores the exception',
          'The transaction is automatically rolled back',
          'The database connection is terminated immediately',
          'Spring attempts the transaction 3 times before failing',
        ],
        correctAnswer: 1,
        explanation:
          'By default, Spring declarative transaction management rolls back transactions on unchecked runtime exceptions (`RuntimeException` and `Error`), but commits on checked exceptions unless `rollbackFor` is explicitly configured.',
        difficulty: 'INTERMEDIATE',
        skillSlug: 'spring-boot',
      },
      {
        question:
          'Which Spring Boot starter dependency provides production-ready monitoring, health checks, and application metrics out of the box?',
        options: [
          'spring-boot-starter-web',
          'spring-boot-starter-actuator',
          'spring-boot-starter-logging',
          'spring-boot-starter-security',
        ],
        correctAnswer: 1,
        explanation:
          'Spring Boot Actuator exposes operational endpoints like `/actuator/health`, `/actuator/metrics`, and `/actuator/info` for production telemetry and monitoring systems.',
        difficulty: 'BEGINNER',
        skillSlug: 'spring-boot',
      },
      {
        question:
          'Which annotation is used in Spring MVC to validate incoming request bodies against Bean Validation (JSR-380) constraints such as `@NotNull` and `@Size`?',
        options: ['@Valid or @Validated', '@Check', '@Sanitize', '@SchemaValidate'],
        correctAnswer: 0,
        explanation:
          '`@Valid` (standard Jakarta Validation) or `@Validated` (Spring variant supporting validation groups) triggers validation on DTO request bodies before invoking controller logic.',
        difficulty: 'BEGINNER',
        skillSlug: 'spring-boot',
      },
    ],
  },
  {
    title: 'Relational SQL & Schema Design Mastery',
    slug: 'sql-database-assessment',
    description:
      'Test your understanding of SQL queries, indexing strategies, ACID transaction isolation levels, and relational database schema normalization.',
    difficulty: 'INTERMEDIATE',
    estimatedMinutes: 15,
    passingScore: 70,
    skillSlugs: ['sql'],
    questions: [
      {
        question:
          'Which SQL clause is executed AFTER aggregate functions (e.g. `COUNT()`, `SUM()`) to filter grouped results?',
        options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'],
        correctAnswer: 1,
        explanation:
          '`WHERE` filters individual rows before grouping occurs, while `HAVING` filters grouped rows after aggregation.',
        difficulty: 'BEGINNER',
        skillSlug: 'sql',
      },
      {
        question:
          'In database indexing, why does a B-Tree composite index on `(user_id, created_at)` fail to accelerate a query with only `WHERE created_at > ?`?',
        options: [
          'B-Trees cannot index timestamps',
          'Composite index lookups require matching the leading (leftmost) column of the index prefix',
          'Composite indexes only work for `SELECT *`',
          'The SQL query optimizer requires an explicit table lock',
        ],
        correctAnswer: 1,
        explanation:
          'Composite B-Tree indexes follow the leftmost prefix rule: the index is sorted primarily by `user_id` and secondarily by `created_at`. Without filtering on `user_id`, the index tree cannot be traversed efficiently.',
        difficulty: 'ADVANCED',
        skillSlug: 'sql',
      },
      {
        question:
          'Which ACID transaction isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still allow Phantom Reads in standard ANSI SQL?',
        options: ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'],
        correctAnswer: 2,
        explanation:
          '`REPEATABLE READ` locks existing rows read during the transaction to prevent non-repeatable reads, while `SERIALIZABLE` locks ranges to additionally prevent phantom inserts.',
        difficulty: 'INTERMEDIATE',
        skillSlug: 'sql',
      },
      {
        question:
          'What is the primary condition required for a relational database table to satisfy Third Normal Form (3NF)?',
        options: [
          'It must contain no primary keys',
          'It must be in 2NF and have no transitive functional dependencies between non-prime attributes',
          'All columns must store JSON objects',
          'Tables must be replicated across multiple physical servers',
        ],
        correctAnswer: 1,
        explanation:
          '3NF requires that every non-key attribute is non-transitively dependent on the primary key ("every non-key column must provide a fact about the key, the whole key, and nothing but the key").',
        difficulty: 'INTERMEDIATE',
        skillSlug: 'sql',
      },
      {
        question:
          'What is the computational difference between `UNION` and `UNION ALL` in SQL?',
        options: [
          '`UNION` combines tables horizontally while `UNION ALL` joins vertically',
          '`UNION` automatically deduplicates rows via internal sorting/hashing ($O(N \\log N)$), while `UNION ALL` simply appends datasets without deduplication ($O(N)$)',
          '`UNION ALL` only works on numeric data types',
          '`UNION` requires foreign key constraints',
        ],
        correctAnswer: 1,
        explanation:
          '`UNION ALL` performs a lightweight append operation without sorting or hashing overhead, making it significantly faster when distinct rows are already guaranteed or duplicates are acceptable.',
        difficulty: 'INTERMEDIATE',
        skillSlug: 'sql',
      },
    ],
  },
  {
    title: 'Redis In-Memory Caching & Distributed Data',
    slug: 'redis-caching-assessment',
    description:
      'Evaluate your expertise in in-memory caching strategies, cache invalidation, Redis data structures, and cache stampede prevention.',
    difficulty: 'INTERMEDIATE',
    estimatedMinutes: 15,
    passingScore: 70,
    skillSlugs: ['redis'],
    questions: [
      {
        question:
          'In the Cache-Aside (Lazy Loading) pattern, what action does the application take upon a cache miss?',
        options: [
          'Returns a 404 error to the user',
          'Fetches data from the primary database, writes the result to the cache with a TTL, and returns data to the client',
          'Flushes all Redis memory',
          'Blocks all subsequent read requests until the cache is refreshed by a cron job',
        ],
        correctAnswer: 1,
        explanation:
          'Under Cache-Aside, the application first inspects the cache. On a miss, it reads from the authoritative database, populates the cache for future requests, and returns the payload.',
        difficulty: 'BEGINNER',
        skillSlug: 'redis',
      },
      {
        question:
          'What is a "Cache Stampede" (or Thundering Herd problem) and how is it typically mitigated in high-traffic architectures?',
        options: [
          'Redis running out of disk storage; mitigated by upgrading hardware',
          'Concurrent requests encountering an expired popular cache key and simultaneously hammering the database; mitigated via distributed locking (mutex) or probabilistic early expiration (XFetch)',
          'Network packet loss between microservices; mitigated by TCP retries',
          'Corrupted memory registers; mitigated by ECC RAM',
        ],
        correctAnswer: 1,
        explanation:
          'When a hot cache key expires, thousands of simultaneous queries can overwhelm the backing database. Using a mutex lock ensures only one worker rebuilds the cache while others wait.',
        difficulty: 'ADVANCED',
        skillSlug: 'redis',
      },
      {
        question:
          'Which Redis data structure is optimal for maintaining a real-time leaderboard or rate-limiting sliding window with $O(\\log N)$ score lookups and range removals?',
        options: ['String', 'List', 'Sorted Set (ZSET)', 'HyperLogLog'],
        correctAnswer: 2,
        explanation:
          'Redis Sorted Sets (ZSETs) associate each member with a floating-point score using a skip list and hash map, supporting efficient range queries by score (`ZRANGEBYSCORE`) and rank lookups in $O(\\log N)$ time.',
        difficulty: 'INTERMEDIATE',
        skillSlug: 'redis',
      },
      {
        question:
          'Which Redis eviction policy is best suited when Redis is used strictly as a cache with keys having explicit TTLs, and you want to evict the least recently used keys?',
        options: ['noeviction', 'volatile-lru', 'allkeys-random', 'volatile-ttl'],
        correctAnswer: 1,
        explanation:
          '`volatile-lru` evicts the least recently used keys out of the set of keys that have an expiration (TTL) set, protecting non-expiring data structures from accidental removal.',
        difficulty: 'INTERMEDIATE',
        skillSlug: 'redis',
      },
      {
        question:
          'What is the fundamental difference between Redis RDB snapshots and AOF (Append Only File) persistence mechanisms?',
        options: [
          'RDB writes binary point-in-time snapshots at configured intervals, while AOF logs every write command sequentially for near-zero data loss recovery',
          'RDB is for clusters while AOF is for standalone instances',
          'AOF encrypts memory while RDB compresses memory',
          'RDB runs in user-space while AOF requires kernel privileges',
        ],
        correctAnswer: 0,
        explanation:
          'RDB provides compact point-in-time snapshots optimal for disaster recovery backups, whereas AOF logs write commands continuously with fsync options for maximum durability.',
        difficulty: 'INTERMEDIATE',
        skillSlug: 'redis',
      },
    ],
  },
  {
    title: 'Docker Containerization & Multi-Service Deployment',
    slug: 'docker-assessment',
    description:
      'Assess your skills in writing production Dockerfiles, container isolation, networking, volume management, and multi-stage builds.',
    difficulty: 'INTERMEDIATE',
    estimatedMinutes: 15,
    passingScore: 70,
    skillSlugs: ['docker'],
    questions: [
      {
        question:
          'What is the primary benefit of utilizing Multi-Stage Builds in production Dockerfiles for compiled languages like Java or Go?',
        options: [
          'Enables running multiple containers inside a single image',
          'Separates the heavyweight build environment (SDKs, build tools) from the lightweight runtime image (JRE, scratch), dramatically reducing final image size and security attack surface',
          'Allows Docker to bypass kernel namespace isolation',
          'Automatically signs images with cryptographic certificates',
        ],
        correctAnswer: 1,
        explanation:
          'Multi-stage builds allow compiling in an intermediate stage and copying only the final binary artifact into a minimal production runtime base image (e.g. Alpine or Distroless).',
        difficulty: 'INTERMEDIATE',
        skillSlug: 'docker',
      },
      {
        question:
          'Why should you avoid using the `root` user by specifying a non-privileged `USER` directive in production Docker containers?',
        options: [
          'Root containers consume more CPU cycles',
          'To adhere to the principle of least privilege and prevent container breakout vulnerabilities from gaining root access to the host kernel',
          'Non-root containers run faster on Linux',
          'Docker Compose does not support root users',
        ],
        correctAnswer: 1,
        explanation:
          'By default, container root is identical to host root (UID 0). Running as a non-root user prevents privilege escalation and limits potential damage if a vulnerability is exploited.',
        difficulty: 'BEGINNER',
        skillSlug: 'docker',
      },
      {
        question:
          'How does Docker leverage layer caching when building images from a Dockerfile?',
        options: [
          'It re-executes all instructions randomly',
          'Each Dockerfile instruction creates a read-only layer; if an instruction and its inputs are unchanged from a previous build, Docker reuses the cached layer and skips re-execution',
          'Caching only occurs if the `--no-cache` flag is passed',
          'Layer caching requires an external Redis database',
        ],
        correctAnswer: 1,
        explanation:
          'Docker caches intermediate layers. Ordering instructions from least frequently changing (e.g. dependency manifests) to most frequently changing (e.g. source code) maximizes build cache hits.',
        difficulty: 'BEGINNER',
        skillSlug: 'docker',
      },
      {
        question:
          'What is the difference between `CMD` and `ENTRYPOINT` in a Dockerfile?',
        options: [
          '`CMD` sets the fixed executable, while `ENTRYPOINT` provides default arguments that are easily overridden by CLI arguments',
          '`ENTRYPOINT` defines the executable that will always be invoked, while `CMD` provides default arguments that can be overridden when running the container',
          '`CMD` only works in development while `ENTRYPOINT` is for production',
          '`ENTRYPOINT` compiles code while `CMD` executes code',
        ],
        correctAnswer: 1,
        explanation:
          '`ENTRYPOINT` configures a container to run as an executable. Any arguments passed via `docker run <image> <args>` override `CMD` and are appended to `ENTRYPOINT`.',
        difficulty: 'INTERMEDIATE',
        skillSlug: 'docker',
      },
      {
        question:
          'In Docker networking, what allows multiple containers on the same user-defined bridge network to discover and communicate with each other?',
        options: [
          'Hardcoded IP address tables',
          'Embedded DNS server automatically resolving container names to internal IP addresses',
          'Host `/etc/hosts` file modifications',
          'BGP routing protocols',
        ],
        correctAnswer: 1,
        explanation:
          'User-defined bridge networks provide automatic internal DNS resolution so containers can communicate using service or container names (e.g. `http://api-service:8080`).',
        difficulty: 'INTERMEDIATE',
        skillSlug: 'docker',
      },
    ],
  },
  {
    title: 'Distributed System Design & High Scalability',
    slug: 'system-design-assessment',
    description:
      'Evaluate your understanding of distributed architectures, CAP theorem trade-offs, consistent hashing, load balancing, and asynchronous event streams.',
    difficulty: 'ADVANCED',
    estimatedMinutes: 20,
    passingScore: 70,
    skillSlugs: ['system-design'],
    questions: [
      {
        question:
          'According to the CAP Theorem, in the presence of a network partition ($P$), what fundamental trade-off must a distributed data store choose between?',
        options: [
          'Performance vs Security',
          'Consistency (all nodes return latest data) vs Availability (every non-failing node returns a response)',
          'Throughput vs Storage capacity',
          'Relational integrity vs JSON compatibility',
        ],
        correctAnswer: 1,
        explanation:
          'When network partitions inevitably occur in distributed systems, the system must either refuse requests to maintain strict Consistency (CP) or accept writes on isolated partitions at the cost of Consistency (AP).',
        difficulty: 'INTERMEDIATE',
        skillSlug: 'system-design',
      },
      {
        question:
          'What major problem does Consistent Hashing solve in distributed caching and database sharding clusters?',
        options: [
          'Encrypts cache keys using AES-256',
          'Minimizes the number of keys that must be remapped when nodes are added or removed from $O(N)$ down to $O(K/N)$',
          'Eliminates all network latency',
          'Converts relational tables to key-value pairs',
        ],
        correctAnswer: 1,
        explanation:
          'Traditional modulo hashing ($hash(key) \\pmod N$) remaps almost all keys when $N$ changes. Consistent hashing places keys and servers on a hash ring so only $K/N$ keys move on average during node scaling.',
        difficulty: 'ADVANCED',
        skillSlug: 'system-design',
      },
      {
        question:
          'Which distributed rate-limiting algorithm enforces a strict average rate while smoothly accommodating bursts of incoming requests up to a defined bucket capacity?',
        options: ['Fixed Window Counter', 'Token Bucket', 'Random Drop', 'Round Robin'],
        correctAnswer: 1,
        explanation:
          'The Token Bucket algorithm adds tokens at a fixed constant rate up to bucket capacity $C$. Requests consume tokens, allowing instantaneous bursts of up to $C$ requests while bounding the long-term rate.',
        difficulty: 'ADVANCED',
        skillSlug: 'system-design',
      },
      {
        question:
          'What is the primary role of a Dead Letter Queue (DLQ) in asynchronous message-driven microservice architectures (e.g. RabbitMQ, Kafka)?',
        options: [
          'To permanently delete old log files',
          'To isolate and hold poisoned messages that failed processing after multiple retries for inspection and manual recovery without stalling the main queue',
          'To compress outgoing JSON messages',
          'To route messages exclusively to dead containers',
        ],
        correctAnswer: 1,
        explanation:
          'A DLQ captures unparseable or repeatedly failing messages to prevent infinite processing loops from blocking the consumer pipeline while allowing engineers to diagnose root causes.',
        difficulty: 'INTERMEDIATE',
        skillSlug: 'system-design',
      },
      {
        question:
          'In distributed transaction management across microservices, why is the Saga pattern (choreography or orchestration) widely preferred over Two-Phase Commit (2PC)?',
        options: [
          '2PC is not supported on Linux systems',
          '2PC is a blocking protocol that holds locks across services and introduces single points of failure, whereas Sagas use local transactions and compensating transactions for high availability and loose coupling',
          'Sagas eliminate the need for databases',
          '2PC requires synchronous blockchain consensus',
        ],
        correctAnswer: 1,
        explanation:
          'Two-Phase Commit requires all distributed participants to hold locks until coordinator agreement, causing poor scalability and vulnerability to coordinator failure. Sagas break workflows into independent local transactions with compensating rollbacks.',
        difficulty: 'ADVANCED',
        skillSlug: 'system-design',
      },
    ],
  },
];

/**
 * Seeds curated assessments and questions idempotently into the database.
 */
export async function seedAssessments() {
  console.log('📝 Seeding Curated Assessments & Questions...');

  for (const item of CURATED_ASSESSMENTS) {
    // 1. Upsert Assessment header
    const assessment = await prisma.assessment.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        difficulty: item.difficulty,
        estimatedMinutes: item.estimatedMinutes,
        passingScore: item.passingScore,
        isActive: true,
      },
      create: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        difficulty: item.difficulty,
        estimatedMinutes: item.estimatedMinutes,
        passingScore: item.passingScore,
        isActive: true,
      },
    });

    // 2. Map skills to assessment
    for (const skillSlug of item.skillSlugs) {
      const skill = await prisma.skill.findUnique({ where: { slug: skillSlug } });
      if (skill) {
        await prisma.assessmentSkill.upsert({
          where: {
            assessmentId_skillId: {
              assessmentId: assessment.id,
              skillId: skill.id,
            },
          },
          update: {},
          create: {
            assessmentId: assessment.id,
            skillId: skill.id,
          },
        });
      }
    }

    // 3. Clear and re-create questions for idempotent freshness
    await prisma.assessmentQuestion.deleteMany({
      where: { assessmentId: assessment.id },
    });

    let qOrder = 1;
    for (const q of item.questions) {
      let skill = await prisma.skill.findUnique({ where: { slug: q.skillSlug } });
      if (!skill) {
        skill = await prisma.skill.findFirst();
      }

      if (skill) {
        await prisma.assessmentQuestion.create({
          data: {
            assessmentId: assessment.id,
            question: q.question,
            questionType: 'MULTIPLE_CHOICE',
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            skillId: skill.id,
            order: qOrder++,
          },
        });
      }
    }
  }

  console.log(`✅ Seeded ${CURATED_ASSESSMENTS.length} assessments with curated questions.`);
}
