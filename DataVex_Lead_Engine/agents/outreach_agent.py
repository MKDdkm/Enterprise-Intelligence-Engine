import os
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

load_dotenv()

def create_outreach_agent():

    client = Cerebras(
        api_key=os.getenv("CEREBRAS_API_KEY")
    )

    def evaluate_lead(analysis, catalog):

        prompt = f"""
You are a strategic B2B lead qualification expert.

Your role is to evaluate whether DataVex should pursue this company.

CRITICAL RULES:
- Base decision strictly on provided analysis.
- Return ONLY valid JSON.
- Fit score MUST be integer between 0 and 100.
- Do NOT write numbers in words.
- No email content.
- No extra text outside JSON.

Evaluation Focus:
- Service alignment strength
- Revenue potential
- Strategic value
- Timing opportunity
- Market relevance
- Competitive advantage

Return EXACTLY this JSON structure:

{{
  "fit_score": 0,
  "verdict": "PURSUE / MAYBE / NOT PURSUE",
  "why_now": "Detailed timing justification",
  "outreach_strategy": "Detailed bullet-point strategy",
  "decision_maker": "Most relevant executive role title",
  "research_journey_trace": "Step-by-step logical evaluation process"
}}

---

COMPANY ANALYSIS:
{analysis}

---

DATA VEX SERVICE CATALOG:
{catalog}
"""

        response = client.chat.completions.create(
            model="gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": "Return only valid JSON. Be strategic and objective."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2
        )

        return response.choices[0].message.content

    return evaluate_lead 