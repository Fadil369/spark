# ✨ Spark الشرارة - Healthcare Startup Builder

**Transform your healthcare startup idea into production-ready code with AI-powered guidance**

Spark الشرارة is a comprehensive, gamified platform that guides healthcare entrepreneurs through a structured six-phase journey—from initial brainstorm to deployed GitHub repository—with intelligent DeepSeek AI assistance that personalizes every step.

## 🚀 What's Inside?

- **AI-Powered Content Generation**: Every piece of content is dynamically generated using DeepSeek AI
- **Full Bilingual Support**: Complete English/Arabic support with RTL layout
- **Gamified Progression**: Earn XP and badges as you build your startup
- **Six Guided Phases**: Brainstorm → Story → Brand → PRD → Code → GitHub
- **Production-Ready Code**: AI-validated, healthcare-compliant code generation
- **Live Code Preview**: Real-time preview with AI enhancement capabilities
- **Personality-Driven AI**: Brand personality quiz customizes all AI outputs
  
## 🧠 Key Features

### 🤖 DeepSeek AI Integration

**Personalized Content Generation:**
- Healthcare concepts tailored to your specific problem
- Unique founder stories with tone customization
- Brand names based on personality archetype
- Comprehensive PRD sections with real data
- Code validation with HIPAA compliance checks
- Automated code enhancement and optimization

**No More Templates:**
- Zero placeholder text or "Coming Soon" messages
- Every output is unique to your startup
- Contextual suggestions based on your journey
- Real-time quality scoring and feedback

### 🌍 Language Support

- **English**: Professional international healthcare terminology
- **Arabic (العربية)**: Complete RTL support with professional medical vocabulary
- **Seamless Switching**: Toggle between languages anytime
- **AI-Aware**: All AI generations respect selected language

### 💻 Code Generation & Validation

- **AI Validation**: Structure, security, performance, accessibility scores
- **AI Enhancement**: Automatic improvements with explanations
- **AI Suggestions**: Actionable recommendations for code quality
- **Live Preview**: Real-time rendering with device viewport testing
- **Healthcare Focus**: HIPAA compliance, accessibility (WCAG 2.1 AA)

## 📖 Documentation

- **[ENV_SETUP.md](./ENV_SETUP.md)**: 🔑 **Environment variables setup guide (START HERE)**
- **[DEEPSEEK_INTEGRATION.md](./DEEPSEEK_INTEGRATION.md)**: Complete DeepSeek AI integration guide
- **[DEEPSEEK_INTEGRATION_SUMMARY.md](./DEEPSEEK_INTEGRATION_SUMMARY.md)**: Technical implementation summary
- **[USER_GUIDE_DEEPSEEK.md](./USER_GUIDE_DEEPSEEK.md)**: User-facing improvements and guide
- **[PRD.md](./PRD.md)**: Complete product requirements document
- **[LANGUAGE_AND_THEME_UPDATES.md](./LANGUAGE_AND_THEME_UPDATES.md)**: Translation and theming details

## 🎮 The Journey

### Phase 1: 🧠 Brainstorm
- Enter your healthcare problem
- AI generates 8 contextual concepts
- Refine into structured concept card
- **Earn**: 100 XP + "Idea Alchemist" badge

### Phase 2: 📖 Story
- Fill in narrative parameters
- AI generates compelling founder story
- Get real-time quality analysis
- **Earn**: 150 XP + "Patient Whisperer" badge

### Phase 3: 🎨 Brand
- Complete personality quiz
- AI generates personalized brand names
- Choose colors and create taglines
- **Earn**: 120 XP + "Identity Shaper" badge

### Phase 4: 📋 PRD
- AI generates all section content
- Edit and improve with AI assistance
- Export as formatted PDF
- **Earn**: 200 XP + "Blueprint Champion" badge

### Phase 5: 💻 Code
- AI generates production-ready code
- Validate with comprehensive analysis
- Enhance with AI optimizations
- Preview live with multiple viewports
- **Earn**: 250 XP + "Code Conjurer" badge

### Phase 6: 🚀 GitHub
- Review your complete journey
- Optional: Create GitHub repository
- View deployment instructions
- **Earn**: 300 XP + "Repo Rocketeer" badge

## 🔧 Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui v4
- **State**: Spark KV (persistent browser storage)
- **AI**: DeepSeek API
- **Icons**: Phosphor Icons
- **Animations**: Framer Motion
- **Build**: Vite
- **Languages**: English + Arabic with i18n

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A DeepSeek API key (get one at [platform.deepseek.com](https://platform.deepseek.com))

### Installation

1. **Clone or download this repository**

2. **Configure Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your DeepSeek API key
   VITE_DEEPSEEK_API_KEY=sk-your-actual-api-key-here
   ```
   
   📖 **See [ENV_SETUP.md](./ENV_SETUP.md) for detailed configuration instructions**

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   - Navigate to `http://localhost:5173` (or the URL shown in terminal)
   - Choose your language (🌐 Globe icon)
   - Click "Start Your Journey"

### Quick Start Guide

1. **Phase 1**: Enter a healthcare problem and let AI guide you
2. **Progress**: Complete each phase to unlock the next
3. **Deploy**: Generate code and optionally create GitHub repo

## 💡 Usage Tips

1. **Be Specific**: "Medication adherence for elderly diabetics" works better than "healthcare app"
2. **Use Full Sentences**: Give AI context and details
3. **Iterate**: Generate multiple times to see different approaches
4. **Review & Edit**: AI provides great starting points—add your expertise
5. **Validate Early**: Run code validation before finalizing
6. **Use Native Language**: Work in the language you're most comfortable with

## 🔐 Privacy & Security

- All data stored locally in browser (Spark KV)
- No server-side storage
- DeepSeek API calls are secure (HTTPS)
- No personally identifiable information collected
- Clear browser data to reset journey

## 🌟 What Makes This Different

**Traditional Approach:**
- ❌ Generic templates
- ❌ Manual content creation
- ❌ One-size-fits-all
- ❌ No validation

**Spark الشرارة:**
- ✅ AI-generated unique content
- ✅ Personalized to your concept
- ✅ Brand personality-driven
- ✅ Healthcare-compliant validation
- ✅ Bilingual support
- ✅ Production-ready output

## 🧹 Just Exploring?

No problem! If you were just checking things out:
- Delete your Spark
- Everything will be cleaned up
- No traces left behind

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

## 🤝 Support

For questions or issues:
1. Check documentation files in this repository
2. Review error messages in browser console
3. Verify DeepSeek API connectivity
4. Clear browser cache and reload

---

**Built with ❤️ for healthcare entrepreneurs worldwide**  
**مبني بحب لرواد الأعمال في مجال الرعاية الصحية في جميع أنحاء العالم**
