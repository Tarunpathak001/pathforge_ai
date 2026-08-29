================================================================================
PATHFORGE AI — HCLTECH HACKATHON 2026 SUBMISSION PACKAGE
Tagline: From Career Goal to Adaptive Learning Path.
Release Tag: v1.0.0-final
================================================================================

PACKAGE CONTENTS:
-----------------
1. source-code/      : Complete monorepo source code for PathForge AI
2. documentation/    : Official Solution Whitepaper, API Reference, & Feature Audit
3. presentation/     : 12-Slide Final Competition Pitch Deck
4. demo/             : 3-5 Minute Timestamped Demo Script & Recording Guide
5. README.txt        : This quickstart evaluation guide

QUICKSTART EVALUATION (RUNNING LOCALLY):
----------------------------------------
Prerequisites: Node.js >= 18.0.0, pnpm >= 9.0.0

Step 1: Extract the source code archive and navigate to root:
   $ cd pathforge-ai

Step 2: Install dependencies:
   $ pnpm install

Step 3: Initialize and seed the canonical demo database:
   $ pnpm --filter @pathforge/api prisma db push
   $ pnpm --filter @pathforge/api prisma db seed

Step 4: Launch development servers:
   $ pnpm dev

Step 5: Open in browser:
   - Web Client: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Probe: http://localhost:3001/health
   - Readiness Probe: http://localhost:3001/health/ready

CANONICAL DEMO PERSONA:
-----------------------
- Name: Alex Chen (demo-learner-id)
- Target Career: Backend Engineer
- Career Alignment: 72%
- Active Milestone: Milestone 2 — Spring Boot & Advanced Microservices
- Next Best Action: Build a REST API with Spring Boot (5.0 hrs)

AUTOMATED TEST VERIFICATION:
----------------------------
Run the complete 127-test automated suite:
   $ pnpm test

All 127 tests pass across 24 test suites with 100% success rate.

================================================================================
Thank you for evaluating PathForge AI!
================================================================================
