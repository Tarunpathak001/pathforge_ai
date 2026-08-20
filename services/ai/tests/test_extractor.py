import pytest
from app.services.extractor import extract_profile_intelligence
from app.services.normalizer import normalize_skill_name

def test_skill_normalization():
    canonical, key = normalize_skill_name("js")
    assert canonical == "JavaScript"
    assert key == "javascript"

    canonical, key = normalize_skill_name("reactjs")
    assert canonical == "React"

    canonical, key = normalize_skill_name("node.js")
    assert canonical == "Node.js"

    canonical, key = normalize_skill_name("postgres")
    assert canonical == "PostgreSQL"

def test_extract_empty_and_whitespace():
    res = extract_profile_intelligence("")
    assert len(res.skills) == 0
    assert len(res.projects) == 0

    res2 = extract_profile_intelligence("   ")
    assert len(res2.skills) == 0

def test_extract_hackathon_scenario():
    text = (
        "I want to become a Backend Engineer. I know Java and SQL fairly well. "
        "I've built two full-stack projects using React, Node.js and MongoDB. "
        "I have basic knowledge of Spring Boot and Docker. "
        "I am interested in distributed systems and cloud computing. "
        "I can spend around 10 hours per week learning."
    )
    res = extract_profile_intelligence(text)

    assert res.target_role == "Backend Engineer"
    
    skill_names = [s.name for s in res.skills]
    for expected in ["Java", "SQL", "React", "Node.js", "MongoDB", "Spring Boot", "Docker"]:
        assert expected in skill_names, f"Expected {expected} in extracted skills"

    assert "Distributed Systems" in res.interests
    assert "Cloud Computing" in res.interests
    assert len(res.projects) >= 1
    assert "10" in res.weekly_availability
