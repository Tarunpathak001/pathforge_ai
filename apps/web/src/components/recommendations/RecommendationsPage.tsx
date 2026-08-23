import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api-client';
import type {
  RecommendationResponse,
  RecommendationItem,
} from '@pathforge/shared';
import { RecommendationCard } from './RecommendationCard';
import { RecommendationDetailModal } from './RecommendationDetailModal';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedCareerSlug, setSelectedCareerSlug] = useState<string>('backend-engineer');
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [freeOnly, setFreeOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active modal
  const [selectedItemForModal, setSelectedItemForModal] = useState<RecommendationItem | null>(null);

  // Load careers and initial recommendations
  useEffect(() => {
    loadCareers();
    fetchRecommendations(selectedCareerSlug);
  }, []);

  const loadCareers = async () => {
    try {
      const res = await apiClient.getCareers();
      if (res && res.length > 0) {
        setCareers(res);
      }
    } catch (err) {
      console.warn('Failed to load careers for selector:', err);
    }
  };

  const fetchRecommendations = async (careerSlug: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getRecommendations(careerSlug);
      if (res.data) {
        setRecommendations(res.data);
      } else {
        // Trigger initial generation if none exists
        await handleGenerate(careerSlug);
      }
    } catch (err: any) {
      console.warn('Get recommendations failed, attempting generate:', err);
      await handleGenerate(careerSlug);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (careerSlug?: string) => {
    setGenerating(true);
    setError(null);
    try {
      const slug = careerSlug || selectedCareerSlug;
      const res = await apiClient.generateRecommendations({ careerSlug: slug });
      if (res.data) {
        setRecommendations(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate recommendations. Ensure profile onboarding is complete.');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleCareerChange = (newSlug: string) => {
    setSelectedCareerSlug(newSlug);
    fetchRecommendations(newSlug);
  };

  // Filter groups and items
  const filteredGroups = recommendations?.groups?.map(group => {
    const filteredItems = group.recommendations.filter(item => {
      const r = item.resource;
      if (selectedType !== 'ALL' && r.resourceType !== selectedType) return false;
      if (selectedDifficulty !== 'ALL' && r.difficulty !== selectedDifficulty) return false;
      if (freeOnly && !r.isFree) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        const matchesProvider = r.provider.toLowerCase().includes(q);
        const matchesSkill = item.targetSkillName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesProvider && !matchesSkill) return false;
      }
      return true;
    });

    return {
      ...group,
      recommendations: filteredItems,
    };
  }).filter(group => group.recommendations.length > 0) || [];

  const allItems = recommendations?.groups?.flatMap(g => g.recommendations) || [];
  const avgMatchPct = allItems.length > 0
    ? Math.round(allItems.reduce((acc, item) => acc + item.scoreBreakdown.matchPercentage, 0) / allItems.length)
    : 0;
  const freePct = allItems.length > 0
    ? Math.round((allItems.filter(item => item.resource.isFree).length / allItems.length) * 100)
    : 0;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)', color: '#a5b4fc', fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>
            <span>⚡ Phase 4 Intelligence</span>
            <span>•</span>
            <span>Deterministic Hybrid Engine</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Personalized Learning Recommendations
          </h1>
          <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0, maxWidth: '680px', lineHeight: 1.5 }}>
            Ranked, explainable learning resources tailored to bridge your exact skill gaps for your target career.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Career Selector */}
          <select
            value={selectedCareerSlug}
            onChange={e => handleCareerChange(e.target.value)}
            disabled={loading || generating}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'rgba(18, 24, 38, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {careers.map(c => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
            {careers.length === 0 && (
              <option value="backend-engineer">Backend Engineer</option>
            )}
          </select>

          {/* Regenerate Button */}
          <button
            onClick={() => handleGenerate(selectedCareerSlug)}
            disabled={generating || loading}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: generating || loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              opacity: generating || loading ? 0.7 : 1,
              transition: 'transform 0.15s, opacity 0.15s',
            }}
          >
            <span>{generating ? '🔄 Scoring Resources...' : '✨ Regenerate Recommendations'}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            color: '#fca5a5',
            marginBottom: '24px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => handleGenerate(selectedCareerSlug)}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: 'none',
              color: '#fecaca',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics Banner */}
      {recommendations && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              background: 'rgba(18, 24, 38, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '16px 20px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Target Career
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
              {recommendations.careerName}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Algorithm: {recommendations.algorithmVersion}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(18, 24, 38, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '16px 20px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Skill Gaps Addressed
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#6366f1', marginTop: '4px' }}>
              {recommendations.groups.length} Priority Skills
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Covering critical & developing gaps
            </div>
          </div>

          <div
            style={{
              background: 'rgba(18, 24, 38, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '16px 20px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Average Match Fit
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
              {avgMatchPct}%
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Across {allItems.length} curated resources
            </div>
          </div>

          <div
            style={{
              background: 'rgba(18, 24, 38, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '16px 20px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Free Content Ratio
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
              {freePct}% Free
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Open-access high quality materials
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div
        style={{
          background: 'rgba(18, 24, 38, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Left Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Format Type */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              fontSize: '13px',
              outline: 'none',
            }}
          >
            <option value="ALL">All Resource Formats</option>
            <option value="COURSE">Courses</option>
            <option value="PROJECT">Projects</option>
            <option value="DOCUMENTATION">Documentation</option>
            <option value="VIDEO">Videos</option>
            <option value="BOOK">Books</option>
            <option value="EXERCISE">Exercises</option>
          </select>

          {/* Difficulty */}
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              fontSize: '13px',
              outline: 'none',
            }}
          >
            <option value="ALL">All Difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          {/* Free Only Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={e => setFreeOnly(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Free Resources Only</span>
          </label>
        </div>

        {/* Right Search Input */}
        <div style={{ minWidth: '240px', flex: '1', maxWidth: '360px' }}>
          <input
            type="text"
            placeholder="Search resources, skills, providers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>⚡</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
            Computing Multi-Factor Recommendations...
          </div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Evaluating semantic similarity, prerequisite dependencies, coverage depth, and difficulty zone.
          </div>
        </div>
      )}

      {/* Content Groups */}
      {!loading && filteredGroups.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {filteredGroups.map(group => (
            <div key={group.skillId}>
              {/* Group Skill Gap Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  paddingBottom: '10px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: group.isCritical ? '#ef4444' : '#f59e0b',
                      boxShadow: group.isCritical ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none',
                    }}
                  />
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    {group.isCritical ? 'Critical Gap' : 'Target Skill'}: {group.skillName}
                  </h3>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: group.readiness === 'READY' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: group.readiness === 'READY' ? '#34d399' : '#fbbf24',
                      border: group.readiness === 'READY' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    {group.readiness === 'READY' ? '✓ Foundations Ready' : '⚠️ Foundation Building'}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Current: <strong style={{ color: '#f1f5f9' }}>{group.learnerLevel}/5</strong> → Required: <strong style={{ color: '#60a5fa' }}>{group.requiredLevel}/5</strong> (Gap: -{group.gap})
                </div>
              </div>

              {/* Grid of Recommendation Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '20px',
                }}
              >
                {group.recommendations.map(item => (
                  <RecommendationCard
                    key={item.id}
                    item={item}
                    onViewDetails={selected => setSelectedItemForModal(selected)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredGroups.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(18, 24, 38, 0.4)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px 0' }}>
            No Matching Recommendations Found
          </h3>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 20px 0' }}>
            Try adjusting your search filters or click regenerate to compute fresh recommendations.
          </p>
          <button
            onClick={() => {
              setSelectedType('ALL');
              setSelectedDifficulty('ALL');
              setFreeOnly(false);
              setSearchQuery('');
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#f8fafc',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Detail Breakdown Modal */}
      <RecommendationDetailModal
        item={selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
      />
    </div>
  );
};

export default RecommendationsPage;
