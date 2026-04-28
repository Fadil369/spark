Thanks for helping make GitHub safe for everyone.

# Security

GitHub takes the security of our software products and services seriously, including all of the open source code repositories managed through our GitHub organizations, such as [GitHub](https://github.com/GitHub).

Even though [open source repositories are outside of the scope of our bug bounty program](https://bounty.github.com/index.html#scope) and therefore not eligible for bounty rewards, we will ensure that your finding gets passed along to the appropriate maintainers for remediation. 

## Spark الشرارة Security Practices

### API Key Management

This application uses environment variables to manage sensitive API keys securely:

1. **Never commit API keys to version control**
   - All API keys should be stored in `.env` files
   - The `.env` file is included in `.gitignore`
   - Use `.env.example` as a template (without real keys)

2. **Environment Variable Structure**
   - DeepSeek API Key: `VITE_DEEPSEEK_API_KEY`
   - All browser-accessible variables use the `VITE_` prefix

3. **Key Rotation**
   - Regularly rotate your API keys
   - If a key is compromised, revoke it immediately in the DeepSeek dashboard
   - Generate a new key and update your `.env` file

4. **Local Development**
   - Keep development and production API keys separate
   - Use different keys with appropriate rate limits
   - Never share keys between team members (each should have their own)

### Client-Side Security Considerations

⚠️ **Important**: This is a client-side application running in the browser. This means:

1. **API Key Exposure**: Environment variables prefixed with `VITE_` are accessible in the browser's JavaScript bundle. This is necessary for the application to function but means:
   - Anyone can extract the API key from the browser
   - Rate limiting and usage monitoring are essential
   - Consider implementing a backend proxy for production deployments

2. **Recommended Production Architecture**:
   ```
   Browser → Your Backend API → DeepSeek API
   ```
   - Your backend validates requests and manages the API key
   - The API key never reaches the client
   - You can implement user authentication and rate limiting

3. **For Development/Personal Use**: The current architecture is acceptable when:
   - You're the only user
   - The API key has appropriate rate limits
   - You monitor usage regularly

### Healthcare Data Compliance

If you're building healthcare applications:

1. **HIPAA Compliance**
   - Never send PHI (Protected Health Information) to AI APIs without proper BAAs
   - Implement proper encryption for data at rest and in transit
   - Conduct regular security audits

2. **Data Minimization**
   - Only collect and process necessary data
   - Implement proper data retention policies
   - Provide clear privacy notices

3. **Access Controls**
   - Implement proper authentication and authorization
   - Use role-based access control (RBAC)
   - Log all access to sensitive data

## Reporting Security Issues

If you believe you have found a security vulnerability in any GitHub-owned repository, please report it to us through coordinated disclosure.

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, please send an email to opensource-security[@]github.com.

Please include as much of the information listed below as you can to help us better understand and resolve the issue:

  * The type of issue (e.g., buffer overflow, SQL injection, or cross-site scripting)
  * Full paths of source file(s) related to the manifestation of the issue
  * The location of the affected source code (tag/branch/commit or direct URL)
  * Any special configuration required to reproduce the issue
  * Step-by-step instructions to reproduce the issue
  * Proof-of-concept or exploit code (if possible)
  * Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Policy

See [GitHub's Safe Harbor Policy](https://docs.github.com/en/site-policy/security-policies/github-bug-bounty-program-legal-safe-harbor#1-safe-harbor-terms)
