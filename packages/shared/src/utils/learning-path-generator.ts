import type {
  LearningPathReport,
  LearningMilestoneItem,
  MilestoneSkillItem,
  MilestoneResourceItem,
  MilestoneStatus,
  PathStatus,
  MilestoneResourceRole,
} from '../types/learning-path.js';
import type { SkillGapAnalysisReport, SkillGapItem } from '../types/skill-gap.js';
import type { LearningResource } from '../types/recommendation.js';

export interface GraphPrerequisiteEdge {
  skillId: string; // The dependent skill (requires prerequisiteSkillId)
  prerequisiteSkillId: string; // The prerequisite skill (must be learned first)
  skillSlug?: string;
  prerequisiteSlug?: string;
}

export interface GenerateLearningPathParams {
  userId: string;
  learnerProfileId: string;
  career: {
    id: string;
    name: string;
    slug: string;
  };
  gapReport: SkillGapAnalysisReport;
  allPrerequisites: GraphPrerequisiteEdge[];
  candidateResources: LearningResource[];
  learnerProfile: {
    targetRole?: string;
    technicalLevel?: string;
    skills?: Array<{
      name: string;
      normalizedName?: string;
      selfReportedLevel: number;
    }>;
  };
  learnerPreference?: {
    learningFormat?: string;
    weeklyAvailabilityHours?: string;
  };
  weeklyHoursOverride?: number;
  algorithmVersion?: string;
}

/**
 * Deterministic, prerequisite-aware Personalized Learning Path & Roadmap Generator.
 */
export function generateLearningPath(params: GenerateLearningPathParams): LearningPathReport {
  const {
    userId,
    learnerProfileId,
    career,
    gapReport,
    allPrerequisites,
    candidateResources,
    learnerProfile,
    learnerPreference,
    weeklyHoursOverride,
    algorithmVersion = 'path-v1',
  } = params;

  // 1. Determine Weekly Study Commitment Hours
  let weeklyHours = 10;
  if (weeklyHoursOverride && weeklyHoursOverride > 0) {
    weeklyHours = weeklyHoursOverride;
  } else if (learnerPreference?.weeklyAvailabilityHours) {
    const str = learnerPreference.weeklyAvailabilityHours;
    if (str.includes('20')) weeklyHours = 20;
    else if (str.includes('15')) weeklyHours = 15;
    else if (str.includes('10')) weeklyHours = 10;
    else if (str.includes('5')) weeklyHours = 5;
    else {
      const num = parseInt(str, 10);
      if (!isNaN(num) && num > 0) weeklyHours = num;
    }
  }

  // 2. Build Learner Skill Level Map (normalizedName / slug -> level)
  const learnerLevelMap = new Map<string, number>();
  if (learnerProfile.skills) {
    for (const s of learnerProfile.skills) {
      const key = (s.normalizedName || s.name).toLowerCase().replace(/\s+/g, '-');
      learnerLevelMap.set(key, s.selfReportedLevel);
    }
  }

  const getLearnerLevel = (skillSlug: string, skillName?: string): number => {
    const slugKey = skillSlug.toLowerCase();
    if (learnerLevelMap.has(slugKey)) return learnerLevelMap.get(slugKey)!;
    if (skillName) {
      const nameKey = skillName.toLowerCase().replace(/\s+/g, '-');
      if (learnerLevelMap.has(nameKey)) return learnerLevelMap.get(nameKey)!;
    }
    return 0;
  };

  // 3. Step 1: Target Skill Selection (Exclude already-mastered skills)
  const allGapItems: SkillGapItem[] = [
    ...gapReport.criticalGaps,
    ...gapReport.developingSkills,
    ...gapReport.missingSkills,
  ];

  const gapItemMap = new Map<string, SkillGapItem>();
  for (const item of allGapItems) {
    if (item.gap > 0) {
      gapItemMap.set(item.skillId, item);
    }
  }

  // 4. Step 2: Prerequisite Closure (Upstream DAG traversal)
  const skillIdToSlugMap = new Map<string, string>();
  const slugToSkillIdMap = new Map<string, string>();
  for (const item of gapReport.allResults) {
    skillIdToSlugMap.set(item.skillId, item.skillSlug);
    slugToSkillIdMap.set(item.skillSlug, item.skillId);
  }

  const closedSkillIds = new Set<string>(gapItemMap.keys());
  let addedNewPrereq = true;

  while (addedNewPrereq) {
    addedNewPrereq = false;
    for (const skillId of Array.from(closedSkillIds)) {
      const prereqEdges = allPrerequisites.filter(
        e => e.skillId === skillId || (e.skillSlug && e.skillSlug === skillIdToSlugMap.get(skillId))
      );

      for (const edge of prereqEdges) {
        const prereqId = edge.prerequisiteSkillId || slugToSkillIdMap.get(edge.prerequisiteSlug || '');
        const prereqSlug = edge.prerequisiteSlug || skillIdToSlugMap.get(prereqId || '') || prereqId;

        if (prereqId && prereqSlug) {
          const currentPrereqLvl = getLearnerLevel(prereqSlug);
          if (currentPrereqLvl < 2 && !closedSkillIds.has(prereqId)) {
            closedSkillIds.add(prereqId);
            addedNewPrereq = true;

            if (!gapItemMap.has(prereqId)) {
              gapItemMap.set(prereqId, {
                skillId: prereqId,
                skillName: prereqSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                skillSlug: prereqSlug,
                skillType: 'TECHNICAL',
                aliases: [],
                categoryName: 'Foundations',
                learnerLevel: currentPrereqLvl,
                requiredLevel: 3,
                gap: 3 - currentPrereqLvl,
                gapSeverity: 0.8,
                severityCategory: 'CRITICAL',
                importance: 'HIGH',
                importanceWeight: 0.8,
                priorityScore: 0.85,
                careerPriorityRank: 1,
                displayPriority: 85,
                isCore: true,
                readiness: 'READY',
                readinessScore: 1.0,
                category: 'DEVELOPING',
                isCritical: true,
                explanation: `Required foundational prerequisite for ${skillIdToSlugMap.get(skillId) || 'advanced topics'}.`,
                downstreamImpactCount: 2,
                prerequisiteImpactScore: 0.8,
                prerequisites: [],
              });
            }
          }
        }
      }
    }
  }

  // 5. Step 3: Topological Sorting (Kahn's multi-tier algorithm)
  const targetSkillList = Array.from(gapItemMap.values());
  const targetSkillIdSet = new Set(targetSkillList.map(s => s.skillId));

  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>(); // prereq -> dependents

  for (const s of targetSkillList) {
    inDegree.set(s.skillId, 0);
    adjList.set(s.skillId, []);
  }

  for (const edge of allPrerequisites) {
    const depId = edge.skillId || slugToSkillIdMap.get(edge.skillSlug || '');
    const prereqId = edge.prerequisiteSkillId || slugToSkillIdMap.get(edge.prerequisiteSlug || '');

    if (depId && prereqId && targetSkillIdSet.has(depId) && targetSkillIdSet.has(prereqId) && depId !== prereqId) {
      adjList.get(prereqId)!.push(depId);
      inDegree.set(depId, (inDegree.get(depId) || 0) + 1);
    }
  }

  let currentTier: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      currentTier.push(id);
    }
  }

  currentTier.sort((a, b) => {
    const itemA = gapItemMap.get(a);
    const itemB = gapItemMap.get(b);
    return (itemB?.priorityScore || 0) - (itemA?.priorityScore || 0);
  });

  const topologicalTiers: SkillGapItem[][] = [];
  const processedSkillIds = new Set<string>();

  while (currentTier.length > 0) {
    const tierItems: SkillGapItem[] = [];
    for (const id of currentTier) {
      const item = gapItemMap.get(id);
      if (item) tierItems.push(item);
    }
    if (tierItems.length > 0) {
      topologicalTiers.push(tierItems);
    }

    const nextTierCandidates: string[] = [];

    for (const id of currentTier) {
      processedSkillIds.add(id);
      const dependents = adjList.get(id) || [];
      for (const dep of dependents) {
        if (!processedSkillIds.has(dep)) {
          const newDeg = (inDegree.get(dep) || 1) - 1;
          inDegree.set(dep, newDeg);
          if (newDeg === 0) {
            nextTierCandidates.push(dep);
          }
        }
      }
    }

    nextTierCandidates.sort((a, b) => {
      const itemA = gapItemMap.get(a);
      const itemB = gapItemMap.get(b);
      return (itemB?.priorityScore || 0) - (itemA?.priorityScore || 0);
    });

    currentTier = nextTierCandidates;
  }

  for (const s of targetSkillList) {
    if (!processedSkillIds.has(s.skillId)) {
      topologicalTiers.push([s]);
      processedSkillIds.add(s.skillId);
    }
  }

  // 6. Step 4: Thematic Milestone Clustering
  const getThematicCategory = (slug: string): string => {
    const s = slug.toLowerCase();
    if (s.includes('rest') || s.includes('http') || s.includes('api') || s.includes('programming') || s.includes('javascript') || s.includes('python')) {
      return 'FOUNDATIONS';
    }
    if (s.includes('spring') || s.includes('node') || s.includes('express') || s.includes('fastapi') || s.includes('react') || s.includes('vue')) {
      return 'FRAMEWORKS';
    }
    if (s.includes('sql') || s.includes('postgres') || s.includes('mongo') || s.includes('redis') || s.includes('database') || s.includes('caching')) {
      return 'DATA_CACHING';
    }
    if (s.includes('docker') || s.includes('kubernetes') || s.includes('microservices') || s.includes('message') || s.includes('kafka') || s.includes('auth')) {
      return 'ARCHITECTURE';
    }
    if (s.includes('system-design') || s.includes('distributed') || s.includes('scalability') || s.includes('cloud') || s.includes('aws')) {
      return 'SYSTEM_DESIGN';
    }
    return 'SPECIALIZATION';
  };

  // Group each topological tier by semantic category
  const clusters: SkillGapItem[][] = [];

  for (const tier of topologicalTiers) {
    // Group skills within this tier by category
    const catMap = new Map<string, SkillGapItem[]>();
    for (const skill of tier) {
      const cat = getThematicCategory(skill.skillSlug);
      if (!catMap.has(cat)) {
        catMap.set(cat, []);
      }
      catMap.get(cat)!.push(skill);
    }

    for (const group of catMap.values()) {
      clusters.push(group);
    }
  }

  // 7. Step 5 & 6: Milestone Creation, Objectives, Resources & Workload
  const milestones: LearningMilestoneItem[] = [];
  let milestoneOrder = 1;
  const usedResourceIds = new Set<string>();

  for (const cluster of clusters) {
    if (cluster.length === 0) continue;
    const primarySkill = cluster[0];
    if (!primarySkill) continue;
    const skillNames = cluster.map(c => c.skillName);
    const categoryTheme = getThematicCategory(primarySkill.skillSlug);

    let milestoneTitle = '';
    let milestoneDesc = '';
    let objectives: string[] = [];
    let completionCriteria: string[] = [];
    let whyThisOrder = '';

    switch (categoryTheme) {
      case 'FOUNDATIONS':
        milestoneTitle = cluster.length === 1 ? `${primarySkill.skillName} Foundations` : 'API & Web Foundations';
        milestoneDesc = `Master core protocols, resource modeling, and service contracts for ${skillNames.join(', ')}.`;
        objectives = [
          `Understand HTTP verb semantics, status codes, and idempotency guarantees.`,
          `Design resource-oriented endpoints and contract schemas.`,
          `Implement payload validation, standard error responses, and pagination.`,
        ];
        completionCriteria = [
          `Build and test a functional REST API with complete CRUD operations and input validation.`,
        ];
        whyThisOrder = `This milestone is scheduled first because ${skillNames.join(' and ')} represent foundational prerequisites required before advancing into application frameworks and distributed architecture.`;
        break;

      case 'FRAMEWORKS':
        milestoneTitle = cluster.length === 1 ? `${primarySkill.skillName} Development` : 'Application Framework Development';
        milestoneDesc = `Build production-grade backend web services using ${skillNames.join(' and ')}.`;
        objectives = [
          `Implement dependency injection and modular service architectures.`,
          `Configure enterprise middleware, logging, and security filters.`,
          `Write automated integration tests covering web controllers and service layers.`,
        ];
        completionCriteria = [
          `Construct a modular multi-tier backend application with clean separation of concerns and automated tests.`,
        ];
        whyThisOrder = `This milestone builds directly on your API foundations, allowing you to implement production patterns in ${skillNames.join(', ')}.`;
        break;

      case 'DATA_CACHING':
        milestoneTitle = cluster.length === 1 ? `${primarySkill.skillName} Persistence` : 'Database Persistence & Caching';
        milestoneDesc = `Design relational/document data storage and accelerate query performance with in-memory caching.`;
        objectives = [
          `Model normalized database schemas and optimize query execution plans.`,
          `Implement atomic ACID transactions and connection pooling.`,
          `Integrate Redis caching patterns (Cache-Aside, Write-Through, TTL expiration).`,
        ];
        completionCriteria = [
          `Implement a robust persistence layer with optimized indexes and an in-memory caching strategy.`,
        ];
        whyThisOrder = `Data storage and caching follow framework fundamentals so you can integrate persistence directly into your backend services.`;
        break;

      case 'ARCHITECTURE':
        milestoneTitle = cluster.length === 1 ? `${primarySkill.skillName} & Services` : 'Backend Architecture & Microservices';
        milestoneDesc = `Containerize services and orchestrate asynchronous event-driven communication.`;
        objectives = [
          `Containerize multi-service applications using multi-stage Docker builds.`,
          `Implement asynchronous message queues and pub/sub event channels.`,
          `Configure JWT / OAuth2 token verification and secure service communication.`,
        ];
        completionCriteria = [
          `Deploy containerized microservices communicating asynchronously via message broker.`,
        ];
        whyThisOrder = `Architecture and messaging depend on strong service and data layer foundations established in earlier milestones.`;
        break;

      case 'SYSTEM_DESIGN':
        milestoneTitle = cluster.length === 1 ? `${primarySkill.skillName} Mastery` : 'System Design & High Scalability';
        milestoneDesc = `Architect highly available, fault-tolerant distributed systems capable of scaling to millions of users.`;
        objectives = [
          `Apply horizontal scaling, load balancing, and database sharding techniques.`,
          `Evaluate trade-offs between consistency, availability, and partition tolerance (CAP theorem).`,
          `Design resilient distributed rate limiters and caching topologies.`,
        ];
        completionCriteria = [
          `Complete an end-to-end scalable system architecture blueprint addressing throughput, latency, and fault tolerance.`,
        ];
        whyThisOrder = `System design is placed as an advanced milestone because it synthesizes knowledge across APIs, databases, caching, and distributed architecture.`;
        break;

      default:
        milestoneTitle = `${primarySkill.skillName} Competency`;
        milestoneDesc = `Develop core capabilities in ${skillNames.join(', ')}.`;
        objectives = [
          `Master core principles and idioms of ${skillNames.join(', ')}.`,
          `Apply industry best practices to real-world software scenarios.`,
        ];
        completionCriteria = [
          `Complete hands-on implementation demonstrating target proficiency in ${skillNames.join(', ')}.`,
        ];
        whyThisOrder = `This milestone addresses key competencies required for ${career.name}.`;
    }

    // Assign Complementary Curated Learning Resources
    const milestoneResources: MilestoneResourceItem[] = [];
    const milestoneSkills: MilestoneSkillItem[] = cluster.map((c, sIdx) => ({
      skillId: c.skillId,
      skillName: c.skillName,
      skillSlug: c.skillSlug,
      currentLevel: c.learnerLevel,
      targetLevel: c.requiredLevel,
      gap: c.gap,
      order: sIdx + 1,
      importance: c.importance,
      category: c.categoryName,
    }));

    const clusterSlugs = cluster.map(c => c.skillSlug);
    const matchingResources = candidateResources.filter(r => {
      if (usedResourceIds.has(r.id)) return false;
      return r.skills && r.skills.some(s => s.skillSlug && clusterSlugs.includes(s.skillSlug));
    });

    matchingResources.sort((a, b) => {
      const aPrimary = a.skills && a.skills.some(s => s.skillSlug && clusterSlugs.includes(s.skillSlug) && s.coverage === 'PRIMARY');
      const bPrimary = b.skills && b.skills.some(s => s.skillSlug && clusterSlugs.includes(s.skillSlug) && s.coverage === 'PRIMARY');
      if (aPrimary && !bPrimary) return -1;
      if (!aPrimary && bPrimary) return 1;
      return (b.qualityScore || 0) - (a.qualityScore || 0);
    });

    const selectedForMilestone: LearningResource[] = [];

    const primaryCandidate = matchingResources.find(
      r => r.resourceType === 'COURSE' || r.resourceType === 'DOCUMENTATION'
    ) || matchingResources[0];

    if (primaryCandidate) {
      selectedForMilestone.push(primaryCandidate);
      usedResourceIds.add(primaryCandidate.id);
    }

    const projectCandidate = matchingResources.find(
      r => (r.resourceType === 'PROJECT' || r.resourceType === 'EXERCISE') && !usedResourceIds.has(r.id)
    );
    if (projectCandidate) {
      selectedForMilestone.push(projectCandidate);
      usedResourceIds.add(projectCandidate.id);
    }

    const supportingCandidate = matchingResources.find(
      r => !usedResourceIds.has(r.id)
    );
    if (supportingCandidate && selectedForMilestone.length < 3) {
      selectedForMilestone.push(supportingCandidate);
      usedResourceIds.add(supportingCandidate.id);
    }

    selectedForMilestone.sort((a, b) => {
      const orderWeight: Record<string, number> = {
        DOCUMENTATION: 1,
        COURSE: 2,
        ARTICLE: 3,
        VIDEO: 4,
        PROJECT: 5,
        EXERCISE: 6,
        BOOK: 7,
      };
      return (orderWeight[a.resourceType] || 5) - (orderWeight[b.resourceType] || 5);
    });

    let resOrder = 1;
    let milestoneHours = 0;

    for (const res of selectedForMilestone) {
      let role: MilestoneResourceRole = 'SUPPORTING';
      if (res.resourceType === 'PROJECT') role = 'PROJECT';
      else if (res.resourceType === 'EXERCISE') role = 'PRACTICE';
      else if (resOrder === 1) role = 'PRIMARY';

      milestoneResources.push({
        resourceId: res.id,
        resource: res,
        order: resOrder,
        role,
        estimatedHours: res.estimatedHours,
      });

      milestoneHours += res.estimatedHours;
      resOrder++;
    }

    if (milestoneHours < 6) milestoneHours = Math.max(6, milestoneHours + 2);
    const milestoneWeeks = Math.max(1, Math.ceil(milestoneHours / weeklyHours));

    milestones.push({
      title: milestoneTitle,
      description: milestoneDesc,
      order: milestoneOrder,
      estimatedHours: milestoneHours,
      estimatedWeeks: milestoneWeeks,
      learningObjectives: objectives,
      completionCriteria,
      whyThisOrder,
      status: milestoneOrder === 1 ? ('IN_PROGRESS' as MilestoneStatus) : ('NOT_STARTED' as MilestoneStatus),
      skills: milestoneSkills,
      resources: milestoneResources,
    });

    milestoneOrder++;
  }

  // 8. Add Capstone Project Milestone at the end if we have >= 3 milestones
  if (milestones.length >= 3) {
    const capstoneHours = 20;
    const capstoneWeeks = Math.max(1, Math.ceil(capstoneHours / weeklyHours));

    milestones.push({
      title: `Capstone: Production ${career.name} Portfolio Project`,
      description: `Synthesize all mastered competencies into an end-to-end production portfolio project demonstrate career readiness.`,
      order: milestoneOrder,
      estimatedHours: capstoneHours,
      estimatedWeeks: capstoneWeeks,
      learningObjectives: [
        `Architect and deploy a full-featured ${career.name} project integrating APIs, databases, caching, and CI/CD.`,
        `Write comprehensive unit and integration tests achieving >80% code coverage.`,
        `Document system architecture, API schemas, and deployment instructions in GitHub repository.`,
      ],
      completionCriteria: [
        `Deliver a working, tested, and deployed ${career.name} repository ready for technical recruiter inspection.`,
      ],
      whyThisOrder: `The capstone project serves as the final milestone to consolidate all learned skills into demonstrable portfolio evidence.`,
      status: 'NOT_STARTED',
      skills: [],
      resources: [],
    });
  }

  // 9. Calculate Overall Path Workload & Overview Explanations
  const totalEstimatedHours = milestones.reduce((acc, m) => acc + m.estimatedHours, 0);
  const totalEstimatedWeeks = Math.max(1, Math.ceil(totalEstimatedHours / weeklyHours));

  const whyThisOrderOverview = milestones.map((m, idx) => {
    return `${idx + 1}. ${m.title}: ${m.whyThisOrder}`;
  });

  return {
    userId,
    learnerProfileId,
    careerId: career.id,
    careerName: career.name,
    careerSlug: career.slug,
    title: `Personalized Learning Path to ${career.name}`,
    description: `A structured, prerequisite-aware learning roadmap designed to bridge your skill gaps for ${career.name} over approximately ${totalEstimatedWeeks} weeks (${weeklyHours} hrs/week).`,
    readinessAtGeneration: gapReport.readinessScore,
    estimatedHours: totalEstimatedHours,
    estimatedWeeks: totalEstimatedWeeks,
    weeklyHours,
    status: 'ACTIVE' as PathStatus,
    algorithmVersion,
    whyThisOrderOverview,
    milestones,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
