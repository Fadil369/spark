# Planning Guide

HealFounder is a gamified, story-driven platform that transforms the messy early-stage healthcare startup journey into a satisfying, level-based progression system where aspiring founders brainstorm ideas, craft narratives, build brands, write PRDs, generate code, and push to GitHub—all with AI assistance.

**Experience Qualities**:
1. **Empowering** - Every interaction makes the user feel capable of building something real, with AI as a helpful sidekick rather than the hero
2. **Progressive** - Clear visual advancement through locked and unlocked stages creates momentum and achievement
3. **Playful** - Healthcare startup building shouldn't feel intimidating; game mechanics, badges, and delightful micro-interactions keep it fun

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a multi-phase application with persistent state, AI integration via Spark's LLM API, dynamic content generation, visual progression system, and complex data modeling across six distinct stages of the startup journey.

## Essential Features

**Phase Navigation System**
- Functionality: Sequential unlocking of 6 phases (Brainstorm → Story → Brand → PRD → Code → GitHub), with visual progress indicator
- Purpose: Creates clear structure and prevents overwhelm by guiding users through a proven process
- Trigger: User completes previous phase or views dashboard
- Progression: Dashboard → Select active/next phase → Phase-specific interface → Complete phase → Unlock next → Return to dashboard
- Success criteria: Users can navigate between completed phases, see locked future phases, and understand their current position

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
- Functionality: AI name generation from healthcare vocabulary, color palette selector, tagline generator, logo icon picker
- Purpose: Create instant visual identity without design skills
- Trigger: Complete Story phase
- Progression: Generate names → Pick favorite → Select color scheme → Choose icon → Generate taglines → Finalize brand → Unlock PRD
- Success criteria: User has complete brand kit (name, colors, logo, tagline) stored as JSON

**Phase 4: PRD Workshop**
- Functionality: Section-by-section PRD builder with templates, AI co-author for each section, feature card swiper, regulatory checklist
- Purpose: Build investor-ready PRD without blank-page paralysis
- Trigger: Complete Brand phase
- Progression: Navigate PRD sections → AI drafts content → User edits inline → Swipe feature cards → Check regulatory items → View completeness score → Save PRD → Unlock Code
- Success criteria: All PRD sections filled, completeness meter shows "Investor Ready", document is structured and coherent

**Phase 5: Code Generator**
- Functionality: Architecture template selection based on PRD, customization with brand/content, live preview of generated site
- Purpose: Turn PRD into tangible code artifact
- Trigger: Complete PRD phase
- Progression: Review PRD summary → Select template type → AI customizes code → View preview → Adjust settings → Generate final code → Unlock GitHub
- Success criteria: User can see generated HTML/React preview with their brand and content

**Phase 6: GitHub Integration**
- Functionality: Display generated code structure, show commit message, celebration animation
- Purpose: Validate journey completion and provide sense of launch
- Trigger: Complete Code phase
- Progression: View code summary → See mock GitHub push details → Trigger celebration → View journey timeline → Start new journey
- Success criteria: User sees celebration, unlocks "Repo Rocketeer" badge, can review entire journey

**Gamification Engine**
- Functionality: XP tracking, badge awards, level progression (1-10), milestone celebrations, streak tracking
- Purpose: Create engagement and reward progress
- Trigger: Complete any phase milestone or special action
- Progression: User action → XP calculation → Badge check → Award notification → Update dashboard
- Success criteria: Dashboard shows current XP, level, badges earned, and progress bar

**AI Assistance System**
- Functionality: Context-aware suggestions in each phase using Spark's LLM API, regeneration options, edit capabilities
- Purpose: Accelerate creation while keeping user in control
- Trigger: User reaches generation point in any phase
- Progression: User provides input → AI generates suggestions → User reviews → Accept/regenerate/edit → Save final version
- Success criteria: AI suggestions are clearly marked, users can iterate, and final content feels personalized

## Edge Case Handling

- **Incomplete Phase Data** - Allow users to save progress mid-phase and resume later without losing work
- **AI Generation Failures** - Show friendly error messages with retry option and fallback manual input
- **Navigation to Locked Phases** - Display "locked" state with requirements clearly shown
- **Empty Brainstorm Input** - Provide example healthcare problems as starting inspiration
- **Long AI Generation Times** - Show loading states with progress indicators and healthcare facts
- **Multiple Projects** - Allow viewing dashboard with project list, but focus MVP on single active journey

## Design Direction

The design should feel like a premium healthcare-tech product meets a modern game interface—clean, professional, but with moments of delight. Think Duolingo's progression system meets Notion's polish, with healthcare-specific visual language (pulse lines, stethoscope shapes, clean medical aesthetics). The experience should feel safe and trustworthy while being genuinely fun.

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
  
- **Customizations**: 
  - Custom phase navigation component with locked/unlocked states and connecting progress lines
  - Animated concept bubble components with drag-free click interactions for brainstorming
  - Feature card swiper using transform animations (not a separate library)
  - Achievement badge showcase with staggered reveal animations
  - Custom progress ring for level advancement using SVG
  
- **States**: 
  - Buttons show clear hover lift (translateY -1px, shadow increase), active press (scale 0.98), disabled (opacity 0.5)
  - Cards have subtle hover elevation and border color shift
  - Phase navigation items show clear locked (opacity 0.4, lock icon), active (primary border, glow), completed (checkmark, muted state)
  - Input fields have focus rings in primary color with smooth transition
  
- **Icon Selection**: 
  - Phosphor icons throughout - Lightbulb for brainstorm, BookOpen for story, Palette for brand, FileText for PRD, Code for generation, GithubLogo for push
  - Trophy, Star, Medal, Crown for achievements
  - Lock for locked phases, Check for completed, ArrowRight for progression
  
- **Spacing**: 
  - Container padding: p-6 (medium screens), p-4 (mobile)
  - Section gaps: gap-8 (between major sections), gap-4 (between related items), gap-2 (tight groupings)
  - Card internal padding: p-6
  
- **Mobile**: 
  - Phase navigation switches from horizontal timeline to vertical list on mobile
  - Dashboard grid goes from 3-column to single column
  - Side-by-side editing layouts stack vertically
  - Floating action buttons for primary phase actions on mobile
  - Touch-friendly 44px minimum tap targets
