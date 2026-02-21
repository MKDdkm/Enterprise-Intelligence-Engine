# scraper/crawler.py

from urllib.parse import urljoin, urlparse
import requests

def extract_internal_links(base_url, links):
    """
    Convert relative links to absolute
    and keep only same-domain links.
    """
    internal_links = set()
    base_domain = urlparse(base_url).netloc

    for link in links:
        absolute_url = urljoin(base_url, link)
        parsed_link = urlparse(absolute_url)

        if parsed_link.netloc == base_domain:
            internal_links.add(absolute_url)

    return list(internal_links)


def is_valid_url(url):
    """
    Check if URL returns 200 status.
    """
    try:
        response = requests.head(url, timeout=5)
        return response.status_code == 200
    except:
        return False


def discover_endpoints(base_url, homepage_links):
    """
    Main function:
    Takes homepage links
    Returns valid internal endpoints.
    """

    print("\n🔎 Discovering endpoints...")

    # Step 1: Get internal links
    internal_links = extract_internal_links(base_url, homepage_links)

    # Step 2: Validate links
    valid_links = []

    for link in internal_links:
        if is_valid_url(link):
            valid_links.append(link)

    print(f"✅ Found {len(valid_links)} valid endpoints.")

    return valid_links