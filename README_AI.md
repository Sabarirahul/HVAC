# 🤖 AI-Powered HVAC Monitoring App

An intelligent HVAC monitoring mobile app built with React Native and Expo, featuring AI-powered maintenance insights using OpenAI GPT-4o-mini.

## 🎯 Features

- **Real-time HVAC Monitoring**: Track temperature, pressure, airflow, vibration, and power consumption
- **Health Score Calculation**: Automated scoring based on sensor readings
- **Status Classification**: Critical, Warning, and Healthy status indicators
- **AI Maintenance Insights**: GPT-4o-mini powered recommendations for technicians
- **Mobile-First Design**: Clean, readable UI optimized for factory floor use
- **Offline Fallback**: Works without AI when API is unavailable
- **CSV Data Loading**: Local sensor data processing

## 🛠️ Tech Stack

- **React Native** with Expo SDK 54
- **TypeScript** for type safety
- **Expo Router** for navigation
- **OpenAI API** (GPT-4o-mini) for AI insights
- **Papaparse** for CSV parsing
- **Axios** for API requests
- **expo-file-system** for asset loading

## 📦 Installation

```bash
# Clone repository
git clone <your-repo-url>
cd hvac-ai-app2

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your OpenAI API key to .env
# EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key-here
```

## 🔑 OpenAI API Setup

1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Create `.env` file in project root:
   ```
   EXPO_PUBLIC_OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. Restart dev server after adding key

**Note**: The app works without an API key using fallback insights.

## 🚀 Running the App

```bash
# Start development server
npx expo start --clear

# Run on specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

## 📁 Project Structure

```
hvac-ai-app2/
├── app/                      # Expo Router screens
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Entry point
├── src/
│   ├── components/
│   │   └── HVACCard.tsx     # Reusable HVAC unit card
│   ├── screens/
│   │   ├── DashboardScreen.tsx  # Main dashboard
│   │   └── DetailScreen.tsx     # Unit details + AI insights
│   ├── services/
│   │   ├── loadCSV.ts       # CSV data loader
│   │   └── ai.ts            # OpenAI integration
│   ├── utils/
│   │   └── healthScore.ts   # Health calculation logic
│   └── types/
│       └── index.ts         # TypeScript interfaces
├── assets/
│   └── hvac_sensor_data.csv # Sensor data
├── .env.example             # Environment template
└── AI_SETUP.md             # Detailed AI setup guide
```

## 🎨 Key Components

### Dashboard Screen
- Lists all HVAC units
- Sorts by status priority (Critical → Warning → Healthy)
- Tap any card to view AI insights

### Detail Screen
- Sensor readings with normal ranges
- Health score visualization
- AI-powered maintenance recommendations
- Retry mechanism for failed AI requests
- Confidence indicators (high/medium/low)

### AI Service
- OpenAI GPT-4o-mini integration
- Optimized prompts for HVAC diagnostics
- Fallback insights when API unavailable
- Error handling and retry logic

## 🧠 AI Prompt Engineering

The AI system is optimized for:
- **Anomaly Detection**: Identifies out-of-range sensor readings
- **False Alarm Reduction**: Considers normal operating ranges
- **Actionable Recommendations**: Provides specific technician actions
- **Severity Assessment**: Classifies issues as Critical/Warning/Healthy
- **Concise Output**: Mobile-friendly, jargon-free language

## 💰 Cost Estimation

- GPT-4o-mini: ~$0.00015 per insight
- 1000 insights ≈ $0.15
- Very affordable for MVP/demo

## 🔒 Security Considerations

**Current Implementation (MVP):**
- Client-side API key (suitable for demos)
- Environment variable protection

**Production Recommendations:**
1. Move API calls to backend proxy
2. Implement rate limiting
3. Add request caching
4. Use separate dev/prod keys
5. Monitor usage and set quotas

See `AI_SETUP.md` for detailed security guidance.

## 📊 Data Format

CSV columns:
- `timestamp`: ISO date string
- `unit_id`: HVAC unit identifier
- `temp`: Temperature (°F)
- `pressure`: Pressure (PSI)
- `airflow`: Airflow (CFM)
- `vibration`: Vibration level
- `power`: Power consumption (kW)

## 🎯 For Hiring Challenge

**Highlights:**
- ✅ Real AI integration (not mocked)
- ✅ Production-ready error handling
- ✅ Clean TypeScript architecture
- ✅ Mobile-first responsive design
- ✅ Technician-friendly UX
- ✅ Scalable prompt engineering
- ✅ Comprehensive documentation

## 🐛 Troubleshooting

**CSV Loading Issues:**
- Ensure `metro.config.js` includes CSV in `assetExts`
- Run `npx expo start --clear` to clear cache

**AI Not Working:**
- Check `.env` file exists with valid API key
- Verify key starts with `sk-`
- Check OpenAI account has credits
- Review console for error messages

**Build Errors:**
- Clear cache: `npx expo start --clear`
- Reinstall: `rm -rf node_modules && npm install`
- Check Expo SDK version compatibility

## 📝 License

MIT

## 👨‍💻 Author

Built for hiring challenge demonstration
