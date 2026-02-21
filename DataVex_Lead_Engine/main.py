
# Scraper system
import sys
import os

# ✅ Ensure project root is in path (fixes import issue)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import json
from scraper.fetcher import fetch_page
from scraper.parser import parse_page
from scraper.crawler import discover_endpoints

def run(domain):

    # Ensure proper base URL
    if not domain.startswith("http"):
        base_url = f"https://{domain}"
    else:
        base_url = domain

    print(f"\n🔎 Scraping seed page: {base_url}")

    try:
        # -----------------------------
        # 1️⃣ Scrape Homepage
        # -----------------------------
        homepage_html = fetch_page(base_url)
        homepage_data = parse_page(homepage_html)

        # -----------------------------
        # 2️⃣ Automatically Discover Endpoints
        # -----------------------------
        endpoints = discover_endpoints(
            base_url,
            homepage_data.get("links", [])
        )

        # -----------------------------
        # 3️⃣ Store Data
        # -----------------------------
        company_data = {
            "homepage": homepage_data,
            "discovered_endpoints": endpoints
        }

        # -----------------------------
        # 4️⃣ Scrape Discovered Pages
        # -----------------------------
        for url in endpoints:
            print(f"\n🔎 Scraping discovered page: {url}")
            try:
                html = fetch_page(url)
                parsed = parse_page(html)
                company_data[url] = parsed

                print("   ✅ Title:", parsed.get("title"))
                print("   Headings:", len(parsed.get("headings", [])))
                print("   Paragraphs:", len(parsed.get("paragraphs", [])))
                print("   Links:", len(parsed.get("links", [])))

            except Exception as e:
                print(f"   ❌ Failed: {e}")
                company_data[url] = {"error": str(e)}

        # -----------------------------
        # 5️⃣ Save Output
        # -----------------------------
        os.makedirs("data", exist_ok=True)

        filename = domain.replace("https://", "").replace("/", "_").replace(".", "_")

        with open(f"data/{filename}.json", "w", encoding="utf-8") as f:
            json.dump(company_data, f, indent=4, ensure_ascii=False)

        print("\n✅ Research data saved successfully!")
        return company_data

    except Exception as e:
        print("❌ Error during scraping:", e)
        return None


# -----------------------------
# ENTRY POINT
# -----------------------------
if __name__ == "__main__":
    run("datavex.ai")


# Testing stage of AI Agents
