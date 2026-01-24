# MathDash Deployment Instructions

## Overview
MathDash is a Progressive Web App (PWA) for kids to practice multiplication tables. This guide provides instructions for deploying the application.

## Automated Packaging

A GitHub Action automatically creates deployment packages when code is merged to the `main` branch.

### Accessing Deployment Packages

1. Go to the repository's **Actions** tab
2. Click on the latest **"Package and Release MathDash"** workflow run
3. Download the package artifact (e.g., `mathdash-package-abc1234`)
4. Extract the ZIP file to get the deployment-ready package

## Server Requirements

### Recommended Server Type: **Static Web Server**

MathDash is a client-side PWA that requires only a static file server. No server-side processing, database, or backend is needed.

#### Suitable Hosting Options:
1. **GitHub Pages** (Free)
   - Perfect for this static PWA
   - Easy deployment via repository

2. **Netlify** (Free tier available)
   - Automatic HTTPS
   - Easy drag-and-drop deployment

3. **Vercel** (Free tier available)
   - Optimized for static sites
   - Simple deployment

4. **Apache/Nginx** (Self-hosted)
   - Traditional web servers
   - Full control over configuration

5. **AWS S3 + CloudFront** (Pay-as-you-go)
   - Scalable static hosting
   - CDN distribution

6. **Azure Static Web Apps** (Free tier available)
   - Integrated with GitHub
   - Global distribution

### Minimum Server Requirements:
- **HTTP Server**: Any web server capable of serving static files (HTML, CSS, JS)
- **HTTPS**: Recommended for PWA features (service worker, install prompt)
- **MIME Types**: Must support proper MIME types for:
  - `.html` → `text/html`
  - `.js` → `application/javascript` or `text/javascript`
  - `.css` → `text/css`
  - `.json` → `application/json`
- **No Database**: Not required
- **No Server-Side Processing**: Not required (PHP, Node.js, Python, etc.)

## Quick Deployment Options

### Option 1: GitHub Pages (Recommended)

1. Go to repository **Settings** → **Pages**
2. Under "Source", select branch `main` and root directory
3. Click **Save**
4. Access via `https://[username].github.io/[repository-name]/`

### Option 2: Netlify

1. Sign up for free at [netlify.com](https://netlify.com)
2. Drag and drop the package folder into Netlify dashboard
3. Netlify automatically deploys and provides a URL

### Option 3: Vercel

1. Sign up for free at [vercel.com](https://vercel.com)
2. Import GitHub repository or upload files
3. Vercel automatically builds and deploys

## Traditional Web Server Deployment

### Apache

```bash
# Copy files to web server directory
sudo cp -r /path/to/mathdash/* /var/www/html/mathdash/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/html/mathdash/
sudo chmod -R 755 /var/www/html/mathdash/
```

Optional `.htaccess` configuration:
```apache
# Enable HTTPS redirect (recommended for PWA)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Nginx

```bash
# Copy files to web server directory
sudo cp -r /path/to/mathdash/* /usr/share/nginx/html/mathdash/

# Set proper permissions
sudo chown -R nginx:nginx /usr/share/nginx/html/mathdash/
sudo chmod -R 755 /usr/share/nginx/html/mathdash/
```

Server block configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /usr/share/nginx/html/mathdash;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Local Testing

### Using Node.js
```bash
npx http-server -p 8000
# Access at http://localhost:8000
```

### Using Python
```bash
python3 -m http.server 8000
# Access at http://localhost:8000
```

## Post-Deployment Verification

1. **Access the application** via your deployment URL
2. **Test PWA features**:
   - Look for "Install" or "Add to Home Screen" prompt (requires HTTPS)
   - Test offline functionality
3. **Test game functionality**:
   - Choose a multiplication table
   - Complete a game
   - Verify all screens work

## PWA Installation

Once deployed with HTTPS:
- **Desktop**: Look for install icon in browser address bar
- **Mobile**: Use "Add to Home Screen" in browser menu
- **Benefits**: Works offline, appears like native app

## Troubleshooting

### Service Worker Issues
- Ensure HTTPS is enabled
- Check browser console for errors
- Verify `sw.js` is accessible

### Files Not Loading
- Check file permissions (755 for dirs, 644 for files)
- Verify MIME types
- Check web server error logs

### PWA Install Prompt Missing
- HTTPS is required
- Service worker must register successfully
- User must interact with page first

## Security

- **Use HTTPS** in production for PWA features
- No sensitive data stored or transmitted
- Entirely client-side application

## License

MIT License - See README.md for details
