import React from 'react';
import type { RecommendationItem } from '@pathforge/shared';

interface RecommendationCardProps {
  item: RecommendationItem;
  onViewDetails: (item: RecommendationItem) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  onViewDetails,
}) => {
  const { resource, scoreBreakdown, rank, explanation } = item;

  // Format resource type display
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'COURSE':
        return { label: 'Course', bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      case 'PROJECT':
        return { label: 'Hands-on Project', bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'DOCUMENTATION':
        return { label: 'Documentation', bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
      case 'VIDEO':
        return { label: 'Video Lecture', bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
      case 'BOOK':
        return { label: 'Book', bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'EXERCISE':
        return { label: 'Interactive Practice', bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' };
      default:
        return { label: type, bg: 'rgba(100, 116, 139, 0.15)', text: '#94a3b8', border: 'rgba(100, 116, 139, 0.3)' };
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'BEGINNER':
        return { label: 'Beginner', color: '#10b981' };
      case 'INTERMEDIATE':
        return { label: 'Intermediate', color: '#f59e0b' };
      case 'ADVANCED':
        return { label: 'Advanced', color: '#ef4444' };
      default:
        return { label: diff, color: '#94a3b8' };
    }
  };

  const typeMeta = getTypeBadge(resource.resourceType);
  const diffMeta = getDifficultyBadge(resource.difficulty);
  const matchPct = scoreBreakdown.matchPercentage;

  // Match score color
  const getMatchColor = (pct: number) => {
    if (pct >= 85) return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' };
    if (pct >= 70) return { text: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.3)' };
    return { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' };
  };
  const matchTheme = getMatchColor(matchPct);

  return (
    <div
      style={{
        background: 'rgba(18, 24, 38, 0.75)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.35)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top Header: Rank, Badges & Match % */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              #{rank}
            </span>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600,
                background: typeMeta.bg,
                color: typeMeta.text,
                border: `1px solid ${typeMeta.border}`,
              }}
            >
              {typeMeta.label}
            </span>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                color: diffMeta.color,
                background: 'rgba(255, 255, 255, 0.04)',
              }}
            >
              {diffMeta.label}
            </span>
            {resource.isFree ? (
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#34d399',
                  background: 'rgba(52, 211, 153, 0.1)',
                }}
              >
                Free
              </span>
            ) : (
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#94a3b8',
                  background: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                Paid
              </span>
            )}
          </div>

          {/* Match Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: matchTheme.bg,
              border: `1px solid ${matchTheme.border}`,
              color: matchTheme.text,
              fontWeight: 700,
              fontSize: '13px',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{matchPct}% Match</span>
          </div>
        </div>

        {/* Resource Title & Provider */}
        <h4
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#f8fafc',
            margin: '0 0 4px 0',
            lineHeight: 1.4,
          }}
        >
          {resource.title}
        </h4>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Provider: <strong style={{ color: '#94a3b8' }}>{resource.provider}</strong></span>
          <span>•</span>
          <span>~{resource.estimatedHours} hrs</span>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: '13px',
            color: '#94a3b8',
            lineHeight: 1.5,
            margin: '0 0 14px 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {resource.description}
        </p>

        {/* Skills Covered Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {resource.skills.map((s, idx) => (
            <span
              key={idx}
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 500,
                background: s.coverage === 'PRIMARY' ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                color: s.coverage === 'PRIMARY' ? '#a5b4fc' : '#94a3b8',
                border: s.coverage === 'PRIMARY' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              {s.skillName || s.skillSlug} {s.coverage === 'PRIMARY' ? '★' : ''}
            </span>
          ))}
        </div>

        {/* Structured Reasons (Top 2) */}
        {explanation && explanation.length > 0 && (
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '16px',
              borderLeft: '3px solid #6366f1',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#818cf8', marginBottom: '4px' }}>
              Why this was selected:
            </div>
            {explanation.slice(0, 2).map((reason, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: '12px',
                  color: '#cbd5e1',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '6px',
                  marginBottom: idx === 0 && explanation.length > 1 ? '2px' : 0,
                }}
              >
                <span style={{ color: '#10b981', fontSize: '10px' }}>✓</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          gap: '10px',
        }}
      >
        <button
          onClick={() => onViewDetails(item)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#a5b4fc',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#c7d2fe')}
          onMouseLeave={e => (e.currentTarget.style.color = '#a5b4fc')}
        >
          <span>Score Breakdown</span>
          <span>→</span>
        </button>

        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
            transition: 'transform 0.15s, opacity 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>Start Learning</span>
          <span>↗</span>
        </a>
      </div>
    </div>
  );
};

export default RecommendationCard;
