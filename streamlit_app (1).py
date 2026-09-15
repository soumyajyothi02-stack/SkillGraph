
import io
import json
import re
from datetime import date, time

import pandas as pd
import streamlit as st

# Optional document readers
try:
    from pypdf import PdfReader
except Exception:
    PdfReader = None

try:
    from docx import Document
except Exception:
    Document = None

# Optional Gemini SDK
try:
    from google import genai
    from google.genai import types
except Exception:
    genai = None
    types = None


st.set_page_config(
    page_title="HirePulse | AI Recruitment Intelligence",
    page_icon="💼",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ---------- Styling ----------
st.markdown(
    """
    <style>
    .stApp {
        background: #0f100e;
        color: #f2efe7;
    }
    [data-testid="stSidebar"] {
        background: #171815;
        border-right: 1px solid #2b2c27;
    }
    .block-container {
        max-width: 1400px;
        padding-top: 1.5rem;
        padding-bottom: 3rem;
    }
    h1, h2, h3 {
        color: #f2efe7 !important;
        letter-spacing: -0.02em;
    }
    .brand {
        font-size: 1.55rem;
        font-weight: 800;
        color: #f2efe7;
        margin-bottom: 0.2rem;
    }
    .muted {
        color: #a8a69d;
        font-size: 0.92rem;
    }
    .hero {
        background: linear-gradient(135deg, #1b1c18 0%, #151612 100%);
        border: 1px solid #2c2d27;
        border-radius: 18px;
        padding: 1.5rem 1.7rem;
        margin-bottom: 1.2rem;
    }
    .hero-accent {
        color: #d58a50;
        font-weight: 700;
    }
    .metric-card {
        background: #191a17;
        border: 1px solid #2b2c27;
        border-radius: 14px;
        padding: 1rem;
        min-height: 105px;
    }
    .metric-label {
        color: #aaa89f;
        font-size: 0.82rem;
    }
    .metric-value {
        color: #f2efe7;
        font-size: 1.75rem;
        font-weight: 800;
        margin-top: 0.25rem;
    }
    .score {
        font-size: 3rem;
        font-weight: 900;
        color: #d58a50;
    }
    .pill {
        display: inline-block;
        padding: 0.28rem 0.6rem;
        border-radius: 999px;
        border: 1px solid #3a3b34;
        color: #ddd9ce;
        font-size: 0.78rem;
        margin: 0.15rem;
    }
    .section-card {
        background: #161714;
        border: 1px solid #292a25;
        border-radius: 15px;
        padding: 1rem 1.1rem;
        margin: 0.5rem 0;
    }
    .stButton > button {
        border-radius: 10px;
    }
    div[data-testid="stMetric"] {
        background: #191a17;
        border: 1px solid #2b2c27;
        padding: 0.8rem;
        border-radius: 14px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------- State ----------
if "candidates" not in st.session_state:
    st.session_state.candidates = [
        {"name": "Aarav Mehta", "role": "AI Engineer", "stage": "Technical Screen", "score": 91, "skills": ["Python", "LLMs", "FastAPI"]},
        {"name": "Isha Rao", "role": "Frontend Engineer", "stage": "Phone Screen", "score": 86, "skills": ["React", "TypeScript", "UI"]},
        {"name": "Kabir Shah", "role": "Data Analyst", "stage": "Applied", "score": 78, "skills": ["Python", "SQL", "Power BI"]},
        {"name": "Naina Verma", "role": "ML Engineer", "stage": "Interview", "score": 94, "skills": ["Python", "ML", "PyTorch"]},
    ]

if "jobs" not in st.session_state:
    st.session_state.jobs = [
        {"title": "AI Engineer", "department": "Engineering", "openings": 2, "status": "Open"},
        {"title": "Data Analyst", "department": "Analytics", "openings": 1, "status": "Open"},
        {"title": "Frontend Engineer", "department": "Product", "openings": 1, "status": "Open"},
    ]

if "screening_result" not in st.session_state:
    st.session_state.screening_result = None

# ---------- Helpers ----------
def extract_resume_text(uploaded_file):
    if uploaded_file is None:
        return ""

    data = uploaded_file.getvalue()
    name = uploaded_file.name.lower()

    if name.endswith(".pdf"):
        if PdfReader is None:
            return "PDF reader is not installed. Add pypdf to requirements.txt."
        try:
            reader = PdfReader(io.BytesIO(data))
            return "\n".join((p.extract_text() or "") for p in reader.pages)
        except Exception as exc:
            return f"Could not read PDF: {exc}"

    if name.endswith(".docx"):
        if Document is None:
            return "DOCX reader is not installed. Add python-docx to requirements.txt."
        try:
            doc = Document(io.BytesIO(data))
            return "\n".join(p.text for p in doc.paragraphs)
        except Exception as exc:
            return f"Could not read DOCX: {exc}"

    try:
        return data.decode("utf-8", errors="ignore")
    except Exception:
        return ""


def get_gemini_client():
    key = st.secrets.get("GEMINI_API_KEY", "")
    if not key:
        key = st.session_state.get("gemini_key", "")
    if not key or genai is None:
        return None
    try:
        return genai.Client(api_key=key)
    except Exception:
        return None


def call_gemini_json(prompt):
    client = get_gemini_client()
    if client is None:
        return None

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )
        text = response.text or "{}"
        return json.loads(text)
    except Exception as exc:
        st.warning(f"Gemini could not be reached. Showing a local fallback instead. ({exc})")
        return None


def local_screening(resume, job, role):
    resume_lower = resume.lower()
    job_lower = job.lower()
    tokens = sorted(set(re.findall(r"[a-zA-Z][a-zA-Z+#.-]{1,}", job_lower)))
    stop = {
        "the", "and", "for", "with", "that", "this", "from", "have", "has",
        "are", "you", "our", "will", "into", "your", "role", "years", "year",
        "job", "work", "using", "use", "team", "about", "their", "they",
        "strong", "good", "experience", "looking", "required", "preferred",
    }
    keywords = [t for t in tokens if t not in stop and len(t) > 2]
    found = [k for k in keywords if k in resume_lower]
    score = min(98, max(20, 45 + int(55 * len(found) / max(1, min(len(keywords), 12)))))
    missing = [k for k in keywords if k not in resume_lower][:6]

    return {
        "matchScore": score,
        "matchSummary": f"The profile shows a {score}% estimated match for the {role} position based on the provided resume and job description. This local analysis is a screening aid, not a final hiring decision.",
        "keyStrengths": [
            f"Matched keywords: {', '.join(found[:6])}" if found else "Relevant experience should be verified against the role requirements.",
            "Resume content is available for recruiter review.",
            "The screening highlights areas that can be explored in an interview.",
        ],
        "gapsAndConcerns": [
            f"Missing or unconfirmed keywords: {', '.join(missing)}" if missing else "No major keyword gaps were detected.",
            "Validate depth of experience and ownership during interviews.",
        ],
        "interviewQuestions": [
            f"Can you walk us through your most relevant project for the {role} role?",
            "Which requirement in this job description is your strongest area, and why?",
            "Tell us about a technical challenge you faced and how you solved it.",
            "What would you improve or learn to become stronger in this role?",
        ],
        "recommendation": "Advance to Phone Screen" if score >= 70 else "Consider for Alternate Role",
        "skillsFound": found[:12] or ["No skills confidently extracted"],
        "experienceYearsEstimate": None,
        "educationSummary": "Review resume education section",
    }


# ---------- Sidebar ----------
with st.sidebar:
    st.markdown('<div class="brand">HirePulse</div>', unsafe_allow_html=True)
    st.markdown('<div class="muted">AI Recruitment Intelligence</div>', unsafe_allow_html=True)
    st.divider()

    page = st.radio(
        "Workspace",
        [
            "Dashboard",
            "Resume Screener",
            "Candidates",
            "Jobs",
            "Interview Prep",
            "Rejection Center",
            "Analytics",
        ],
        label_visibility="collapsed",
    )

    st.divider()
    st.markdown("**AI Configuration**")
    st.caption("For Gemini-powered analysis, add `GEMINI_API_KEY` in Streamlit Secrets.")
    with st.expander("Temporary key for this session"):
        st.text_input("Gemini API key", type="password", key="gemini_key")
    st.caption("Never commit an API key to GitHub.")

# ---------- Dashboard ----------
if page == "Dashboard":
    st.markdown(
        """
        <div class="hero">
            <div class="hero-accent">RECRUITMENT OPERATIONS</div>
            <h1>Make every hiring decision more informed.</h1>
            <p class="muted">Screen resumes, manage candidates, prepare interviews and turn hiring data into practical insights.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    candidates = st.session_state.candidates
    open_jobs = len([j for j in st.session_state.jobs if j["status"] == "Open"])
    interviews = len([c for c in candidates if c["stage"] in ("Interview", "Technical Screen")])
    avg_score = round(sum(c["score"] for c in candidates) / max(1, len(candidates)))

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Active Candidates", len(candidates))
    c2.metric("Open Roles", open_jobs)
    c3.metric("Interview Stage", interviews)
    c4.metric("Avg. Match Score", f"{avg_score}%")

    st.subheader("Pipeline snapshot")
    df = pd.DataFrame(candidates)
    if not df.empty:
        counts = df["stage"].value_counts().rename_axis("Stage").reset_index(name="Candidates")
        st.bar_chart(counts.set_index("Stage"))

    st.subheader("Top candidates")
    if not df.empty:
        show = df[["name", "role", "stage", "score"]].sort_values("score", ascending=False)
        st.dataframe(show, use_container_width=True, hide_index=True)

# ---------- Resume Screener ----------
elif page == "Resume Screener":
    st.markdown("## Resume Screener")
    st.caption("Upload a resume, paste a job description, and generate a structured screening report.")

    left, right = st.columns([1, 1])
    with left:
        role = st.text_input("Role title", placeholder="e.g. AI/ML Intern")
        department = st.text_input("Department", placeholder="e.g. Engineering")
        candidate_name = st.text_input("Candidate name", placeholder="e.g. Candidate")
        uploaded = st.file_uploader("Upload resume", type=["pdf", "docx", "txt"])
    with right:
        job_description = st.text_area(
            "Job description",
            height=210,
            placeholder="Paste the job description and key requirements here...",
        )
        resume_text = st.text_area(
            "Or paste resume text",
            height=130,
            placeholder="Paste resume text if you do not want to upload a file.",
        )

    if uploaded:
        extracted = extract_resume_text(uploaded)
        if extracted:
            resume_text = extracted
            st.success(f"Resume loaded: {uploaded.name} ({len(resume_text):,} characters)")

    if st.button("Run AI Screening", type="primary", use_container_width=True):
        if not role or not resume_text.strip():
            st.error("Please provide a role title and resume.")
        else:
            prompt = f"""
You are an objective recruitment intelligence engine.
Analyze this candidate for the role below. Return ONLY valid JSON with:
matchScore (integer 0-100), matchSummary (string), keyStrengths (array of strings),
gapsAndConcerns (array of strings), interviewQuestions (array of strings),
recommendation (string), skillsFound (array of strings),
experienceYearsEstimate (number or null), educationSummary (string).

ROLE: {role}
DEPARTMENT: {department or "General"}
JOB DESCRIPTION:
{job_description or "No job description provided."}

CANDIDATE:
{resume_text[:30000]}
"""
            result = call_gemini_json(prompt)
            st.session_state.screening_result = result or local_screening(resume_text, job_description, role)

    result = st.session_state.screening_result
    if result:
        st.divider()
        score = result.get("matchScore", 0)
        st.markdown(
            f'<div class="section-card"><span class="score">{score}%</span><br>'
            f'<b>Estimated role match</b><br>{result.get("matchSummary", "")}</div>',
            unsafe_allow_html=True,
        )

        a, b = st.columns(2)
        with a:
            st.markdown("### Strengths")
            for item in result.get("keyStrengths", []):
                st.write("✓", item)
            st.markdown("### Skills found")
            skills = result.get("skillsFound", [])
            st.markdown(" ".join(f'<span class="pill">{s}</span>' for s in skills), unsafe_allow_html=True)
        with b:
            st.markdown("### Gaps & concerns")
            for item in result.get("gapsAndConcerns", []):
                st.write("•", item)
            st.markdown("### Recommendation")
            st.info(result.get("recommendation", "Review manually"))

        st.markdown("### Targeted interview questions")
        for i, q in enumerate(result.get("interviewQuestions", []), 1):
            st.write(f"**{i}.** {q}")

        if st.button("Add candidate to pipeline"):
            st.session_state.candidates.insert(
                0,
                {
                    "name": candidate_name or "New Candidate",
                    "role": role,
                    "stage": "Applied",
                    "score": score,
                    "skills": result.get("skillsFound", []),
                },
            )
            st.success("Candidate added to the pipeline.")

# ---------- Candidates ----------
elif page == "Candidates":
    st.markdown("## Candidate Pipeline")
    st.caption("A lightweight recruitment pipeline for the Streamlit deployment.")

    with st.expander("Add candidate manually"):
        with st.form("candidate_form"):
            name = st.text_input("Name")
            role = st.text_input("Role")
            stage = st.selectbox("Stage", ["Applied", "Phone Screen", "Technical Screen", "Interview", "Hired", "Rejected"])
            score = st.slider("Match score", 0, 100, 75)
            skills = st.text_input("Skills (comma separated)")
            submitted = st.form_submit_button("Add candidate")
            if submitted and name and role:
                st.session_state.candidates.append({
                    "name": name,
                    "role": role,
                    "stage": stage,
                    "score": score,
                    "skills": [x.strip() for x in skills.split(",") if x.strip()],
                })
                st.success("Candidate added.")

    df = pd.DataFrame(st.session_state.candidates)
    if not df.empty:
        stages = ["All"] + sorted(df["stage"].unique().tolist())
        selected_stage = st.selectbox("Filter by stage", stages)
        filtered = df if selected_stage == "All" else df[df["stage"] == selected_stage]
        st.dataframe(filtered[["name", "role", "stage", "score"]], use_container_width=True, hide_index=True)

        st.markdown("### Candidate details")
        selected_name = st.selectbox("Select candidate", filtered["name"].tolist())
        candidate = next(c for c in st.session_state.candidates if c["name"] == selected_name)
        st.write(f"**Role:** {candidate['role']}")
        st.write(f"**Stage:** {candidate['stage']}")
        st.write(f"**Match score:** {candidate['score']}%")
        st.write("**Skills:** " + ", ".join(candidate.get("skills", [])))

# ---------- Jobs ----------
elif page == "Jobs":
    st.markdown("## Job Requisitions")

    with st.form("job_form"):
        title = st.text_input("Job title")
        department = st.text_input("Department")
        openings = st.number_input("Openings", min_value=1, max_value=100, value=1)
        submitted = st.form_submit_button("Create job")
        if submitted and title:
            st.session_state.jobs.append({
                "title": title,
                "department": department or "General",
                "openings": int(openings),
                "status": "Open",
            })
            st.success("Job created.")

    df = pd.DataFrame(st.session_state.jobs)
    st.dataframe(df, use_container_width=True, hide_index=True)

# ---------- Interview Prep ----------
elif page == "Interview Prep":
    st.markdown("## AI Interview Prep")
    st.caption("Generate focused interview questions from a role and candidate profile.")

    role = st.text_input("Role", placeholder="e.g. Machine Learning Intern")
    jd = st.text_area("Job requirements", height=150)
    profile = st.text_area("Candidate profile / resume summary", height=180)

    if st.button("Generate interview guide", type="primary"):
        if not role:
            st.error("Enter a role first.")
        else:
            prompt = f"""
Create an interview guide for a recruiter.
Role: {role}
Requirements: {jd}
Candidate profile: {profile}
Return JSON with sections: warmup (3 strings), technical (5 strings),
behavioral (4 strings), redFlagsToProbe (4 strings), scorecardCriteria (5 strings).
"""
            result = call_gemini_json(prompt)
            if result is None:
                result = {
                    "warmup": [
                        "Tell me about yourself and your most relevant project.",
                        "Why are you interested in this role?",
                        "What are you currently learning?",
                    ],
                    "technical": [
                        "Explain a project where you used the main technology required for this role.",
                        "How would you debug a problem in your solution?",
                        "What trade-offs did you make in a recent project?",
                        "How do you test your work?",
                        "How would you improve your current approach?",
                    ],
                    "behavioral": [
                        "Tell me about a time you handled a difficult problem.",
                        "Describe a time you received critical feedback.",
                        "How do you prioritize when deadlines overlap?",
                        "Tell me about a team project and your contribution.",
                    ],
                    "redFlagsToProbe": [
                        "Unclear ownership of claimed projects.",
                        "Inability to explain fundamental concepts.",
                        "Unverified experience level.",
                        "Weak communication of problem-solving steps.",
                    ],
                    "scorecardCriteria": [
                        "Technical fundamentals", "Problem solving", "Communication",
                        "Learning ability", "Role alignment",
                    ],
                }

            for section, items in result.items():
                st.markdown(f"### {section.replace('_', ' ').title()}")
                if isinstance(items, list):
                    for i, item in enumerate(items, 1):
                        st.write(f"{i}. {item}")
                else:
                    st.write(items)

# ---------- Rejection ----------
elif page == "Rejection Center":
    st.markdown("## Rejection Center")
    st.caption("Generate respectful, clear candidate communication.")

    c1, c2 = st.columns(2)
    with c1:
        name = st.text_input("Candidate name")
        role = st.text_input("Role")
        stage = st.selectbox("Stage", ["Application", "Phone Screen", "Technical Interview", "Final Interview"])
        company = st.text_input("Company name", value="HirePulse")
    with c2:
        feedback = st.text_area("High-level feedback", height=160)

    if st.button("Generate rejection email", type="primary"):
        prompt = f"""
Draft a warm and professional candidate rejection email.
Candidate: {name or "Candidate"}
Role: {role or "the position"}
Stage: {stage}
Company: {company}
Feedback: {feedback or "Competitive candidate pool"}
Return JSON with subject and bodyText.
"""
        result = call_gemini_json(prompt)
        if result is None:
            result = {
                "subject": f"Update regarding your application for {role or 'the position'} at {company}",
                "bodyText": (
                    f"Dear {name or 'Candidate'},\n\n"
                    f"Thank you for your time and interest in the {role or 'the position'} at {company}. "
                    "After careful consideration, we have decided to move forward with other candidates "
                    "whose experience more closely matches our current requirements.\n\n"
                    "We appreciate the effort you invested in the process and wish you the very best in your career.\n\n"
                    "Warm regards,\nTalent Acquisition Team"
                ),
            }

        st.markdown("### Email")
        st.text_input("Subject", value=result.get("subject", ""), key="generated_subject")
        st.text_area("Body", value=result.get("bodyText", ""), height=300, key="generated_body")

# ---------- Analytics ----------
elif page == "Analytics":
    st.markdown("## Recruitment Analytics")
    df = pd.DataFrame(st.session_state.candidates)

    if df.empty:
        st.info("Add candidates to see analytics.")
    else:
        c1, c2, c3 = st.columns(3)
        c1.metric("Candidates", len(df))
        c2.metric("Average Match", f"{df['score'].mean():.0f}%")
        c3.metric("Top Match", f"{df['score'].max()}%")

        st.markdown("### Candidates by stage")
        stage_counts = df["stage"].value_counts().rename_axis("Stage").reset_index(name="Candidates")
        st.bar_chart(stage_counts.set_index("Stage"))

        st.markdown("### Match score distribution")
        score_counts = pd.cut(
            df["score"],
            bins=[0, 59, 69, 79, 89, 100],
            labels=["0–59", "60–69", "70–79", "80–89", "90–100"],
            include_lowest=True,
        ).value_counts().sort_index()
        st.bar_chart(score_counts)

        st.markdown("### Candidate table")
        st.dataframe(df[["name", "role", "stage", "score"]].sort_values("score", ascending=False),
                     use_container_width=True, hide_index=True)

st.divider()
st.caption("HirePulse Streamlit edition • AI-assisted recruitment workflow • Keep hiring decisions human-reviewed.")
