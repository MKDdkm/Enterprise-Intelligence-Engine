# import os
# from langchain_openai import ChatOpenAI
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.output_parsers import StrOutputParser
# from dotenv import load_dotenv

# load_dotenv()

# def create_analysis_agent():

#     # LLM (replace model or base_url later if needed)
#     llm = ChatOpenAI(
#         model="gpt-oss-120b",
#         api_key=os.getenv("OPENAI_API_KEY")
#     )

#     # Prompt Template
#     prompt = ChatPromptTemplate.from_messages([
#         ("system",
#          "You are an Analysis Agent. "
#          "Analyze company data and return structured JSON output."),
#         ("user",
#          "Company Domain: {domain}\n"
#          "Selected Services: {services}\n"
#          "Return detailed insights.")
#     ])

#     # LCEL Chain
#     chain = prompt | llm | StrOutputParser()

#     return chain


import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

load_dotenv()

def create_analysis_agent():

    llm = ChatOpenAI(
        model="gpt-oss-120b",
        api_key=os.getenv("OPENAI_API_KEY")
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are a senior business research analyst. "
         "Your job is to create a detailed company dossier "
         "and summarize findings clearly."),
        ("user",
         "Company Domain: {domain}\n\n"
         "DataVex Service Catalog:\n{catalog}\n\n"
         "Return:\n"
         "- Company Dossier\n"
         "- Key Insights\n"
         "- Research Notes")
    ])

    return prompt | llm | StrOutputParser()