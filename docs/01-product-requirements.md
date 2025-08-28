bonk.ai MVP - Product Requirements Document
Executive Summary
bonk.ai is a web application that generates personalized 12-week running training plans by analyzing users' Strava data and race goals. The MVP focuses on delivering intelligent, data-driven training plans without the complexity of route generation.
Problem Statement
Runners struggle to create effective training plans that account for their current fitness level, training history, and specific race goals. Generic plans don't consider individual progress and limitations, while custom coaching is expensive and inaccessible.
Target Audience
Primary Persona: The Committed Amateur Runner

Demographics: Ages 25-45, income $50K+, college-educated
Running Experience: 2-5 years consistent running, 15-40 miles/week
Goals: Sub-4 marathon, BQ times, first ultra, PR in 5K-half marathon
Pain Points:

Overwhelmed by training plan options
Plans don't match current fitness level
Don't know how to progress safely
Want data-driven recommendations



Secondary Persona: The Returning Runner

Demographics: Ages 30-50, previously active, getting back into running
Experience: Had a running background, took time off, rebuilding fitness
Goals: Complete first race back, avoid injury, gradual progression
Pain Points:

Unsure where to start after time off
Fear of doing too much too soon
Need conservative but effective progression



Product Goals

Primary: Generate personalized 12-week training plans using Strava data
Secondary: Provide clear weekly structure with paces and workout types
Success Metrics:

User completes Strava connection (>80%)
Generates training plan (>90% of connected users)
User satisfaction with plan relevance (>4.0/5.0)



Core Features (MVP)
1. Strava Integration

OAuth connection to access user's running data
Data analysis of recent 12 weeks of training
Fitness assessment based on volume, consistency, pace trends

2. Goal Setting

Race distance selection (5K, 10K, Half Marathon, Marathon)
Target completion time (optional)
Training availability (days per week, constraints)

3. AI Plan Generation

Anthropic API integration to generate structured training plans
Periodization logic appropriate for race distance and timeline
Personal fitness consideration based on Strava analysis

4. Plan Display

12-week overview with weekly themes and mileage progression
Weekly detail view showing specific workouts
Pace recommendations based on current fitness and goals

Technical Requirements
Performance

Plan generation completes within 10 seconds (Vercel timeout limit)
Responsive design for mobile and desktop
Fast initial page load (<3 seconds)

Security

Secure OAuth token storage
API key protection
User data privacy compliance

Scalability

Serverless architecture ready for growth
API rate limit handling for Strava and Anthropic
Efficient data caching

Out of Scope (V1)

Route generation and mapping
Social features and community
Plan modifications after generation
Progress tracking and plan updates
Payment processing
Mobile app

Success Criteria

Technical: Successful Strava integration and plan generation
User Experience: Intuitive flow from connection to plan delivery
Content Quality: Generated plans are coherent and appropriate for user fitness level
Performance: System handles concurrent users without timeout issues

Future Considerations (V2+)

Dynamic route generation based on workout types
Plan adjustments based on ongoing training data
Social sharing and community features
Coaching marketplace integration
Advanced analytics and performance tracking