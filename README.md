# Domain Value Estimator

An AI-powered domain valuation tool that provides accurate estimates based on multiple factors including domain age, SEO metrics, and market trends.

## Features

- 🤖 AI-powered domain value estimation
- 📊 Comprehensive domain analysis
- 🔍 SEO metrics and keyword suggestions
- 📈 Traffic estimation
- 📱 Responsive design
- 💳 Stripe payment integration
- 💼 Free and Pro plans

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Stripe account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/domain-value-estimator.git
cd domain-value-estimator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_APP_URL` | Your application URL |
| `VITE_OPENAI_API_KEY` | OpenAI API key |
| `VITE_STRIPE_SECRET_KEY` | Stripe secret key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `VITE_STRIPE_PRICE_ID` | Stripe price ID for subscription |
| `VITE_STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features by Plan

### Free Plan
- 5 domain valuations per day
- Basic domain analysis
- Domain age verification
- SEO metrics

### Pro Plan ($19.95/month)
- Unlimited domain valuations
- Bulk domain analysis
- Detailed PDF reports
- API access

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.