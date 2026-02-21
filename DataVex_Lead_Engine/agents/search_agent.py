import os
from dotenv import load_dotenv

load_dotenv()

def create_search_agent():

    def generate_search_queries(service_catalog):
        # Simple AI-based query expansion
        return [
            f"companies using {service_catalog}",
            f"startups in {service_catalog}",
            f"enterprise solutions for {service_catalog}"
        ]

    return generate_search_queries