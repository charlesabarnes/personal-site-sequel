#!/usr/bin/env python3
"""
Script to generate movie review blog posts for Jekyll.
This version works without external dependencies.
"""

import os
import sys
import json
import datetime
import re
import urllib.request
import urllib.error
import socket

# Sample Plex movies when cannot connect to Plex
SAMPLE_MOVIES = [
]

def get_env_var(var_name, default=None):
    """Get environment variable from .env file or environment"""
    try:
        with open('.env', 'r') as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    if key == var_name:
                        return value
    except:
        pass
    
    return os.environ.get(var_name, default)

def slugify(text):
    """Create URL-friendly version of text"""
    # Remove non-alphanumeric characters
    text = re.sub(r'[^\w\s-]', '', text.lower())
    # Replace spaces with hyphens
    text = re.sub(r'[\s]+', '-', text)
    # Remove consecutive hyphens
    text = re.sub(r'[-]+', '-', text)
    return text

def fetch_movie_details(metadata_id, token):
    """Fetch detailed movie information from Plex API"""
    if not metadata_id or not token:
        return {}
    
    # Strip any prefix from the metadata ID if needed
    if ':' in metadata_id:
        metadata_id = metadata_id.split(':')[-1]
    
    url = f'https://discover.provider.plex.tv/library/metadata/{metadata_id}'
    headers = {
        'X-Plex-Product': 'Plex Web',
        'X-Plex-Version': '4.145.1',
        'X-Plex-Client-Identifier': 'ucbg4coykuwe8qvh43db8jv5',
        'X-Plex-Platform': 'Chrome',
        'X-Plex-Platform-Version': '134.0',
        'X-Plex-Features': 'external-media,indirect-media,hub-style-list',
        'X-Plex-Model': 'standalone',
        'X-Plex-Device': 'Windows',
        'X-Plex-Device-Screen-Resolution': '1891x2037,3840x2160',
        'X-Plex-Token': token,
        'X-Plex-Provider-Version': '7.2',
        'X-Plex-Text-Format': 'plain',
        'X-Plex-Drm': 'widevine',
        'X-Plex-Language': 'en',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
    }
    
    try:
        # Make request
        req = urllib.request.Request(url, headers=headers, method='GET')
        
        with urllib.request.urlopen(req, timeout=10) as response:
            content = response.read().decode('utf-8')
            
        # Parse XML response
        import xml.etree.ElementTree as ET
        root = ET.fromstring(content)
        
        # Extract movie details from XML
        details = {}
        
        # Find the Video element (main movie data)
        video_elem = root.find('.//Video')
        if video_elem is not None:
            # Get basic info
            details['title'] = video_elem.get('title', '')
            details['year'] = video_elem.get('year', '')
            details['summary'] = video_elem.get('summary', '')
            details['tagline'] = video_elem.get('tagline', '')
            details['content_rating'] = video_elem.get('contentRating', '')
            
            # Convert duration from milliseconds to minutes
            duration_ms = video_elem.get('duration', '')
            if duration_ms:
                try:
                    duration_min = int(int(duration_ms) / 60000)
                    hours, minutes = divmod(duration_min, 60)
                    details['runtime'] = f"{hours}h {minutes}m" if hours else f"{minutes}m"
                except:
                    details['runtime'] = "Unknown"
            
            # Extract directors
            directors = []
            for director in root.findall('.//Director'):
                directors.append(director.get('tag', ''))
            details['directors'] = directors
            
            # Extract genres
            genres = []
            for genre in root.findall('.//Genre'):
                genres.append(genre.get('tag', ''))
            details['genres'] = genres
            
            # Extract cast (roles)
            cast = []
            for role in root.findall('.//Role'):
                cast.append(role.get('tag', ''))
            details['cast'] = cast[:5]  # Limit to top 5 cast members
            
            # Extract poster URL if available
            thumb = video_elem.get('thumb', '')
            if thumb:
                details['poster_url'] = thumb
            
            return details
        
        return {}
        
    except Exception as e:
        print(f"Error fetching movie details: {e}")
        return {}

def get_plex_reviews():
    """Fetch reviews from the Plex API"""
    token = get_env_var("PLEX_TOKEN")
    
    if not token:
        print("No PLEX_TOKEN found in environment or .env file")
        return []
    
    url = 'https://community.plex.tv/api'
    headers = {
        'x-plex-product': 'Plex Web',
        'x-plex-version': '4.145.1',
        'x-plex-client-identifier': 'ucbg4coykuwe8qvh43db8jv5',
        'sec-ch-ua-platform': 'Windows',
        'Referer': 'https://app.plex.tv/',
        'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        'x-plex-token': token,
        'sec-ch-ua-mobile': '?0',
        'x-plex-platform': 'Chrome',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        'content-type': 'application/json'
    }
    
    payload = {
        "query": """
            query GetReviewsHub($uuid: ID = "", $first: PaginationInt!, $after: String, $skipUserState: Boolean = false) {
              user(id: $uuid) {
                reviews(first: $first, after: $after) {
                  nodes {
                    ... on ActivityRating {
                      ...ActivityRatingFragment
                    }
                    ... on ActivityWatchRating {
                      ...ActivityWatchRatingFragment
                    }
                    ... on ActivityReview {
                      ...ActivityReviewFragment
                    }
                    ... on ActivityWatchReview {
                      ...ActivityWatchReviewFragment
                    }
                  }
                  pageInfo {
                    hasNextPage
                    hasPreviousPage
                    endCursor
                  }
                }
              }
            }
            
            fragment ActivityRatingFragment on ActivityRating {
              ...activityFragment
              rating
            }
            

            fragment activityFragment on Activity {
              __typename
              commentCount
              date
              id
              isMuted
              isPrimary
              privacy
              reaction
              reactionsCount
              reactionsTypes
              metadataItem {
                ...itemFields
              }
              userV2 {
                id
                username
                displayName
                avatar
                friendStatus
                isMuted
                isHidden
                isBlocked
                mutualFriends {
                  count
                  friends {
                    avatar
                    displayName
                    id
                    username
                  }
                }
              }
            }
            

            fragment itemFields on MetadataItem {
              id
              images {
                coverArt
                coverPoster
                thumbnail
                art
              }
              userState @skip(if: $skipUserState) {
                viewCount
                viewedLeafCount
                watchlistedAt
              }
              title
              key
              type
              index
              publicPagesURL
              parent {
                ...parentFields
              }
              grandparent {
                ...parentFields
              }
              publishedAt
              leafCount
              year
              originallyAvailableAt
              childCount
            }
            

            fragment parentFields on MetadataItem {
              index
              title
              publishedAt
              key
              type
              images {
                coverArt
                coverPoster
                thumbnail
                art
              }
              userState @skip(if: $skipUserState) {
                viewCount
                viewedLeafCount
                watchlistedAt
              }
            }
            

            fragment ActivityWatchRatingFragment on ActivityWatchRating {
              ...activityFragment
              rating
            }
            

            fragment ActivityReviewFragment on ActivityReview {
              ...activityFragment
              reviewRating: rating
              hasSpoilers
              message
              updatedAt
              status
              updatedAt
            }
            

            fragment ActivityWatchReviewFragment on ActivityWatchReview {
              ...activityFragment
              reviewRating: rating
              hasSpoilers
              message
              updatedAt
              status
              updatedAt
            }
        """,
        "variables": {
            "first": 50,
            "uuid": get_env_var("PLEX_UUID", "a1f44dc256950d10"),
            "skipUserState": False
        },
        "operationName": "GetReviewsHub"
    }
    
    try:
        # Convert payload to JSON string
        data = json.dumps(payload).encode('utf-8')
        
        # Create request
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        
        # Make request
        with urllib.request.urlopen(req, timeout=10) as response:
            content = response.read().decode('utf-8')
            
        # Parse response JSON
        response_data = json.loads(content)
        
        # Debug: print top-level response keys
        if 'data' in response_data:
            print("Found 'data' in response")
            if 'user' in response_data['data']:
                print("Found 'user' in response data")
        
        # Check if we have reviews
        if 'data' in response_data and 'user' in response_data['data'] and 'reviews' in response_data['data']['user']:
            nodes = response_data['data']['user']['reviews']['nodes']
            print(f"Found {len(nodes)} review nodes in response")
            
            # Process reviews
            movie_reviews = []
            for i, node in enumerate(nodes):
                print(f"Node {i} type: {node.get('__typename', 'Unknown')}")
                
                if 'metadataItem' not in node or node['metadataItem'] is None:
                    print(f"  Node {i} has no metadataItem")
                    continue
                    
                meta = node['metadataItem']
                print(f"  Item type: {meta.get('type', 'Unknown')}, Title: {meta.get('title', 'Unknown')}")
                
                # Skip non-movie items
                if meta.get('type', '').upper() != 'MOVIE':
                    print(f"  Skipping non-movie item: {meta.get('type')}")
                    continue
                
                # Extract rating and review text
                rating = node.get('rating') or node.get('reviewRating')
                review_text = node.get('message', '')
                
                # Extract date 
                date_str = node.get('date', None)
                if date_str:
                    try:
                        # Try to parse as timestamp if it's an integer
                        if isinstance(date_str, int) or date_str.isdigit():
                            review_date = datetime.datetime.fromtimestamp(int(date_str))
                        else:
                            # Try to parse different date formats
                            for fmt in ["%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%Y/%m/%d"]:
                                try:
                                    review_date = datetime.datetime.strptime(date_str[:19], fmt)
                                    break
                                except:
                                    continue
                            else:
                                # If all parsing attempts fail, use today's date
                                review_date = datetime.datetime.now()
                        print(f"  Review date: {review_date.strftime('%Y-%m-%d')}")
                    except Exception as e:
                        print(f"  Error parsing date '{date_str}': {e}")
                        review_date = datetime.datetime.now()
                else:
                    review_date = datetime.datetime.now()
                    print(f"  No date found, using today: {review_date.strftime('%Y-%m-%d')}")
                
                # Format date as YYYY-MM-DD for Jekyll
                jekyll_date = review_date.strftime('%Y-%m-%d')
                
                print(f"  Rating: {rating}, Has review: {'Yes' if review_text else 'No'}")
                
                # Extract images
                images = meta.get('images', {})
                cover_art = images.get('coverArt', '')
                cover_poster = images.get('coverPoster', '')
                thumbnail = images.get('thumbnail', '')
                art = images.get('art', '')
                
                # Get the best available image
                poster_url = cover_poster or cover_art or thumbnail or art or ''
                if poster_url and not poster_url.startswith('http'):
                    poster_url = f"https://image.tmdb.org/t/p/w500{poster_url}"
                
                # Get metadata ID for detailed lookup
                metadata_id = meta.get('id', None)
                
                # Print debug info for images
                print(f"  Image URL: {poster_url}")
                print(f"  Metadata ID: {metadata_id}")
                
                # Set defaults
                summary = "No summary available. Visit IMDB or RottenTomatoes for more information."
                tagline = ""
                runtime_formatted = "Unknown"
                content_rating = ""
                directors = []
                genres = ['movies']
                cast = []
                
                # Fetch detailed movie information if we have a metadata ID
                if metadata_id:
                    print(f"  Fetching detailed movie information...")
                    token = get_env_var("PLEX_TOKEN")
                    details = fetch_movie_details(metadata_id, token)
                    
                    if details:
                        # Update with detailed information
                        if 'summary' in details and details['summary']:
                            summary = details['summary']
                            
                        if 'tagline' in details and details['tagline']:
                            tagline = details['tagline']
                            
                        if 'runtime' in details:
                            runtime_formatted = details['runtime']
                            
                        if 'content_rating' in details:
                            content_rating = details['content_rating']
                            
                        if 'directors' in details and details['directors']:
                            directors = details['directors']
                            
                        if 'genres' in details and details['genres']:
                            genres = details['genres']
                            
                        if 'cast' in details and details['cast']:
                            cast = details['cast']
                            
                        if 'poster_url' in details and details['poster_url'] and not poster_url:
                            poster_url = details['poster_url']
                            
                        print(f"  Found detailed info: Directors: {', '.join(directors)}, Genres: {', '.join(genres)}")
                
                # Set director string
                director = directors[0] if directors else "Unknown"
                
                movie_reviews.append({
                    'title': meta.get('title', 'Unknown Title'),
                    'year': meta.get('year', 0),
                    'director': director,
                    'directors': directors,
                    'genres': genres,
                    'rating': rating,
                    'summary': summary,
                    'tagline': tagline,
                    'runtime': runtime_formatted,
                    'content_rating': content_rating,
                    'cast': cast,
                    'review': review_text,
                    'date': jekyll_date,
                    'poster_url': poster_url
                })
            
            print(f"Found {len(movie_reviews)} movie reviews")
            return movie_reviews
        
        print("No reviews found in API response")
        return []
        
    except Exception as e:
        print(f"Error fetching Plex reviews: {e}")
        return []

def parse_args():
    """Parse command line arguments"""
    import argparse
    parser = argparse.ArgumentParser(description="Generate Jekyll blog posts from Plex movie reviews")
    
    parser.add_argument("--output-dir", default="_movie_reviews", help="Output directory")
    parser.add_argument("--min-rating", type=float, default=0, help="Minimum rating (0-10)")
    parser.add_argument("--limit", type=int, help="Limit number of reviews")
    parser.add_argument("--dry-run", action="store_true", help="Don't write files")
    parser.add_argument("--title", type=str, help="Filter by movie title")
    
    return parser.parse_args()

def get_reviewed_items(args):
    """Get items with user ratings from Plex API"""
    print("Fetching reviewed items from Plex API...")
    
    # Try to get reviews from Plex API
    reviews = get_plex_reviews()
    
    if not reviews:
        print("No reviews found or error connecting to Plex API.")
        return []
    
    # Filter by minimum rating
    if args.min_rating > 0:
        reviews = [review for review in reviews if review['rating'] >= args.min_rating]
    
    # Filter by title if specified
    if args.title:
        title_filter = args.title.lower()
        reviews = [review for review in reviews if title_filter in review['title'].lower()]
    
    # Sort by rating (highest first)
    reviews.sort(key=lambda x: x['rating'], reverse=True)
    
    # Apply limit if specified
    if args.limit and args.limit > 0:
        reviews = reviews[:args.limit]
    
    return reviews

def create_post_content(movie):
    """Create Jekyll front matter and content from movie data"""
    # Use the review date from Plex or today's date if not available
    post_date = movie.get('date', datetime.datetime.now().strftime('%Y-%m-%d'))
    # Ensure date is a string
    post_date = f'"{post_date}"'
    
    # Create a title for the post
    post_title = f"Movie Review: {movie['title']} ({movie['year']})"
    
    # Calculate star rating (convert from 0-10 scale to 5 stars)
    stars = "★" * int(round(movie['rating'] / 2))
    
    # Format genres for display
    genres_str = ", ".join(movie['genres']) if movie['genres'] else "Movies"
    
    # Format directors
    directors_str = ", ".join(movie['directors']) if movie['directors'] else movie['director']
    
    # Format cast for display
    cast_str = ", ".join(movie['cast']) if movie['cast'] else "Unknown cast"
    
    # Generate front matter
    genres_yaml = "\n  - ".join(movie['genres'])
    
    # Add poster URL if available
    poster_front_matter = ""
    if movie['poster_url']:
        poster_front_matter = f'''poster_url: "{movie['poster_url']}"
image: "{movie['poster_url']}"'''
    
    # Create slug for the file name
    slug = slugify(movie['title'])
    
    frontmatter = f"""---
layout: post
title: "{post_title}"
date: {post_date}
permalink: /movie-reviews/{slug}/
tags: [movies, reviews]
rating: {movie['rating']}
movie_title: "{movie['title']}"
release_year: {movie['year']}
director: "{movie['director']}"
content_rating: "{movie['content_rating']}"
runtime: "{movie['runtime']}"
{poster_front_matter}
genres: 
  - {genres_yaml}
---"""

    # Add poster image HTML if available
    poster_html = ""
    if movie['poster_url']:
        poster_html = f"""
<div class="movie-poster">
  <img src="{movie['poster_url']}" alt="{movie['title']} poster" />
</div>
"""

    # Add tagline if available
    tagline_html = ""
    if movie['tagline']:
        tagline_html = f"""
> *{movie['tagline']}*
"""
    
    # Create post content
    content = f"""{frontmatter}

# Movie Review: {movie['title']} ({movie['year']})

{poster_html}

**Rating: {stars} ({movie['rating']}/10)**

{tagline_html}

**Details:**
- **Director:** {directors_str}
- **Cast:** {cast_str}
- **Genre:** {genres_str}
- **Runtime:** {movie['runtime']}
- **Rating:** {movie['content_rating']}

## Summary

{movie.get('summary', 'No summary available')}

## My Review

I rated this movie {movie['rating']}/10.

{movie.get('review', '<!-- Add your detailed review here -->')}
"""
    
    # Replace any repeated backslashes (can happen with formatting)
    content = content.replace("\\\\", "\\")
    
    return content

def save_post(movie, content, output_dir, dry_run=False):
    """Save the post to a file in Jekyll _posts directory"""
    # Create filename in Jekyll format: YYYY-MM-DD-title.md
    # Use the review date from Plex or today's date if not available
    date = movie.get('date', datetime.datetime.now().strftime('%Y-%m-%d'))
    title_slug = slugify(movie['title'])
    filename = f"{date}-{title_slug}-review.md"
    filepath = os.path.join(output_dir, filename)
    
    if dry_run:
        print(f"Would create post: {filepath}")
        print("Content preview:")
        print("-" * 40)
        preview_lines = content.split('\n')[:10]
        print('\n'.join(preview_lines))
        print("...")
        print("-" * 40)
        return
    
    # Ensure directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Write file
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Created post: {filepath}")
    except Exception as e:
        print(f"Error creating post for {movie['title']}: {e}")

def main():
    """Main function"""
    args = parse_args()
    
    # Get reviewed items from Plex API
    reviewed_items = get_reviewed_items(args)
    
    # Create posts
    for movie in reviewed_items:
        print(f"Processing: {movie['title']} ({movie['year']}) - {movie['rating']}/10")
        content = create_post_content(movie)
        save_post(movie, content, args.output_dir, args.dry_run)
    
    print("Done!")

if __name__ == "__main__":
    main()