# Image Assets for NC Resilience Platform

## Overview
Large image assets are excluded from git to keep repository size small.
For production deployment, images should be hosted on a CDN or image service.

## Required Images
- `about_hero.png` - About page hero image
- `agricpage.png` - Agriculture page banner
- `businesspage.png` - Business page banner  
- `mappage2.png` - Map page screenshot
- `nc-hero.png` - Main hero image
- `ourfoundationsvalues2.png` - Values section image
- `ourfoundationsvalues3.png` - Values section image
- `ourfoundationvalues.png` - Foundation values image

## Deployment Options

### Option 1: Cloudinary (Recommended)
1. Upload images to Cloudinary
2. Update image URLs in components
3. Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` environment variable

### Option 2: AWS S3 + CloudFront
1. Upload to S3 bucket
2. Configure CloudFront distribution
3. Update image URLs in components

### Option 3: Vercel/Render Static Assets
1. Upload images during deployment process
2. Place in `public/` directory on server
3. Images will be served as static assets

## For Development
Images are available locally in the `public/` directory.
Git ignores them to keep repository lightweight.