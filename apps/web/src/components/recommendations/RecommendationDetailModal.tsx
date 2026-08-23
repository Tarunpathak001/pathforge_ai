import React from 'react';
import type { RecommendationItem } from '@pathforge/shared';

interface RecommendationDetailModalProps {
  item: RecommendationItem | null;
  onClose: () => void;
}

export const RecommendationDetailModal: React.FC<RecommendationDetailModalProps> = ({
  item,
  onClose,
}) => {
  if (!item) return null;

  const { resource, scoreBreakdown, explanation, algorithmVersion } = item;
  const matchPct = scoreBreakdown.matchPercentage;

  const subscores = [
    {
      label: 'Semantic Relevance',
      weight: scoreBreakdown.isSemanticFallback ? '0%' : '30%',
      score: scoreBreakdown.semanticScore,
      color: '#6366f1',
      desc: 'Cosine similarity between resource embedding & career/gap contextual query',
    },
    {
      label: 'Skill Coverage Depth',
      weight: '25%',
      score: scoreBreakdown.coverageScore,
      color: '#10b981',
      desc: 'Whether this resource teaches the target gap as PRIMARY vs SUPPORTING',
    },
    {
      label: 'Career Priority',
      weight: '15%',
      score: scoreBreakdown.careerScore,
      color: '#f59e0b',
      desc: 'Importance of the target skill for your selected target role',
    },
    {
      label: 'Difficulty Calibration',
      weight: '10%',
      score: scoreBreakdown.difficultyScore,
      color: '#06b6d4',
      desc: 'Alignment with your current skill level and optimal learning zone',
    },
    {
      label: 'Prerequisite Readiness',
      weight: '8%',
      score: scoreBreakdown.prerequisiteScore,
      color: '#8b5cf6',
      desc: 'Verification that you possess the necessary prerequisite foundations',
    },
    {
      label: 'Learner Preference Fit',
      weight: '7%',
      score: scoreBreakdown.preferenceScore,
      color: '#ec4899',
      desc: 'Match with your preferred learning format (Video, Project, Docs, etc.)',
    },
    {
      label: 'Curated Quality Score',
      weight: '5%',
      score: scoreBreakdown.qualityScore,
      color: '#14b8a6',
      desc: 'Internal curated quality and technical depth evaluation',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 16, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          padding: '28px',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#94a3b8',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ marginBottom: '20px', paddingRight: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600,
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              {resource.resourceType}
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>by {resource.provider}</span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0', lineHeight: 1.3 }}>
            {resource.title}
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Target Skill: <strong style={{ color: '#cbd5e1' }}>{item.targetSkillName}</strong>
          </p>
        </div>

        {/* Total Match Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Overall Match Score
            </div>
            <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '2px' }}>
              Weighted deterministic multi-factor fit
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>
              {matchPct}%
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Score: {scoreBreakdown.finalScore.toFixed(3)} / 1.0
            </div>
          </div>
        </div>

        {/* Explainability Bullets */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px' }}>
            Personalized Selection Rationale
          </h4>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              padding: '14px 16px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {explanation && explanation.length > 0 ? (
              explanation.map((reason, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#cbd5e1',
                    marginBottom: idx === explanation.length - 1 ? 0 : '8px',
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
                  <span>{reason}</span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>Ranked based on skill coverage and target career relevance.</div>
            )}
          </div>
        </div>

        {/* Detailed 7-Factor Subscores Breakdown */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', marginBottom: '12px' }}>
            Component Subscore Analysis
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {subscores.map((sub, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{sub.label}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>({sub.weight} weight)</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: sub.color }}>
                    {(sub.score * 100).toFixed(0)}% ({sub.score.toFixed(2)})
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(0, sub.score * 100))}%`,
                      background: sub.color,
                      borderRadius: '3px',
                    }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{sub.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Algorithm Metadata & Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Algorithm: <code style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>{algorithmVersion}</code>
            {scoreBreakdown.isSemanticFallback && (
              <span style={{ marginLeft: '8px', color: '#f59e0b' }}>[Fallback Mode Active]</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                background: '#4f46e5',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Visit Resource</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationDetailModal;
