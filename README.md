# bonk.ai

AI-powered personalized running training plans that help you never hit the wall (bonk) again.

## Overview

bonk.ai is a Next.js web application that generates personalized 12-week running training plans using AI (Anthropic's Claude). The application features a simplified, streamlined architecture focused on delivering intelligent training recommendations with a clean, responsive interface.

## Features

- **AI-Powered Plans**: Claude AI generates personalized 12-week running training plans
- **Multiple Distances**: Support for 5K, 10K, Half Marathon, and Marathon training
- **Responsive Design**: Mobile-first design optimized for all devices
- **Analytics Integration**: Vercel Analytics for performance monitoring
- **Simplified Architecture**: Streamlined codebase for faster development and deployment

## Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes (serverless)
- **AI**: Anthropic Claude API
- **Analytics**: Vercel Analytics
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key

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

Edit `.env.local` with your Anthropic API key.

### Required Environment Variables

- `ANTHROPIC_API_KEY` - Your Anthropic API key

### Development

Run the development server with Turbopack:

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
│   ├── connect/            # Authentication/connection pages
│   ├── dashboard/          # Main dashboard
│   ├── api/                # API routes
│   ├── globals.css         # Global styles and Tailwind config
│   ├── layout.tsx          # Root layout with analytics
│   └── page.tsx            # Landing page
├── components/             # Reusable React components
│   ├── auth/               # Authentication components
│   ├── plans/              # Training plan components
│   ├── training/           # Training-related components
│   ├── ui/                 # UI components
│   └── layout/             # Layout components
├── lib/                    # Utility libraries
│   ├── api/                # API clients
│   ├── auth/               # Authentication context
│   ├── export/             # Export utilities
│   ├── storage/            # Storage utilities
│   ├── training/           # Training plan logic
│   └── utils/              # General utilities
├── types/                  # TypeScript type definitions
├── public/                 # Static assets
└── docs/                   # Project documentation
```

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Features

### Training Plans
- 12-week periodized training plans
- Distance-specific training focuses
- AI-generated recommendations based on goals and preferences
- Clean, printable plan format
- Export capabilities

### Modern Stack
- Latest Next.js 15 with App Router
- React 19 for improved performance
- Tailwind CSS 4 for styling
- TypeScript for type safety
- Turbopack for faster builds and development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` to check for issues
5. Submit a pull request

## License

This project is licensed under the MIT License.
