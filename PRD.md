# Planning Guide

HealFounder is a gamified, story-driven platform that transforms the messy early-stage healthcare startup journey into a satisfying, level-based progression system where aspiring founders brainstorm ideas, craft narratives, build brands, write PRDs, generate code, and push to GitHub—all with AI assistance.

**Experience Qualities**:
1. **Empowering** - Every interaction makes the user feel capable of building something real, with AI as a helpful sidekick rather than the hero; supports users in their native language (Arabic or English)
2. **Progressive** - Clear visual advancement through locked and unlocked stages creates momentum and achievement
3. **Playful** - Healthcare startup building shouldn't feel intimidating; game mechanics, badges, and delightful micro-interactions keep it fun

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a multi-phase application with persistent state, AI integration via Spark's LLM API, dynamic content generation, visual progression system, complex data modeling across six distinct stages, internationalization with RTL support, and persistent gamification mechanics.

## Essential Features

**Internationalization System (Arabic/English)**
- Functionality: Full bilingual support with Arabic (RTL) and English (LTR) language switching, comprehensive translations for all UI elements, automatic RTL layout adaptation
- Purpose: Make the platform accessible to Arabic-speaking healthcare entrepreneurs across the Middle East and North Africa, supporting both Western and Arabic user experiences
- Trigger: User clicks language toggle in header, or browser/localStorage language preference
- Progression: User clicks Globe icon → Language switches → UI re-renders with translated text → Layout adapts to RTL/LTR → Preference saved to localStorage
- Success criteria: All text translates accurately, RTL layout feels natural, language persists across sessions, no broken layouts in either direction

**Phase Navigation System**
- Functionality: Sequential unlocking of 6 phases (Brainstorm → Story → Brand → PRD → Code → GitHub), with visual progress indicator, horizontal timeline on desktop, vertical list on mobile
- Purpose: Creates clear structure and prevents overwhelm by guiding users through a proven process
- Trigger: User completes previous phase or views dashboard
- Progression: Dashboard → Select active/next phase → Phase-specific interface → Complete phase → Unlock next → Return to dashboard
- Success criteria: Users can navigate between completed phases, see locked future phases, understand their current position, and navigate intuitively on mobile

**Phase 1: Brainstorm Canvas**
- Functionality: Freeform text input for healthcare problems, AI-generated related concepts as interactive bubbles, concept card creation
- Purpose: Extract and refine healthcare startup ideas through exploration
- Trigger: User clicks "Start Brainstorming" or enters Brainstorm phase
- Progression: Enter keywords → AI generates related terms → User explores bubbles → AI suggests concept variations → User creates Concept Card → Unlock Story phase
- Success criteria: User can input terms, see AI suggestions, and generate a saved concept that includes problem, target users, and solution draft

**Phase 2: Story Builder**
- Functionality: Fill-in-the-blanks narrative template, tone slider, AI-generated patient journey, story quality scoring
- Purpose: Transform concept into compelling founder story
- Trigger: Complete Brainstorm phase
- Progression: Select story template → Fill narrative beats → Adjust tone slider → AI generates full story → User edits → AI scores clarity/emotion → Save story → Unlock Brand
- Success criteria: Complete story with problem, impact, vision that scores above threshold for healthcare specificity

**Phase 3: Brand Studio**
- Functionality: AI-powered brand personality quiz, personalized name generation from healthcare vocabulary, color palette selector, tagline generator, logo icon picker
- Purpose: Create instant visual identity without design skills, guided by personality insights
- Trigger: Complete Story phase
- Progression: Complete personality quiz (6 questions) → AI analyzes responses → Generate personalized names → Pick favorite → Select color scheme → Choose icon → Generate taglines → Finalize brand → Unlock PRD
- Success criteria: User has complete brand kit (name, colors, logo, tagline, personality profile) stored as JSON

**Phase 4: PRD Workshop**
- Functionality: Section-by-section PRD builder with personality-tailored templates, AI co-author that matches brand tone, feature card swiper, regulatory checklist, PDF export with personality-matched formatting
- Purpose: Build investor-ready PRD without blank-page paralysis, customized to brand personality, with professional PDF output for sharing
- Trigger: Complete Brand phase
- Progression: View personality profile → Navigate PRD sections → Use personality-tailored templates → AI drafts content matching brand tone → User edits inline → Check regulatory items → View completeness score → Export as formatted PDF → Save PRD → Unlock Code
- Success criteria: All PRD sections filled with content matching brand personality, completeness meter shows "Investor Ready", document is structured and coherent, PDF export applies personality-specific styling and formatting

**Phase 5: Code Generator**
- Functionality: AI-powered code generation with architecture template selection (landing page, web app, or admin dashboard), PRD-based customization, brand personality integration, feature prioritization, technical recommendations, security considerations, code preview with file browser, enhancement options
- Purpose: Transform PRD into production-ready, downloadable code that reflects brand personality and includes intelligent architectural decisions
- Trigger: Complete PRD phase
- Progression: Review brand personality → Select template type (landing/webapp/dashboard) → AI analyzes requirements and provides recommendations → Customize features (auth, forms, charts, accessibility, animations) → Select priority features from PRD → Generate AI-powered code → Preview code structure and files → Optional AI enhancements (error handling, mobile optimization, SEO, performance) → Complete and unlock GitHub phase
- Success criteria: User receives production-ready code files with brand colors, personality-matched design, intelligent architecture, comprehensive comments, and ability to copy/download all files

**Phase 6: GitHub Integration**
- Functionality: Direct GitHub repository creation with generated code files, automatic README generation, repository configuration (public/private), real-time creation status, success confirmation with repository link
- Purpose: Enable users to push their generated code directly to GitHub, creating a real repository they can access, share, and deploy
- Trigger: Complete Code phase
- Progression: View journey summary → Configure repository name and visibility → Create repository → Upload code files and README → Show success with GitHub link → Provide next steps (clone, view on GitHub, settings) → Complete journey
- Success criteria: User creates a real GitHub repository with all generated files, receives a working repository URL, unlocks "Repo Rocketeer" badge, can access and manage their code on GitHub

**Gamification Engine**
- Functionality: XP tracking, badge awards, level progression (1-10), milestone celebrations, streak tracking, persistent state via Spark's useKV hook
- Purpose: Create engagement and reward progress while maintaining data across sessions
- Trigger: Complete any phase milestone or special action
- Progression: User action → XP calculation → Badge check → Update journey state → Award notification → Update dashboard → Persist to key-value store
- Success criteria: Dashboard shows current XP, level, badges earned, progress bar, and all state persists across page refreshes and sessions

**AI Assistance System**
- Functionality: Context-aware suggestions in each phase using Spark's LLM API, regeneration options, edit capabilities
- Purpose: Accelerate creation while keeping user in control
- Trigger: User reaches generation point in any phase
- Progression: User provides input → AI generates suggestions → User reviews → Accept/regenerate/edit → Save final version
- Success criteria: AI suggestions are clearly marked, users can iterate, and final content feels personalized

## Edge Case Handling

- **Internationalization Edge Cases** - Ensure long Arabic text wraps properly, numbers display correctly in RTL, icons maintain proper alignment in both directions
- **Incomplete Phase Data** - Allow users to save progress mid-phase and resume later without losing work
- **AI Generation Failures** - Show friendly error messages with retry option and fallback manual input
- **Navigation to Locked Phases** - Display "locked" state with requirements clearly shown
- **Empty Brainstorm Input** - Provide example healthcare problems as starting inspiration
- **Long AI Generation Times** - Show loading states with progress indicators and healthcare facts
- **Multiple Projects** - Allow viewing dashboard with project list, but focus MVP on single active journey
- **Theme Persistence** - Dark/light mode preferences saved to localStorage and synced with system preferences

## Design Direction

The design should feel like a premium healthcare-tech product meets a modern game interface—clean, professional, but with moments of delight. Think Duolingo's progression system meets Notion's polish, with healthcare-specific visual language (pulse lines, stethoscope shapes, clean medical aesthetics). The experience should feel safe and trustworthy while being genuinely fun. Full support for RTL (Arabic) and LTR (English) layouts ensures the interface feels natural regardless of language preference, with dark mode support for comfortable extended use.

## Color Selection

A modern healthcare palette that balances clinical trust with innovative energy, using medical-inspired colors with high contrast for clarity.

- **Primary Color**: Medical teal `oklch(0.65 0.12 200)` - Communicates healthcare trust and innovation without feeling sterile
- **Secondary Colors**: Deep navy `oklch(0.25 0.05 250)` for structure and seriousness; Soft lavender `oklch(0.88 0.08 280)` for creative phases
- **Accent Color**: Vibrant pulse pink `oklch(0.68 0.20 350)` - Energetic highlight for CTAs, celebrations, and achievement moments
- **Foreground/Background Pairings**: 
  - Background (Clean white `oklch(0.99 0 0)`): Primary text navy `oklch(0.20 0.05 250)` - Ratio 13.8:1 ✓
  - Primary (Medical teal `oklch(0.65 0.12 200)`): White text `oklch(1 0 0)` - Ratio 4.9:1 ✓
  - Accent (Pulse pink `oklch(0.68 0.20 350)`): White text `oklch(1 0 0)` - Ratio 5.2:1 ✓
  - Secondary (Deep navy `oklch(0.25 0.05 250)`): White text `oklch(1 0 0)` - Ratio 11.4:1 ✓

## Font Selection

Typography should communicate both medical professionalism and approachable modernity—clean, highly legible, with a touch of personality for the gaming elements.

- **Typographic Hierarchy**:
  - H1 (Phase Titles): Space Grotesk Bold / 36px / -0.02em letter spacing / 1.1 line height
  - H2 (Section Headers): Space Grotesk SemiBold / 24px / -0.01em letter spacing / 1.2 line height
  - H3 (Card Titles): Inter SemiBold / 18px / normal spacing / 1.3 line height
  - Body (Content): Inter Regular / 16px / normal spacing / 1.6 line height
  - Small (Labels/Badges): Inter Medium / 14px / 0.01em spacing / 1.4 line height
  - Code (PRD/Tech): JetBrains Mono / 15px / normal spacing / 1.5 line height

## Animations

Animations should feel purposeful and healthcare-inspired—smooth, confident, with occasional pulse-like rhythms that reference heartbeat monitors. Use motion to guide attention through complex multi-phase flows, celebrate achievements with confetti and badge reveals, and provide micro-interactions on hover/tap that make every element feel responsive. Keep transitions quick (200-300ms) except for celebration moments which can be more dramatic (500-800ms).

## Component Selection

- **Components**: 
  - Card for phase containers and concept/story/brand displays with shadow hover states
  - Button with primary (medical teal), secondary (outline), and destructive variants
  - Progress for phase completion and XP bars with pulse animation on update
  - Badge for achievement indicators and status labels
  - Tabs for PRD section navigation
  - Dialog for celebration modals and badge award reveals
  - Slider for story tone adjustment
  - Input and Textarea for user content creation
  - Separator for visual section breaks
  - ScrollArea for long generated content
  - Tooltip for helper text and locked phase explanations
  - Sonner (toast notifications) for success/error feedback
  
- **Customizations**: 
  - Custom phase navigation component with locked/unlocked states and connecting progress lines
  - Animated concept bubble components with drag-free click interactions for brainstorming
  - Feature card swiper using transform animations (not a separate library)
  - Achievement badge showcase with staggered reveal animations
  - Custom progress ring for level advancement using SVG
  - AILoadingScreen component with rotating healthcare facts in both English and Arabic
  - LanguageProvider context for managing internationalization state and RTL layout
  - CelebrationDialog with confetti effects for phase completion
  - Persistent state management using Spark's useKV hook for journey data
  
- **States**: 
  - Buttons show clear hover lift (translateY -1px, shadow increase), active press (scale 0.98), disabled (opacity 0.5)
  - Cards have subtle hover elevation and border color shift
  - Phase navigation items show clear locked (opacity 0.4, lock icon), active (primary border, glow), completed (checkmark, muted state)
  - Input fields have focus rings in primary color with smooth transition
  
- **Icon Selection**: 
  - Phosphor icons throughout - Lightbulb for brainstorm, BookOpen for story, Palette for brand, FileText for PRD, Code for generation, GithubLogo for push
  - Trophy, Star, Medal, Crown for achievements
  - Lock for locked phases, Check for completed, ArrowRight for progression
  - Globe for language switching, Sun/Moon for theme toggle
  
- **Spacing**: 
  - Container padding: p-6 (medium screens), p-4 (mobile)
  - Section gaps: gap-8 (between major sections), gap-4 (between related items), gap-2 (tight groupings)
  - Card internal padding: p-6
  - RTL-aware spacing that mirrors appropriately for Arabic layout
  
- **Mobile**: 
  - Phase navigation switches from horizontal timeline to vertical list on mobile
  - Dashboard grid goes from 3-column to single column
  - Side-by-side editing layouts stack vertically
  - Floating action buttons for primary phase actions on mobile
  - Touch-friendly 44px minimum tap targets
  - Language and theme toggles remain easily accessible in mobile header

## Technical Architecture

**State Management**
- Primary data persistence: Spark's `useKV` hook for journey state (`healfounder-journey`)
- Browser localStorage: Language preference (`healfounder-lang`) and theme preference (`healfounder-theme`)
- React Context: LanguageContext for internationalization state and translations
- Component-level state: useState for UI interactions, form inputs, and loading states

**Internationalization Implementation**
- Translation system: Centralized translation objects in `lib/i18n.ts` with type-safe keys
- RTL support: Dynamic `dir` attribute on document root, CSS logical properties for layout
- Language persistence: localStorage with fallback to 'en'
- Component structure: LanguageProvider wraps app, useLanguage hook for accessing translations
- Translated components: All user-facing text uses `t` object from context

**Data Models**
- Journey: Main container with phases, concept, story, brand, PRD, code, githubRepo, gameState
- PhaseStatus: Tracks completion and unlock state for each of 6 phases
- GameState: XP, level, badges array, streak tracking
- ConceptCard, Story, Brand, PRD, GeneratedCode, GitHubRepo: Phase-specific data structures
- Badge: Achievement definitions with earned status and timestamps

**Key Libraries & Tools**
- React 19.2.0 with TypeScript
- Spark SDK: useKV hook, LLM API (spark.llm, spark.llmPrompt), user API (spark.user)
- UI Components: shadcn v4 (Radix UI primitives)
- Icons: @phosphor-icons/react
- Styling: Tailwind CSS v4 with oklch color system
- Animations: framer-motion for micro-interactions and celebrations
- Date handling: date-fns
- Forms: react-hook-form with zod validation
- Notifications: sonner for toast messages

## Implementation Status

**Completed Features** ✅
- Core application architecture with TypeScript
- Internationalization system (English + Arabic) with RTL support
- LanguageProvider context and translation system
- Dark/light theme toggle with system preference detection
- Main dashboard with phase navigation
- Gamification engine (XP, levels, badges, streaks)
- Phase navigation component with locked/unlocked states
- Badge showcase with visual achievements
- Game stats display (level, XP, badges)
- Celebration dialog with confetti effects
- AI loading screen with healthcare facts (bilingual)
- Persistent state management via Spark's useKV
- Brainstorm phase with AI concept generation (partial)
- Story phase with tone selection and AI generation (partial)
- Brand phase structure (placeholder)
- PRD phase structure (placeholder)
- Code generation phase structure (placeholder)
- GitHub integration phase structure (placeholder)
- Error boundary with fallback UI
- Responsive mobile layout
- Custom theme with medical-inspired color palette

**In Development** 🚧
- Full Brainstorm phase implementation (AI bubble interactions, concept refinement)
- Complete Story phase (narrative templates, quality scoring)
- Brand phase (personality quiz, name generation, color palette, logo picker)
- PRD phase (section builder, templates, completeness scoring, PDF export)
- Code generation (template selection, file generation, preview)
- GitHub integration (repository creation, file upload, authentication)

**Planned Enhancements** 📋
- Multi-project support
- Streak tracking with reminder notifications
- Additional badge achievements
- Export journey as shareable link
- Community features (sharing concepts/stories)
- AI model selection per phase
- Enhanced analytics dashboard
- Onboarding tutorial
- Accessibility improvements (ARIA labels, keyboard navigation)
- Performance optimizations for large journeys
