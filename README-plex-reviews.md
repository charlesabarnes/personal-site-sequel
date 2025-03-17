# Plex Movie Reviews to Jekyll Blog Posts

This script allows you to automatically generate blog posts from your Plex movie ratings and reviews. It connects to your Plex server, fetches movies you've rated, and creates Jekyll-formatted markdown files ready to be published on your blog.

## Features

- Pull ratings and reviews from your Plex server
- Generate properly formatted Jekyll blog posts
- Filter by minimum rating
- Limit to recent reviews
- Include movie details (director, genres, summary)
- Support for movie posters

## Requirements

- Python 3.6+
- A Plex server with rated movies
- The following Python packages:
  - plexapi
  - pyyaml
  - python-slugify

## Installation

1. Make sure you have Python installed
2. Install required packages:

```bash
pip install plexapi pyyaml python-slugify
```

3. Make the script executable:

```bash
chmod +x plex-reviews-to-posts.py
```

## Usage

### Direct Connection

```bash
./plex-reviews-to-posts.py --url "http://your-plex-server:32400" --token "your-plex-token"
```

### Using Plex Account

```bash
./plex-reviews-to-posts.py --account --username "your-username" --password "your-password" --server "Your Server Name"
```

### Options

- `--output-dir`: Directory where blog posts will be created (default: `_posts`)
- `--tag`: Default tag to apply to all posts (default: `movies`)
- `--min-rating`: Only include movies with this rating or higher (0-10)
- `--days`: Only fetch reviews from the last N days
- `--limit`: Limit number of reviews to process
- `--dry-run`: Don't write files, just print what would be created

### Examples

Generate posts for all movies rated 7 or higher:
```bash
./plex-reviews-to-posts.py --url "http://your-plex-server:32400" --token "your-plex-token" --min-rating 7
```

Get the 5 most recent reviews:
```bash
./plex-reviews-to-posts.py --url "http://your-plex-server:32400" --token "your-plex-token" --limit 5
```

Only include reviews from the last 30 days:
```bash
./plex-reviews-to-posts.py --url "http://your-plex-server:32400" --token "your-plex-token" --days 30
```

## Finding Your Plex Token

You need your Plex token to authenticate with your server. Here are a few ways to find it:

1. From the Plex Web App:
   - Log into Plex
   - Open the developer tools (F12)
   - Go to the Network tab
   - Look for any request to your Plex server
   - Find the "X-Plex-Token" parameter in the URL

2. From your Plex configuration files (location varies by OS)

3. Using this Python command:
```python
from plexapi.myplex import MyPlexAccount
account = MyPlexAccount('your-username', 'your-password')
print(f"Your Plex token is: {account.authenticationToken}")
```

## Customization

- Edit the `create_post_content` function to change the layout of generated posts
- Modify the front matter to include additional metadata
- Update the template in the script to match your blog's style

## Creating a Movies Tag

Make sure to create a tag file for movies reviews:

```bash
mkdir -p tag
echo "---
layout: tag
tag: movies
title: \"Movie Reviews\"
permalink: /tag/movies/
---" > tag/movies.md
```

## License

This script is provided as-is under the MIT License. Feel free to modify and use it as needed.