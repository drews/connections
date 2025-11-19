import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Dict


def extract_metadata(url: str) -> Dict:
    """
    Extract metadata from a URL (title, description, favicon, image)
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract title
        title = None
        if soup.find('meta', property='og:title'):
            title = soup.find('meta', property='og:title').get('content')
        elif soup.find('title'):
            title = soup.find('title').string
        else:
            title = url

        # Extract description
        description = ''
        if soup.find('meta', property='og:description'):
            description = soup.find('meta', property='og:description').get('content')
        elif soup.find('meta', attrs={'name': 'description'}):
            description = soup.find('meta', attrs={'name': 'description'}).get('content')

        # Extract image
        image = ''
        if soup.find('meta', property='og:image'):
            image = soup.find('meta', property='og:image').get('content')
            if image and not image.startswith('http'):
                image = urljoin(url, image)

        # Extract favicon
        favicon = ''
        parsed_url = urlparse(url)
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"

        # Try to find favicon link
        favicon_link = soup.find('link', rel='icon') or soup.find('link', rel='shortcut icon')
        if favicon_link and favicon_link.get('href'):
            favicon = urljoin(url, favicon_link.get('href'))
        else:
            # Default to /favicon.ico
            favicon = f"{base_url}/favicon.ico"

        # Determine type
        page_type = 'website'
        if soup.find('meta', property='og:type'):
            page_type = soup.find('meta', property='og:type').get('content')

        return {
            'url': url,
            'title': title.strip() if title else url,
            'description': description.strip() if description else '',
            'favicon': favicon,
            'image': image,
            'type': page_type
        }

    except Exception as e:
        print(f"Error extracting metadata from {url}: {e}")
        # Return minimal metadata on error
        return {
            'url': url,
            'title': url,
            'description': '',
            'favicon': '',
            'image': '',
            'type': 'website'
        }
