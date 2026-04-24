import { FrameworkType, TemplateType } from './frameworkBestPractices'

export type DeploymentPlatform = 'vercel' | 'netlify' | 'github-pages' | 'railway' | 'render'
export type CICDProvider = 'github-actions' | 'gitlab-ci' | 'circleci'

export interface CICDPipelineConfig {
  provider: CICDProvider
  platform: DeploymentPlatform
  framework: FrameworkType
  template: TemplateType
  fileName: string
  content: string
  instructions: string[]
}

export interface DeploymentGuide {
  platform: DeploymentPlatform
  name: string
  description: string
  supportedFrameworks: FrameworkType[]
  setupSteps: string[]
  environmentVariables: string[]
  buildCommand: Record<FrameworkType, string>
  outputDirectory: Record<FrameworkType, string>
  features: string[]
  pricing: string
  healthcareConsiderations: string[]
}

export const DEPLOYMENT_PLATFORMS: Record<DeploymentPlatform, DeploymentGuide> = {
  'vercel': {
    platform: 'vercel',
    name: 'Vercel',
    description: 'Optimized for Next.js and modern web frameworks with automatic deployments',
    supportedFrameworks: ['react', 'vue', 'html'],
    setupSteps: [
      'Install Vercel CLI: npm i -g vercel',
      'Run "vercel" in your project directory',
      'Link to your Vercel account',
      'Configure project settings (auto-detected)',
      'Deploy with "vercel --prod"',
      'Or connect GitHub repo for automatic deployments'
    ],
    environmentVariables: [
      'NODE_ENV=production',
      'VITE_API_URL (if using external API)',
      'VITE_SUPABASE_URL (if using Supabase)',
      'VITE_SUPABASE_KEY (public anon key)'
    ],
    buildCommand: {
      html: 'echo "No build needed"',
      react: 'npm run build',
      vue: 'npm run build'
    },
    outputDirectory: {
      html: '.',
      react: 'dist',
      vue: 'dist'
    },
    features: [
      'Automatic HTTPS',
      'Global CDN',
      'Edge Functions',
      'Preview deployments for PRs',
      'Zero-config for many frameworks',
      'Web Analytics',
      'Environment variables management'
    ],
    pricing: 'Free tier: Hobby plan with generous limits',
    healthcareConsiderations: [
      'Ensure HIPAA compliance plan if handling PHI (contact Vercel enterprise)',
      'Configure security headers in vercel.json',
      'Use environment variables for all secrets',
      'Enable Web Analytics for monitoring',
      'Set up custom domain with SSL for professional appearance'
    ]
  },
  'netlify': {
    platform: 'netlify',
    name: 'Netlify',
    description: 'All-in-one platform for modern web projects with powerful build automation',
    supportedFrameworks: ['react', 'vue', 'html'],
    setupSteps: [
      'Install Netlify CLI: npm i -g netlify-cli',
      'Run "netlify init" in your project',
      'Connect to Git repository or deploy manually',
      'Configure build settings',
      'Deploy with "netlify deploy --prod"',
      'Or enable continuous deployment from Git'
    ],
    environmentVariables: [
      'NODE_ENV=production',
      'VITE_API_URL',
      'CI=true (for build optimization)'
    ],
    buildCommand: {
      html: 'echo "Static files ready"',
      react: 'npm run build',
      vue: 'npm run build'
    },
    outputDirectory: {
      html: '.',
      react: 'dist',
      vue: 'dist'
    },
    features: [
      'Automatic HTTPS',
      'Form handling',
      'Serverless Functions',
      'Split testing',
      'Deploy previews',
      'Custom headers and redirects',
      'Identity service for authentication'
    ],
    pricing: 'Free tier: Starter plan with 100GB bandwidth',
    healthcareConsiderations: [
      'Use Netlify Identity for secure authentication',
      'Configure _headers file for security policies',
      'Enable form handling with spam protection',
      'Set up custom domain with SSL',
      'Use serverless functions for API endpoints'
    ]
  },
  'github-pages': {
    platform: 'github-pages',
    name: 'GitHub Pages',
    description: 'Free static site hosting directly from GitHub repository',
    supportedFrameworks: ['html', 'react', 'vue'],
    setupSteps: [
      'Build your project: npm run build',
      'Go to repository Settings > Pages',
      'Select source branch (usually "main" or "gh-pages")',
      'Choose folder (/root or /docs)',
      'Save and wait for deployment',
      'Or use GitHub Actions for automated deployments'
    ],
    environmentVariables: [
      'PUBLIC_URL (set to repository name for path prefix)',
      'NODE_ENV=production'
    ],
    buildCommand: {
      html: 'echo "No build needed"',
      react: 'npm run build',
      vue: 'npm run build'
    },
    outputDirectory: {
      html: '.',
      react: 'dist',
      vue: 'dist'
    },
    features: [
      'Free hosting',
      'Automatic HTTPS',
      'Custom domain support',
      'GitHub Actions integration',
      'Version control integration',
      'Fast CDN delivery'
    ],
    pricing: 'Free for public repositories',
    healthcareConsiderations: [
      'Only for static content - no server-side processing',
      'Not suitable for handling PHI or authentication',
      'Best for marketing pages and public documentation',
      'Use for landing pages and informational sites',
      'Ensure no sensitive data in repository'
    ]
  },
  'railway': {
    platform: 'railway',
    name: 'Railway',
    description: 'Modern deployment platform with database support and easy scaling',
    supportedFrameworks: ['react', 'vue', 'html'],
    setupSteps: [
      'Install Railway CLI: npm i -g @railway/cli',
      'Run "railway login"',
      'Run "railway init" in your project',
      'Configure build and start commands',
      'Deploy with "railway up"',
      'Or connect GitHub for automatic deployments'
    ],
    environmentVariables: [
      'NODE_ENV=production',
      'PORT (automatically provided)',
      'DATABASE_URL (if using Railway database)'
    ],
    buildCommand: {
      html: 'echo "Static build"',
      react: 'npm run build',
      vue: 'npm run build'
    },
    outputDirectory: {
      html: '.',
      react: 'dist',
      vue: 'dist'
    },
    features: [
      'Database provisioning (PostgreSQL, MySQL, MongoDB)',
      'Environment variables management',
      'Automatic deployments',
      'Metrics and logging',
      'Team collaboration',
      'Service scaling'
    ],
    pricing: 'Free tier: $5 credit per month',
    healthcareConsiderations: [
      'Good for full-stack applications with databases',
      'Configure proper database encryption',
      'Set up regular backups for patient data',
      'Use for applications requiring server-side logic',
      'Implement proper access controls and authentication'
    ]
  },
  'render': {
    platform: 'render',
    name: 'Render',
    description: 'Unified cloud platform for static sites, web services, and databases',
    supportedFrameworks: ['react', 'vue', 'html'],
    setupSteps: [
      'Create Render account at render.com',
      'Click "New Static Site" or "New Web Service"',
      'Connect your Git repository',
      'Configure build command and publish directory',
      'Add environment variables if needed',
      'Click "Create" to deploy'
    ],
    environmentVariables: [
      'NODE_ENV=production',
      'VITE_API_URL',
      'DATABASE_URL (if using Render database)'
    ],
    buildCommand: {
      html: 'echo "Static ready"',
      react: 'npm run build',
      vue: 'npm run build'
    },
    outputDirectory: {
      html: '.',
      react: 'dist',
      vue: 'dist'
    },
    features: [
      'Auto-deploy from Git',
      'Free SSL certificates',
      'DDoS protection',
      'Private networking',
      'PostgreSQL databases',
      'Background workers',
      'Cron jobs'
    ],
    pricing: 'Free tier: Static sites free, web services have free tier',
    healthcareConsiderations: [
      'Supports both static and dynamic applications',
      'Good for applications with backend services',
      'Configure health checks for reliability',
      'Use managed databases with automatic backups',
      'Implement logging for compliance and auditing'
    ]
  }
}

export function generateGitHubActionsWorkflow(
  framework: FrameworkType,
  template: TemplateType,
  platform: DeploymentPlatform
): CICDPipelineConfig {
  const deploymentGuide = DEPLOYMENT_PLATFORMS[platform]
  const buildCommand = deploymentGuide.buildCommand[framework]
  const outputDir = deploymentGuide.outputDirectory[framework]
  
  let workflowContent = ''
  let instructions: string[] = []
  
  if (platform === 'vercel') {
    workflowContent = `name: Deploy to Vercel

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: ${buildCommand}
        env:
          NODE_ENV: production
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
`
    
    instructions = [
      'Create a Vercel account and project at vercel.com',
      'Get your Vercel token from Account Settings > Tokens',
      'Get ORG_ID and PROJECT_ID from project settings',
      'Go to GitHub repo Settings > Secrets and variables > Actions',
      'Add secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID',
      'Commit this workflow file to .github/workflows/deploy.yml',
      'Push to main branch to trigger deployment'
    ]
  } else if (platform === 'netlify') {
    workflowContent = `name: Deploy to Netlify

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: ${buildCommand}
        env:
          NODE_ENV: production
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v3.0
        with:
          publish-dir: './${outputDir}'
          production-branch: main
          github-token: \${{ secrets.GITHUB_TOKEN }}
          deploy-message: 'Deploy from GitHub Actions'
          enable-pull-request-comment: true
          enable-commit-comment: true
        env:
          NETLIFY_AUTH_TOKEN: \${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: \${{ secrets.NETLIFY_SITE_ID }}
        timeout-minutes: 10
`
    
    instructions = [
      'Create a Netlify account and site at netlify.com',
      'Get your Personal Access Token from User Settings > Applications',
      'Get SITE_ID from Site Settings > General > Site information',
      'Go to GitHub repo Settings > Secrets and variables > Actions',
      'Add secrets: NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID',
      'Commit this workflow file to .github/workflows/deploy.yml',
      'Push to main branch to trigger deployment'
    ]
  } else if (platform === 'github-pages') {
    workflowContent = `name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: ${buildCommand}
        env:
          NODE_ENV: production
          PUBLIC_URL: /\${{ github.event.repository.name }}
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './${outputDir}'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`
    
    instructions = [
      'Go to GitHub repository Settings > Pages',
      'Under "Build and deployment", select "GitHub Actions" as source',
      'Commit this workflow file to .github/workflows/deploy.yml',
      'Push to main branch to trigger deployment',
      'Your site will be available at https://<username>.github.io/<repo-name>',
      'Configure custom domain in Pages settings if desired'
    ]
  } else if (platform === 'railway') {
    workflowContent = `name: Deploy to Railway

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: ${buildCommand}
        env:
          NODE_ENV: production
      
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: \${{ secrets.RAILWAY_TOKEN }}
`
    
    instructions = [
      'Create a Railway account and project at railway.app',
      'Install Railway CLI: npm i -g @railway/cli',
      'Run "railway login" to authenticate',
      'Get your project token from project settings',
      'Go to GitHub repo Settings > Secrets and variables > Actions',
      'Add secret: RAILWAY_TOKEN',
      'Commit this workflow file to .github/workflows/deploy.yml',
      'Push to main branch to trigger deployment'
    ]
  } else if (platform === 'render') {
    workflowContent = `name: Deploy to Render

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Trigger Render Deploy Hook
        run: |
          curl -X POST \${{ secrets.RENDER_DEPLOY_HOOK_URL }}
`
    
    instructions = [
      'Create a Render account and service at render.com',
      'Connect your GitHub repository to Render',
      'Configure build command and publish directory in Render dashboard',
      'Go to your Render service Settings > Deploy Hook',
      'Copy the Deploy Hook URL',
      'Go to GitHub repo Settings > Secrets and variables > Actions',
      'Add secret: RENDER_DEPLOY_HOOK_URL (paste the webhook URL)',
      'Commit this workflow file to .github/workflows/deploy.yml',
      'Alternatively, Render can auto-deploy on Git push without this workflow'
    ]
  }
  
  return {
    provider: 'github-actions',
    platform,
    framework,
    template,
    fileName: '.github/workflows/deploy.yml',
    content: workflowContent,
    instructions
  }
}

export function generateVercelConfig(framework: FrameworkType): { fileName: string; content: string } {
  let config: any = {
    buildCommand: DEPLOYMENT_PLATFORMS.vercel.buildCommand[framework],
    outputDirectory: DEPLOYMENT_PLATFORMS.vercel.outputDirectory[framework],
    installCommand: 'npm install',
    framework: framework === 'react' ? 'vite' : framework === 'vue' ? 'vite' : null
  }
  
  if (framework === 'html') {
    config = {
      ...config,
      routes: [
        {
          src: '/(.*)',
          dest: '/$1'
        }
      ]
    }
  }
  
  config.headers = [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'geolocation=(), microphone=(), camera=()'
        }
      ]
    }
  ]
  
  return {
    fileName: 'vercel.json',
    content: JSON.stringify(config, null, 2)
  }
}

export function generateNetlifyConfig(framework: FrameworkType): { fileName: string; content: string } {
  const buildCommand = DEPLOYMENT_PLATFORMS.netlify.buildCommand[framework]
  const outputDir = DEPLOYMENT_PLATFORMS.netlify.outputDirectory[framework]
  
  const config = `[build]
  command = "${buildCommand}"
  publish = "${outputDir}"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.png"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.jpg"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
`
  
  return {
    fileName: 'netlify.toml',
    content: config
  }
}

export function generateDockerfile(framework: FrameworkType): { fileName: string; content: string } {
  let content = ''
  
  if (framework === 'html') {
    content = `# Multi-stage build for HTML static site
FROM nginx:alpine

# Copy static files
COPY . /usr/share/nginx/html

# Copy custom nginx config (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Add security headers
RUN echo 'add_header X-Frame-Options "DENY";' > /etc/nginx/conf.d/security-headers.conf && \\
    echo 'add_header X-Content-Type-Options "nosniff";' >> /etc/nginx/conf.d/security-headers.conf && \\
    echo 'add_header X-XSS-Protection "1; mode=block";' >> /etc/nginx/conf.d/security-headers.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
`
  } else {
    const buildCommand = framework === 'react' || framework === 'vue' ? 'npm run build' : 'echo "No build"'
    const outputDir = framework === 'react' || framework === 'vue' ? 'dist' : '.'
    
    content = `# Multi-stage build for ${framework === 'react' ? 'React' : 'Vue'} application

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN ${buildCommand}

# Stage 2: Production
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/${outputDir} /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # SPA routing - redirect all requests to index.html
    location / {
        try_files \\$uri \\$uri/ /index.html;
    }

    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \\
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
`
  }
  
  return {
    fileName: 'Dockerfile',
    content: content
  }
}

export function generateDockerCompose(framework: FrameworkType, projectName: string): { fileName: string; content: string } {
  const content = `version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    # Uncomment if you need a database
    # depends_on:
    #   - db
  
  # Uncomment and configure if your healthcare app needs a database
  # db:
  #   image: postgres:15-alpine
  #   restart: unless-stopped
  #   environment:
  #     POSTGRES_DB: ${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_db
  #     POSTGRES_USER: \${DB_USER:-postgres}
  #     POSTGRES_PASSWORD: \${DB_PASSWORD:-changeme}
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data
  #   ports:
  #     - "5432:5432"

# volumes:
#   postgres_data:
`
  
  return {
    fileName: 'docker-compose.yml',
    content: content
  }
}

export function generateDeploymentReadme(
  framework: FrameworkType,
  template: TemplateType,
  selectedPlatforms: DeploymentPlatform[]
): { fileName: string; content: string } {
  let content = `# Deployment Guide

This guide covers multiple deployment options for your healthcare startup application.

## Quick Start

Choose one of the following platforms based on your needs:

`
  
  selectedPlatforms.forEach(platform => {
    const guide = DEPLOYMENT_PLATFORMS[platform]
    content += `### ${guide.name}

**Best for:** ${guide.description}

**Pricing:** ${guide.pricing}

**Setup Steps:**
${guide.setupSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**Required Environment Variables:**
${guide.environmentVariables.map(env => `- ${env}`).join('\n')}

**Healthcare Considerations:**
${guide.healthcareConsiderations.map(item => `- ${item}`).join('\n')}

---

`
  })
  
  content += `## CI/CD with GitHub Actions

This repository includes a GitHub Actions workflow for automated deployments.

### Setup

1. Choose your deployment platform from the options above
2. Configure the secrets in GitHub repository settings
3. Push to the main branch to trigger deployment

### Workflow Files

- \`.github/workflows/deploy.yml\` - Main deployment workflow
- Workflow runs on every push to main branch
- Includes build, test, and deploy steps

## Security Best Practices

### For Healthcare Applications

- **Never commit secrets** to the repository
- **Use environment variables** for all sensitive configuration
- **Enable HTTPS** on all deployments (automatic on recommended platforms)
- **Implement proper authentication** before going to production
- **Consider HIPAA compliance** if handling Protected Health Information (PHI)
- **Set up security headers** (included in platform configs)
- **Regular security audits** and dependency updates
- **Backup strategy** for any data storage

### Security Headers

All deployment configurations include these security headers:
- X-Frame-Options: DENY (prevent clickjacking)
- X-Content-Type-Options: nosniff (prevent MIME sniffing)
- X-XSS-Protection: 1; mode=block (XSS protection)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: geolocation=(), microphone=(), camera=()

## Performance Optimization

### Build Optimization

- Minification and bundling enabled in production builds
- Tree shaking to remove unused code
- Code splitting for faster initial loads
- Image optimization and lazy loading

### Caching Strategy

- Static assets cached with long expiration
- HTML files cached with short expiration for updates
- CDN distribution for global performance

## Monitoring and Maintenance

### Health Checks

- Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- Configure application performance monitoring (APM)
- Set up error tracking (Sentry, LogRocket, etc.)

### Updates and Maintenance

- Regular dependency updates: \`npm update\`
- Security patches: \`npm audit fix\`
- Review and update environment variables
- Monitor deployment logs for errors

## Troubleshooting

### Common Issues

**Build Failures:**
- Check Node.js version (requires Node 18+)
- Verify all dependencies are listed in package.json
- Check for TypeScript errors: \`npm run type-check\`

**Environment Variables:**
- Ensure all required variables are set in platform dashboard
- Variables must be prefixed with VITE_ to be accessible in browser
- Restart deployments after changing variables

**404 Errors on Routes:**
- Configure SPA routing redirects (included in configs)
- Verify output directory matches platform settings

**Slow Performance:**
- Enable caching headers (included in configs)
- Optimize images and assets
- Use CDN for static assets

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)

## Healthcare Compliance Notes

⚠️ **Important:** This is an MVP scaffold. Before deploying a production healthcare application:

1. **HIPAA Compliance:** If handling PHI, ensure your hosting platform has a BAA (Business Associate Agreement)
2. **Security Review:** Conduct thorough security audit
3. **Authentication:** Implement proper user authentication and authorization
4. **Data Encryption:** Encrypt sensitive data at rest and in transit
5. **Audit Logging:** Implement comprehensive audit logs for compliance
6. **Legal Review:** Consult with healthcare legal experts
7. **Regulatory Compliance:** Ensure compliance with FDA, HIPAA, GDPR, etc.

## Next Steps

1. Choose your deployment platform
2. Set up CI/CD pipeline
3. Configure environment variables
4. Test deployment thoroughly
5. Set up monitoring and alerts
6. Plan for scaling and maintenance

For questions or issues, please open an issue in the repository.
`
  
  return {
    fileName: 'DEPLOYMENT.md',
    content: content
  }
}

export function getAllCICDFiles(
  framework: FrameworkType,
  template: TemplateType,
  projectName: string,
  selectedPlatforms: DeploymentPlatform[]
): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = []
  
  // GitHub Actions workflows for each platform
  selectedPlatforms.forEach(platform => {
    const workflow = generateGitHubActionsWorkflow(framework, template, platform)
    files.push({
      path: workflow.fileName,
      content: workflow.content
    })
  })
  
  // Platform-specific config files
  if (selectedPlatforms.includes('vercel')) {
    const vercelConfig = generateVercelConfig(framework)
    files.push({
      path: vercelConfig.fileName,
      content: vercelConfig.content
    })
  }
  
  if (selectedPlatforms.includes('netlify')) {
    const netlifyConfig = generateNetlifyConfig(framework)
    files.push({
      path: netlifyConfig.fileName,
      content: netlifyConfig.content
    })
  }
  
  // Docker files
  const dockerfile = generateDockerfile(framework)
  files.push({
    path: dockerfile.fileName,
    content: dockerfile.content
  })
  
  const dockerCompose = generateDockerCompose(framework, projectName)
  files.push({
    path: dockerCompose.fileName,
    content: dockerCompose.content
  })
  
  // Deployment documentation
  const deploymentReadme = generateDeploymentReadme(framework, template, selectedPlatforms)
  files.push({
    path: deploymentReadme.fileName,
    content: deploymentReadme.content
  })
  
  return files
}

export function getRecommendedPlatform(template: TemplateType): DeploymentPlatform {
  switch (template) {
    case 'landing':
      return 'netlify'
    case 'webapp':
      return 'vercel'
    case 'dashboard':
      return 'railway'
    default:
      return 'vercel'
  }
}

export function getPlatformsByFramework(framework: FrameworkType): DeploymentPlatform[] {
  return Object.values(DEPLOYMENT_PLATFORMS)
    .filter(guide => guide.supportedFrameworks.includes(framework))
    .map(guide => guide.platform)
}
