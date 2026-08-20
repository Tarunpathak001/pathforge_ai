import re
from typing import List, Dict, Any, Optional
from app.models.schemas import ExtractedSkill, ExtractedProject, ExtractedProfileResponse
from app.services.normalizer import normalize_skill_name, CANONICAL_SKILL_MAP

# Keyword patterns for proficiency inference
LEVEL_PATTERNS = [
    (5, [r"\bexpert\b", r"\bmastered\b", r"\bproficient\b", r"\bsenior\b", r"\badvanced\b"]),
    (4, [r"\bstrong\b", r"\bwell\b", r"\bfluent\b", r"\bdeep\b", r"\bgood\b", r"\bconfident\b"]),
    (3, [r"\bintermediate\b", r"\bworking knowledge\b", r"\bfamiliar\b", r"\bexperience with\b", r"\bbuilt with\b", r"\bworked with\b"]),
    (2, [r"\bbasic\b", r"\bfundamentals\b", r"\bbasics\b", r"\belementary\b", r"\blimited\b"]),
    (1, [r"\bbeginner\b", r"\blearning\b", r"\bstarted learning\b", r"\bexploring\b", r"\bnew to\b", r"\bnovice\b"])
]

# Patterns for target roles
ROLE_PATTERNS = [
    (r"\bbackend (?:software )?engineer\b|\bbackend developer\b", "Backend Engineer"),
    (r"\bfrontend (?:software )?engineer\b|\bfrontend developer\b", "Frontend Engineer"),
    (r"\bfull[\s-]?stack (?:software )?engineer\b|\bfull[\s-]?stack developer\b", "Full Stack Engineer"),
    (r"\bdata engineer\b", "Data Engineer"),
    (r"\bdata scientist\b", "Data Scientist"),
    (r"\bmachine learning engineer\b|\bml engineer\b|\bai engineer\b", "AI / Machine Learning Engineer"),
    (r"\bdevops engineer\b|\bcloud engineer\b|\bsre\b", "DevOps / Cloud Engineer"),
    (r"\bmobile (?:app )?developer\b|\bios developer\b|\bandroid developer\b", "Mobile Developer"),
    (r"\bsecurity engineer\b|\bcybersecurity\b", "Cybersecurity Engineer")
]

# Patterns for interest topics
INTEREST_PATTERNS = [
    (r"\bdistributed systems\b", "Distributed Systems"),
    (r"\bcloud computing\b|\bcloud\b", "Cloud Computing"),
    (r"\bmachine learning\b|\bai\b|\bdeep learning\b", "AI & Machine Learning"),
    (r"\bweb development\b|\bfrontend\b", "Web Development"),
    (r"\bbackend systems\b|\bbackend\b", "Backend Systems"),
    (r"\bcybersecurity\b|\bsecurity\b", "Cybersecurity"),
    (r"\bdata engineering\b|\bbig data\b", "Data Engineering"),
    (r"\bdevops\b|\bci[\s/]?cd\b", "DevOps & Infrastructure"),
    (r"\bmobile development\b", "Mobile Development"),
    (r"\bblockchain\b|\bweb3\b", "Blockchain & Web3"),
    (r"\bmicroservices\b", "Microservices Architecture")
]

# Hours availability patterns
AVAILABILITY_PATTERNS = [
    (r"(\d+)\s*(?:-|to)\s*(\d+)\s*hours?\s*(?:per|\/|a)\s*week", lambda m: f"{m.group(1)}-{m.group(2)}"),
    (r"(\d+)\+?\s*hours?\s*(?:per|\/|a)\s*week", lambda m: f"{m.group(1)}+ hours/week" if int(m.group(1)) >= 15 else f"{m.group(1)} hours/week"),
    (r"around\s*(\d+)\s*hours?", lambda m: f"{m.group(1)} hours/week"),
    (r"about\s*(\d+)\s*hours?", lambda m: f"{m.group(1)} hours/week")
]

def extract_profile_intelligence(text: str, context: Optional[str] = None) -> ExtractedProfileResponse:
    if not text or not text.strip():
        return ExtractedProfileResponse(
            skills=[],
            interests=[],
            projects=[],
            summary="Empty input provided."
        )

    clean_text = text.strip()
    text_lower = clean_text.lower()

    # 1. Target Role Identification
    target_role = None
    for pattern, role_name in ROLE_PATTERNS:
        if re.search(pattern, text_lower):
            target_role = role_name
            break

    # If user explicitly states "want to become a X" or "aiming for X"
    if not target_role:
        goal_match = re.search(r"(?:become|be|role of|aspire to be|career as)\s+(?:an?\s+)?([a-zA-Z\s]{3,30})(?:\.|\,|$)", clean_text, re.IGNORECASE)
        if goal_match:
            candidate = goal_match.group(1).strip()
            if len(candidate) > 2 and len(candidate.split()) <= 4:
                target_role = " ".join([w.capitalize() for w in candidate.split()])

    # 2. Skill Extraction & Proficiency Scoring
    extracted_skills_dict: Dict[str, ExtractedSkill] = {}

    # Check for canonical skills and aliases in text
    for alias, canonical in CANONICAL_SKILL_MAP.items():
        # Match as whole word/phrase
        escaped_alias = re.escape(alias)
        pattern = rf"(?<!\w){escaped_alias}(?!\w)"
        matches = list(re.finditer(pattern, text_lower))
        if not matches:
            continue

        # Extract context around the match to infer level & evidence
        for match in matches:
            start = max(0, match.start() - 40)
            end = min(len(clean_text), match.end() + 40)
            snippet = clean_text[start:end].strip()
            snippet_lower = snippet.lower()

            inferred_level = 3  # default intermediate
            for level, pats in LEVEL_PATTERNS:
                if any(re.search(p, snippet_lower) for p in pats):
                    inferred_level = level
                    break

            # Look for experience duration (e.g., "for about a year", "2 years")
            years = None
            yr_match = re.search(r"(\d+)\s*(?:years?|yrs?)", snippet_lower)
            if yr_match:
                years = float(yr_match.group(1))
            elif "year" in snippet_lower or "1 year" in snippet_lower:
                years = 1.0

            key = canonical.lower()
            if key not in extracted_skills_dict or extracted_skills_dict[key].level < inferred_level:
                extracted_skills_dict[key] = ExtractedSkill(
                    name=canonical,
                    level=inferred_level,
                    evidence=snippet,
                    years_experience=years
                )

    extracted_skills = list(extracted_skills_dict.values())

    # 3. Interest Extraction
    extracted_interests = []
    for pattern, interest_title in INTEREST_PATTERNS:
        if re.search(pattern, text_lower) and interest_title not in extracted_interests:
            extracted_interests.append(interest_title)

    # 4. Project Extraction
    extracted_projects: List[ExtractedProject] = []
    # Match phrases like "built two full-stack projects using React, Node.js and MongoDB"
    project_match = re.search(
        r"(?:built|developed|created|worked on)\s+([a-zA-Z0-9\s\-]+(?:projects?|apps?|applications?|systems?))\s+(?:using|with|in)\s+([a-zA-Z0-9\s\,\.\-]+?)(?:\.|\;|\n|$)",
        clean_text,
        re.IGNORECASE
    )
    if project_match:
        proj_name = project_match.group(1).strip()
        tech_clause = project_match.group(2).strip()
        
        # Extract matched techs
        proj_techs = []
        for alias, canonical in CANONICAL_SKILL_MAP.items():
            if re.search(rf"(?<!\w){re.escape(alias)}(?!\w)", tech_clause.lower()):
                if canonical not in proj_techs:
                    proj_techs.append(canonical)

        extracted_projects.append(ExtractedProject(
            name=proj_name.capitalize(),
            description=f"Project using {tech_clause}",
            technologies=proj_techs
        ))
    elif re.search(r"\bproject\b|\bprojects\b|\bbuilt\b", text_lower):
        # Generic project sentence extraction
        for sentence in re.split(r"[\.\n]", clean_text):
            if any(k in sentence.lower() for k in ["project", "built", "developed", "app"]):
                s_trimmed = sentence.strip()
                if len(s_trimmed) > 10:
                    proj_techs = [
                        canonical for alias, canonical in CANONICAL_SKILL_MAP.items()
                        if re.search(rf"(?<!\w){re.escape(alias)}(?!\w)", s_trimmed.lower())
                    ]
                    extracted_projects.append(ExtractedProject(
                        name="Practical Application / Project",
                        description=s_trimmed,
                        technologies=list(dict.fromkeys(proj_techs))
                    ))
                    break

    # 5. Availability Extraction
    weekly_availability = None
    for pattern, formatter in AVAILABILITY_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            weekly_availability = formatter(match)
            break

    # 6. Overall Experience Level
    experience_level = "INTERMEDIATE"
    if any(s.level >= 4 for s in extracted_skills) or "senior" in text_lower or "professional" in text_lower:
        experience_level = "ADVANCED"
    elif all(s.level <= 2 for s in extracted_skills) and len(extracted_skills) > 0:
        experience_level = "BEGINNER"

    return ExtractedProfileResponse(
        target_role=target_role,
        skills=extracted_skills,
        interests=extracted_interests,
        projects=extracted_projects,
        experience_level=experience_level,
        weekly_availability=weekly_availability or "10-15 hours/week",
        summary=f"Extracted {len(extracted_skills)} skills, {len(extracted_interests)} interests, and {len(extracted_projects)} projects."
    )
