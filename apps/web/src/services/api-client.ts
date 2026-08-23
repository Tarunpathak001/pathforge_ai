import type {
  LearnerProfile,
  ProfileCompleteness,
  ExtractedProfileResponse,
  AIExtractionRequest,
  CareerDetailResponse,
  Skill,
  SkillDetailResponse,
  SkillPrerequisiteTreeNode,
} from '@pathforge/shared';

const API_BASE = '/api';

export interface CareerFilterParams {
  category?: string;
  difficulty?: string;
  demandLevel?: string;
  search?: string;
}

export interface SkillFilterParams {
  category?: string;
  skillType?: string;
  search?: string;
}

export class ApiClient {
  private userId: string;

  constructor() {
    this.userId = localStorage.getItem('pathforge_user_id') || 'default-learner-id';
  }

  setUserId(id: string) {
    this.userId = id;
    localStorage.setItem('pathforge_user_id', id);
  }

  getUserId(): string {
    return this.userId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      'x-user-id': this.userId,
      ...(options.headers || {}),
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `API error: ${res.status}`);
    }

    return data.data !== undefined ? data.data : data;
  }

  // Profile endpoints
  async getProfile(): Promise<LearnerProfile | null> {
    try {
      return await this.request<LearnerProfile>('/profile');
    } catch (e: any) {
      if (e.message?.includes('not found') || e.message?.includes('404')) {
        return null;
      }
      throw e;
    }
  }

  async saveProfile(profileData: any): Promise<LearnerProfile> {
    return this.request<LearnerProfile>('/profile', {
      method: 'POST',
      body: JSON.stringify({ ...profileData, userId: this.userId }),
    });
  }

  async updateProfile(updates: any): Promise<LearnerProfile> {
    return this.request<LearnerProfile>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteProfile(): Promise<void> {
    await this.request('/profile', { method: 'DELETE' });
  }

  async getCompleteness(): Promise<ProfileCompleteness> {
    return this.request<ProfileCompleteness>('/profile/completeness');
  }

  // AI Extraction
  async extractProfileIntelligence(
    requestPayload: AIExtractionRequest
  ): Promise<ExtractedProfileResponse> {
    return this.request<ExtractedProfileResponse>('/profile/ai-extract', {
      method: 'POST',
      body: JSON.stringify(requestPayload),
    });
  }

  // Skills
  async addSkill(skill: any) {
    return this.request('/profile/skills', {
      method: 'POST',
      body: JSON.stringify(skill),
    });
  }

  async deleteSkill(skillId: string) {
    return this.request(`/profile/skills/${skillId}`, { method: 'DELETE' });
  }

  // Projects
  async addProject(project: any) {
    return this.request('/profile/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(projectId: string) {
    return this.request(`/profile/projects/${projectId}`, { method: 'DELETE' });
  }

  // ============================================================================
  // PHASE 2: CAREER & SKILL INTELLIGENCE ENDPOINTS
  // ============================================================================

  async getCareers(params?: CareerFilterParams): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'ALL') query.append('category', params.category);
    if (params?.difficulty) query.append('difficulty', params.difficulty);
    if (params?.demandLevel) query.append('demandLevel', params.demandLevel);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<any[]>(`/careers${queryString}`);
  }

  async getCareerBySlug(slug: string): Promise<CareerDetailResponse> {
    return this.request<CareerDetailResponse>(`/careers/${slug}`);
  }

  async getCareerSkills(slug: string): Promise<any[]> {
    return this.request<any[]>(`/careers/${slug}/skills`);
  }

  async getSkills(params?: SkillFilterParams): Promise<Skill[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'ALL') query.append('category', params.category);
    if (params?.skillType) query.append('skillType', params.skillType);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<Skill[]>(`/skills${queryString}`);
  }

  async getSkillBySlug(slug: string): Promise<SkillDetailResponse> {
    return this.request<SkillDetailResponse>(`/skills/${slug}`);
  }

  async getSkillPrerequisites(slug: string): Promise<SkillPrerequisiteTreeNode> {
    return this.request<SkillPrerequisiteTreeNode>(`/skills/${slug}/prerequisites`);
  }

  async getSkillDependents(slug: string): Promise<any[]> {
    return this.request<any[]>(`/skills/${slug}/dependents`);
  }

  // ============================================================================
  // PHASE 3: PERSONALIZED SKILL GAP INTELLIGENCE ENGINE ENDPOINTS
  // ============================================================================

  async analyzeSkillGap(data: { careerId?: string; careerSlug?: string }) {
    return this.request<any>('/skill-gap/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLatestSkillGap(careerSlug?: string) {
    const queryString = careerSlug ? `?careerSlug=${encodeURIComponent(careerSlug)}` : '';
    return this.request<any>(`/skill-gap/latest${queryString}`);
  }

  async getSkillGapById(id: string) {
    return this.request<any>(`/skill-gap/${id}`);
  }

  async getSkillGapHistory(limit = 10) {
    return this.request<any[]>(`/skill-gap?limit=${limit}`);
  }

  // ============================================================================
  // PHASE 4: INTELLIGENT LEARNING RESOURCE RECOMMENDATION ENDPOINTS
  // ============================================================================

  async generateRecommendations(data?: {
    careerId?: string;
    careerSlug?: string;
    maxPerGap?: number;
    minScore?: number;
    includeSemantic?: boolean;
  }) {
    return this.request<any>('/recommendations/generate', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async getRecommendations(careerSlug?: string) {
    const queryString = careerSlug ? `?careerSlug=${encodeURIComponent(careerSlug)}` : '';
    return this.request<any>(`/recommendations${queryString}`);
  }

  async getRecommendationById(id: string) {
    return this.request<any>(`/recommendations/${id}`);
  }

  // ============================================================================
  // PHASE 5: PERSONALIZED LEARNING PATH & ROADMAP GENERATOR
  // ============================================================================

  async generateLearningPath(data?: {
    careerId?: string;
    careerSlug?: string;
    weeklyHours?: number;
    regenerate?: boolean;
  }) {
    return this.request<any>('/learning-path/generate', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async getLatestLearningPath(careerSlug?: string) {
    const queryString = careerSlug ? `?careerSlug=${encodeURIComponent(careerSlug)}` : '';
    return this.request<any>(`/learning-path${queryString}`);
  }

  async getLearningPathById(id: string) {
    return this.request<any>(`/learning-path/${id}`);
  }

  async regenerateLearningPath(id: string, data?: { weeklyHours?: number }) {
    return this.request<any>(`/learning-path/${id}/regenerate`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async getLearningPathMilestones(id: string) {
    return this.request<any[]>(`/learning-path/${id}/milestones`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;

