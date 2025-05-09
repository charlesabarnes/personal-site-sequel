# Movie Reviews Collection

This document explains how the movie reviews section is set up and how to manage it.

## Overview

The movie reviews section is implemented as a Jekyll collection called `movie_reviews`. Movie reviews are stored in the `_movie_reviews` directory and are accessible at `/movie-reviews/` on the website.

## Directory Structure

- `_movie_reviews/`: Contains all movie review files (markdown)
- `movie-reviews/index.html`: The main movie reviews listing page
- `_sass/movie_reviews.scss`: Styling for movie reviews
- `plex-reviews-to-posts.py`: Script to import movie reviews from Plex (updated to save to _movie_reviews)

## How to Add a Movie Review

### Method 1: Using the Plex Import Script

The recommended way to add movie reviews is to use the import script:

```bash
python plex-reviews-to-posts.py
```

This will fetch your movie reviews from Plex and generate files in the `_movie_reviews` directory.

Script options:
- `--output-dir`: Set output directory (default: `_movie_reviews`)
- `--min-rating`: Only import reviews with at least this rating (0-10)
- `--limit`: Import only a specific number of reviews
- `--dry-run`: Run without creating files
- `--title`: Import only reviews matching a specific title

### Method 2: Manual Creation

You can also create movie review files manually by creating a markdown file in the `_movie_reviews` directory with the following front matter:

```yaml
---
layout: post
title: "Movie Review: [Movie Title] ([Year])"
date: "YYYY-MM-DD"
permalink: /movie-reviews/[movie-slug]/
tags: [movies, reviews]
rating: [0-10]
movie_title: "[Movie Title]"
release_year: [Year]
director: "[Director Name]"
content_rating: "[Rating]"
runtime: "[Runtime]"
poster_url: "[URL to poster image]"
image: "[Same as poster_url]"
genres: 
  - [Genre1]
  - [Genre2]
---

# Movie Review: [Movie Title] ([Year])

[Review content]
```

## Jekyll Configuration

The collection is configured in `_config.yml`:

```yaml
collections:
  movie_reviews:
    output: true
    permalink: /movie-reviews/:path/

defaults:
  - scope:
      path: ""
      type: "movie_reviews"
    values:
      layout: "post"
```

## Styling

Movie review styles are defined in `_sass/movie_reviews.scss` and imported in `assets/css/styles.scss`.