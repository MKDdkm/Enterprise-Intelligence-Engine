# # scraper/parser.py

# from bs4 import BeautifulSoup

# def parse_page(html):
#     soup = BeautifulSoup(html, "html.parser")

#     title = soup.title.string.strip() if soup.title else ""

#     headings = [h.get_text(strip=True) for h in soup.find_all(["h1", "h2", "h3"])]

#     paragraphs = [
#         p.get_text(strip=True) 
#         for p in soup.find_all("p") 
#         if len(p.get_text(strip=True)) > 40
#     ]

#     links = [
#         a.get("href") 
#         for a in soup.find_all("a", href=True)
#     ]

#     return {
#         "title": title,
#         "headings": headings[:15],
#         "paragraphs": paragraphs[:30],
#         "links": links[:50]
#     }

from bs4 import BeautifulSoup

def parse_page(html):
    soup = BeautifulSoup(html, "html.parser")

    # Title
    title = soup.title.string.strip() if soup.title and soup.title.string else "No Title"

    # Headings (h1, h2, h3)
    headings = []
    for tag in soup.find_all(["h1", "h2", "h3"]):
        text = tag.get_text(strip=True)
        if text:
            headings.append(text)

    # Paragraphs
    paragraphs = []
    for p in soup.find_all("p"):
        text = p.get_text(strip=True)
        if text and len(text) > 30:  # filter very small text
            paragraphs.append(text)

    # Links
    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("http") or href.startswith("/"):
            links.append(href)

    return {
        "title": title,
        "headings": headings,
        "paragraphs": paragraphs,
        "links": links
    }