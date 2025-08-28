CLAUDE.md - bonk.ai Project Instructions
Project Overview
bonk.ai is a Next.js web application that generates personalized 12-week running training plans by analyzing users' Strava data and using AI (Anthropic's Claude) to create intelligent, data-driven training recommendations. The MVP focuses on Strava integration, AI plan generation, and clean plan presentation.
Brand Identity
bonk.ai helps runners avoid the dreaded "bonk" (hitting the wall during endurance events) through smart, AI-powered training plans. The brand combines running culture knowledge with cutting-edge AI technology to create personalized training experiences.
Technology Stack

Frontend: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
Backend: Next.js API Routes (serverless), Vercel deployment
Database: Neon PostgreSQL for persistent data, Vercel KV (Redis) for caching
External APIs: Strava API v3, Anthropic Claude API
Deployment: Vercel with custom domain

Key Business Rules
Training Plan Generation

Plans are always 12 weeks long with proper periodization
Pace recommendations based on recent Strava performance data
Different race distances (5K, 10K, Half Marathon, Marathon) have specific focuses:

5K: Speed development, VO2max, intervals
10K: Balance of speed and aerobic capacity
Half Marathon: Tempo running, progressive long runs
Marathon: Aerobic base, progressive long runs up to 20+ miles


Weekly mileage should progress logically with appropriate recovery weeks

Strava Integration Rules

Only fetch running activities (exclude cycling, swimming, etc.)
Analyze last 12 weeks of data for fitness assessment
Respect API rate limits: 100 requests per 15 minutes, 1000 per day
Cache activity data for 4 hours to minimize API calls
Handle users with limited data gracefully

User Experience Priorities

Mobile-first responsive design (many runners use phones while training)
Fast plan generation (under 10 seconds due to Vercel timeout)
Clear, actionable workout descriptions with specific paces
Intuitive navigation between weeks and days
Export capabilities for use in other apps

Code Standards
TypeScript Usage

Use strict mode TypeScript configuration
Define interfaces for all data structures (User, Activity, TrainingPlan, etc.)
Use proper typing for API responses and database schemas
Avoid any types - use proper typing or unknown with type guards

Component Architecture

Use React functional components with hooks
Implement proper error boundaries for robust error handling
Use loading states and skeleton components for better UX
Follow single responsibility principle for components

API Route Patterns

Always validate input data with proper error responses
Implement comprehensive error handling with appropriate HTTP status codes
Use middleware for authentication and session management
Return consistent JSON response formats
Include proper CORS and security headers

Database Patterns

Use parameterized queries to prevent SQL injection
Implement proper connection pooling and error handling
Include created_at and updated_at timestamps on all tables
Use transactions for multi-table operations
Add proper indexing for performance

Styling Guidelines

Use Tailwind CSS with custom theme colors defined in style guide
Follow mobile-first responsive design approach
Use consistent spacing scale (space-1 through space-12)
Implement proper focus states for accessibility
Use semantic color names (primary, secondary, success, warning)

File Organization
/app
  /(auth)
    /connect/page.tsx          # Strava connection page
    /callback/page.tsx         # OAuth callback handler
  /dashboard
    /page.tsx                  # Main dashboard
    /plans/[id]/page.tsx       # Individual plan view
  /api
    /auth/
      strava/route.ts          # OAuth initiation
      callback/route.ts        # OAuth callback
      logout/route.ts          # Session clearing
    /user/
      profile/route.ts         # User profile data
      activities/route.ts      # Strava activities
      stats/route.ts           # Training analysis
    /plans/
      generate/route.ts        # AI plan generation
      [id]/route.ts            # Plan retrieval
  layout.tsx                   # Root layout
  page.tsx                     # Home/landing page

/components
  /auth/
    StravaConnectButton.tsx
    UserProfile.tsx
  /plans/
    PlanGenerator.tsx
    PlanOverview.tsx
    WeekView.tsx
    WorkoutCard.tsx
  /ui/
    Button.tsx
    Card.tsx
    LoadingSpinner.tsx
  /layout/
    Header.tsx
    Footer.tsx

/lib
  /auth/
    session.ts               # Session management
    middleware.ts            # Auth middleware
  /api/
    strava.ts                # Strava API client
    anthropic.ts             # Claude API client
  /db/
    connection.ts            # Database connection
    queries.ts               # Database queries
  /utils/
    validation.ts            # Input validation
    calculations.ts          # Pace and distance calculations

/types
  index.ts                   # Main type definitions
  strava.ts                  # Strava API types
  training.ts                # Training plan types
Critical Implementation Details
Authentication Flow

User clicks "Connect with Strava" → redirect to Strava OAuth
Strava callback exchanges code for tokens → store encrypted in Vercel KV
Create/update user record in PlanetScale
Set secure session cookie and redirect to dashboard
Protect all authenticated routes with middleware

Plan Generation Process

Fetch user's recent Strava activities (12 weeks)
Analyze training data (volume, consistency, paces)
Generate structured prompt for Anthropic API including:

Current fitness assessment
Selected race distance and target time
Training availability and preferences


Parse and validate AI response
Store complete plan in database
Display with clear navigation and export options

Error Handling Strategy

Strava API Errors: Retry with exponential backoff, graceful degradation
Anthropic API Errors: Retry once, fallback to template plans if needed
Database Errors: Proper transaction rollbacks, user-friendly messages
User Errors: Clear validation messages, guided recovery steps

Security Requirements

All routes use HTTPS with proper security headers
Strava tokens encrypted before storage in KV
Input validation and sanitization on all user data
Rate limiting on API endpoints to prevent abuse
Secure session management with HTTP-only cookies
CSRF protection using state parameter in OAuth flow

Performance Requirements

Initial page load under 3 seconds
Plan generation completes within 10 seconds (Vercel limit)
Cache Strava data for 4 hours to minimize API calls
Optimize images and implement proper lazy loading
Use code splitting for optimal bundle sizes
Monitor Core Web Vitals and maintain good scores

Testing Strategy

Unit tests for utility functions and calculations
Integration tests for API routes and database operations
End-to-end tests for critical user journeys (OAuth, plan generation)
Accessibility testing with automated tools
Performance testing under realistic load scenarios

Common Pitfalls to Avoid

Don't exceed Strava API rate limits - implement proper caching
Don't ignore Vercel serverless timeout - optimize AI prompts for speed
Don't store sensitive data in local storage - use secure server-side sessions
Don't assume all users have extensive running history - handle edge cases
Don't make plans too aggressive - prioritize injury prevention
Don't forget mobile users - test thoroughly on various devices

Development Workflow

Always reference relevant user stories and acceptance criteria
Implement comprehensive error handling for external API dependencies
Test with real Strava data when possible
Follow established patterns for component structure and API routes
Include proper TypeScript types for all new features
Add loading states and empty states for all user-facing features
Test mobile responsiveness throughout development
Write clear, actionable commit messages
Update documentation for any new patterns or significant changes

Environment Variables Required
# Strava API
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret

# Anthropic API
ANTHROPIC_API_KEY=your_anthropic_api_key

# Database
DATABASE_URL=your_neon_postgresql_connection_string

# Redis Cache
KV_REST_API_URL=your_vercel_kv_url
KV_REST_API_TOKEN=your_vercel_kv_token

# Security
NEXTAUTH_SECRET=your_session_encryption_key
NEXTAUTH_URL=your_app_domain

# Optional
VERCEL_ANALYTICS_ID=your_vercel_analytics_id
API Integration Specifics
Strava API Best Practices

Always include athlete_id in requests to avoid rate limit issues
Use include_all_efforts=false to reduce payload size
Implement proper pagination for users with many activities
Handle different activity types gracefully (some users log walks, etc.)
Respect user privacy settings - some activities may be private

Anthropic API Usage

Keep prompts focused and specific to avoid unnecessary token usage
Include examples of desired output format in prompts
Implement proper retry logic for rate limiting
Parse responses carefully - AI output may vary in format
Include fallback logic for when AI generates inappropriate plans

Remember: The goal is to create a tool that helps runners train effectively and safely while avoiding the "bonk." Always prioritize user experience, data accuracy, and injury prevention over flashy features.
Technology Stack

Frontend: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
Backend: Next.js API Routes (serverless), Vercel deployment
Database: Neon PostgreSQL for persistent data, Vercel KV (Redis) for caching
External APIs: Strava API v3, Anthropic Claude API
Deployment: Vercel with custom domain

Key Business Rules
Training Plan Generation

Plans are always 12 weeks long with proper periodization
Pace recommendations based on recent Strava performance data
Different race distances (5K, 10K, Half Marathon, Marathon) have specific focuses:

5K: Speed development, VO2max, intervals
10K: Balance of speed and aerobic capacity
Half Marathon: Tempo running, progressive long runs
Marathon: Aerobic base, progressive long runs up to 20+ miles


Weekly mileage should progress logically with appropriate recovery weeks

Strava Integration Rules

Only fetch running activities (exclude cycling, swimming, etc.)
Analyze last 12 weeks of data for fitness assessment
Respect API rate limits: 100 requests per 15 minutes, 1000 per day
Cache activity data for 4 hours to minimize API calls
Handle users with limited data gracefully

User Experience Priorities

Mobile-first responsive design (many runners use phones while training)
Fast plan generation (under 10 seconds due to Vercel timeout)
Clear, actionable workout descriptions with specific paces
Intuitive navigation between weeks and days
Export capabilities for use in other apps

Code Standards
TypeScript Usage

Use strict mode TypeScript configuration
Define interfaces for all data structures (User, Activity, TrainingPlan, etc.)
Use proper typing for API responses and database schemas
Avoid any types - use proper typing or unknown with type guards

Component Architecture

Use React functional components with hooks
Implement proper error boundaries for robust error handling
Use loading states and skeleton components for better UX
Follow single responsibility principle for components

API Route Patterns

Always validate input data with proper error responses
Implement comprehensive error handling with appropriate HTTP status codes
Use middleware for authentication and session management
Return consistent JSON response formats
Include proper CORS and security headers

Database Patterns

Use parameterized queries to prevent SQL injection
Implement proper connection pooling and error handling
Include created_at and updated_at timestamps on all tables
Use transactions for multi-table operations
Add proper indexing for performance

Styling Guidelines

Use Tailwind CSS with custom theme colors defined in style guide
Follow mobile-first responsive design approach
Use consistent spacing scale (space-1 through space-12)
Implement proper focus states for accessibility
Use semantic color names (primary, secondary, success, warning)

File Organization
/app
  /(auth)
    /connect/page.tsx          # Strava connection page
    /callback/page.tsx         # OAuth callback handler
  /dashboard
    /page.tsx                  # Main dashboard
    /plans/[id]/page.tsx       # Individual plan view
  /api
    /auth/
      strava/route.ts          # OAuth initiation
      callback/route.ts        # OAuth callback
      logout/route.ts          # Session clearing
    /user/
      profile/route.ts         # User profile data
      activities/route.ts      # Strava activities
      stats/route.ts           # Training analysis
    /plans/
      generate/route.ts        # AI plan generation
      [id]/route.ts            # Plan retrieval
  layout.tsx                   # Root layout
  page.tsx                     # Home/landing page

/components
  /auth/
    StravaConnectButton.tsx
    UserProfile.tsx
  /plans/
    PlanGenerator.tsx
    PlanOverview.tsx
    WeekView.tsx
    WorkoutCard.tsx
  /ui/
    Button.tsx
    Card.tsx
    LoadingSpinner.tsx
  /layout/
    Header.tsx
    Footer.tsx

/lib
  /auth/
    session.ts               # Session management
    middleware.ts            # Auth middleware
  /api/
    strava.ts                # Strava API client
    anthropic.ts             # Claude API client
  /db/
    connection.ts            # Database connection
    queries.ts               # Database queries
  /utils/
    validation.ts            # Input validation
    calculations.ts          # Pace and distance calculations

/types
  index.ts                   # Main type definitions
  strava.ts                  # Strava API types
  training.ts                # Training plan types
Critical Implementation Details
Authentication Flow

User clicks "Connect with Strava" → redirect to Strava OAuth
Strava callback exchanges code for tokens → store encrypted in Vercel KV
Create/update user record in PlanetScale
Set secure session cookie and redirect to dashboard
Protect all authenticated routes with middleware

Plan Generation Process

Fetch user's recent Strava activities (12 weeks)
Analyze training data (volume, consistency, paces)
Generate structured prompt for Anthropic API including:

Current fitness assessment
Selected race distance and target time
Training availability and preferences


Parse and validate AI response
Store complete plan in database
Display with clear navigation and export options

Error Handling Strategy

Strava API Errors: Retry with exponential backoff, graceful degradation
Anthropic API Errors: Retry once, fallback to template plans if needed
Database Errors: Proper transaction rollbacks, user-friendly messages
User Errors: Clear validation messages, guided recovery steps

Security Requirements

All routes use HTTPS with proper security headers
Strava tokens encrypted before storage in KV
Input validation and sanitization on all user data
Rate limiting on API endpoints to prevent abuse
Secure session management with HTTP-only cookies
CSRF protection using state parameter in OAuth flow

Performance Requirements

Initial page load under 3 seconds
Plan generation completes within 10 seconds (Vercel limit)
Cache Strava data for 4 hours to minimize API calls
Optimize images and implement proper lazy loading
Use code splitting for optimal bundle sizes
Monitor Core Web Vitals and maintain good scores

Testing Strategy

Unit tests for utility functions and calculations
Integration tests for API routes and database operations
End-to-end tests for critical user journeys (OAuth, plan generation)
Accessibility testing with automated tools
Performance testing under realistic load scenarios

Common Pitfalls to Avoid

Don't exceed Strava API rate limits - implement proper caching
Don't ignore Vercel serverless timeout - optimize AI prompts for speed
Don't store sensitive data in local storage - use secure server-side sessions
Don't assume all users have extensive running history - handle edge cases
Don't make plans too aggressive - prioritize injury prevention
Don't forget mobile users - test thoroughly on various devices

Development Workflow

Always reference relevant user stories and acceptance criteria
Implement comprehensive error handling for external API dependencies
Test with real Strava data when possible
Follow established patterns for component structure and API routes
Include proper TypeScript types for all new features
Add loading states and empty states for all user-facing features
Test mobile responsiveness throughout development
Write clear, actionable commit messages
Update documentation for any new patterns or significant changes

Environment Variables Required
# Strava API
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret

# Anthropic API
ANTHROPIC_API_KEY=your_anthropic_api_key

# Database
DATABASE_URL=your_neon_postgresql_connection_string

# Redis Cache
KV_REST_API_URL=your_vercel_kv_url
KV_REST_API_TOKEN=your_vercel_kv_token

# Security
NEXTAUTH_SECRET=your_session_encryption_key
NEXTAUTH_URL=your_app_domain

# Optional
VERCEL_ANALYTICS_ID=your_vercel_analytics_id
API Integration Specifics
Strava API Best Practices

Always include athlete_id in requests to avoid rate limit issues
Use include_all_efforts=false to reduce payload size
Implement proper pagination for users with many activities
Handle different activity types gracefully (some users log walks, etc.)
Respect user privacy settings - some activities may be private

Anthropic API Usage

Keep prompts focused and specific to avoid unnecessary token usage
Include examples of desired output format in prompts
Implement proper retry logic for rate limiting
Parse responses carefully - AI output may vary in format
Include fallback logic for when AI generates inappropriate plans

Remember: The goal is to create a tool that helps runners train effectively and safely. Always prioritize user experience, data accuracy, and injury prevention over flashy features.