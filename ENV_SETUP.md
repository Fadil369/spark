# Environment Variables Configuration Guide

This document explains how to configure the environment variables required for Spark الشرارة to function properly.

## Required Environment Variables

### DeepSeek API Configuration

The application uses the DeepSeek API for AI-powered features including:
- Healthcare concept generation
- Brand name and tagline suggestions
- Founder story generation
- Code validation and enhancement
- PRD content generation

## Setup Instructions

### 1. Get Your DeepSeek API Key

1. Visit [DeepSeek Platform](https://platform.deepseek.com)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (it starts with `sk-`)

### 2. Create Your .env File

1. Copy the `.env.example` file to create your own `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file in your text editor

3. Replace `your_deepseek_api_key_here` with your actual API key:
   ```env
   VITE_DEEPSEEK_API_KEY=sk-your-actual-api-key-here
   ```

### 3. Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_DEEPSEEK_API_KEY` | Yes | - | Your DeepSeek API key for AI features |
| `VITE_DEEPSEEK_API_URL` | No | `https://api.deepseek.com/v1/chat/completions` | DeepSeek API endpoint URL |

## Security Best Practices

### ⚠️ Important Security Notes

1. **Never commit your `.env` file to version control**
   - The `.env` file is already included in `.gitignore`
   - Always use `.env.example` as a template without real keys

2. **Keep your API key secret**
   - Don't share your API key in public forums, issues, or pull requests
   - Don't include it in screenshots or screen recordings
   - Rotate your API key if you suspect it has been compromised

3. **Use different keys for different environments**
   - Development: Use a separate API key with lower rate limits
   - Production: Use a dedicated API key with appropriate limits

4. **Monitor your API usage**
   - Regularly check your DeepSeek dashboard for usage
   - Set up usage alerts if available
   - Review API logs for suspicious activity

## Troubleshooting

### Error: "DeepSeek API key is not configured"

**Cause:** The `VITE_DEEPSEEK_API_KEY` environment variable is not set or is set to the placeholder value.

**Solution:**
1. Ensure you've created a `.env` file in the project root
2. Verify the API key is correctly set in `.env`
3. Restart the development server after adding the environment variable
4. Check that the API key starts with `sk-`

### Error: "Failed to fetch" or API connection errors

**Possible causes and solutions:**

1. **Invalid API Key**
   - Verify your API key is correct
   - Check if the key has been revoked in the DeepSeek dashboard
   - Generate a new API key if needed

2. **Network Issues**
   - Check your internet connection
   - Verify that `https://api.deepseek.com` is accessible
   - Check if there are any firewall or proxy issues

3. **Rate Limiting**
   - You may have exceeded your API rate limits
   - Check your DeepSeek dashboard for usage information
   - Wait a few minutes and try again

### API Key Not Loading After Setup

**Cause:** Vite requires a restart to load new environment variables.

**Solution:**
1. Stop the development server (Ctrl+C)
2. Restart with `npm run dev`
3. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

## Development vs Production

### Development Environment

For local development, use the `.env` file:

```env
VITE_DEEPSEEK_API_KEY=sk-your-dev-api-key
```

### Production Environment

For production deployments, set environment variables through your hosting platform:

#### Vercel
```bash
vercel env add VITE_DEEPSEEK_API_KEY
```

#### Netlify
Set in: Site settings → Environment variables

#### GitHub Pages
Not recommended for applications requiring API keys (client-side exposure)

#### Railway / Render
Set in: Settings → Environment Variables

## Environment Variable Naming Convention

All environment variables that need to be accessible in the browser must be prefixed with `VITE_` when using Vite as the build tool. This is a Vite security feature that prevents accidental exposure of server-side environment variables.

## Checking Your Configuration

To verify your environment variables are loaded correctly:

1. Start the development server
2. Open browser console
3. Try using an AI-powered feature (e.g., brainstorming concepts)
4. If the API key is configured correctly, the feature will work
5. If not, you'll see a clear error message with instructions

## Support

If you continue to experience issues:

1. Check the browser console for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure you're using the latest version of the application
4. Review the DeepSeek API documentation for any changes

## Additional Resources

- [DeepSeek API Documentation](https://platform.deepseek.com/docs)
- [Vite Environment Variables Guide](https://vitejs.dev/guide/env-and-mode.html)
- [Project README](./README.md)
