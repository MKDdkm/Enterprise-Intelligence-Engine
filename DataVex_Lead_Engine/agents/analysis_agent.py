
# import os
# from dotenv import load_dotenv
# from cerebras.cloud.sdk import Cerebras

# load_dotenv()

# def create_analysis_agent():

#     # Initialize Cerebras client
#     client = Cerebras(
#         api_key=os.getenv("CEREBRAS_API_KEY")
#     )

#     def analyze_company(domain, services, scraped_data):

#         prompt = f"""
# You are a senior business intelligence analyst.

# Your task is to deeply analyze the target company and evaluate strategic fit.

# REQUIREMENTS:

# 1. Create a detailed Company Dossier.
# 2. Identify Industry & Business Model.
# 3. Extract Core Services & Capabilities.
# 4. Analyze Strategic Fit with DataVex Services.
# 5. Provide Research Summary.
# 6. Include clear reasoning steps (research trace).

# ---

# TARGET COMPANY DOMAIN:
# {domain}

# ---

# DATA VEX SERVICE CATALOG:
# {services}

# ---

# SCRAPED WEBSITE DATA (JSON):
# {scraped_data}

# ---

# Return in structured format with clear headings.
# """

#         response = client.chat.completions.create(
#             model="gpt-oss-120b",
#             messages=[
#                 {
#                     "role": "system",
#                     "content": "You are a strategic business research expert."
#                 },
#                 {
#                     "role": "user",
#                     "content": prompt
#                 }
#             ],
#             temperature=0.3
#         )

#         return response.choices[0].message.content

#     return analyze_company



# agents/analysis_agent.py

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
You are a senior business intelligence analyst.

Your task is to analyze the TARGET COMPANY using ONLY the scraped website data.

You MUST use the scraped content provided below.

Return ONLY the following sections:

1. Company Dossier
2. Key Business Insights
3. Industry & Business Model
4. Service Alignment Analysis with DataVex
5. Research Journey Trace (step-by-step reasoning)

IMPORTANT:
- Base all conclusions strictly on scraped data.
- Do not invent external information.
- Use logical reasoning only from the provided content.

---

TARGET COMPANY DOMAIN:
{domain}

---

DATA VEX SERVICE CATALOG:
{services}

---

SCRAPED WEBSITE DATA (JSON):
{scraped_data}

---

Return structured output with clear headings.
"""

        response = client.chat.completions.create(
            model="gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": "You are a disciplined business intelligence analyst."
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