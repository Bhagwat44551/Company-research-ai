# Company Research AI

I built this for the Relu Consultancy AI & Automation Developer hackathon challenge. 
The idea: give it a company name or a URL, and it goes and figures out what that 
company does, who its competitors are, and hands you back a clean PDF report.

## Try it live

- App: https://company-research-ai-gilt.vercel.app
- API: https://company-research-ai-swoc.onrender.com

(Note: the backend is on Render's free tier, so it might take ~30-50 seconds to 
wake up if it's been idle. First request will feel slow, after that it's fine.)

## What it does

- Type in a company name (like "Stripe") or a URL — either works
- It searches the web, pulls info from the company's actual site
- Sends all that to an AI model to generate a summary, pain points, and competitor suggestions
- You can pick which AI model to use from a dropdown
- Download everything as a PDF at the end

## Stack

- **Frontend:** React
- **Backend:** Node + Express
- **Search:** Serper.dev
- **AI:** OpenRouter (lets you swap models easily)
- **PDF:** pdfkit
- Deployed on Vercel (frontend) + Render (backend)

## How it actually works under the hood

1. User submits a company name or URL
2. Backend hits Serper.dev to find the official site + basic info
3. It tries to crawl the homepage for more content (falls back to the search 
   snippet if the site blocks bots or times out)
4. All that text gets sent to OpenRouter with a prompt asking for a structured report
5. Response comes back, gets shown in the UI, and can be exported as a PDF

## Running it yourself

You'll need Node 18+, and API keys from [Serper.dev](https://serper.dev) and 
[OpenRouter](https://openrouter.ai) — both have free tiers, took me a couple 
minutes to sign up for each.

```bash
git clone https://github.com/Bhagwat44551/Company-research-ai.git
cd Company-research-ai
```

**Backend:**
```bash
cd backend
npm install
```

Make a `.env` file in `backend/`:
```
SERPER_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
PORT=8000
```

```bash
npm run dev
```

**Frontend** (new terminal):
```bash
cd frontend
npm install
npm start
```

Opens at `localhost:3000`, talks to the backend on `localhost:8000`.

## About the AI model

By default it uses `openrouter/free` — OpenRouter's free model router — so anyone 
can clone this and run it without needing to add credits anywhere. You can switch 
to Claude Sonnet 4, GPT-4o, or whatever else OpenRouter supports from the dropdown, 
those will just need a funded OpenRouter account.

## A few honest notes

- The website crawler is fairly basic — it grabs the homepage and strips HTML tags. 
  It doesn't recursively crawl multiple pages (About, Products, etc.) since that 
  added complexity I didn't have time to fully test given the 6-hour window.
- Some sites block scraping/bots entirely — in those cases it falls back to just 
  using the search snippet from Serper, which usually still gives the AI enough 
  to work with.
- Discord integration was listed as a bonus feature in the brief — I didn't get 
  to build that given time constraints, everything else is functional.

## Env variables

| Variable | What it's for | Get it from |
|---|---|---|
| `SERPER_API_KEY` | Company search/research | serper.dev |
| `OPENROUTER_API_KEY` | AI analysis | openrouter.ai |