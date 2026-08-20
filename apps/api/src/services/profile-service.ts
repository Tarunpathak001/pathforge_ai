import prisma from '../db/client.js';
import {
  normalizeSkill,
  calculateProfileCompleteness,
  type LearnerProfile,
  type ProfileCompleteness,
} from '@pathforge/shared';

export class ProfileService {
  /**
   * Helper to ensure user exists
   */
  async ensureUser(userId: string, name = 'Learner', email?: string) {
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: email || `user_${userId.substring(0, 8)}@pathforge.local`,
          name,
        },
      });
    }
    return user;
  }

  /**
   * Get full profile for user
   */
  async getProfileByUserId(userId: string): Promise<LearnerProfile | null> {
    const raw = await prisma.learnerProfile.findUnique({
      where: { userId },
      include: {
        skills: true,
        projects: true,
        learningExperiences: true,
        certifications: true,
        interests: true,
        preference: true,
      },
    });

    if (!raw) return null;

    return {
      id: raw.id,
      userId: raw.userId,
      targetRole: raw.targetRole,
      careerGoalDescription: raw.careerGoalDescription,
      targetIndustry: raw.targetIndustry,
      targetCompanyType: raw.targetCompanyType,
      targetTimeline: raw.targetTimeline,
      educationLevel: raw.educationLevel,
      fieldOfStudy: raw.fieldOfStudy,
      experienceYears: raw.experienceYears,
      professionalSummary: raw.professionalSummary,
      technicalLevel: raw.technicalLevel as any,
      skills: raw.skills.map(s => ({
        id: s.id,
        profileId: s.profileId,
        name: s.name,
        normalizedName: s.normalizedName,
        selfReportedLevel: s.selfReportedLevel,
        yearsExperience: s.yearsExperience,
        confidence: s.confidence,
        evidence: s.evidence,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      projects: raw.projects.map(p => ({
        id: p.id,
        profileId: p.profileId,
        name: p.name,
        description: p.description,
        technologies: p.technologies ? JSON.parse(p.technologies) : [],
        role: p.role,
        durationMonths: p.durationMonths,
        projectUrl: p.projectUrl,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      learningExperiences: raw.learningExperiences.map(l => ({
        id: l.id,
        profileId: l.profileId,
        courseName: l.courseName,
        provider: l.provider,
        subject: l.subject,
        status: l.status as any,
        completionDate: l.completionDate,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      })),
      certifications: raw.certifications.map(c => ({
        id: c.id,
        profileId: c.profileId,
        name: c.name,
        issuer: c.issuer,
        issueDate: c.issueDate,
        credentialUrl: c.credentialUrl,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      interests: raw.interests.map(i => ({
        id: i.id,
        profileId: i.profileId,
        category: i.category as any,
        topic: i.topic,
        createdAt: i.createdAt,
      })),
      preference: raw.preference
        ? {
            id: raw.preference.id,
            profileId: raw.preference.profileId,
            learningFormat: raw.preference.learningFormat as any,
            difficultyPreference: raw.preference.difficultyPreference as any,
            weeklyAvailabilityHours: raw.preference.weeklyAvailabilityHours,
            projectPreference: raw.preference.projectPreference as any,
            createdAt: raw.preference.createdAt,
            updatedAt: raw.preference.updatedAt,
          }
        : null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  /**
   * Create or replace complete learner profile
   */
  async createOrUpdateProfile(data: any): Promise<LearnerProfile> {
    await this.ensureUser(data.userId);

    // Delete existing profile if present to cleanly replace or initialize
    const existing = await prisma.learnerProfile.findUnique({
      where: { userId: data.userId },
    });

    if (existing) {
      await prisma.learnerProfile.delete({ where: { id: existing.id } });
    }

    // Process skills with normalization
    const processedSkills = (data.skills || []).map((s: any) => {
      const { normalizedName } = normalizeSkill(s.name);
      return {
        name: normalizedName || s.name,
        normalizedName: normalizedName.toLowerCase() || s.name.toLowerCase(),
        selfReportedLevel: s.selfReportedLevel || 3,
        yearsExperience: s.yearsExperience || null,
        confidence: s.confidence || 3,
        evidence: s.evidence || null,
      };
    });

    // Deduplicate by normalizedName
    const uniqueSkillsMap = new Map<string, (typeof processedSkills)[0]>();
    for (const s of processedSkills) {
      const key = s.normalizedName;
      if (
        !uniqueSkillsMap.has(key) ||
        uniqueSkillsMap.get(key)!.selfReportedLevel < s.selfReportedLevel
      ) {
        uniqueSkillsMap.set(key, s);
      }
    }
    const finalSkills = Array.from(uniqueSkillsMap.values());

    await prisma.learnerProfile.create({
      data: {
        userId: data.userId,
        targetRole: data.targetRole,
        careerGoalDescription: data.careerGoalDescription || null,
        targetIndustry: data.targetIndustry || null,
        targetCompanyType: data.targetCompanyType || null,
        targetTimeline: data.targetTimeline || null,
        educationLevel: data.educationLevel || null,
        fieldOfStudy: data.fieldOfStudy || null,
        experienceYears: data.experienceYears !== undefined ? data.experienceYears : null,
        professionalSummary: data.professionalSummary || null,
        technicalLevel: data.technicalLevel || 'BEGINNER',
        skills: {
          create: finalSkills,
        },
        projects: {
          create: (data.projects || []).map((p: any) => ({
            name: p.name,
            description: p.description,
            technologies: JSON.stringify(p.technologies || []),
            role: p.role || null,
            durationMonths: p.durationMonths !== undefined ? p.durationMonths : null,
            projectUrl: p.projectUrl || null,
          })),
        },
        learningExperiences: {
          create: (data.learningExperiences || []).map((l: any) => ({
            courseName: l.courseName,
            provider: l.provider,
            subject: l.subject || null,
            status: l.status || 'IN_PROGRESS',
            completionDate: l.completionDate || null,
          })),
        },
        certifications: {
          create: (data.certifications || []).map((c: any) => ({
            name: c.name,
            issuer: c.issuer,
            issueDate: c.issueDate || null,
            credentialUrl: c.credentialUrl || null,
          })),
        },
        interests: {
          create: (data.interests || []).map((i: any) => ({
            category: i.category || 'TECHNICAL',
            topic: i.topic,
          })),
        },
        ...(data.preference && {
          preference: {
            create: {
              learningFormat: data.preference.learningFormat || 'MIXED',
              difficultyPreference: data.preference.difficultyPreference || 'CHALLENGING',
              weeklyAvailabilityHours: data.preference.weeklyAvailabilityHours || '10-15',
              projectPreference: data.preference.projectPreference || 'BALANCED',
            },
          },
        }),
      },
    });

    const full = await this.getProfileByUserId(data.userId);
    return full!;
  }

  /**
   * Update core profile fields
   */
  async updateProfile(userId: string, data: any): Promise<LearnerProfile> {
    const existing = await prisma.learnerProfile.findUnique({ where: { userId } });
    if (!existing) {
      throw new Error('Learner profile not found');
    }

    await prisma.learnerProfile.update({
      where: { id: existing.id },
      data: {
        ...(data.targetRole !== undefined && { targetRole: data.targetRole }),
        ...(data.careerGoalDescription !== undefined && {
          careerGoalDescription: data.careerGoalDescription,
        }),
        ...(data.targetIndustry !== undefined && { targetIndustry: data.targetIndustry }),
        ...(data.targetCompanyType !== undefined && { targetCompanyType: data.targetCompanyType }),
        ...(data.targetTimeline !== undefined && { targetTimeline: data.targetTimeline }),
        ...(data.educationLevel !== undefined && { educationLevel: data.educationLevel }),
        ...(data.fieldOfStudy !== undefined && { fieldOfStudy: data.fieldOfStudy }),
        ...(data.experienceYears !== undefined && { experienceYears: data.experienceYears }),
        ...(data.professionalSummary !== undefined && {
          professionalSummary: data.professionalSummary,
        }),
        ...(data.technicalLevel !== undefined && { technicalLevel: data.technicalLevel }),
      },
    });

    const full = await this.getProfileByUserId(userId);
    return full!;
  }

  /**
   * Delete profile
   */
  async deleteProfile(userId: string): Promise<boolean> {
    const existing = await prisma.learnerProfile.findUnique({ where: { userId } });
    if (!existing) return false;
    await prisma.learnerProfile.delete({ where: { id: existing.id } });
    return true;
  }

  /**
   * Add skills (batch or single)
   */
  async addSkills(userId: string, skills: any[]): Promise<any[]> {
    const profile = await prisma.learnerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const createdSkills = [];
    for (const skill of skills) {
      const { normalizedName } = normalizeSkill(skill.name);
      const normKey = normalizedName.toLowerCase();

      const existingSkill = await prisma.learnerSkill.findUnique({
        where: {
          profileId_normalizedName: {
            profileId: profile.id,
            normalizedName: normKey,
          },
        },
      });

      if (existingSkill) {
        const updated = await prisma.learnerSkill.update({
          where: { id: existingSkill.id },
          data: {
            selfReportedLevel: skill.selfReportedLevel ?? existingSkill.selfReportedLevel,
            yearsExperience: skill.yearsExperience ?? existingSkill.yearsExperience,
            confidence: skill.confidence ?? existingSkill.confidence,
            evidence: skill.evidence ?? existingSkill.evidence,
          },
        });
        createdSkills.push(updated);
      } else {
        const created = await prisma.learnerSkill.create({
          data: {
            profileId: profile.id,
            name: normalizedName,
            normalizedName: normKey,
            selfReportedLevel: skill.selfReportedLevel || 3,
            yearsExperience: skill.yearsExperience || null,
            confidence: skill.confidence || 3,
            evidence: skill.evidence || null,
          },
        });
        createdSkills.push(created);
      }
    }

    return createdSkills;
  }

  /**
   * Update skill by ID
   */
  async updateSkill(skillId: string, data: any) {
    return prisma.learnerSkill.update({
      where: { id: skillId },
      data: {
        ...(data.selfReportedLevel !== undefined && { selfReportedLevel: data.selfReportedLevel }),
        ...(data.yearsExperience !== undefined && { yearsExperience: data.yearsExperience }),
        ...(data.confidence !== undefined && { confidence: data.confidence }),
        ...(data.evidence !== undefined && { evidence: data.evidence }),
      },
    });
  }

  /**
   * Delete skill
   */
  async deleteSkill(skillId: string) {
    return prisma.learnerSkill.delete({ where: { id: skillId } });
  }

  /**
   * Add project
   */
  async addProject(userId: string, project: any) {
    const profile = await prisma.learnerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    return prisma.project.create({
      data: {
        profileId: profile.id,
        name: project.name,
        description: project.description,
        technologies: JSON.stringify(project.technologies || []),
        role: project.role || null,
        durationMonths: project.durationMonths !== undefined ? project.durationMonths : null,
        projectUrl: project.projectUrl || null,
      },
    });
  }

  /**
   * Update project
   */
  async updateProject(projectId: string, project: any) {
    return prisma.project.update({
      where: { id: projectId },
      data: {
        ...(project.name !== undefined && { name: project.name }),
        ...(project.description !== undefined && { description: project.description }),
        ...(project.technologies !== undefined && {
          technologies: JSON.stringify(project.technologies),
        }),
        ...(project.role !== undefined && { role: project.role }),
        ...(project.durationMonths !== undefined && { durationMonths: project.durationMonths }),
        ...(project.projectUrl !== undefined && { projectUrl: project.projectUrl }),
      },
    });
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string) {
    return prisma.project.delete({ where: { id: projectId } });
  }

  /**
   * Add learning experience
   */
  async addLearning(userId: string, learning: any) {
    const profile = await prisma.learnerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    return prisma.learningExperience.create({
      data: {
        profileId: profile.id,
        courseName: learning.courseName,
        provider: learning.provider,
        subject: learning.subject || null,
        status: learning.status || 'IN_PROGRESS',
        completionDate: learning.completionDate || null,
      },
    });
  }

  /**
   * Update learning experience
   */
  async updateLearning(id: string, learning: any) {
    return prisma.learningExperience.update({
      where: { id },
      data: {
        ...(learning.courseName !== undefined && { courseName: learning.courseName }),
        ...(learning.provider !== undefined && { provider: learning.provider }),
        ...(learning.subject !== undefined && { subject: learning.subject }),
        ...(learning.status !== undefined && { status: learning.status }),
        ...(learning.completionDate !== undefined && { completionDate: learning.completionDate }),
      },
    });
  }

  /**
   * Delete learning experience
   */
  async deleteLearning(id: string) {
    return prisma.learningExperience.delete({ where: { id } });
  }

  /**
   * Add certification
   */
  async addCertification(userId: string, cert: any) {
    const profile = await prisma.learnerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    return prisma.certification.create({
      data: {
        profileId: profile.id,
        name: cert.name,
        issuer: cert.issuer,
        issueDate: cert.issueDate || null,
        credentialUrl: cert.credentialUrl || null,
      },
    });
  }

  /**
   * Update certification
   */
  async updateCertification(id: string, cert: any) {
    return prisma.certification.update({
      where: { id },
      data: {
        ...(cert.name !== undefined && { name: cert.name }),
        ...(cert.issuer !== undefined && { issuer: cert.issuer }),
        ...(cert.issueDate !== undefined && { issueDate: cert.issueDate }),
        ...(cert.credentialUrl !== undefined && { credentialUrl: cert.credentialUrl }),
      },
    });
  }

  /**
   * Delete certification
   */
  async deleteCertification(id: string) {
    return prisma.certification.delete({ where: { id } });
  }

  /**
   * Replace interests
   */
  async setInterests(userId: string, interests: any[]) {
    const profile = await prisma.learnerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    await prisma.learnerInterest.deleteMany({ where: { profileId: profile.id } });

    if (interests.length > 0) {
      await prisma.learnerInterest.createMany({
        data: interests.map(i => ({
          profileId: profile.id,
          category: i.category || 'TECHNICAL',
          topic: i.topic,
        })),
      });
    }

    return prisma.learnerInterest.findMany({ where: { profileId: profile.id } });
  }

  /**
   * Calculate completeness
   */
  async getCompleteness(userId: string): Promise<ProfileCompleteness> {
    const profile = await this.getProfileByUserId(userId);
    return calculateProfileCompleteness(profile);
  }
}

export const profileService = new ProfileService();
export default profileService;
