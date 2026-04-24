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
  try {
    const user = await window.spark.user()
    
    if (!user || !user.isOwner) {
      throw new Error('User authentication required')
    }

    const octokit = new Octokit({
      auth: undefined
    })

    const sanitizedName = options.name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100)

    const repoData = {
      name: sanitizedName,
      description: options.description,
      private: options.isPrivate,
      auto_init: true,
      homepage: '',
    }

    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser(repoData)

    if (options.files.length > 0) {
      const defaultBranch = repo.default_branch || 'main'
      
      const { data: refData } = await octokit.rest.git.getRef({
        owner: repo.owner.login,
        repo: repo.name,
        ref: `heads/${defaultBranch}`,
      })

      const { data: commitData } = await octokit.rest.git.getCommit({
        owner: repo.owner.login,
        repo: repo.name,
        commit_sha: refData.object.sha,
      })

      const blobs = await Promise.all(
        options.files.map(async (file) => {
          const { data } = await octokit.rest.git.createBlob({
            owner: repo.owner.login,
            repo: repo.name,
            content: btoa(unescape(encodeURIComponent(file.content))),
            encoding: 'base64',
          })
          return { path: file.path, sha: data.sha, mode: '100644' as const }
        })
      )

      const { data: tree } = await octokit.rest.git.createTree({
        owner: repo.owner.login,
        repo: repo.name,
        tree: blobs,
        base_tree: commitData.tree.sha,
      })

      const { data: newCommit } = await octokit.rest.git.createCommit({
        owner: repo.owner.login,
        repo: repo.name,
        message: '🚀 Initial commit from HealFounder',
        tree: tree.sha,
        parents: [refData.object.sha],
      })

      await octokit.rest.git.updateRef({
        owner: repo.owner.login,
        repo: repo.name,
        ref: `heads/${defaultBranch}`,
        sha: newCommit.sha,
      })

      return {
        name: repo.name,
        url: repo.html_url,
        createdAt: Date.now(),
        commitSha: newCommit.sha,
      }
    }

    return {
      name: repo.name,
      url: repo.html_url,
      createdAt: Date.now(),
    }
  } catch (error: any) {
    if (error.status === 401) {
      throw new Error('GitHub authentication failed. Please check your credentials.')
    } else if (error.status === 422) {
      throw new Error('Repository name already exists or is invalid. Please try a different name.')
    } else if (error.message) {
      throw new Error(error.message)
    } else {
      throw new Error('Failed to create GitHub repository. Please try again.')
    }
  }
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
  return 'Healthcare startup project built with HealFounder'
}

export function generateReadmeContent(journey: {
  brand?: { name: string; tagline: string; logo: string }
  concept?: { problem: string; solution: string; targetUsers: string }
  story?: { narrative: string }
  prd?: any
  code?: GeneratedCode
}): string {
  const { brand, concept, story, prd, code } = journey

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
    readme += `This project was generated using HealFounder, an AI-powered healthcare startup builder.\n\n`
    readme += `### Running Locally\n\n`
    
    if (code.template === 'landing') {
      readme += `1. Clone this repository\n`
      readme += `2. Open \`index.html\` in your browser\n`
      readme += `3. Start customizing the code for your needs\n\n`
    } else if (code.template === 'webapp' || code.template === 'dashboard') {
      readme += `1. Clone this repository\n`
      readme += `2. Install dependencies: \`npm install\`\n`
      readme += `3. Run development server: \`npm run dev\`\n`
      readme += `4. Open your browser to the provided local URL\n\n`
    }
  }

  if (prd) {
    readme += `## Product Documentation\n\n`
    readme += `For detailed product requirements and specifications, see the PRD documentation included in this repository.\n\n`
  }

  readme += `## Built With\n\n`
  readme += `- [HealFounder](https://github.com) - AI-powered healthcare startup journey platform\n`
  readme += `- Generated with ❤️ for healthcare innovation\n\n`

  readme += `## License\n\n`
  readme += `This project is open source and available under the MIT License.\n\n`

  readme += `---\n\n`
  readme += `**Note:** This is an MVP scaffold generated by HealFounder. Remember to:\n`
  readme += `- Add proper authentication and security measures\n`
  readme += `- Implement HIPAA compliance if handling PHI\n`
  readme += `- Conduct thorough testing before production use\n`
  readme += `- Consult with legal and regulatory experts\n`

  return readme
}
