# DeepSeek AI - Quick Reference

## API Configuration
```typescript
API Key: sk-21e093bd78c7478e92e1f8cc681dfe5f
Endpoint: https://api.deepseek.com/v1/chat/completions
Model: deepseek-chat
```

## Core Functions

### Content Generation

```typescript
// Healthcare Concepts
import { generatePersonalizedConcepts } from '@/lib/deepseekHelper'
const concepts = await generatePersonalizedConcepts(
  "Managing chronic pain in elderly patients",
  "en" // or "ar"
)
// Returns: ["Pain tracking", "Telemedicine consultations", ...]
```

```typescript
// Concept Refinement
import { refineConceptWithAI } from '@/lib/deepseekHelper'
const concept = await refineConceptWithAI(
  userInput,
  selectedKeywords,
  language
)
// Returns: { problem, targetUsers, solution }
```

```typescript
// Founder Story
import { generatePersonalizedStory } from '@/lib/deepseekHelper'
const story = await generatePersonalizedStory(
  concept,
  { tone: 'empathetic', targetPatient, coreProblem, impact, vision },
  language
)
// Returns: unique narrative string
```

```typescript
// Story Quality
import { analyzeStoryQuality } from '@/lib/deepseekHelper'
const scores = await analyzeStoryQuality(story)
// Returns: { clarity: 85, emotion: 78, healthcare: 92 }
```

```typescript
// Brand Names
import { generateBrandNames } from '@/lib/deepseekHelper'
const names = await generateBrandNames(
  { archetype, tone, values, targetFeeling },
  concept,
  language
)
// Returns: ["MediCare", "HealPath", ...]
```

```typescript
// Taglines
import { generateTaglines } from '@/lib/deepseekHelper'
const taglines = await generateTaglines(brandName, concept, language)
// Returns: ["Health made simple", "Care when you need it", ...]
```

```typescript
// PRD Content
import { generatePRDContent } from '@/lib/deepseekHelper'
const content = await generatePRDContent(
  "Problem Statement",
  productContext,
  existingContent, // or "" for new
  language,
  true // isImprovement
)
// Returns: comprehensive section content
```

### Code Analysis

```typescript
// Code Validation
import { validateCodeWithDeepSeek } from '@/lib/deepseekHelper'
const validation = await validateCodeWithDeepSeek(
  code,
  "javascript",
  "Healthcare startup application for MediTrack"
)
// Returns: {
//   isValid: true,
//   errors: [],
//   warnings: ["Consider lazy loading"],
//   suggestions: ["Add error boundaries"],
//   quality: {
//     structure: 88,
//     security: 92,
//     performance: 85,
//     accessibility: 87,
//     overall: 88
//   }
// }
```

```typescript
// Code Enhancement
import { enhanceCodeWithDeepSeek } from '@/lib/deepseekHelper'
const enhancement = await enhanceCodeWithDeepSeek(
  code,
  "javascript",
  [
    "Healthcare data security",
    "Accessibility (WCAG 2.1 AA)",
    "Performance optimization"
  ]
)
// Returns: {
//   enhancedCode: "...",
//   improvements: ["Added ARIA labels", "Implemented lazy loading"],
//   explanations: ["ARIA labels improve...", "Lazy loading reduces..."]
// }
```

```typescript
// Code Suggestions
import { generateCodeSuggestions } from '@/lib/deepseekHelper'
const suggestions = await generateCodeSuggestions(
  code,
  "javascript",
  "React"
)
// Returns: [
//   "Add input validation for health data",
//   "Implement session timeout for security",
//   "Use React.memo for expensive components",
//   ...
// ]
```

## Using with AIHelper

```typescript
import { createAIHelper } from '@/lib/aiHelper'
import { useLanguage } from '@/contexts/LanguageContext'

const { language } = useLanguage()
const aiHelper = createAIHelper(language)

// All methods automatically use correct language
const concepts = await aiHelper.generateHealthcareConcepts(input)
const concept = await aiHelper.refineConcept(input, keywords)
const story = await aiHelper.generateFounderStory(params)
const scores = await aiHelper.scoreStory(story)
const names = await aiHelper.generateBrandName(personality, concept)
const taglines = await aiHelper.generateTaglines(brandName, concept)
const improved = await aiHelper.improvePRDSection(title, content, context)
const generated = await aiHelper.suggestPRDContent(title, context)
```

## Temperature Guide

| Operation | Temperature | Reasoning |
|-----------|-------------|-----------|
| Concept Generation | 0.8 | Need creativity for diverse ideas |
| Story Writing | 0.8 | Creative, engaging narratives |
| Brand Names | 0.9 | Maximum creativity for unique names |
| Taglines | 0.8 | Memorable, impactful phrases |
| PRD Content | 0.7 | Balanced creativity and structure |
| Code Validation | 0.3 | Analytical, consistent evaluation |
| Code Enhancement | 0.4 | Careful, deliberate improvements |
| Code Suggestions | 0.5 | Balanced practical suggestions |

## Token Limits

| Operation | Max Tokens | Purpose |
|-----------|------------|---------|
| Concepts | 1000 | Quick list generation |
| Story | 2000 | Full narrative |
| Brand Names | 1000 | Name list |
| Taglines | 800 | Short phrases |
| PRD Content | 2000 | Comprehensive sections |
| Code Validation | 2000 | Detailed analysis |
| Code Enhancement | 4000 | Full code rewrite |
| Code Suggestions | 1500 | Multiple suggestions |

## Error Handling Pattern

```typescript
try {
  setLoading(true)
  const result = await generatePersonalizedConcepts(input, language)
  
  if (!result || result.length === 0) {
    throw new Error('No concepts generated')
  }
  
  setData(result)
  successToast('Concepts generated! ✨')
  
} catch (error) {
  console.error('Generation failed:', error)
  toast.error(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  
} finally {
  setLoading(false)
}
```

## Language Handling

```typescript
// Check current language
const { language } = useLanguage()

// Generate in specific language
if (language === 'ar') {
  // All AI content will be in Arabic
  const concepts = await generatePersonalizedConcepts(input, 'ar')
} else {
  // All AI content will be in English
  const concepts = await generatePersonalizedConcepts(input, 'en')
}

// Language affects:
// ✅ Healthcare concepts
// ✅ Concept refinement
// ✅ Founder stories
// ✅ Brand names & taglines
// ✅ PRD content
// ✅ AI feedback messages
// ❌ Code (always English)
```

## Common Patterns

### Generate with Loading State
```typescript
const [isGenerating, setIsGenerating] = useState(false)
const [content, setContent] = useState('')

const handleGenerate = async () => {
  setIsGenerating(true)
  try {
    const result = await generatePersonalizedStory(concept, params, language)
    setContent(result)
    successToast('Story generated! ✨')
  } catch (error) {
    toast.error(`Failed: ${error.message}`)
  } finally {
    setIsGenerating(false)
  }
}
```

### Regenerate on Demand
```typescript
<Button 
  onClick={handleGenerate}
  disabled={isGenerating}
>
  {isGenerating ? 'Generating...' : 'Generate with AI'}
</Button>
```

### Display Quality Scores
```typescript
const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

<div className={getScoreColor(validation.quality.overall)}>
  {validation.quality.overall}/100
</div>
```

### Show AI Suggestions
```typescript
{suggestions.map((suggestion, idx) => (
  <div key={idx} className="flex items-start gap-2">
    <Lightbulb className="w-4 h-4 text-accent" />
    <p>{suggestion}</p>
  </div>
))}
```

## Testing Checklist

- [ ] Test concept generation in English
- [ ] Test concept generation in Arabic
- [ ] Test story with empathetic tone
- [ ] Test story with scientific tone
- [ ] Test brand name generation
- [ ] Test tagline generation
- [ ] Test PRD content generation
- [ ] Test PRD content improvement
- [ ] Test code validation
- [ ] Test code enhancement
- [ ] Test code suggestions
- [ ] Test language switching
- [ ] Test error handling
- [ ] Test with invalid inputs
- [ ] Test with empty responses

## Debugging Tips

1. **Check Browser Console**: All errors logged with context
2. **Verify API Key**: Ensure `DEEPSEEK_API_KEY` is valid
3. **Check Network Tab**: View request/response in DevTools
4. **Test Language**: Ensure `language` parameter is correct
5. **Validate Input**: Ensure input strings are not empty
6. **Check Token Limits**: Large requests may timeout
7. **Review Error Messages**: DeepSeek returns detailed errors

## Performance Tips

1. **Cache Results**: Use `useKV` to store generated content
2. **Debounce Inputs**: Don't regenerate on every keystroke
3. **Show Loading States**: Use spinners/skeletons during generation
4. **Handle Errors Gracefully**: Provide retry options
5. **Optimize Token Usage**: Request only what's needed
6. **Batch Operations**: Combine related requests when possible

## Best Practices

✅ **DO:**
- Provide context in prompts
- Handle errors gracefully
- Show loading states
- Cache generated content
- Allow regeneration
- Test in both languages
- Validate responses

❌ **DON'T:**
- Hardcode language strings
- Ignore error responses
- Block UI during generation
- Request excessive tokens
- Skip response validation
- Assume API availability
- Forget timeout handling
