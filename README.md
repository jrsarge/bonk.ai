# bonk.ai

AI-powered personalized running training plans that help you never hit the wall (bonk) again.

## Overview

bonk.ai is a Next.js web application that generates personalized 12-week running training plans by analyzing users' Strava data and using AI (Anthropic's Claude) to create intelligent, data-driven training recommendations. The MVP focuses on Strava integration, AI plan generation, and clean plan presentation.

## Features

- **Strava Integration**: Connect your Strava account to analyze your training history
- **AI-Powered Plans**: Claude AI generates personalized 12-week training plans
- **Multiple Distances**: Support for 5K, 10K, Half Marathon, and Marathon training
- **Smart Analysis**: Analyzes your last 12 weeks of data for fitness assessment
- **Mobile-First Design**: Responsive design optimized for mobile devices

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless), Vercel deployment
- **Database**: PlanetScale (MySQL) for persistent data, Vercel KV (Redis) for caching
- **External APIs**: Strava API v3, Anthropic Claude API
- **Deployment**: Vercel with custom domain

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Strava API credentials
- Anthropic API key
- PlanetScale database
- Vercel KV instance

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/bonk.ai.git
cd bonk.ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual API keys and configuration values.

### Required Environment Variables

- `STRAVA_CLIENT_ID` - Your Strava API client ID
- `STRAVA_CLIENT_SECRET` - Your Strava API client secret
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `DATABASE_URL` - PlanetScale connection string
- `KV_REST_API_URL` - Vercel KV URL
- `KV_REST_API_TOKEN` - Vercel KV token
- `NEXTAUTH_SECRET` - Session encryption key
- `NEXTAUTH_URL` - Your app domain (http://localhost:3000 for development)

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Building for Production

```bash
npm run build
```

## Project Structure

```
bonk.ai/
├── app/                    # Next.js App Router pages and API routes
│   ├── (auth)/            # Authentication pages (connect, callback)
│   ├── dashboard/         # Main dashboard
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── user/          # User data endpoints
│   │   └── plans/         # Training plan endpoints
│   ├── globals.css        # Global styles and Tailwind config
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable React components
│   ├── auth/              # Authentication components
│   ├── plans/             # Training plan components
│   ├── ui/                # UI components
│   └── layout/            # Layout components
├── lib/                   # Utility libraries
│   ├── auth/              # Authentication utilities
│   ├── api/               # API clients
│   ├── db/                # Database utilities
│   └── utils/             # General utilities
├── types/                 # TypeScript type definitions
│   ├── index.ts           # Main types
│   ├── strava.ts          # Strava API types
│   └── training.ts        # Training plan types
└── docs/                  # Project documentation
```

## API Endpoints

- `GET /api/auth/strava` - Initiate Strava OAuth
- `GET /api/auth/callback` - Handle OAuth callback
- `POST /api/auth/logout` - Clear user session
- `GET /api/user/profile` - Get user profile
- `GET /api/user/activities` - Get Strava activities
- `GET /api/user/stats` - Get training analysis
- `POST /api/plans/generate` - Generate training plan
- `GET /api/plans/[id]` - Get specific plan

## Key Business Rules

### Training Plans
- Always 12 weeks long with proper periodization
- Pace recommendations based on recent Strava performance
- Distance-specific focuses (5K: speed, Marathon: endurance)
- Weekly mileage progresses logically with recovery weeks

### Strava Integration
- Only fetch running activities (exclude cycling, swimming)
- Analyze last 12 weeks of data
- Respect API rate limits (100/15min, 1000/day)
- Cache activity data for 4 hours

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
