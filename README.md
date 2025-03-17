# Charles Barnes Personal Website

This is my personal website built with Jekyll and hosted on GitHub Pages.

## Features

- Clean, minimalist design
- Responsive layout for mobile and desktop
- Blog section with Markdown support
- Photography gallery
- Portfolio showcase
- Tag-based content organization

## Development

### Prerequisites

- Ruby (version 2.5.0 or higher)
- RubyGems
- GCC and Make

### Setup

1. Clone the repository
   ```
   git clone https://github.com/charlesabarnes/personal-site-sequel.git
   cd personal-site-sequel
   ```

2. Install dependencies
   ```
   bundle install
   ```

3. Run locally
   ```
   bundle exec jekyll serve
   ```

4. View the site at `http://localhost:4000`

## Content Management

### Blog Posts

Add new blog posts as markdown files in the `_posts` directory using the format:
```
YYYY-MM-DD-title.md
```

With front matter:
```yaml
---
layout: post
title: "Your Post Title"
date: YYYY-MM-DD
tags: [tag1, tag2]
---
```

### Photo Albums

Add new photo albums in the `_photography` directory as markdown files with front matter:

```yaml
---
layout: photo_album
title: "Album Title"
thumbnail: "/assets/images/photography/album-name/thumbnail.jpg"
description: "Album description"
---
```

Place your album images in the corresponding directory: `/assets/images/photography/album-name/`.

Each album should have a thumbnails subdirectory containing thumbnail versions of all images. You can use the included `generate-thumbnails.sh` script to create these:

```
./generate-thumbnails.sh album-name
```

This will create properly sized thumbnails for all images in the album directory.

### Tags

The site uses a tag-based organization system. Create new tag pages in the `tag/` directory:

```
tag/tag-name.md
```

With front matter:
```yaml
---
layout: tag
tag: tag-name
permalink: /tag/tag-name/
---
```

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch.

## License

All content is copyright Charles Barnes unless otherwise specified.

## Contact

For questions or issues, contact me at [charles@charlesabarnes.com](mailto:charles@charlesabarnes.com)