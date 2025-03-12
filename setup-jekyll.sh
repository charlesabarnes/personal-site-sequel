#!/bin/bash

# Install Ruby dependencies
echo "Installing Jekyll and dependencies..."
gem install bundler jekyll
bundle install

# Build and serve site
echo "Starting Jekyll server..."
bundle exec jekyll serve --host=0.0.0.0 --livereload