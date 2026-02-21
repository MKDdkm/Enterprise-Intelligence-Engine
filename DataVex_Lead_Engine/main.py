
# # Scraper system
# import sys
# import os

# # ✅ Ensure project root is in path (fixes import issue)
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# import json
# from scraper.fetcher import fetch_page
# from scraper.parser import parse_page
# from scraper.crawler import discover_endpoints

# def run(domain):

#     # Ensure proper base URL
#     if not domain.startswith("http"):
#         base_url = f"https://{domain}"
#     else:
#         base_url = domain

#     print(f"\n🔎 Scraping seed page: {base_url}")

#     try:
#         # -----------------------------
#         # 1️⃣ Scrape Homepage
#         # -----------------------------
#         homepage_html = fetch_page(base_url)
#         homepage_data = parse_page(homepage_html)

#         # -----------------------------
#         # 2️⃣ Automatically Discover Endpoints
#         # -----------------------------
#         endpoints = discover_endpoints(
#             base_url,
#             homepage_data.get("links", [])
#         )

#         # -----------------------------
#         # 3️⃣ Store Data
#         # -----------------------------
#         company_data = {
#             "homepage": homepage_data,
#             "discovered_endpoints": endpoints
#         }

#         # -----------------------------
#         # 4️⃣ Scrape Discovered Pages
#         # -----------------------------
#         for url in endpoints:
#             print(f"\n🔎 Scraping discovered page: {url}")
#             try:
#                 html = fetch_page(url)
#                 parsed = parse_page(html)
#                 company_data[url] = parsed

#                 print("   ✅ Title:", parsed.get("title"))
#                 print("   Headings:", len(parsed.get("headings", [])))
#                 print("   Paragraphs:", len(parsed.get("paragraphs", [])))
#                 print("   Links:", len(parsed.get("links", [])))

#             except Exception as e:
#                 print(f"   ❌ Failed: {e}")
#                 company_data[url] = {"error": str(e)}

#         # -----------------------------
#         # 5️⃣ Save Output
#         # -----------------------------
#         os.makedirs("data", exist_ok=True)

#         filename = domain.replace("https://", "").replace("/", "_").replace(".", "_")

#         with open(f"data/{filename}.json", "w", encoding="utf-8") as f:
#             json.dump(company_data, f, indent=4, ensure_ascii=False)

#         print("\n✅ Research data saved successfully!")
#         return company_data

#     except Exception as e:
#         print("❌ Error during scraping:", e)
#         return None


# # -----------------------------
# # ENTRY POINT
# # -----------------------------
# if __name__ == "__main__":
#     run("datavex.ai")


# # Testing stage of AI Agents
# import sys
# import os
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# import json

# from scraper.fetcher import fetch_page
# from scraper.parser import parse_page
# from scraper.crawler import discover_endpoints

# from agents.analysis_agent import create_analysis_agent
# from agents.outreach_agent import create_outreach_agent

# print("🔥 MAIN.PY IS RUNNING")
# def run(domain):

#     # Ensure proper base URL
#     if not domain.startswith("http"):
#         base_url = f"https://{domain}"
#     else:
#         base_url = domain

#     print(f"\n🔎 Scraping seed page: {base_url}")

#     try:
#         # -----------------------------
#         # 1️⃣ Scrape Homepage
#         # -----------------------------
#         homepage_html = fetch_page(base_url)
#         homepage_data = parse_page(homepage_html)

#         # -----------------------------
#         # 2️⃣ Discover Endpoints
#         # -----------------------------
#         endpoints = discover_endpoints(
#             base_url,
#             homepage_data.get("links", [])
#         )

#         # Store all scraped data
#         company_data = {
#             "homepage": homepage_data,
#             "discovered_endpoints": endpoints
#         }

#         # -----------------------------
#         # 3️⃣ Scrape Discovered Pages
#         # -----------------------------
#         for url in endpoints:
#             try:
#                 print(f"\n🔎 Scraping discovered page: {url}")
#                 html = fetch_page(url)
#                 parsed = parse_page(html)
#                 company_data[url] = parsed
#             except Exception as e:
#                 company_data[url] = {"error": str(e)}

#         print("\n✅ Scraping Completed")

#         # =============================
#         # 🤖 AGENT PHASE
#         # =============================

#         service_catalog = """
#         DataVex Service Catalog:
#         - AI Automation
#         - Data Analytics
#         - Market Intelligence
#         - Lead Qualification
#         - SEO Optimization
#         - Cybersecurity Assessment
#         """

#         # Create Agents
#         analysis_agent = create_analysis_agent()
#         outreach_agent = create_outreach_agent()

#         # -----------------------------
#         # 4️⃣ Analysis Agent
#         # -----------------------------
#         dossier = analysis_agent.invoke({
#             "domain": base_url,
#             "services": service_catalog,
#             "scraped_data": json.dumps(company_data)
#         })

#         print("\n===== COMPANY DOSSIER =====\n")
#         print(dossier)

#         # -----------------------------
#         # 5️⃣ Outreach Agent
#         # -----------------------------
#         final_report = outreach_agent.invoke({
#             "domain": base_url,
#             "analysis": dossier
#         })

#         print("\n===== FINAL INTELLIGENCE REPORT =====\n")
#         print(final_report)

#         return final_report

#     except Exception as e:
#         print("❌ Error during execution:", e)
#         return None


# # -----------------------------
# # ENTRY POINT
# # -----------------------------
# if __name__ == "__main__":
#     run("datavex.ai")



# ==============================
# DataVex AI Lead Engine
# ==============================

# # V2
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

#     print(f"\n🔎 Scraping seed page: {base_url}")

#     try:
#         # =============================
#         # PHASE 1 — SCRAPING
#         # =============================

#         # 1️⃣ Scrape Homepage
#         homepage_html = fetch_page(base_url)
#         homepage_data = parse_page(homepage_html)

#         # 2️⃣ Discover Endpoints
#         endpoints = discover_endpoints(
#             base_url,
#             homepage_data.get("links", [])
#         )

#         # Store Data
#         company_data = {
#             "homepage": homepage_data,
#             "discovered_endpoints": endpoints
#         }

#         # 3️⃣ Scrape Discovered Pages
#         for url in endpoints:
#             try:
#                 print(f"\n🔎 Scraping: {url}")
#                 html = fetch_page(url)
#                 parsed = parse_page(html)
#                 company_data[url] = parsed
#             except Exception as e:
#                 company_data[url] = {"error": str(e)}

#         print("\n✅ Scraping Completed")

#         # =============================
#         # PHASE 2 — AI AGENTS
#         # =============================

#         # Service Catalog (From Backend for now)
#         service_catalog = """
#         DataVex Service Catalog:
#         - AI Automation
#         - Data Intelligence
#         - Lead Generation
#         - Business Analytics
#         - Process Optimization
#         """

#         # Convert scraped data to string
#         scraped_json = json.dumps(company_data, indent=2)

#         # 4️⃣ Create Agents
#         analysis_agent = create_analysis_agent()
#         outreach_agent = create_outreach_agent()

#         # 5️⃣ Run Analysis Agent
#         print("\n🧠 Running Analysis Agent...")

#         dossier = analysis_agent(
#             domain=base_url,
#             services=service_catalog,
#             scraped_data=scraped_json
#         )

#         print("\n===== COMPANY DOSSIER =====\n")
#         print(dossier)

#         # 6️⃣ Run Outreach Agent
#         print("\n📨 Running Outreach Agent...")

#         final_report = outreach_agent(
#             analysis=dossier,
#             catalog=service_catalog
#         )

#         print("\n===== FINAL INTELLIGENCE REPORT =====\n")
#         print(final_report)

#         # =============================
#         # SAVE FINAL OUTPUT
#         # =============================

#         os.makedirs("data", exist_ok=True)

#         filename = domain.replace("https://", "").replace("/", "_").replace(".", "_")

#         with open(f"data/{filename}_report.json", "w", encoding="utf-8") as f:
#             json.dump({
#                 "company_data": company_data,
#                 "dossier": dossier,
#                 "final_report": final_report
#             }, f, indent=4, ensure_ascii=False)

#         print("\n💾 Final report saved successfully!")

#         return final_report

#     except Exception as e:
#         print("❌ Error during execution:", e)
#         return None


# # ==============================
# # ENTRY POINT
# # ==============================

# if __name__ == "__main__":
#     run("datavex.ai")


# V3
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
#         DataVex provides:
#         - AI Automation Solutions
#         - Data Intelligence Systems
#         - Lead Generation Platforms
#         - Business Analytics
#         - Process Optimization Tools
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
#             domain=base_url,
#             services=service_catalog,
#             scraped_data=scraped_json
#         )

#         print("\n===== COMPANY DOSSIER =====\n")
#         print(dossier)

#         # =============================
#         # Run Outreach Agent
#         # =============================

#         print("\n📨 Running Outreach Agent...")

#         final_report = outreach_function(
#             analysis=dossier,
#             catalog=service_catalog
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
#     run("datavex.ai")

import sys
import os
import json

# Ensure project root in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scraper.fetcher import fetch_page
from scraper.parser import parse_page
from scraper.crawler import discover_endpoints

from agents.analysis_agent import create_analysis_agent
from agents.outreach_agent import create_outreach_agent


print("🔥 MAIN.PY IS RUNNING")


def run(domain):

    # -----------------------------
    # Normalize Domain
    # -----------------------------
    if not domain.startswith("http"):
        base_url = f"https://{domain}"
    else:
        base_url = domain

    print(f"\n🔎 Evaluating Target Company: {base_url}")

    try:
        # =============================
        # PHASE 1 — SCRAPING
        # =============================

        print("\n🌐 Scraping website...")

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

        # Scrape additional pages
        for url in endpoints:
            try:
                print(f"🔎 Scraping: {url}")
                html = fetch_page(url)
                parsed = parse_page(html)
                company_data[url] = parsed
            except Exception as e:
                company_data[url] = {"error": str(e)}

        print("\n✅ Scraping Completed")

        # =============================
        # PHASE 2 — AI AGENTS
        # =============================

        service_catalog = """
        DataVex provides:
        - AI Automation Solutions
        - Data Intelligence Systems
        - Lead Generation Platforms
        - Business Analytics
        - Process Optimization Tools
        """

        scraped_json = json.dumps(company_data, indent=2)

        # Create Agents
        analysis_function = create_analysis_agent()
        outreach_function = create_outreach_agent()

        # =============================
        # Run Analysis Agent
        # =============================

        print("\n🧠 Running Analysis Agent...")

        dossier = analysis_function(
            base_url,
            service_catalog,
            scraped_json
        )

        print("\n===== COMPANY DOSSIER =====\n")
        print(dossier)

        # =============================
        # Run Outreach Agent
        # =============================

        print("\n📨 Running Outreach Agent...")

        final_report = outreach_function(
            dossier,
            service_catalog
        )

        print("\n===== FINAL VERDICT & STRATEGY =====\n")
        print(final_report)

        # =============================
        # SAVE OUTPUT
        # =============================

        os.makedirs("data", exist_ok=True)

        filename = base_url.replace("https://", "").replace("/", "_").replace(".", "_")

        with open(f"data/{filename}_report.json", "w", encoding="utf-8") as f:
            json.dump({
                "company_data": company_data,
                "dossier": dossier,
                "final_report": final_report
            }, f, indent=4, ensure_ascii=False)

        print("\n💾 Report saved successfully!")

        return final_report

    except Exception as e:
        print("❌ Error during execution:", e)
        return None


# ==============================
# ENTRY POINT
# ==============================

if __name__ == "__main__":
    run("datavex.ai")