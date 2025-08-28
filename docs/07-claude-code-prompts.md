bonk.ai MVP - Claude Code Prompts
Sprint 1.1: Project Setup Prompts
SETUP-001: Project Initialization
Initialize a new Next.js 14 project for bonk.ai with the following requirements:

Project Setup:
- Use Next.js 14 with App Router and TypeScript
- Configure Tailwind CSS with custom theme colors from the style guide
- Set up proper folder structure for a running training plan app
- Include basic pages: home (/), dashboard (/dashboard), connect (/connect)

Custom Configuration:
- Add custom colors: primary blue (#2563eb), success green (#16a34a), Strava orange (#fc4c02)
- Configure Inter font family as primary
- Set up proper TypeScript configuration for strict mode
- Include all necessary dependencies for a modern Next.js app

File Structure:
- Create /app directory structure with proper layout.tsx
- Set up /components directory with index exports
- Create /lib directory for utilities and API clients
- Set up /types directory for TypeScript definitions
- Include proper .gitignore and README.md

The app will integrate with Strava API and Anthropic API for AI-generated training plans.
SETUP-002: Development Tooling
Set up development tooling and code quality standards for the bonk.ai project:

ESLint Configuration:
- Configure ESLint for Next.js 14, TypeScript, and React
- Add rules for consistent code style and best practices
- Include accessibility linting rules
- Set up import ordering and unused variable detection

Prettier Setup:
- Configure Prettier with consistent formatting rules
- Set line width to 100 characters
- Use single quotes and trailing commas
- Configure proper print width and tab width

Git Hooks:
- Set up Husky for pre-commit hooks
- Add lint-staged for running linters on staged files
- Prevent commits with linting errors or failing tests
- Add commit message linting if possible

VS Code Configuration:
- Create .vscode/settings.json with proper formatting settings
- Configure auto-format on save
- Set up proper TypeScript and ESLint integration
- Add recommended extensions list

Environment Variables:
- Create .env.example with all required environment variables
- Document each variable's purpose
- Set up proper .env.local structure for development
Sprint 1.2: Authentication Prompts
AUTH-001: Strava OAuth Integration
Implement complete Strava OAuth integration for bonk.ai:

API Route Setup:
- Create /api/auth/strava route to initiate OAuth flow
- Create /api/auth/callback route to handle OAuth callback
- Create /api/auth/logout route to clear user session
- Implement proper error handling for OAuth failures

OAuth Flow Implementation:
- Build redirect to Strava with proper scopes (read,activity:read)
- Handle authorization code exchange for access tokens
- Store tokens securely in Vercel KV with encryption
- Create user session management with secure cookies

Database Integration:
- Set up PlanetScale connection with proper error handling
- Create users table if not exists
- Implement user creation/update logic
- Handle duplicate user scenarios gracefully

Component Creation:
- Build StravaConnectButton component with loading states
- Create OAuth callback page with proper loading and error states
- Implement logout functionality with session clearing
- Add proper TypeScript types for all OAuth-related data

Security Requirements:
- Use state parameter for CSRF protection
- Implement proper token encryption before storage
- Add rate limiting to prevent OAuth abuse
- Secure all routes with proper middleware

Environment Variables Needed:
- STRAVA_CLIENT_ID
- STRAVA_CLIENT_SECRET
- NEXTAUTH_SECRET (for session encryption)
- KV_REST_API_URL and KV_REST_API_TOKEN
AUTH-002: Session Management
Implement secure session management for authenticated users:

Session Infrastructure:
- Create session middleware for protecting routes
- Implement session creation, validation, and destruction
- Use Vercel KV for session storage with 24-hour expiry
- Add proper TypeScript types for session data

User Context:
- Create React context for user authentication state
- Implement useAuth hook for easy access to user data
- Add loading and error states for authentication
- Handle token refresh logic for expired Strava tokens

Protected Routes:
- Create middleware to protect dashboard and API routes
- Redirect unauthenticated users to home page
- Implement proper loading states during auth checks
- Add error boundaries for authentication failures

Components:
- Build UserProfile component showing basic user info
- Create AuthGuard component for protecting pages
- Implement session status indicators
- Add logout functionality with proper cleanup

Database Queries:
- Implement getUserById function with proper error handling
- Add updateUser function for profile updates
- Create session validation queries
- Handle database connection failures gracefully
Sprint 2.1: Strava Integration Prompts
STRAVA-001: Activity Data Fetching
Build comprehensive Strava API integration for fetching and displaying user activities:

Strava API Client:
- Create robust Strava API client with proper error handling
- Implement rate limiting respect (100 requests per 15 minutes)
- Add retry logic with exponential backoff for failed requests
- Build token refresh mechanism for expired access tokens

Activity Fetching:
- Create function to fetch last 12 weeks of activities
- Implement pagination to handle users with many activities
- Filter for running activities only (exclude cycling, swimming, etc.)
- Parse and normalize activity data for consistent structure

Data Processing:
- Calculate weekly mileage totals and averages
- Identify different types of runs (easy, workout, long runs)
- Extract pace data and convert to consistent units
- Detect training patterns and consistency

API Routes:
- Create /api/user/activities endpoint with proper error handling
- Implement caching to minimize Strava API calls (4-hour cache)
- Add proper authentication middleware
- Return structured data ready for frontend consumption

Components:
- Build ActivityList component for displaying recent runs
- Create ActivityCard component with run details
- Implement loading states and error boundaries
- Add filtering and sorting capabilities

Cache Strategy:
- Use Vercel KV for caching activity data
- Implement cache invalidation on new data detection
- Add cache warming for better user experience
- Monitor cache hit rates for optimization
STRAVA-002: Training Analysis
Implement intelligent training analysis based on Strava activity data:

Analysis Algorithms:
- Calculate weekly mileage trends over past 12 weeks
- Compute average pace across different run types
- Analyze training consistency (runs per week, missed weeks)
- Detect fitness progression or regression patterns

Pace Analysis:
- Extract easy run paces for aerobic base assessment
- Identify tempo/threshold paces from workout data
- Calculate recent race equivalent times if available
- Determine appropriate training pace zones

Training Load Assessment:
- Compute relative training load based on distance and pace
- Identify peak training weeks and recovery periods
- Calculate training stress balance and fatigue indicators
- Assess readiness for different race distances

Data Structures:
- Create TypeScript interfaces for all analysis results
- Design JSON structure for storing analysis in database
- Implement data validation for analysis outputs
- Add error handling for insufficient data scenarios

API Implementation:
- Create /api/user/stats endpoint returning analysis results
- Cache analysis results until new activities detected
- Add proper error handling for users with limited data
- Include confidence scores for analysis accuracy

Components:
- Build TrainingAnalysis dashboard component
- Create data visualization components for trends
- Implement responsive charts for mobile viewing
- Add explanatory text for analysis metrics
Sprint 2.2 & 3.1: AI Plan Generation Prompts
PLAN-002 & PLAN-003: Anthropic Integration & Plan Generation
Build intelligent AI training plan generation using Anthropic's Claude API:

Plan Generation System:
- Create comprehensive prompt templates for different race distances
- Integrate Strava analysis data into AI prompts for personalization
- Implement plan structure validation and parsing
- Build fallback system for API failures

Anthropic API Client:
- Set up robust API client with proper error handling
- Implement retry logic with exponential backoff
- Add response validation and parsing
- Monitor API usage and implement rate limiting

Prompt Engineering:
- Design race-specific prompts (5K, 10K, Half Marathon, Marathon)
- Include user fitness data, goals, and constraints in prompts
- Request structured JSON responses with specific plan format
- Add examples of high-quality plans for consistency

Plan Structure:
- Define comprehensive TypeScript interfaces for training plans
- Create 12-week structure with weekly themes and progressions
- Include daily workouts with type, distance, pace, and descriptions
- Add metadata for plan generation parameters and date

Pace Calculation:
- Use Strava analysis to calculate realistic training paces
- Implement pace zone calculations based on recent performance
- Add progression logic for fitness improvement over 12 weeks
- Handle edge cases for new runners or returning athletes

API Routes:
- Create /api/plans/generate endpoint with comprehensive validation
- Implement plan storage in PlanetScale database
- Add error handling for generation failures
- Include plan retrieval and listing endpoints

Database Schema:
- Design training_plans table with proper indexing
- Store plan data as JSON with searchable metadata
- Implement proper foreign key relationships
- Add created_at and updated_at timestamps

Components:
- Build PlanGenerationForm component with race distance selection
- Create loading states with progress indicators for plan generation
- Implement error handling with retry options
- Add plan preview and confirmation before saving

Validation & Error Handling:
- Validate generated plans for completeness and coherence
- Check that weekly mileage progressions are reasonable
- Ensure pace recommendations are within realistic ranges
- Add fallback templates for AI generation failures

Testing:
- Create comprehensive test cases for different user fitness levels
- Test plan generation with various Strava data profiles
- Validate generated plans against established training principles
- Ensure consistent plan quality across multiple generations
PLAN-004: Multi-Distance Support
Implement race-distance-specific training plan generation:

Distance-Specific Logic:
- Create separate prompt templates for 5K, 10K, Half Marathon, Marathon
- Implement appropriate periodization for each distance
- Design distance-specific workout types and progressions
- Add race-specific pace zone calculations

5K Plan Requirements:
- Focus on speed development and VO2max workouts
- Include regular interval training and tempo runs
- 8-12 week progression suitable for 5K racing
- Weekly mileage typically 20-40 miles based on fitness level

10K Plan Requirements:
- Balance aerobic capacity and speed development
- Include lactate threshold and interval workouts
- 10-12 week progression building to 10K race pace
- Weekly mileage typically 25-50 miles based on fitness level

Half Marathon Plan Requirements:
- Emphasize aerobic development and tempo running
- Include progressive long runs and race pace segments
- 12-16 week progression with appropriate taper
- Weekly mileage typically 30-60 miles based on fitness level

Marathon Plan Requirements:
- Focus on aerobic base building and endurance
- Include progressive long runs up to 20+ miles
- 16-20 week progression with proper peak and taper
- Weekly mileage typically 40-70+ miles based on fitness level

Implementation:
- Create race distance selection UI component
- Implement distance-specific plan generation logic
- Add validation for appropriate weekly mileage by distance
- Include distance-specific coaching tips and advice

Database Updates:
- Add race_distance field to training_plans table
- Include target_time field for goal-specific planning
- Add plan_type metadata for different approaches
- Implement proper indexing for plan queries
Sprint 3.2: Plan Display Prompts
UI-001 & UI-002: Plan Display Components
Create comprehensive training plan display and navigation components:

Plan Overview Component:
- Build 12-week calendar overview showing weekly themes
- Implement week selection and navigation
- Display weekly mileage totals and key workout highlights
- Add progress indicators showing completed vs. upcoming weeks

Weekly View Component:
- Create detailed weekly view with daily workout breakdown
- Implement expandable daily cards with full workout details
- Show weekly totals, themes, and coaching notes
- Add week-to-week navigation with smooth transitions

Daily Workout Component:
- Design comprehensive workout cards with all necessary details
- Include workout type, distance, pace, and detailed descriptions
- Add effort level indicators and coaching tips
- Implement responsive design for mobile viewing

Pace Display:
- Show pace ranges clearly with units (min/mile or min/km)
- Add pace zone explanations (Easy, Tempo, Interval, etc.)
- Implement pace calculator for different distances
- Include effort descriptions alongside numerical paces

Navigation:
- Build intuitive plan navigation with breadcrumbs
- Add jump-to-week functionality
- Implement search within plan workouts
- Create plan sharing and export options

Responsive Design:
- Ensure excellent mobile experience with touch-friendly navigation
- Optimize for different screen sizes and orientations
- Use appropriate typography hierarchy for readability
- Implement collapsible sections for mobile space efficiency

State Management:
- Manage plan viewing state (current week, expanded sections)
- Handle loading states for plan data fetching
- Implement error boundaries for plan display failures
- Add local storage for user viewing preferences
EXPORT-001: Plan Export Functionality
Implement comprehensive plan export functionality:

PDF Export:
- Create PDF generation using a library like Puppeteer or jsPDF
- Design print-friendly layout with proper page breaks
- Include all workout details, paces, and coaching notes
- Add bonk.ai branding and user information header

Calendar Export:
- Generate ICS calendar files compatible with major calendar apps
- Create individual events for each workout day
- Include workout details in event descriptions
- Add proper timezone handling and recurring event logic

Sharing Features:
- Generate shareable links for plan viewing
- Implement social media sharing with proper metadata
- Create plan summary cards for social sharing
- Add copy-to-clipboard functionality for plan URLs

Export UI:
- Build export modal with format selection options
- Add preview functionality before final export
- Implement download progress indicators
- Include export confirmation and success states

Data Formatting:
- Ensure exported data maintains all critical information
- Format paces and distances consistently across export types
- Include plan generation date and parameters
- Add disclaimers and usage recommendations

Mobile Support:
- Ensure export functionality works on mobile devices
- Optimize file sizes for mobile data constraints
- Add mobile-specific sharing options (WhatsApp, Messages)
- Handle mobile browser download limitations gracefully
Sprint 4.1: UX Improvements Prompts
UX-001: Onboarding Flow
Create comprehensive onboarding experience for new bonk.ai users:

Landing Page:
- Design compelling landing page explaining bonk.ai's value proposition
- Include clear call-to-action for Strava connection
- Add testimonials, example plans, or demo content
- Implement responsive design with fast loading times

Onboarding Steps:
- Create step-by-step wizard for initial setup
- Include progress indicators showing user's location in flow
- Add helpful explanations for each step's importance
- Implement skip options for optional steps

Strava Connection Guidance:
- Explain why Strava connection is necessary
- Show preview of data that will be analyzed
- Address common privacy concerns with clear explanations
- Add troubleshooting help for OAuth issues

Goal Setting:
- Build intuitive race distance selection interface
- Add target time selection with realistic suggestions
- Include training availability preferences (days per week)
- Provide guidance on choosing appropriate goals

Help System:
- Create contextual help tooltips throughout onboarding
- Add FAQ section addressing common questions
- Implement chat widget or help contact system
- Include video tutorials or walkthrough guides

Progress Tracking:
- Show onboarding completion percentage
- Allow users to return to incomplete onboarding
- Save progress across browser sessions
- Provide completion celebration and next steps

Error Recovery:
- Handle OAuth failures with clear retry options
- Provide alternative paths if Strava connection fails
- Include contact support options for technical issues
- Add graceful degradation for users without sufficient data
UX-002: Loading and Progress States
Implement comprehensive loading states and progress indicators:

Plan Generation Loading:
- Create engaging loading experience for AI plan generation
- Show progress steps: "Analyzing data", "Generating plan", "Finalizing"
- Include estimated completion time (typically 5-15 seconds)
- Add progress bar or percentage indicator

Data Fetching States:
- Implement skeleton loading for Strava activity data
- Show shimmer effects for cards and lists during loading
- Add pulse animations for loading states
- Provide meaningful loading messages based on operation

Error States:
- Design clear error messages with specific next steps
- Include retry buttons with proper retry logic
- Add contact support options for persistent errors
- Show different errors for different failure types

Success States:
- Create celebratory animations for successful actions
- Show confirmation messages with clear next steps
- Add toast notifications for background operations
- Implement success states that guide user's next action

Interactive Feedback:
- Add button loading states with spinners
- Show form validation in real-time
- Implement hover and active states for all interactions
- Provide immediate feedback for user actions

Performance Optimization:
- Optimize loading state rendering performance
- Implement proper cleanup for loading state timers
- Add timeout handling for stuck loading states
- Monitor and log loading state duration metrics
Sprint 4.2: Performance & Deployment Prompts
PERF-001: Performance Optimization
Optimize bonk.ai application performance for production deployment:

Bundle Optimization:
- Implement code splitting for optimal bundle sizes
- Add dynamic imports for heavy components
- Configure webpack bundle analyzer to identify large dependencies
- Implement lazy loading for non-critical components

Caching Strategy:
- Implement comprehensive caching for API responses
- Add browser caching for static assets
- Configure CDN caching for images and fonts
- Set up service worker for offline functionality

Database Optimization:
- Add proper indexing to database queries
- Implement connection pooling for database connections
- Optimize queries for faster response times
- Add query performance monitoring

Image Optimization:
- Implement Next.js Image component throughout app
- Add proper image sizing and responsive images
- Configure image optimization for different devices
- Use modern image formats (WebP) where supported

API Performance:
- Implement request deduplication for API calls
- Add response compression for large payloads
- Configure proper HTTP caching headers
- Implement API route optimization

Core Web Vitals:
- Optimize Largest Contentful Paint (LCP) by prioritizing critical content
- Minimize First Input Delay (FID) with optimized JavaScript
- Reduce Cumulative Layout Shift (CLS) with stable layouts
- Monitor and track all Core Web Vitals metrics

Performance Monitoring:
- Set up Vercel Analytics for performance tracking
- Add custom performance metrics for key user journeys
- Implement error tracking and performance alerting
- Create performance dashboards for ongoing monitoring
DEPLOY-001: Production Deployment
Set up secure, scalable production deployment for bonk.ai:

Environment Configuration:
- Set up production environment variables in Vercel
- Configure database connections for production
- Add proper API key management and rotation
- Implement environment-specific configuration

Security Headers:
- Configure Content Security Policy (CSP)
- Add security headers (HSTS, X-Frame-Options, etc.)
- Implement proper CORS configuration
- Add rate limiting to prevent abuse

Database Setup:
- Configure PlanetScale production database
- Set up database migration system
- Implement backup and recovery procedures
- Add database monitoring and alerting

Domain and SSL:
- Configure custom domain with proper DNS
- Set up SSL certificates and HTTPS redirect
- Implement subdomain configuration if needed
- Add domain security configurations

Monitoring and Alerting:
- Set up error tracking with Sentry or similar
- Configure uptime monitoring
- Add performance alerting for degradation
- Implement user behavior analytics

CI/CD Pipeline:
- Configure automated testing in deployment pipeline
- Set up staging environment for testing
- Implement proper deployment rollback procedures
- Add deployment health checks and validation

Scalability Preparation:
- Configure auto-scaling for serverless functions
- Set up database scaling policies
- Implement CDN for global content delivery
- Plan for traffic spikes and scaling scenarios
Enterprise Sprint Prompts
A11Y-001: Accessibility Implementation
Implement comprehensive accessibility features for bonk.ai:

WCAG 2.1 AA Compliance:
- Audit all components for accessibility compliance
- Ensure proper color contrast ratios (4.5:1 minimum)
- Add alternative text for all images and icons
- Implement proper heading hierarchy throughout app

Keyboard Navigation:
- Make all interactive elements keyboard accessible
- Implement logical tab order for all pages
- Add skip navigation links for main content
- Create keyboard shortcuts for common actions

Screen Reader Support:
- Add proper ARIA labels and roles to all components
- Implement live regions for dynamic content updates
- Add screen reader announcements for state changes
- Test with actual screen reader software

Focus Management:
- Implement visible focus indicators for all interactive elements
- Manage focus for modal dialogs and overlays
- Add focus trapping in modal components
- Ensure focus returns appropriately after interactions

Accessibility Testing:
- Set up automated accessibility testing with tools like axe
- Implement accessibility unit tests
- Add accessibility checks to CI/CD pipeline
- Create manual testing checklist for accessibility features

Documentation:
- Create accessibility documentation for future developers
- Document keyboard shortcuts and navigation patterns
- Add accessibility statement for users
- Include accessibility considerations in component documentation
SEC-001: Security Hardening
Implement comprehensive security measures for bonk.ai:

Input Validation and Sanitization:
- Add comprehensive input validation for all user inputs
- Implement XSS prevention with proper output encoding
- Add SQL injection prevention with parameterized queries
- Validate and sanitize all API request data

Authentication Security:
- Implement secure token storage with encryption
- Add token rotation and expiration handling
- Implement brute force protection for authentication
- Add session security with proper cookie settings

API Security:
- Add rate limiting to all API endpoints
- Implement proper authentication middleware
- Add request validation and error handling
- Implement API versioning and deprecation handling

Security Headers:
- Configure comprehensive Content Security Policy
- Add security headers (HSTS, X-Content-Type-Options, etc.)
- Implement proper CORS configuration
- Add referrer policy and feature policy headers

Data Protection:
- Implement data encryption at rest and in transit
- Add proper data retention and deletion policies
- Implement user data export and deletion capabilities
- Add privacy controls and consent management

Security Monitoring:
- Set up security event logging and monitoring
- Add intrusion detection and alerting
- Implement security incident response procedures
- Create security audit trails for sensitive operations

Vulnerability Management:
- Set up automated security scanning for dependencies
- Implement regular security audits and testing
- Add vulnerability disclosure process
- Create security update and patch management procedures
Prompt Usage Instructions
Each prompt should be used with Claude Code by:

Context Setting: Provide relevant project context and requirements
File Structure: Reference existing files and desired structure
Dependencies: Specify required packages and integrations
Standards: Reference style guide and coding standards
Testing: Include testing requirements and validation steps

Example Usage:
Use the AUTH-001 prompt to implement Strava OAuth integration. 
The project already has basic Next.js setup from SETUP-001 and SETUP-002.
Follow the established patterns in /lib and /components directories.
Ensure all code follows the TypeScript and ESLint configurations.
Test the OAuth flow thoroughly before marking the story complete.
``` all routes with proper middleware

Environment Variables Needed:
- STRAVA_CLIENT_ID
- STRAVA_CLIENT_SECRET
- NEXTAUTH_SECRET (for session encryption)
- KV_REST_API_URL and KV_REST_API_TOKEN
AUTH-002: Session Management
Implement secure session management for authenticated users:

Session Infrastructure:
- Create session middleware for protecting routes
- Implement session creation, validation, and destruction
- Use Vercel KV for session storage with 24-hour expiry
- Add proper TypeScript types for session data

User Context:
- Create React context for user authentication state
- Implement useAuth hook for easy access to user data
- Add loading and error states for authentication
- Handle token refresh logic for expired Strava tokens

Protected Routes:
- Create middleware to protect dashboard and API routes
- Redirect unauthenticated users to home page
- Implement proper loading states during auth checks
- Add error boundaries for authentication failures

Components:
- Build UserProfile component showing basic user info
- Create AuthGuard component for protecting pages
- Implement session status indicators
- Add logout functionality with proper cleanup

Database Queries:
- Implement getUserById function with proper error handling
- Add updateUser function for profile updates
- Create session validation queries
- Handle database connection failures gracefully
Sprint 2.1: Strava Integration Prompts
STRAVA-001: Activity Data Fetching
Build comprehensive Strava API integration for fetching and displaying user activities:

Strava API Client:
- Create robust Strava API client with proper error handling
- Implement rate limiting respect (100 requests per 15 minutes)
- Add retry logic with exponential backoff for failed requests
- Build token refresh mechanism for expired access tokens

Activity Fetching:
- Create function to fetch last 12 weeks of activities
- Implement pagination to handle users with many activities
- Filter for running activities only (exclude cycling, swimming, etc.)
- Parse and normalize activity data for consistent structure

Data Processing:
- Calculate weekly mileage totals and averages
- Identify different types of runs (easy, workout, long runs)
- Extract pace data and convert to consistent units
- Detect training patterns and consistency

API Routes:
- Create /api/user/activities endpoint with proper error handling
- Implement caching to minimize Strava API calls (4-hour cache)
- Add proper authentication middleware
- Return structured data ready for frontend consumption

Components:
- Build ActivityList component for displaying recent runs
- Create ActivityCard component with run details
- Implement loading states and error boundaries
- Add filtering and sorting capabilities

Cache Strategy:
- Use Vercel KV for caching activity data
- Implement cache invalidation on new data detection
- Add cache warming for better user experience
- Monitor cache hit rates for optimization
STRAVA-002: Training Analysis
Implement intelligent training analysis based on Strava activity data:

Analysis Algorithms:
- Calculate weekly mileage trends over past 12 weeks
- Compute average pace across different run types
- Analyze training consistency (runs per week, missed weeks)
- Detect fitness progression or regression patterns

Pace Analysis:
- Extract easy run paces for aerobic base assessment
- Identify tempo/threshold paces from workout data
- Calculate recent race equivalent times if available
- Determine appropriate training pace zones

Training Load Assessment:
- Compute relative training load based on distance and pace
- Identify peak training weeks and recovery periods
- Calculate training stress balance and fatigue indicators
- Assess readiness for different race distances

Data Structures:
- Create TypeScript interfaces for all analysis results
- Design JSON structure for storing analysis in database
- Implement data validation for analysis outputs
- Add error handling for insufficient data scenarios

API Implementation:
- Create /api/user/stats endpoint returning analysis results
- Cache analysis results until new activities detected
- Add proper error handling for users with limited data
- Include confidence scores for analysis accuracy

Components:
- Build TrainingAnalysis dashboard component
- Create data visualization components for trends
- Implement responsive charts for mobile viewing
- Add explanatory text for analysis metrics
Sprint 2.2 & 3.1: AI Plan Generation Prompts
PLAN-002 & PLAN-003: Anthropic Integration & Plan Generation
Build intelligent AI training plan generation using Anthropic's Claude API:

Plan Generation System:
- Create comprehensive prompt templates for different race distances
- Integrate Strava analysis data into AI prompts for personalization
- Implement plan structure validation and parsing
- Build fallback system for API failures

Anthropic API Client:
- Set up robust API client with proper error handling
- Implement retry logic with exponential backoff
- Add response validation and parsing
- Monitor API usage and implement rate limiting

Prompt Engineering:
- Design race-specific prompts (5K, 10K, Half Marathon, Marathon)
- Include user fitness data, goals, and constraints in prompts
- Request structured JSON responses with specific plan format
- Add examples of high-quality plans for consistency

Plan Structure:
- Define comprehensive TypeScript interfaces for training plans
- Create 12-week structure with weekly themes and progressions
- Include daily workouts with type, distance, pace, and descriptions
- Add metadata for plan generation parameters and date

Pace Calculation:
- Use Strava analysis to calculate realistic training paces
- Implement pace zone calculations based on recent performance
- Add progression logic for fitness improvement over 12 weeks
- Handle edge cases for new runners or returning athletes

API Routes:
- Create /api/plans/generate endpoint with comprehensive validation
- Implement plan storage in PlanetScale database
- Add error handling for generation failures
- Include plan retrieval and listing endpoints

Database Schema:
- Design training_plans table with proper indexing
- Store plan data as JSON with searchable metadata
- Implement proper foreign key relationships
- Add created_at and updated_at timestamps

Components:
- Build PlanGenerationForm component with race distance selection
- Create loading states with progress indicators for plan generation
- Implement error handling with retry options
- Add plan preview and confirmation before saving

Validation & Error Handling:
- Validate generated plans for completeness and coherence
- Check that weekly mileage progressions are reasonable
- Ensure pace recommendations are within realistic ranges
- Add fallback templates for AI generation failures

Testing:
- Create comprehensive test cases for different user fitness levels
- Test plan generation with various Strava data profiles
- Validate generated plans against established training principles
- Ensure consistent plan quality across multiple generations
PLAN-004: Multi-Distance Support
Implement race-distance-specific training plan generation:

Distance-Specific Logic:
- Create separate prompt templates for 5K, 10K, Half Marathon, Marathon
- Implement appropriate periodization for each distance
- Design distance-specific workout types and progressions
- Add race-specific pace zone calculations

5K Plan Requirements:
- Focus on speed development and VO2max workouts
- Include regular interval training and tempo runs
- 8-12 week progression suitable for 5K racing
- Weekly mileage typically 20-40 miles based on fitness level

10K Plan Requirements:
- Balance aerobic capacity and speed development
- Include lactate threshold and interval workouts
- 10-12 week progression building to 10K race pace
- Weekly mileage typically 25-50 miles based on fitness level

Half Marathon Plan Requirements:
- Emphasize aerobic development and tempo running
- Include progressive long runs and race pace segments
- 12-16 week progression with appropriate taper
- Weekly mileage typically 30-60 miles based on fitness level

Marathon Plan Requirements:
- Focus on aerobic base building and endurance
- Include progressive long runs up to 20+ miles
- 16-20 week progression with proper peak and taper
- Weekly mileage typically 40-70+ miles based on fitness level

Implementation:
- Create race distance selection UI component
- Implement distance-specific plan generation logic
- Add validation for appropriate weekly mileage by distance
- Include distance-specific coaching tips and advice

Database Updates:
- Add race_distance field to training_plans table
- Include target_time field for goal-specific planning
- Add plan_type metadata for different approaches
- Implement proper indexing for plan queries
Sprint 3.2: Plan Display Prompts
UI-001 & UI-002: Plan Display Components
Create comprehensive training plan display and navigation components:

Plan Overview Component:
- Build 12-week calendar overview showing weekly themes
- Implement week selection and navigation
- Display weekly mileage totals and key workout highlights
- Add progress indicators showing completed vs. upcoming weeks

Weekly View Component:
- Create detailed weekly view with daily workout breakdown
- Implement expandable daily cards with full workout details
- Show weekly totals, themes, and coaching notes
- Add week-to-week navigation with smooth transitions

Daily Workout Component:
- Design comprehensive workout cards with all necessary details
- Include workout type, distance, pace, and detailed descriptions
- Add effort level indicators and coaching tips
- Implement responsive design for mobile viewing

Pace Display:
- Show pace ranges clearly with units (min/mile or min/km)
- Add pace zone explanations (Easy, Tempo, Interval, etc.)
- Implement pace calculator for different distances
- Include effort descriptions alongside numerical paces

Navigation:
- Build intuitive plan navigation with breadcrumbs
- Add jump-to-week functionality
- Implement search within plan workouts
- Create plan sharing and export options

Responsive Design:
- Ensure excellent mobile experience with touch-friendly navigation
- Optimize for different screen sizes and orientations
- Use appropriate typography hierarchy for readability
- Implement collapsible sections for mobile space efficiency

State Management:
- Manage plan viewing state (current week, expanded sections)
- Handle loading states for plan data fetching
- Implement error boundaries for plan display failures
- Add local storage for user viewing preferences
EXPORT-001: Plan Export Functionality
Implement comprehensive plan export functionality:

PDF Export:
- Create PDF generation using a library like Puppeteer or jsPDF
- Design print-friendly layout with proper page breaks
- Include all workout details, paces, and coaching notes
- Add RunPlan branding and user information header

Calendar Export:
- Generate ICS calendar files compatible with major calendar apps
- Create individual events for each workout day
- Include workout details in event descriptions
- Add proper timezone handling and recurring event logic

Sharing Features:
- Generate shareable links for plan viewing
- Implement social media sharing with proper metadata
- Create plan summary cards for social sharing
- Add copy-to-clipboard functionality for plan URLs

Export UI:
- Build export modal with format selection options
- Add preview functionality before final export
- Implement download progress indicators
- Include export confirmation and success states

Data Formatting:
- Ensure exported data maintains all critical information
- Format paces and distances consistently across export types
- Include plan generation date and parameters
- Add disclaimers and usage recommendations

Mobile Support:
- Ensure export functionality works on mobile devices
- Optimize file sizes for mobile data constraints
- Add mobile-specific sharing options (WhatsApp, Messages)
- Handle mobile browser download limitations gracefully
Sprint 4.1: UX Improvements Prompts
UX-001: Onboarding Flow
Create comprehensive onboarding experience for new RunPlan users:

Landing Page:
- Design compelling landing page explaining RunPlan's value proposition
- Include clear call-to-action for Strava connection
- Add testimonials, example plans, or demo content
- Implement responsive design with fast loading times

Onboarding Steps:
- Create step-by-step wizard for initial setup
- Include progress indicators showing user's location in flow
- Add helpful explanations for each step's importance
- Implement skip options for optional steps

Strava Connection Guidance:
- Explain why Strava connection is necessary
- Show preview of data that will be analyzed
- Address common privacy concerns with clear explanations
- Add troubleshooting help for OAuth issues

Goal Setting:
- Build intuitive race distance selection interface
- Add target time selection with realistic suggestions
- Include training availability preferences (days per week)
- Provide guidance on choosing appropriate goals

Help System:
- Create contextual help tooltips throughout onboarding
- Add FAQ section addressing common questions
- Implement chat widget or help contact system
- Include video tutorials or walkthrough guides

Progress Tracking:
- Show onboarding completion percentage
- Allow users to return to incomplete onboarding
- Save progress across browser sessions
- Provide completion celebration and next steps

Error Recovery:
- Handle OAuth failures with clear retry options
- Provide alternative paths if Strava connection fails
- Include contact support options for technical issues
- Add graceful degradation for users without sufficient data
UX-002: Loading and Progress States
Implement comprehensive loading states and progress indicators:

Plan Generation Loading:
- Create engaging loading experience for AI plan generation
- Show progress steps: "Analyzing data", "Generating plan", "Finalizing"
- Include estimated completion time (typically 5-15 seconds)
- Add progress bar or percentage indicator

Data Fetching States:
- Implement skeleton loading for Strava activity data
- Show shimmer effects for cards and lists during loading
- Add pulse animations for loading states
- Provide meaningful loading messages based on operation

Error States:
- Design clear error messages with specific next steps
- Include retry buttons with proper retry logic
- Add contact support options for persistent errors
- Show different errors for different failure types

Success States:
- Create celebratory animations for successful actions
- Show confirmation messages with clear next steps
- Add toast notifications for background operations
- Implement success states that guide user's next action

Interactive Feedback:
- Add button loading states with spinners
- Show form validation in real-time
- Implement hover and active states for all interactions
- Provide immediate feedback for user actions

Performance Optimization:
- Optimize loading state rendering performance
- Implement proper cleanup for loading state timers
- Add timeout handling for stuck loading states
- Monitor and log loading state duration metrics
Sprint 4.2: Performance & Deployment Prompts
PERF-001: Performance Optimization
Optimize RunPlan application performance for production deployment:

Bundle Optimization:
- Implement code splitting for optimal bundle sizes
- Add dynamic imports for heavy components
- Configure webpack bundle analyzer to identify large dependencies
- Implement lazy loading for non-critical components

Caching Strategy:
- Implement comprehensive caching for API responses
- Add browser caching for static assets
- Configure CDN caching for images and fonts
- Set up service worker for offline functionality

Database Optimization:
- Add proper indexing to database queries
- Implement connection pooling for database connections
- Optimize queries for faster response times
- Add query performance monitoring

Image Optimization:
- Implement Next.js Image component throughout app
- Add proper image sizing and responsive images
- Configure image optimization for different devices
- Use modern image formats (WebP) where supported

API Performance:
- Implement request deduplication for API calls
- Add response compression for large payloads
- Configure proper HTTP caching headers
- Implement API route optimization

Core Web Vitals:
- Optimize Largest Contentful Paint (LCP) by prioritizing critical content
- Minimize First Input Delay (FID) with optimized JavaScript
- Reduce Cumulative Layout Shift (CLS) with stable layouts
- Monitor and track all Core Web Vitals metrics

Performance Monitoring:
- Set up Vercel Analytics for performance tracking
- Add custom performance metrics for key user journeys
- Implement error tracking and performance alerting
- Create performance dashboards for ongoing monitoring
DEPLOY-001: Production Deployment
Set up secure, scalable production deployment for RunPlan:

Environment Configuration:
- Set up production environment variables in Vercel
- Configure database connections for production
- Add proper API key management and rotation
- Implement environment-specific configuration

Security Headers:
- Configure Content Security Policy (CSP)
- Add security headers (HSTS, X-Frame-Options, etc.)
- Implement proper CORS configuration
- Add rate limiting to prevent abuse

Database Setup:
- Configure PlanetScale production database
- Set up database migration system
- Implement backup and recovery procedures
- Add database monitoring and alerting

Domain and SSL:
- Configure custom domain with proper DNS
- Set up SSL certificates and HTTPS redirect
- Implement subdomain configuration if needed
- Add domain security configurations

Monitoring and Alerting:
- Set up error tracking with Sentry or similar
- Configure uptime monitoring
- Add performance alerting for degradation
- Implement user behavior analytics

CI/CD Pipeline:
- Configure automated testing in deployment pipeline
- Set up staging environment for testing
- Implement proper deployment rollback procedures
- Add deployment health checks and validation

Scalability Preparation:
- Configure auto-scaling for serverless functions
- Set up database scaling policies
- Implement CDN for global content delivery
- Plan for traffic spikes and scaling scenarios
Enterprise Sprint Prompts
A11Y-001: Accessibility Implementation
Implement comprehensive accessibility features for RunPlan:

WCAG 2.1 AA Compliance:
- Audit all components for accessibility compliance
- Ensure proper color contrast ratios (4.5:1 minimum)
- Add alternative text for all images and icons
- Implement proper heading hierarchy throughout app

Keyboard Navigation:
- Make all interactive elements keyboard accessible
- Implement logical tab order for all pages
- Add skip navigation links for main content
- Create keyboard shortcuts for common actions

Screen Reader Support:
- Add proper ARIA labels and roles to all components
- Implement live regions for dynamic content updates
- Add screen reader announcements for state changes
- Test with actual screen reader software

Focus Management:
- Implement visible focus indicators for all interactive elements
- Manage focus for modal dialogs and overlays
- Add focus trapping in modal components
- Ensure focus returns appropriately after interactions

Accessibility Testing:
- Set up automated accessibility testing with tools like axe
- Implement accessibility unit tests
- Add accessibility checks to CI/CD pipeline
- Create manual testing checklist for accessibility features

Documentation:
- Create accessibility documentation for future developers
- Document keyboard shortcuts and navigation patterns
- Add accessibility statement for users
- Include accessibility considerations in component documentation
SEC-001: Security Hardening
Implement comprehensive security measures for RunPlan:

Input Validation and Sanitization:
- Add comprehensive input validation for all user inputs
- Implement XSS prevention with proper output encoding
- Add SQL injection prevention with parameterized queries
- Validate and sanitize all API request data

Authentication Security:
- Implement secure token storage with encryption
- Add token rotation and expiration handling
- Implement brute force protection for authentication
- Add session security with proper cookie settings

API Security:
- Add rate limiting to all API endpoints
- Implement proper authentication middleware
- Add request validation and error handling
- Implement API versioning and deprecation handling

Security Headers:
- Configure comprehensive Content Security Policy
- Add security headers (HSTS, X-Content-Type-Options, etc.)
- Implement proper CORS configuration
- Add referrer policy and feature policy headers

Data Protection:
- Implement data encryption at rest and in transit
- Add proper data retention and deletion policies
- Implement user data export and deletion capabilities
- Add privacy controls and consent management

Security Monitoring:
- Set up security event logging and monitoring
- Add intrusion detection and alerting
- Implement security incident response procedures
- Create security audit trails for sensitive operations

Vulnerability Management:
- Set up automated security scanning for dependencies
- Implement regular security audits and testing
- Add vulnerability disclosure process
- Create security update and patch management procedures
Prompt Usage Instructions
Each prompt should be used with Claude Code by:

Context Setting: Provide relevant project context and requirements
File Structure: Reference existing files and desired structure
Dependencies: Specify required packages and integrations
Standards: Reference style guide and coding standards
Testing: Include testing requirements and validation steps

Example Usage:
Use the AUTH-001 prompt to implement Strava OAuth integration. 
The project already has basic Next.js setup from SETUP-001 and SETUP-002.
Follow the established patterns in /lib and /components directories.
Ensure all code follows the TypeScript and ESLint configurations.
Test the OAuth flow thoroughly before marking the story complete.