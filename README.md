# ZEMA - Zero Effort Mail Automation

*Railway production deployment - Fixed server configuration for Railway - Build: 2025-01-11 21:45*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)

## Overview

ZEMA is a comprehensive AI-powered email automation SaaS platform that revolutionizes how users manage their email workflow. Built with modern web technologies, ZEMA provides intelligent email processing, automation rules, sentiment analysis, and productivity optimization tools.

### Key Features

- **🤖 AI-Powered Email Processing**: Advanced GPT-4o integration for intelligent email analysis
- **📧 Multi-Platform Integration**: Support for Gmail, Outlook, and 40+ third-party platforms
- **🎯 Smart Automation Rules**: Dual-level interface for both novice and power users
- **📊 Predictive Analytics**: Email volume forecasting and communication insights
- **🔒 Advanced Security**: Real-time threat detection and email security scanning
- **👥 Team Collaboration**: Shared rules, performance tracking, and team analytics
- **📈 Business Intelligence**: Comprehensive dashboard with productivity metrics

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Framer Motion** for animations
- **TanStack Query** for state management
- **Wouter** for routing

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** with Drizzle ORM
- **OpenAI GPT-4o** for AI features
- **OAuth2** for platform integrations

### Infrastructure
- **Vite** for build tooling
- **Docker** support included
- **Environment-based configuration**
- **Production-ready deployment**

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/zema.git
   cd zema
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/zema
   OPENAI_API_KEY=your_openai_api_key_here
   SESSION_SECRET=your_session_secret_here
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Visit the application**
   Open http://localhost:5000 in your browser

### Default Credentials

- **Demo User**: demo@zema.com / demo123
- **Admin User**: admin@zema.com / Luna0906!

## Core Features

### 🤖 AI-Powered Automation

ZEMA leverages OpenAI's GPT-4o for intelligent email processing:

- **Smart Email Classification**: Automatically categorizes emails by purpose and urgency
- **Sentiment Analysis**: Real-time emotion detection in email communication
- **Content Summarization**: AI-generated summaries of long email threads
- **Priority Scoring**: Intelligent email prioritization based on context
- **Auto-Response Generation**: Context-aware email reply suggestions

### 📧 Email Rule Creation

**Dual-Level Interface Design:**

1. **AI-Guided Builder** (For Beginners)
   - Conversational interface with step-by-step guidance
   - Natural language rule creation
   - AI asks contextual questions to build rules automatically

2. **Advanced Builder** (For Power Users)
   - Full-featured form with detailed conditions and actions
   - Multiple operators and field types
   - Real-time rule preview and validation

### 🔐 Security & Compliance

- **Real-time Threat Detection**: AI-powered phishing and malware detection
- **Privacy Controls**: User data encryption and secure storage
- **Compliance Ready**: SOC 2 Type II aligned security measures
- **Multi-factor Authentication**: Enhanced account security

### 📊 Analytics & Insights

- **Performance Metrics**: Email processing statistics and efficiency tracking
- **Predictive Analytics**: Email volume forecasting and trend analysis
- **Communication Insights**: Response time analysis and engagement metrics
- **Team Analytics**: Collaborative performance tracking

### 🔗 Platform Integrations

**40+ Platform Support:**
- **Email**: Gmail, Outlook, Yahoo Mail
- **Calendar**: Google Calendar, Outlook Calendar, Calendly
- **Project Management**: Trello, Asana, Monday.com, ClickUp, Linear, Jira
- **Communication**: Slack, Discord, Telegram, WhatsApp
- **CRM**: Salesforce, HubSpot, Pipedrive
- **Cloud Storage**: Google Drive, Dropbox, OneDrive
- **And many more...**

## Architecture

```
zema/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express.js backend
│   ├── services/          # Business logic services
│   ├── routes.ts          # API endpoints
│   ├── db.ts              # Database configuration
│   └── storage.ts         # Data access layer
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema definitions
└── docs/                  # Documentation
```

## API Documentation

### Authentication
- `POST /api/auth/login` - User authentication
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - User logout

### Email Management
- `GET /api/email-accounts` - List user email accounts
- `POST /api/email-accounts` - Add new email account
- `PUT /api/email-accounts/:id` - Update email account

### Automation Rules
- `GET /api/automation-rules` - List user automation rules
- `POST /api/automation-rules` - Create new automation rule
- `PUT /api/automation-rules/:id` - Update automation rule
- `DELETE /api/automation-rules/:id` - Delete automation rule

### AI Services
- `POST /api/ai/analyze-email` - Analyze email content with AI
- `POST /api/ai/generate-reply` - Generate AI-powered email reply
- `POST /api/ai/sentiment-analysis` - Perform sentiment analysis

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard metrics
- `GET /api/analytics/predictive` - Get predictive analytics
- `GET /api/analytics/performance` - Get performance metrics

## Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   DATABASE_URL=your_production_db_url
   OPENAI_API_KEY=your_production_openai_key
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

### Docker Deployment

```bash
# Build the Docker image
docker build -t zema .

# Run the container
docker run -p 5000:5000 --env-file .env zema
```

### Cloud Deployment

ZEMA supports deployment on major cloud platforms:

- **Vercel**: Automatic deployment from GitHub
- **Railway**: One-click deployment with database
- **Render**: Static site + backend service
- **DigitalOcean**: App Platform deployment
- **AWS**: EC2 + RDS setup
- **Google Cloud**: App Engine deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 **Email**: support@zema.app
- 💬 **Discord**: [Join our community](https://discord.gg/zema)
- 📖 **Documentation**: [docs.zema.app](https://docs.zema.app)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/zema/issues)

## Acknowledgments

- OpenAI for GPT-4o integration
- The React and TypeScript communities
- All contributors who help make ZEMA better

---

**Made with ❤️ by the ZEMA team**

*Zero Effort Mail Automation - Revolutionizing email productivity one automation at a time.*
