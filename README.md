# HNA (HackerNews Analyzer)

A powerful tool that analyzes HackerNews comments to identify micro-SaaS opportunities and pain points using AI. It helps entrepreneurs discover niche problems and validate business ideas through real user feedback.

## Core Features

- **Comment Analysis**
  - Direct text input or website URL processing
  - AI-powered analysis of user pain points
  - Sentiment analysis for each topic
  - Example comments for context

- **Market Analysis**
  - Micro-SaaS opportunity identification
  - Competitor analysis
  - Market size estimation
  - Growth potential assessment
  - Key differentiators
  - Implementation challenges

- **Project Generation**
  - One-click project setup with Bolt.DIY
  - Pre-configured Next.js + Shadcn UI template
  - Automated technical implementation

- **Analysis Management**
  - Save and organize multiple analyses
  - Generate descriptive titles
  - Easy deletion and updates
  - Search through saved analyses

## Getting Started

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file with:
   ```
   OPENAI_API_KEY=your_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development servers
   ```bash
   # Start both main app and Bolt.DIY
   npm run dev:all
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Create New Analysis**
   - Click "New Analysis"
   - Choose input method:
     - Paste text directly
     - Enter website URL for processing
   - Click "Analyze"

2. **View Analysis Results**
   - Pain points with sentiment scores
   - Example comments for each topic
   - Potential micro-SaaS ideas
   - Overall sentiment analysis

3. **Explore Market Opportunities**
   - Click on any identified idea
   - View detailed market analysis
   - See similar existing solutions
   - Understand market size and growth

4. **Generate Implementation**
   - Click "Open in Bolt" for any idea
   - Wait for template to clone
   - Paste the auto-copied prompt
   - Get AI-guided implementation

## Technologies Used

- **Frontend**
  - Next.js 14 with App Router
  - React
  - Shadcn UI
  - TailwindCSS
  - TypeScript

- **Backend & Services**
  - Supabase for data storage
  - OpenAI GPT-4 for analysis
  - Bolt.DIY for implementation

## License

MIT
