import { Octokit } from 'octokit'
import { GeneratedCode, GitHubRepo } from './types'

export interface CreateRepoOptions {
  name: string
  description: string
  isPrivate: boolean
  files: Array<{ path: string; content: string }>
}

export async function createGitHubRepository(
  options: CreateRepoOptions
): Promise<GitHubRepo> {
  throw new Error('GitHub repository creation is not available in this environment. Please download your code files and create a repository manually on GitHub.com, or use the GitHub CLI (`gh repo create`) to push your code.')
}

export function generateRepoName(brandName: string): string {
  return brandName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100) || 'healthcare-startup'
}

export function generateRepoDescription(journey: { concept?: { problem: string }; brand?: { tagline: string } }): string {
  if (journey.brand?.tagline) {
    return journey.brand.tagline
  }
  if (journey.concept?.problem) {
    return journey.concept.problem.slice(0, 200)
  }
  return 'Healthcare startup built with Spark الشرارة'
}

export function generateReadmeContent(journey: {
  brand?: { name: string; tagline: string; logo: string }
  concept?: { problem: string; solution: string; targetUsers: string }
  story?: { narrative: string }
  prd?: any
  code?: GeneratedCode
  githubRepo?: { deploymentPlatforms?: string[]; includeDocker?: boolean }
}): string {
  const { brand, concept, story, prd, code, githubRepo } = journey

  let readme = `# ${brand?.name || 'Healthcare Startup'}\n\n`
  
  if (brand?.tagline) {
    readme += `> ${brand.tagline}\n\n`
  }

  if (brand?.logo) {
    readme += `${brand.logo}\n\n`
  }

  readme += `## About\n\n`
  
  if (concept?.problem) {
    readme += `**Problem:** ${concept.problem}\n\n`
  }
  
  if (concept?.solution) {
    readme += `**Solution:** ${concept.solution}\n\n`
  }
  
  if (concept?.targetUsers) {
    readme += `**Target Users:** ${concept.targetUsers}\n\n`
  }

  if (story?.narrative) {
    readme += `## Our Story\n\n${story.narrative}\n\n`
  }

  if (code) {
    readme += `## Getting Started\n\n`
    readme += `This project was generated using Spark الشرارة, an AI-powered healthcare startup builder.\n\n`
    
    readme += `### Prerequisites\n\n`
    if (code.template === 'landing') {
      readme += `- A modern web browser\n`
      readme += `- (Optional) A local web server for testing\n\n`
    } else {
      readme += `- Node.js 18+ installed\n`
      readme += `- npm or yarn package manager\n\n`
    }
    
    readme += `### Local Development\n\n`
    
    if (code.template === 'landing') {
      readme += `\`\`\`bash\n`
      readme += `# Clone this repository\n`
      readme += `git clone <repository-url>\n`
      readme += `cd ${brand?.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'project'}\n\n`
      readme += `# Open index.html in your browser\n`
      readme += `# Or use a simple HTTP server:\n`
      readme += `npx http-server .\n`
      readme += `\`\`\`\n\n`
    } else {
      readme += `\`\`\`bash\n`
      readme += `# Clone this repository\n`
      readme += `git clone <repository-url>\n`
      readme += `cd ${brand?.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'project'}\n\n`
      readme += `# Install dependencies\n`
      readme += `npm install\n\n`
      readme += `# Run development server\n`
      readme += `npm run dev\n\n`
      readme += `# Build for production\n`
      readme += `npm run build\n`
      readme += `\`\`\`\n\n`
    }

    if (githubRepo?.includeDocker) {
      readme += `### Docker Deployment\n\n`
      readme += `This project includes Docker configuration for containerized deployment:\n\n`
      readme += `\`\`\`bash\n`
      readme += `# Build the Docker image\n`
      readme += `docker build -t ${brand?.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'healthcare-app'} .\n\n`
      readme += `# Run the container\n`
      readme += `docker run -p 8080:80 ${brand?.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'healthcare-app'}\n\n`
      readme += `# Or use Docker Compose\n`
      readme += `docker-compose up\n`
      readme += `\`\`\`\n\n`
      readme += `Visit \`http://localhost:8080\` to view your application.\n\n`
    }

    if (githubRepo?.deploymentPlatforms && githubRepo.deploymentPlatforms.length > 0) {
      readme += `## Deployment\n\n`
      readme += `This repository is configured for deployment on multiple platforms:\n\n`
      
      githubRepo.deploymentPlatforms.forEach(platform => {
        readme += `### ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n\n`
        
        switch(platform) {
          case 'vercel':
            readme += `[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=${encodeURIComponent('https://github.com/yourusername/' + (brand?.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'project'))})\n\n`
            readme += `\`\`\`bash\n`
            readme += `# Install Vercel CLI\n`
            readme += `npm i -g vercel\n\n`
            readme += `# Deploy\n`
            readme += `vercel\n`
            readme += `\`\`\`\n\n`
            break
          case 'netlify':
            readme += `[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=${encodeURIComponent('https://github.com/yourusername/' + (brand?.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'project'))})\n\n`
            readme += `\`\`\`bash\n`
            readme += `# Install Netlify CLI\n`
            readme += `npm i -g netlify-cli\n\n`
            readme += `# Deploy\n`
            readme += `netlify deploy\n`
            readme += `\`\`\`\n\n`
            break
          case 'github-pages':
            readme += `Automatically deployed via GitHub Actions when pushing to main branch.\n\n`
            readme += `**Live URL:** \`https://<username>.github.io/<repository>/\`\n\n`
            break
          case 'railway':
            readme += `[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/yourusername/${brand?.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'project'})\n\n`
            break
          case 'render':
            readme += `[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)\n\n`
            break
        }
      })
      
      readme += `For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).\n\n`
    }
  }

  if (prd) {
    readme += `## Product Documentation\n\n`
    readme += `For detailed product requirements and specifications, see the PRD documentation included in this repository.\n\n`
  }

  readme += `## Project Structure\n\n`
  readme += `\`\`\`\n`
  if (code?.template === 'landing') {
    readme += `.\n`
    readme += `├── index.html          # Main HTML file\n`
    readme += `├── styles.css          # Stylesheet\n`
    readme += `├── script.js           # JavaScript logic\n`
  } else {
    readme += `.\n`
    readme += `├── src/                # Source files\n`
    readme += `│   ├── components/     # React components\n`
    readme += `│   ├── styles/         # CSS/styling\n`
    readme += `│   └── utils/          # Utility functions\n`
    readme += `├── public/             # Static assets\n`
  }
  if (githubRepo?.includeDocker) {
    readme += `├── Dockerfile          # Docker configuration\n`
    readme += `├── docker-compose.yml  # Docker Compose setup\n`
  }
  if (githubRepo?.deploymentPlatforms && githubRepo.deploymentPlatforms.length > 0) {
    readme += `├── .github/workflows/  # CI/CD workflows\n`
    readme += `├── DEPLOYMENT.md       # Deployment guide\n`
  }
  readme += `└── README.md           # This file\n`
  readme += `\`\`\`\n\n`

  readme += `## Built With\n\n`
  readme += `- [Spark الشرارة](https://github.com) - AI-powered healthcare startup journey platform\n`
  if (code?.template === 'webapp' || code?.template === 'dashboard') {
    readme += `- React + TypeScript - Modern frontend framework\n`
    readme += `- Vite - Fast build tool\n`
  }
  readme += `- Generated with ❤️ for healthcare innovation\n\n`

  readme += `## Healthcare Compliance\n\n`
  readme += `⚠️ **Important Security & Compliance Notes:**\n\n`
  readme += `This is an MVP scaffold. Before deploying to production with real patient data:\n\n`
  readme += `- [ ] Implement proper authentication and authorization\n`
  readme += `- [ ] Add end-to-end encryption for sensitive data\n`
  readme += `- [ ] Ensure HIPAA compliance if handling PHI (Protected Health Information)\n`
  readme += `- [ ] Conduct security audits and penetration testing\n`
  readme += `- [ ] Set up comprehensive audit logging\n`
  readme += `- [ ] Implement data backup and disaster recovery\n`
  readme += `- [ ] Review and comply with FDA regulations if applicable\n`
  readme += `- [ ] Consult with legal and healthcare compliance experts\n`
  readme += `- [ ] Obtain necessary Business Associate Agreements (BAAs)\n`
  readme += `- [ ] Configure proper access controls and role-based permissions\n\n`

  readme += `## Support & Contribution\n\n`
  readme += `For questions, issues, or contributions:\n\n`
  readme += `1. Open an issue in this repository\n`
  readme += `2. Submit a pull request with improvements\n`
  readme += `3. Contact the development team\n\n`

  readme += `## License\n\n`
  readme += `This project is open source and available under the MIT License.\n\n`

  readme += `---\n\n`
  readme += `**Built with Spark الشرارة** - Empowering healthcare founders to turn ideas into reality.\n`

  return readme
}
