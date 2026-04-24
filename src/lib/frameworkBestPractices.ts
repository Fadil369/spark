export type FrameworkType = 'html' | 'react' | 'vue'
export type TemplateType = 'landing' | 'webapp' | 'dashboard'

export interface FrameworkBestPractices {
  framework: FrameworkType
  name: string
  description: string
  coreGuidelines: string[]
  structurePatterns: string[]
  securityPractices: string[]
  performanceOptimizations: string[]
  accessibilityGuidelines: string[]
  stateManagement: string[]
  componentArchitecture: string[]
  stylingApproach: string[]
  testingStrategy: string[]
  healthcareSpecific: string[]
}

export const FRAMEWORK_BEST_PRACTICES: Record<FrameworkType, FrameworkBestPractices> = {
  html: {
    framework: 'html',
    name: 'HTML/CSS/JavaScript',
    description: 'Modern vanilla web development with web standards',
    coreGuidelines: [
      'Use semantic HTML5 elements (header, nav, main, section, article, aside, footer)',
      'Progressive enhancement: ensure core functionality works without JavaScript',
      'Use ES6+ JavaScript features: const/let, arrow functions, template literals, modules',
      'Implement CSS custom properties for theming and maintainability',
      'Follow BEM or similar CSS naming methodology for scalable styles',
      'Use native form validation with HTML5 attributes before adding JavaScript',
      'Leverage modern CSS features: Grid, Flexbox, Container Queries, :has(), :is()'
    ],
    structurePatterns: [
      'Organize files: index.html, styles/ (reset.css, variables.css, layout.css, components.css), scripts/ (utils.js, app.js)',
      'Keep JavaScript modular with ES6 modules and separate concerns',
      'Use defer or async for script loading, place scripts before </body>',
      'Implement a clear visual hierarchy using semantic heading levels (h1-h6)',
      'Group related CSS rules in logical sections with comments'
    ],
    securityPractices: [
      'Sanitize all user inputs before rendering to DOM (use textContent, not innerHTML for user data)',
      'Implement Content Security Policy (CSP) meta tags',
      'Use HTTPS for all external resources',
      'Validate and sanitize form data on both client and server',
      'For healthcare: never store PHI in localStorage/sessionStorage without encryption',
      'Implement CSRF tokens for form submissions'
    ],
    performanceOptimizations: [
      'Lazy load images using loading="lazy" attribute',
      'Use modern image formats (WebP, AVIF) with fallbacks',
      'Minify and bundle CSS/JS for production',
      'Implement critical CSS inline for above-the-fold content',
      'Use CSS animations instead of JavaScript for simple transitions',
      'Debounce scroll/resize event handlers',
      'Cache static assets with appropriate Cache-Control headers'
    ],
    accessibilityGuidelines: [
      'Include lang attribute on html element',
      'Provide text alternatives for images using alt attributes',
      'Ensure keyboard navigation with proper tabindex and focus management',
      'Use ARIA labels only when semantic HTML is insufficient',
      'Maintain color contrast ratio of 4.5:1 for normal text, 3:1 for large text',
      'Include skip navigation link as first focusable element',
      'Test with screen readers (NVDA, JAWS, VoiceOver)',
      'Provide clear focus indicators with visible outlines'
    ],
    stateManagement: [
      'Use data attributes for component state',
      'Leverage sessionStorage/localStorage for client-side persistence',
      'Implement simple state management with JavaScript objects',
      'Use custom events for component communication',
      'Keep state minimal and close to where it\'s used'
    ],
    componentArchitecture: [
      'Create reusable functions for common UI patterns',
      'Use template literals or <template> elements for HTML generation',
      'Implement simple component pattern with init/render/destroy lifecycle',
      'Keep components small and focused on single responsibility',
      'Use event delegation for dynamic content'
    ],
    stylingApproach: [
      'Mobile-first responsive design with min-width media queries',
      'Use relative units (rem, em, %, vh/vw) for scalability',
      'Implement CSS Grid for page layouts, Flexbox for component layouts',
      'Create utility classes for common patterns (e.g., .flex-center, .text-large)',
      'Use CSS logical properties for international support',
      'Implement consistent spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)'
    ],
    testingStrategy: [
      'Manual testing in multiple browsers (Chrome, Firefox, Safari, Edge)',
      'Use browser DevTools for debugging and performance profiling',
      'Test keyboard navigation thoroughly',
      'Validate HTML with W3C Validator',
      'Test on real devices for touch interactions'
    ],
    healthcareSpecific: [
      'Display clear privacy policies and HIPAA compliance notices',
      'Use secure connections (HTTPS) for all pages',
      'Implement session timeouts for security',
      'Include accessibility features for diverse patient populations',
      'Provide large, easy-to-read fonts and high contrast modes',
      'Include medication/appointment reminders using native notifications API',
      'Ensure forms are clear and have inline validation with helpful error messages'
    ]
  },
  react: {
    framework: 'react',
    name: 'React + TypeScript',
    description: 'Component-based UI with static typing and modern patterns',
    coreGuidelines: [
      'Use functional components with hooks (useState, useEffect, useContext, useCallback, useMemo)',
      'Implement TypeScript for type safety: define interfaces for props, state, and API responses',
      'Follow React 18+ best practices: concurrent features, automatic batching, startTransition',
      'Use strict mode during development to catch potential issues',
      'Prefer composition over inheritance for component reusability',
      'Keep components pure: same props = same output',
      'Use key prop correctly in lists (stable, unique identifiers, not array index for dynamic lists)'
    ],
    structurePatterns: [
      'Organize by feature: src/components/, src/hooks/, src/contexts/, src/utils/, src/types/',
      'Colocate related files: MyComponent.tsx, MyComponent.module.css, MyComponent.test.tsx',
      'Use index.ts files for clean imports (barrel exports)',
      'Create custom hooks for reusable stateful logic',
      'Keep components small (<200 lines), extract sub-components as needed',
      'Use absolute imports with path aliases (@/components, @/utils)',
      'Separate container (logic) from presentational (UI) components when complexity increases'
    ],
    securityPractices: [
      'Sanitize user input with DOMPurify before using dangerouslySetInnerHTML (avoid when possible)',
      'Validate all props with TypeScript interfaces and runtime validation (zod, yup)',
      'Use environment variables for API keys, never commit secrets',
      'Implement proper authentication with httpOnly cookies or secure token storage',
      'For healthcare: encrypt PHI before storing, use secure authentication flows (OAuth 2.0)',
      'Validate and sanitize form inputs on both client and server',
      'Implement rate limiting and CSRF protection for API calls'
    ],
    performanceOptimizations: [
      'Memoize expensive calculations with useMemo',
      'Prevent unnecessary re-renders with React.memo and useCallback',
      'Lazy load routes and components with React.lazy and Suspense',
      'Virtualize long lists with react-window or react-virtual',
      'Optimize images with next/image or similar (lazy loading, responsive, WebP)',
      'Use code splitting to reduce initial bundle size',
      'Profile with React DevTools Profiler to identify bottlenecks',
      'Debounce/throttle expensive operations (search, scroll handlers)',
      'Use production builds for deployment (minification, tree-shaking)'
    ],
    accessibilityGuidelines: [
      'Use semantic HTML elements within JSX',
      'Manage focus programmatically with useRef and focus() for modals, dropdowns',
      'Announce dynamic content changes with ARIA live regions',
      'Ensure all interactive elements are keyboard accessible',
      'Use libraries like react-aria or Radix UI for accessible primitives',
      'Test with jest-axe for automated accessibility testing',
      'Implement proper heading hierarchy in each route',
      'Provide loading states and skeleton screens for async operations'
    ],
    stateManagement: [
      'Use useState for local component state',
      'Use useReducer for complex state logic (multiple sub-values)',
      'Leverage Context API for global state (theme, auth, language)',
      'Consider state management libraries for complex apps: Zustand (lightweight), Redux Toolkit (enterprise)',
      'Keep state as local as possible, lift only when needed',
      'Use React Query or SWR for server state management (caching, refetching)',
      'Implement optimistic UI updates for better perceived performance',
      'Use useRef for mutable values that don\'t trigger re-renders'
    ],
    componentArchitecture: [
      'Create reusable UI components in src/components/ui/',
      'Build feature-specific components in src/components/features/',
      'Extract business logic into custom hooks',
      'Use compound components pattern for flexible APIs (e.g., Tabs, Accordion)',
      'Implement render props or children as function for advanced patterns',
      'Use TypeScript generics for type-safe reusable components',
      'Follow container/presenter pattern for complex features',
      'Create Higher-Order Components (HOCs) sparingly, prefer hooks'
    ],
    stylingApproach: [
      'Use CSS Modules or styled-components for component-scoped styles',
      'Implement Tailwind CSS for utility-first approach with rapid development',
      'Use CSS-in-JS (styled-components, emotion) for dynamic styling',
      'Create a centralized theme with CSS variables or styled-components ThemeProvider',
      'Implement dark mode with CSS variables and context/localStorage persistence',
      'Use classnames or clsx library for conditional class application',
      'Follow mobile-first responsive design',
      'Create reusable styled components for design system consistency'
    ],
    testingStrategy: [
      'Write unit tests with Jest and React Testing Library',
      'Test user interactions, not implementation details',
      'Use @testing-library/user-event for realistic user interactions',
      'Mock API calls with MSW (Mock Service Worker)',
      'Implement integration tests for critical user flows',
      'Achieve >80% code coverage for business logic',
      'Use Storybook for component development and visual testing',
      'Implement E2E tests with Playwright or Cypress for critical paths'
    ],
    healthcareSpecific: [
      'Build HIPAA-compliant forms with proper validation and encryption',
      'Implement role-based access control (RBAC) for patient/provider views',
      'Create patient dashboards with real-time health data visualization',
      'Use React Query for caching patient data with appropriate stale times',
      'Implement audit logging for all PHI access',
      'Build accessible forms with clear error messages and inline validation',
      'Create telehealth interfaces with WebRTC for video consultations',
      'Implement medication reminders with Web Notifications API',
      'Use React Hook Form with zod for robust form validation',
      'Create multi-step forms with progress indicators for patient onboarding'
    ]
  },
  vue: {
    framework: 'vue',
    name: 'Vue 3 + TypeScript',
    description: 'Progressive framework with composition API and reactivity',
    coreGuidelines: [
      'Use Composition API with <script setup> for cleaner, more maintainable code',
      'Implement TypeScript with proper type definitions for props, emits, and composables',
      'Use Vue 3 reactivity system: ref, reactive, computed, watch, watchEffect',
      'Follow single-file component (SFC) structure: <script>, <template>, <style>',
      'Use provide/inject for dependency injection across component tree',
      'Leverage Vue 3 Teleport for modals, tooltips, and notifications',
      'Use v-model for two-way binding sparingly, prefer explicit prop/emit patterns'
    ],
    structurePatterns: [
      'Organize by feature: src/components/, src/composables/, src/stores/, src/views/, src/utils/',
      'Use .vue extension for single-file components',
      'Create composables (use*.ts) for reusable stateful logic',
      'Implement Pinia for state management (Vue-recommended)',
      'Use Vue Router for navigation with lazy-loaded routes',
      'Keep components focused and small (<250 lines)',
      'Use index.ts for clean exports from feature folders'
    ],
    securityPractices: [
      'Avoid v-html unless absolutely necessary; sanitize with DOMPurify if used',
      'Validate props with runtime validators and TypeScript',
      'Use environment variables (import.meta.env) for configuration',
      'Implement secure authentication with JWT in httpOnly cookies',
      'For healthcare: encrypt PHI data, implement proper access controls',
      'Validate all form inputs on client and server',
      'Use HTTPS for all API calls and resources'
    ],
    performanceOptimizations: [
      'Use v-once for static content that never changes',
      'Implement v-memo for conditional memoization of template sections',
      'Use keep-alive for caching inactive components',
      'Lazy load components with defineAsyncComponent',
      'Use virtual scrolling for long lists (vue-virtual-scroller)',
      'Optimize images with lazy loading and responsive formats',
      'Use computed properties instead of methods in templates for caching',
      'Implement code splitting with dynamic imports',
      'Use shallow reactive (shallowRef, shallowReactive) for large data structures'
    ],
    accessibilityGuidelines: [
      'Use semantic HTML within templates',
      'Manage focus with template refs and nextTick',
      'Implement ARIA attributes dynamically with v-bind',
      'Use Vue announcer plugins for screen reader notifications',
      'Ensure all interactive elements are keyboard accessible',
      'Test with Vue Axe for accessibility violations',
      'Provide loading states and skeleton screens',
      'Implement proper heading hierarchy per route'
    ],
    stateManagement: [
      'Use ref and reactive for local component state',
      'Implement Pinia stores for global state (user, settings, data)',
      'Create composables for shared stateful logic',
      'Use provide/inject for dependency injection',
      'Leverage VueUse composables for common patterns',
      'Keep state as local as possible, globalize only when necessary',
      'Use computed properties for derived state',
      'Implement store actions for async operations and side effects'
    ],
    componentArchitecture: [
      'Build base UI components in src/components/base/',
      'Create feature components in src/components/features/',
      'Extract logic into composables in src/composables/',
      'Use slots for flexible component composition',
      'Implement scoped slots for data sharing to children',
      'Use provide/inject for deep prop drilling avoidance',
      'Create compound components with provide/inject pattern',
      'Use TypeScript generics for type-safe reusable components'
    ],
    stylingApproach: [
      'Use scoped styles in SFCs with <style scoped>',
      'Implement CSS Modules for additional isolation',
      'Use Tailwind CSS with Vue for utility-first approach',
      'Create global styles in src/assets/styles/',
      'Use CSS variables for theming and dark mode',
      'Implement v-bind() in <style> for dynamic styles',
      'Follow mobile-first responsive design',
      'Use deep selectors (:deep()) sparingly for scoped style overrides'
    ],
    testingStrategy: [
      'Write unit tests with Vitest and Vue Test Utils',
      'Test component behavior, not implementation',
      'Use @vue/test-utils for mounting and interacting with components',
      'Mock API calls and composables in tests',
      'Implement integration tests for critical flows',
      'Use Storybook for component development and documentation',
      'Test Pinia stores separately from components',
      'Implement E2E tests with Playwright for critical user paths'
    ],
    healthcareSpecific: [
      'Build HIPAA-compliant patient forms with validation',
      'Implement RBAC with Pinia stores and route guards',
      'Create real-time patient monitoring dashboards',
      'Use composables for health data fetching and caching',
      'Implement audit trails with Pinia plugins',
      'Build accessible medical forms with clear error states',
      'Create appointment scheduling interfaces with Vue Calendar',
      'Implement secure messaging with WebSocket connections',
      'Use VeeValidate with yup for comprehensive form validation',
      'Build multi-step patient intake forms with Vue Router'
    ]
  }
}

export interface TemplateArchitectureGuide {
  template: TemplateType
  name: string
  description: string
  fileStructure: Record<FrameworkType, string[]>
  keyComponents: string[]
  layoutPattern: string
  responsiveStrategy: string
  navigationPattern: string
  dataFlowPattern: string
  healthcareConsiderations: string[]
}

export const TEMPLATE_ARCHITECTURE: Record<TemplateType, TemplateArchitectureGuide> = {
  landing: {
    template: 'landing',
    name: 'Landing Page',
    description: 'Single-page marketing site optimized for conversion',
    fileStructure: {
      html: [
        'index.html (complete page structure)',
        'css/reset.css (browser normalization)',
        'css/variables.css (design tokens: colors, spacing, typography)',
        'css/layout.css (grid, flexbox, responsive breakpoints)',
        'css/components.css (hero, features, testimonials, CTA, footer)',
        'js/app.js (form handling, animations, analytics)',
        'js/utils.js (helpers, validators)'
      ],
      react: [
        'src/App.tsx (main layout component)',
        'src/components/Hero.tsx (value proposition, CTA)',
        'src/components/Features.tsx (feature grid)',
        'src/components/Testimonials.tsx (social proof)',
        'src/components/CTA.tsx (conversion section)',
        'src/components/Footer.tsx (navigation, links)',
        'src/styles/index.css (Tailwind + custom styles)',
        'src/hooks/useForm.ts (form handling)',
        'src/types/index.ts (TypeScript interfaces)'
      ],
      vue: [
        'src/App.vue (main layout)',
        'src/components/HeroSection.vue (value prop)',
        'src/components/FeatureGrid.vue (features)',
        'src/components/TestimonialCarousel.vue (social proof)',
        'src/components/CtaSection.vue (conversion)',
        'src/components/FooterNav.vue (footer)',
        'src/composables/useForm.ts (form logic)',
        'src/assets/styles/main.css (global styles)',
        'src/types/index.ts (type definitions)'
      ]
    },
    keyComponents: [
      'Hero section with headline, subheadline, primary CTA, and visual',
      'Features section with icon-text cards in responsive grid',
      'Social proof section with testimonials or metrics',
      'Benefits section explaining key value propositions',
      'Call-to-action section with form or button',
      'Footer with navigation, legal links, contact info'
    ],
    layoutPattern: 'Vertical scroll, full-width sections with max-width container',
    responsiveStrategy: 'Mobile-first with stacked sections, desktop uses multi-column grids',
    navigationPattern: 'Sticky header with anchor links to sections, smooth scroll behavior',
    dataFlowPattern: 'Static content with form submission to API or email service',
    healthcareConsiderations: [
      'Clear trust signals: certifications, security badges, provider credentials',
      'Patient testimonials with consent and privacy considerations',
      'Prominent privacy policy and HIPAA compliance notices',
      'Accessible contact forms with validation and error messages',
      'Clear value proposition addressing patient pain points',
      'Mobile-optimized for patients accessing on phones',
      'Emergency contact information in footer'
    ]
  },
  webapp: {
    template: 'webapp',
    name: 'Web Application',
    description: 'Multi-page application with authentication and interactive features',
    fileStructure: {
      html: [
        'index.html (app shell)',
        'login.html (authentication page)',
        'dashboard.html (main app interface)',
        'css/reset.css',
        'css/variables.css (design system)',
        'css/layout.css (app shell, sidebar, header)',
        'css/components.css (cards, forms, buttons, modals)',
        'js/auth.js (login, logout, session management)',
        'js/app.js (main app logic)',
        'js/api.js (API client)',
        'js/utils.js (helpers, validation)'
      ],
      react: [
        'src/App.tsx (root with router)',
        'src/pages/Login.tsx (authentication)',
        'src/pages/Dashboard.tsx (main view)',
        'src/pages/Profile.tsx (user settings)',
        'src/components/layout/Header.tsx',
        'src/components/layout/Sidebar.tsx',
        'src/components/ui/Card.tsx',
        'src/components/ui/Button.tsx',
        'src/components/ui/Modal.tsx',
        'src/hooks/useAuth.ts (authentication logic)',
        'src/hooks/useApi.ts (data fetching)',
        'src/contexts/AuthContext.tsx',
        'src/lib/api.ts (API client)',
        'src/types/index.ts'
      ],
      vue: [
        'src/App.vue (root with router-view)',
        'src/views/LoginView.vue',
        'src/views/DashboardView.vue',
        'src/views/ProfileView.vue',
        'src/components/layout/AppHeader.vue',
        'src/components/layout/AppSidebar.vue',
        'src/components/ui/BaseCard.vue',
        'src/components/ui/BaseButton.vue',
        'src/components/ui/BaseModal.vue',
        'src/composables/useAuth.ts',
        'src/composables/useApi.ts',
        'src/stores/auth.ts (Pinia)',
        'src/router/index.ts',
        'src/lib/api.ts'
      ]
    },
    keyComponents: [
      'Authentication pages (login, signup, password reset)',
      'Dashboard with overview metrics and quick actions',
      'Navigation sidebar or header with menu',
      'User profile and settings page',
      'Data entry forms with validation',
      'Data display tables or lists with filtering/sorting',
      'Modal dialogs for confirmations and detail views',
      'Notification/toast system for feedback'
    ],
    layoutPattern: 'App shell with persistent header/sidebar and content area',
    responsiveStrategy: 'Collapsible sidebar on mobile, hamburger menu, bottom navigation alternative',
    navigationPattern: 'Multi-page routing with protected routes requiring authentication',
    dataFlowPattern: 'RESTful API calls with loading states, error handling, and optimistic updates',
    healthcareConsiderations: [
      'Secure authentication with MFA options',
      'Role-based views (patient vs provider)',
      'Patient health records with privacy controls',
      'Appointment scheduling and management',
      'Secure messaging between patients and providers',
      'Medication lists and prescription management',
      'Lab results and medical imaging access',
      'Session timeout for security',
      'Audit logs for PHI access',
      'Clear privacy and data usage indicators'
    ]
  },
  dashboard: {
    template: 'dashboard',
    name: 'Admin Dashboard',
    description: 'Data-rich interface with analytics and management tools',
    fileStructure: {
      html: [
        'index.html (dashboard shell)',
        'css/reset.css',
        'css/variables.css',
        'css/layout.css (grid layout, sidebar)',
        'css/components.css (cards, tables, charts)',
        'js/app.js (dashboard logic)',
        'js/charts.js (Chart.js integration)',
        'js/data.js (data fetching, processing)',
        'js/api.js (API client)',
        'libs/chart.min.js (charting library)'
      ],
      react: [
        'src/App.tsx',
        'src/pages/Overview.tsx (KPI cards, charts)',
        'src/pages/Patients.tsx (data table)',
        'src/pages/Analytics.tsx (detailed metrics)',
        'src/pages/Reports.tsx (report generation)',
        'src/components/layout/DashboardLayout.tsx',
        'src/components/charts/LineChart.tsx',
        'src/components/charts/BarChart.tsx',
        'src/components/charts/PieChart.tsx',
        'src/components/data/DataTable.tsx',
        'src/components/data/Filters.tsx',
        'src/hooks/useData.ts',
        'src/hooks/useCharts.ts',
        'src/lib/chartConfig.ts'
      ],
      vue: [
        'src/App.vue',
        'src/views/OverviewView.vue',
        'src/views/PatientsView.vue',
        'src/views/AnalyticsView.vue',
        'src/views/ReportsView.vue',
        'src/components/layout/DashboardLayout.vue',
        'src/components/charts/LineChart.vue',
        'src/components/charts/BarChart.vue',
        'src/components/data/DataTable.vue',
        'src/components/data/FilterPanel.vue',
        'src/composables/useData.ts',
        'src/composables/useCharts.ts',
        'src/stores/data.ts'
      ]
    },
    keyComponents: [
      'Overview page with KPI cards (metrics with trends)',
      'Data visualization charts (line, bar, pie, area)',
      'Data tables with sorting, filtering, pagination',
      'Search and filter controls',
      'Export functionality (CSV, PDF, print)',
      'Date range pickers for time-based filtering',
      'Real-time data updates or refresh controls',
      'Action buttons for management tasks'
    ],
    layoutPattern: 'Sidebar + top nav with main content grid for cards and tables',
    responsiveStrategy: 'Priority-based responsive: hide less critical data on mobile, collapsible charts',
    navigationPattern: 'Sidebar navigation with hierarchical menu, breadcrumbs for context',
    dataFlowPattern: 'Polling or WebSocket for real-time updates, state management for cached data',
    healthcareConsiderations: [
      'Patient management dashboard for providers',
      'Appointment scheduling overview and calendar',
      'Health metrics visualization (vitals, trends)',
      'Bed/resource availability tracking',
      'Billing and claims management',
      'Prescription and medication tracking',
      'Clinical decision support indicators',
      'Population health analytics',
      'Compliance and quality metrics',
      'Provider productivity analytics',
      'Real-time alerts for critical patient conditions'
    ]
  }
}

export function getFrameworkBestPractices(framework: FrameworkType): FrameworkBestPractices {
  return FRAMEWORK_BEST_PRACTICES[framework]
}

export function getTemplateArchitecture(template: TemplateType): TemplateArchitectureGuide {
  return TEMPLATE_ARCHITECTURE[template]
}

export function generateFrameworkSpecificPrompt(
  framework: FrameworkType,
  template: TemplateType,
  brandContext: any,
  prdContext: any,
  customizations: any
): string {
  const frameworkGuide = getFrameworkBestPractices(framework)
  const templateGuide = getTemplateArchitecture(template)
  
  const fileStructure = templateGuide.fileStructure[framework].join('\n- ')
  
  return `
FRAMEWORK: ${frameworkGuide.name} (${frameworkGuide.description})

FILE STRUCTURE:
Generate these files:
- ${fileStructure}

FRAMEWORK-SPECIFIC BEST PRACTICES:

Core Guidelines:
${frameworkGuide.coreGuidelines.map((g, i) => `${i + 1}. ${g}`).join('\n')}

Component Architecture:
${frameworkGuide.componentArchitecture.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Security Practices (CRITICAL for Healthcare):
${frameworkGuide.securityPractices.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Performance Optimizations:
${frameworkGuide.performanceOptimizations.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Accessibility Guidelines (WCAG 2.1 AA Required):
${frameworkGuide.accessibilityGuidelines.map((a, i) => `${i + 1}. ${a}`).join('\n')}

State Management:
${frameworkGuide.stateManagement.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Styling Approach:
${frameworkGuide.stylingApproach.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Healthcare-Specific Implementation:
${frameworkGuide.healthcareSpecific.map((h, i) => `${i + 1}. ${h}`).join('\n')}

TEMPLATE ARCHITECTURE: ${templateGuide.name}

Key Components to Implement:
${templateGuide.keyComponents.map((k, i) => `${i + 1}. ${k}`).join('\n')}

Layout Pattern: ${templateGuide.layoutPattern}

Responsive Strategy: ${templateGuide.responsiveStrategy}

Navigation Pattern: ${templateGuide.navigationPattern}

Data Flow: ${templateGuide.dataFlowPattern}

Healthcare Considerations for ${templateGuide.name}:
${templateGuide.healthcareConsiderations.map((h, i) => `${i + 1}. ${h}`).join('\n')}

IMPLEMENTATION REQUIREMENTS:
- Follow ALL framework-specific best practices listed above
- Implement proper TypeScript types (if React/Vue)
- Use semantic HTML5 throughout
- Ensure WCAG 2.1 AA accessibility compliance
- Implement security best practices for healthcare data
- Create production-ready, well-commented code
- Use the brand colors and personality throughout
- Make it visually stunning and professional
`
}

export function analyzeCodeQuality(
  code: string,
  framework: FrameworkType,
  template: TemplateType
): {
  score: number
  issues: string[]
  suggestions: string[]
  strengths: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []
  const strengths: string[] = []
  
  const frameworkGuide = getFrameworkBestPractices(framework)
  
  if (framework === 'react' && code.includes('class ') && code.includes('extends React.Component')) {
    issues.push('Using class components instead of functional components with hooks')
    suggestions.push('Refactor class components to functional components with hooks')
  }
  
  if (framework === 'vue' && code.includes('export default {') && !code.includes('setup(')) {
    issues.push('Using Options API instead of Composition API')
    suggestions.push('Migrate to Composition API with <script setup> for better TypeScript support')
  }
  
  if (!code.includes('aria-') && !code.includes('role=')) {
    issues.push('Missing accessibility attributes (ARIA labels, roles)')
    suggestions.push('Add ARIA labels and semantic HTML for screen reader support')
  }
  
  if (code.includes('innerHTML') || code.includes('v-html') || code.includes('dangerouslySetInnerHTML')) {
    issues.push('Using innerHTML/v-html/dangerouslySetInnerHTML (security risk)')
    suggestions.push('Sanitize user input with DOMPurify or avoid HTML injection entirely')
  }
  
  if (code.match(/console\.(log|error|warn)/)) {
    issues.push('Contains console statements (should be removed for production)')
    suggestions.push('Remove console statements or use proper logging service')
  }
  
  if (framework === 'react' && code.includes('useState') && code.includes('useEffect')) {
    strengths.push('Using React hooks appropriately')
  }
  
  if (code.match(/const|let/) && !code.match(/var /)) {
    strengths.push('Using modern JavaScript (const/let instead of var)')
  }
  
  if (code.includes('interface ') || code.includes('type ')) {
    strengths.push('Using TypeScript type definitions')
  }
  
  if (code.match(/aria-label|role=|aria-describedby/)) {
    strengths.push('Implementing accessibility features')
  }
  
  let score = 70
  score -= issues.length * 5
  score += strengths.length * 5
  score = Math.max(0, Math.min(100, score))
  
  return { score, issues, suggestions, strengths }
}
