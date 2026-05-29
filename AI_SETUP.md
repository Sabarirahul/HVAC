# AI-Powered HVAC Monitoring App - Setup Guide

## 🤖 AI Integration Setup

### 1. OpenAI API Key Configuration

#### Get Your API Key:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

#### Configure Environment Variables:

**Create `.env` file in project root:**
```bash
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important Notes:**
- Use `EXPO_PUBLIC_` prefix for client-side access in Expo
- Never commit `.env` to version control
- Add `.env` to `.gitignore`

### 2. Security Considerations

⚠️ **For Production Apps:**

**Current Implementation (MVP/Demo):**
- API key stored in client-side environment variable
- Suitable for hiring challenge demos
- NOT recommended for production

**Production Best Practices:**
1. **Backend Proxy:**
   - Create backend API endpoint
   - Store OpenAI key server-side
   - Client calls your backend, not OpenAI directly

2. **Rate Limiting:**
   - Implement request throttling
   - Cache AI responses
   - Set usage quotas per user

3. **Key Rotation:**
   - Rotate API keys regularly
   - Use separate keys for dev/prod

4. **Cost Management:**
   - Monitor OpenAI usage dashboard
   - Set spending limits
   - Implement fallback for quota exceeded

### 3. How Environment Variables Work in Expo

**Expo SDK 54 Environment Variables:**

```typescript
// Access in code:
const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
```

**Key Points:**
- `EXPO_PUBLIC_` prefix makes variable available in client code
- Variables without prefix are build-time only
- Restart dev server after changing `.env`
- Use `npx expo start --clear` to clear cache

**Build-time vs Runtime:**
- Expo injects `EXPO_PUBLIC_*` variables at build time
- They become part of the JavaScript bundle
- Not truly "secret" in client apps

### 4. Testing Without API Key

The app includes fallback insights:
- Works without OpenAI API key
- Shows generic maintenance recommendations
- Useful for testing UI/UX

### 5. AI Prompt Optimization

**Current Prompt Strategy:**
- Focuses on actionable insights
- Reduces false alarms with threshold context
- Prioritizes critical issues
- Mobile-friendly language

**Customization:**
Edit `src/services/ai.ts` → `buildPrompt()` function

### 6. Cost Estimation

**GPT-4o-mini Pricing (as of 2024):**
- ~$0.00015 per request (200 tokens)
- 1000 insights ≈ $0.15
- Very affordable for MVP

**Optimization Tips:**
- Cache insights for same sensor readings
- Only regenerate on significant changes
- Use lower temperature (0.3) for consistency

### 7. Alternative AI Providers

**Easy Swaps:**
- Anthropic Claude (similar API)
- Google Gemini
- Azure OpenAI
- Local models (Ollama)

Just modify `src/services/ai.ts` API endpoint and headers.

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your OpenAI API key

# Start app
npx expo start --clear

# Test on device
# Press 'a' for Android, 'i' for iOS
```

## 📱 Features

- ✅ CSV sensor data loading
- ✅ Health score calculation
- ✅ Dashboard with status cards
- ✅ AI-powered maintenance insights
- ✅ Detail screen with sensor readings
- ✅ Retry mechanism for AI failures
- ✅ Fallback insights
- ✅ Mobile-optimized UI

## 🎯 For Hiring Challenge

**Highlights:**
- Real AI integration (not mocked)
- Production-ready error handling
- Clean TypeScript architecture
- Mobile-first design
- Technician-friendly UX
- Scalable prompt engineering

**Demo Tips:**
- Show AI insights for Critical units
- Demonstrate retry functionality
- Explain fallback mechanism
- Discuss production security approach
