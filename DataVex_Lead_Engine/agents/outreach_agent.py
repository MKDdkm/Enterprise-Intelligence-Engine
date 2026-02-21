# import os
# from dotenv import load_dotenv
# from cerebras.cloud.sdk import Cerebras

# load_dotenv()

# def create_outreach_agent():

#     # Initialize Cerebras client
#     client = Cerebras(
#         api_key=os.getenv("CEREBRAS_API_KEY")
#     )

#     def generate_outreach(analysis, catalog):

#         prompt = f"""
# You are a senior B2B strategic outreach and lead qualification expert.

# Your responsibilities:

# 1. Calculate a Fit Score (0-100).
# 2. Provide Final Verdict: PURSUE / MAYBE / SKIP.
# 3. Give detailed justification.
# 4. Explain Why Now (timing analysis).
# 5. Identify the best Decision Maker.
# 6. Create Outreach Strategy.
# 7. Write a professional personalized email.
# 8. Provide a short Research Trace Summary explaining how you reached the decision.

# IMPORTANT:
# - Be objective.
# - Base decisions strictly on analysis and service alignment.
# - Clearly structure your response with headings.

# ---

# COMPANY ANALYSIS:
# {analysis}

# ---

# DATA VEX SERVICE CATALOG:
# {catalog}

# ---

# Return the response in clearly separated sections.
# """

#         response = client.chat.completions.create(
#             model="gpt-oss-120b",
#             messages=[
#                 {
#                     "role": "system",
#                     "content": "You are a highly analytical B2B sales intelligence strategist."
#                 },
#                 {
#                     "role": "user",
#                     "content": prompt
#                 }
#             ],
#             temperature=0.2  # lower temperature for structured decisions
#         )

#         return response.choices[0].message.content

#     return generate_outreach

# agents/outreach_agent.py

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
You are a strategic lead evaluation expert.

Using the analysis below, produce ONLY these outputs:

1. Fit Score (0-100)
2. Justified Verdict: PURSUE / MAYBE / NOT PURSUE
3. Why Now Analysis (timing justification)
4. Draft Outreach Strategy (bullet points only)
5. Specific Decision-Maker Title
6. Research Journey Trace explaining how decision was derived

IMPORTANT:
- Do NOT write a full email.
- Do NOT include promotional content.
- Be objective.
- Base scoring strictly on alignment with DataVex services.

---

COMPANY ANALYSIS:
{analysis}

---

DATA VEX SERVICE CATALOG:
{catalog}

---

Return clearly structured sections.
"""

        response = client.chat.completions.create(
            model="gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": "You are a disciplined B2B strategic evaluator."
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