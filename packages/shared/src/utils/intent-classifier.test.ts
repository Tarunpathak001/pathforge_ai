import { describe, it, expect } from 'vitest';
import { classifyCopilotIntent } from './intent-classifier.js';

describe('Intent Classifier Unit Tests', () => {
  it('correctly classifies NEXT_ACTION queries', () => {
    expect(classifyCopilotIntent('What should I learn today?').intent).toBe('NEXT_ACTION');
    expect(classifyCopilotIntent('What is my next best step?').intent).toBe('NEXT_ACTION');
    expect(classifyCopilotIntent('where do I start next?').intent).toBe('NEXT_ACTION');
  });

  it('correctly classifies PLANNING queries', () => {
    expect(classifyCopilotIntent('I only have 5 hours this week. What should I focus on?').intent).toBe(
      'PLANNING'
    );
    expect(classifyCopilotIntent('Can I finish this milestone this weekend?').intent).toBe('PLANNING');
  });

  it('correctly classifies SKILL_GAP queries', () => {
    expect(classifyCopilotIntent('Why is System Design still my biggest gap?').intent).toBe('SKILL_GAP');
    expect(classifyCopilotIntent('What skills am I weakest at?').intent).toBe('SKILL_GAP');
  });

  it('correctly classifies ROADMAP queries', () => {
    expect(classifyCopilotIntent('Why did my roadmap change?').intent).toBe('ROADMAP');
    expect(classifyCopilotIntent('Why is Backend Architecture before System Design?').intent).toBe(
      'ROADMAP'
    );
  });

  it('correctly classifies RECOMMENDATION queries', () => {
    expect(classifyCopilotIntent('Why did you recommend this course?').intent).toBe('RECOMMENDATION');
    expect(classifyCopilotIntent('Is there a hands-on project instead?').intent).toBe('RECOMMENDATION');
  });

  it('correctly classifies PROGRESS queries', () => {
    expect(classifyCopilotIntent('How much have I completed toward Backend Engineer?').intent).toBe(
      'PROGRESS'
    );
    expect(classifyCopilotIntent('What skills have I improved recently?').intent).toBe('PROGRESS');
  });

  it('correctly classifies ASSESSMENT queries', () => {
    expect(classifyCopilotIntent("Didn't I already complete the System Design assessment?").intent).toBe(
      'ASSESSMENT'
    );
    expect(classifyCopilotIntent('What was my score on the REST API quiz?').intent).toBe('ASSESSMENT');
  });

  it('correctly classifies CONCEPT_EXPLANATION queries', () => {
    expect(classifyCopilotIntent('What is Redis and how does caching work?').intent).toBe(
      'CONCEPT_EXPLANATION'
    );
    expect(classifyCopilotIntent('Explain REST APIs simply like I am 5').intent).toBe(
      'CONCEPT_EXPLANATION'
    );
  });
});
