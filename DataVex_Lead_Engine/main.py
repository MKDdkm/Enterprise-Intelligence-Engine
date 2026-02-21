# import sys
# import os
# import json
# # Ensure project root in path
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# from scraper.fetcher import fetch_page
# from scraper.parser import parse_page
# from scraper.crawler import discover_endpoints

# from agents.analysis_agent import create_analysis_agent
# from agents.outreach_agent import create_outreach_agent


# print("🔥 MAIN.PY IS RUNNING")


# def run(domain):

#     # -----------------------------
#     # Normalize Domain
#     # -----------------------------
#     if not domain.startswith("http"):
#         base_url = f"https://{domain}"
#     else:
#         base_url = domain

#     print(f"\n🔎 Evaluating Target Company: {base_url}")

#     try:
#         # =============================
#         # PHASE 1 — SCRAPING
#         # =============================

#         print("\n🌐 Scraping website...")

#         homepage_html = fetch_page(base_url)
#         homepage_data = parse_page(homepage_html)

#         endpoints = discover_endpoints(
#             base_url,
#             homepage_data.get("links", [])
#         )

#         company_data = {
#             "homepage": homepage_data,
#             "discovered_endpoints": endpoints
#         }

#         # Scrape additional pages
#         for url in endpoints:
#             try:
#                 print(f"🔎 Scraping: {url}")
#                 html = fetch_page(url)
#                 parsed = parse_page(html)
#                 company_data[url] = parsed
#             except Exception as e:
#                 company_data[url] = {"error": str(e)}

#         print("\n✅ Scraping Completed")

#         # =============================
#         # PHASE 2 — AI AGENTS
#         # =============================

#         service_catalog = """
#         DataVex provides AI-Powered PropTech Solutions that leverage Artificial Intelligence, RPA, and Generative AI to transform the real estate industry. Our solutions automate repetitive processes, enable predictive analytics, and use generative AI to create immersive virtual tours and automated marketing content. We also deliver Data-Driven Marketing AI through custom AI agents that analyze market trends and customer behavior to optimize campaigns, improve engagement, and maximize ROI. Additionally, our Automated Financial Analysis solutions use machine learning to streamline financial reporting, risk assessment, fraud detection, and real-time forecasting, enabling smarter and faster business decisions.
#         """

#         scraped_json = json.dumps(company_data, indent=2)

#         # Create Agents
#         analysis_function = create_analysis_agent()
#         outreach_function = create_outreach_agent()

#         # =============================
#         # Run Analysis Agent
#         # =============================

#         print("\n🧠 Running Analysis Agent...")

#         dossier = analysis_function(
#             base_url,
#             service_catalog,
#             scraped_json
#         )

#         print("\n===== COMPANY DOSSIER =====\n")
#         print(dossier)

#         # =============================
#         # Run Outreach Agent
#         # =============================

#         print("\n📨 Running Outreach Agent...")

#         final_report = outreach_function(
#             dossier,
#             service_catalog
#         )

#         print("\n===== FINAL VERDICT & STRATEGY =====\n")
#         print(final_report)

#         # =============================
#         # SAVE OUTPUT
#         # =============================

#         os.makedirs("data", exist_ok=True)

#         filename = base_url.replace("https://", "").replace("/", "_").replace(".", "_")

#         with open(f"data/{filename}_report.json", "w", encoding="utf-8") as f:
#             json.dump({
#                 "company_data": company_data,
#                 "dossier": dossier,
#                 "final_report": final_report
#             }, f, indent=4, ensure_ascii=False)

#         print("\n💾 Report saved successfully!")

#         return final_report

#     except Exception as e:
#         print("❌ Error during execution:", e)
#         return None


# # ==============================
# # ENTRY POINT
# # ==============================



# if __name__ == "__main__":
#     run("https://www.sahynex.com/")

import sys
import os
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scraper.fetcher import fetch_page
from scraper.parser import parse_page
from scraper.crawler import discover_endpoints

from agents.analysis_agent import create_analysis_agent
from agents.outreach_agent import create_outreach_agent


print("🔥 MAIN.PY IS RUNNING")


def run(domain, service_catalog):

    if not domain.startswith("http"):
        base_url = f"https://{domain}"
    else:
        base_url = domain

    print(f"\n🔎 Evaluating Target Company: {base_url}")

    try:
        # =============================
        # SCRAPING
        # =============================

        homepage_html = fetch_page(base_url)
        homepage_data = parse_page(homepage_html)

        endpoints = discover_endpoints(
            base_url,
            homepage_data.get("links", [])
        )

        company_data = {
            "homepage": homepage_data,
            "discovered_endpoints": endpoints
        }

        for url in endpoints:
            try:
                html = fetch_page(url)
                parsed = parse_page(html)
                company_data[url] = parsed
            except Exception as e:
                company_data[url] = {"error": str(e)}

        print("\n✅ Scraping Completed")

        scraped_json = json.dumps(company_data, indent=2)

        # =============================
        # AGENTS
        # =============================

        analysis_function = create_analysis_agent()
        outreach_function = create_outreach_agent()

        print("\n🧠 Running Analysis Agent...")

        dossier = analysis_function(
            base_url,
            service_catalog,
            scraped_json
        )

        print("\n===== COMPANY DOSSIER =====\n")
        print(dossier)

        print("\n📨 Running Outreach Agent...")

        final_report = outreach_function(
            dossier,
            service_catalog
        )

        print("\n===== FINAL VERDICT =====\n")
        print(final_report)

        return {
            "dossier": dossier,
            "final_report": final_report
        }

    except Exception as e:
        print("❌ Error:", e)
        return None