bonk.ai MVP - Style Guide
Brand Identity
Mission Statement
Empowering runners with intelligent, personalized training plans that adapt to their unique fitness journey and goals, helping them avoid the dreaded "bonk" through smart preparation.
Brand Personality

Intelligent: Data-driven, analytical, precise
Supportive: Encouraging, understanding, non-judgmental
Accessible: Clear, simple, approachable
Reliable: Consistent, dependable, trustworthy
Clever: Smart references to running culture and AI technology

Visual Design
Color Palette
Primary Colors

Primary Blue: #2563eb (blue-600)

Use: Primary CTAs, links, active states
Represents reliability and performance


Success Green: #16a34a (green-600)

Use: Success states, achievements, positive metrics


Warning Orange: #ea580c (orange-600)

Use: Important notices, caution states



Neutral Colors

Text Primary: #0f172a (slate-900)
Text Secondary: #475569 (slate-600)
Text Muted: #94a3b8 (slate-400)
Background: #ffffff (white)
Background Secondary: #f8fafc (slate-50)
Border: #e2e8f0 (slate-200)

Accent Colors

Strava Orange: #fc4c02 (for Strava branding consistency)
Chart Purple: #7c3aed (violet-600)
Chart Teal: #0d9488 (teal-600)

Typography
Font Stack

Primary: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Monospace: 'Fira Code', 'Monaco', 'Cascadia Code', monospace (for data/times)

Type Scale

Heading XL: text-4xl font-bold (36px) - Page titles
Heading Large: text-3xl font-bold (30px) - Section titles
Heading Medium: text-2xl font-semibold (24px) - Card titles
Heading Small: text-xl font-semibold (20px) - Subsections
Body Large: text-lg (18px) - Important body text
Body: text-base (16px) - Default body text
Body Small: text-sm (14px) - Secondary information
Caption: text-xs (12px) - Labels, metadata

Spacing System
Following Tailwind's spacing scale:

XS: space-1 (4px)
Small: space-2 (8px)
Medium: space-4 (16px)
Large: space-6 (24px)
XL: space-8 (32px)
XXL: space-12 (48px)

Component Styles
Buttons
css/* Primary Button */
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

/* Secondary Button */  
.btn-secondary {
  @apply bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-3 rounded-lg font-semibold transition-colors;
}

/* Strava Connect Button */
.btn-strava {
  @apply bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors;
}
Cards
css.card {
  @apply bg-white rounded-xl border border-slate-200 shadow-sm p-6;
}

.card-header {
  @apply border-b border-slate-100 pb-4 mb-4;
}
Forms
css.input {
  @apply border border-slate-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500;
}

.label {
  @apply text-sm font-semibold text-slate-700 mb-2 block;
}
Content Guidelines
Voice and Tone
Voice Characteristics

Knowledgeable but not condescending: Share expertise without talking down
Encouraging but realistic: Motivate without overpromising
Personal but professional: Friendly without being overly casual

Tone Variations by Context

Onboarding: Excited, welcoming, clear
Plan Generation: Confident, analytical, detailed
Error States: Apologetic, helpful, solution-focused
Success States: Celebratory, encouraging, forward-looking

Writing Style
General Guidelines

Use active voice over passive voice
Write in second person ("your training plan")
Keep sentences concise and scannable
Use specific numbers and data when available
Avoid jargon unless necessary, then explain it

Specific Contexts
Training Plan Language:

Use "workout" instead of "session"
Specify paces clearly: "Easy pace (8:30-9:00/mile)"
Include effort descriptions: "comfortably hard"
Use encouraging but realistic language

Data Presentation:

Round numbers appropriately (6.2 miles, not 6.21371 miles)
Use consistent units (minutes:seconds for pace)
Provide context for metrics ("20% faster than last month")

Error Messages:

Explain what happened in plain language
Provide clear next steps
Include retry options where appropriate
Avoid technical error codes in user-facing text

Content Patterns
Loading States

"Analyzing your training data..."
"Generating your personalized plan..."
"Almost ready! Finalizing your workouts..."

Success Messages

"Your training plan is ready!"
"Strava connected successfully"
"Plan generated based on your recent training"

Empty States

"Connect your Strava to get started"
"No recent activities found - run first!"
"Your training plans will appear here"

Accessibility Standards
Color Accessibility

All color combinations meet WCAG AA contrast standards
Never rely solely on color to convey information
Provide text labels alongside color-coded elements

Interactive Elements

Minimum 44px touch targets for mobile
Clear focus states on all interactive elements
Logical tab order throughout application
Screen reader friendly labels and descriptions

Content Accessibility

Use semantic HTML structure
Provide alt text for images
Include skip navigation links
Use headings hierarchically (h1 → h2 → h3)

Mobile Design Principles
Layout

Mobile-first responsive design
Touch-friendly interface elements
Optimized for one-handed use
Clear visual hierarchy on small screens

Performance

Minimize data usage for mobile users
Optimize images and assets
Fast loading times on slower connections
Progressive enhancement approach

Data Visualization Guidelines
Training Plan Display

Use consistent colors for workout types
Clear date/week progression
Easy-to-scan weekly summaries
Highlight key workouts and rest days

Activity Charts

Simple, focused data presentations
Meaningful date ranges
Clear axis labels and units
Responsive design for mobile viewing

Pace/Time Formatting

Consistent MM:SS format for paces
H:MM:SS format for longer durations
Clear unit labels (per mile, per km, total time)
Use runner-friendly terminology
