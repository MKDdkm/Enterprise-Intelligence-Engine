# import os
# from langchain_openai import ChatOpenAI
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.output_parsers import StrOutputParser
# from dotenv import load_dotenv

# load_dotenv()

# def create_outreach_agent():

#     llm = ChatOpenAI(
#         model="gpt-4o-mini",
#         api_key=os.getenv("OPENAI_API_KEY")
#     )

#     prompt = ChatPromptTemplate.from_messages([
#         ("system",
#          "You are an Outreach Agent. "
#          "Generate professional business outreach emails."),
#         ("user",
#          "Company Domain: {domain}\n"
#          "Analysis Result: {analysis}\n"
#          "Write a personalized outreach email.")
#     ])

#     chain = prompt | llm | StrOutputParser()

#     return chain


import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

load_dotenv()

def create_strategy_agent():

    llm = ChatOpenAI(
        model="gpt-oss-120b",
        api_key=os.getenv("OPENAI_API_KEY")
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are a strategic sales intelligence agent. "
         "Your role is to decide whether to pursue the lead "
         "and create an outreach strategy."),
        ("user",
         "Company Dossier:\n{dossier}\n\n"
         "DataVex Services:\n{catalog}\n\n"
         "Provide:\n"
         "1. Justified Verdict (Pursue / Not Pursue)\n"
         "2. Why Now Analysis\n"
         "3. Outreach Strategy\n"
         "4. Target Decision Maker\n"
         "5. Draft Outreach Message\n"
         "6. Research Journey Trace")
    ])

    return prompt | llm | StrOutputParser()