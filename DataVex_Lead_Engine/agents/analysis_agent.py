import os
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

load_dotenv()

def create_analysis_agent():

    client = Cerebras(
        api_key=os.getenv("CEREBRAS_API_KEY")
    )

    def analyze_company(domain, services, scraped_data):

        prompt = f"""
You are a senior enterprise business intelligence analyst.

Your goal is to deeply analyze the TARGET COMPANY as a potential CLIENT for DataVex.

CRITICAL RULES:
- Use ONLY the provided scraped website data.
- Do NOT invent external information.
- Keep FULL detailed analysis.
- Do NOT summarize.
- Return ONLY valid JSON.
- No extra text outside JSON.

Scoring Guidelines:
0–30   = Weak alignment
31–60  = Moderate alignment
61–80  = Strong alignment
81–100 = Excellent strategic fit

Return EXACTLY this JSON structure:

{{
  "company_dossier": "Comprehensive structured overview of the company",
  "key_business_insights": "Deep insights about business model, positioning, strengths, opportunities",
  "industry_and_business_model": "Industry classification and detailed revenue model analysis",
  "service_alignment_analysis": "Detailed comparison between company capabilities and DataVex services",
  "fit_score": 0,
  "research_journey_trace": "Step-by-step reasoning showing how conclusions were derived from scraped data"
}}

Be analytical, objective, and evidence-based.

---

TARGET DOMAIN:
{domain}

---

DATA VEX SERVICE CATALOG:
{services}

---

SCRAPED WEBSITE DATA:
{scraped_data}
"""

        response = client.chat.completions.create(
            model="gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": "Return only valid JSON. Be detailed and evidence-based."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3
        )

        return response.choices[0].message.content

    return analyze_company