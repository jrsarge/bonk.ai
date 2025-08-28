bonk.ai MVP - Architecture Design Document
System Overview
bonk.ai is built as a Next.js application deployed on Vercel, leveraging serverless functions for API integrations and a simple database for caching user data and generated plans.
Technology Stack
Frontend

Next.js 14 (App Router)
React 18 with TypeScript
Tailwind CSS for styling
React Hook Form for form management
Lucide React for icons

Backend

Next.js API Routes (serverless functions)
Vercel KV (Redis) for session and token storage
PlanetScale (MySQL) for persistent data storage

External APIs

Strava API v3 for athlete data and activities
Anthropic Claude API for training plan generation

Deployment

Vercel for hosting and serverless functions
Environment variables for API keys and secrets

System Architecture
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   Frontend      │────│   API Routes     │────│  External APIs  │
│   (Next.js)     │    │   (Serverless)   │    │  (Strava,       │
│                 │    │                  │    │   Anthropic)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │
         │                        │
         │              ┌─────────────────┐
         │              │                 │
         └──────────────│   Database      │
                        │   (PlanetScale + │
                        │    Vercel KV)   │
                        └─────────────────┘
Database Schema
Users Table (PlanetScale)
sqlCREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  strava_id BIGINT UNIQUE NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  profile_picture_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
Training Plans Table (PlanetScale)
sqlCREATE TABLE training_plans (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  race_distance ENUM('5k', '10k', 'half_marathon', 'marathon'),
  target_time VARCHAR(20),
  plan_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
Cache Layer (Vercel KV)

Strava tokens: strava_token:{user_id} (expires with token)
User sessions: session:{session_id} (24 hour expiry)
Recent activities: activities:{user_id} (4 hour expiry)

API Routes Structure
Authentication Routes

GET /api/auth/strava - Initiate Strava OAuth
GET /api/auth/callback - Handle OAuth callback
POST /api/auth/logout - Clear session

User Data Routes

GET /api/user/profile - Get user profile
GET /api/user/activities - Get recent Strava activities
GET /api/user/stats - Get training analysis

Training Plan Routes

POST /api/plans/generate - Generate new training plan
GET /api/plans/[id] - Get specific training plan
GET /api/plans/user - Get user's training plans

Data Flow
1. User Authentication
User clicks "Connect Strava" 
→ Redirect to Strava OAuth 
→ User authorizes 
→ Callback receives code 
→ Exchange for access token 
→ Store in Vercel KV 
→ Create/update user record
→ Redirect to dashboard
2. Plan Generation
User selects race distance/goal 
→ Fetch recent Strava activities 
→ Analyze training data (volume, pace, consistency) 
→ Call Anthropic API with structured prompt 
→ Parse and validate response 
→ Store plan in database 
→ Display to user
Security Considerations
API Security

Environment variables for all secrets
Secure token storage in Vercel KV with encryption
Rate limiting on API endpoints
Input validation and sanitization

Data Privacy

Minimal data storage (only necessary Strava data)
Secure token handling
Clear data retention policies

Performance Optimizations
Caching Strategy

Cache Strava activities for 4 hours
Cache user sessions for 24 hours
Static generation for marketing pages

API Efficiency

Batch Strava API calls where possible
Implement request deduplication
Use Vercel Edge Functions for better performance

Error Handling
Strava API Errors

Rate limit handling with exponential backoff
Token refresh logic
Graceful degradation for API outages

Anthropic API Errors

Retry logic for transient failures
Fallback to basic plan templates
Clear error messages to users

Monitoring and Logging
Metrics to Track

API response times
Error rates by endpoint
User conversion funnel
Plan generation success rate

Logging Strategy

Structured logging with context
Error tracking with stack traces
Performance monitoring
User behavior analytics

Deployment Strategy
Environment Setup

Development: Local Next.js with env variables
Staging: Vercel preview deployments
Production: Vercel production with custom domain

CI/CD Pipeline

GitHub integration with Vercel
Automatic deployments on main branch
Preview deployments for PRs
Database migrations via PlanetScale

Scalability Considerations
Current Limitations

Vercel serverless function timeout (10 seconds)
Strava API rate limits (100 req/15min, 1000 req/day)
Anthropic API rate limits (varies by tier)

Scaling Solutions

Implement queue system for slow operations
Cache generated plans aggressively
Consider upgrading to Vercel Pro for longer timeouts
Implement background job processing