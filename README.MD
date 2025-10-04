
# Peter Agents API (P.E.T.E.R.)

**P**redictive **E**valuation **T**ool for **E**cosystem **R**esearch.

Peter is a sophisticated, multi-agent AI system designed to provide comprehensive intelligence and valuation for on-chain domains. It serves as the backend for the Peter domain analytics platform, built for the Doma DomainFi Challenge.

The system goes beyond traditional Web2 metrics by integrating live, on-chain data from the **Doma Protocol**, real-time community sentiment from **X/Twitter**, and deep market research from **Perplexity**, synthesized by a suite of powerful LLMs from **Together AI** and **Google Gemini**.

## ✨ Features

*   **Multi-Agent Architecture:** Deploys a team of specialist AI agents that run in parallel to analyze different facets of a domain's value.
*   **Deep On-Chain Analysis:** Leverages the Doma Subgraph to analyze a domain's on-chain history, including transfers, renewals, and claim status, to generate a unique "On-Chain Health Score."
*   **Live Market Intelligence:** Uses Perplexity and xAI (Grok) to perform real-time research on market trends, brandability, comparable sales, and crypto-native community sentiment.
*   **Hybrid Intelligence:** Combines quantitative analysis from APIs (Doma, SE Ranking) with qualitative reasoning from Large Language Models to produce a single, cohesive intelligence report.
*   **Resilient & Scalable:** Built as a serverless API on Vercel, ensuring it's scalable, fast, and robust.

## 🤖 The Agent Roster

The Peter API is powered by a team of specialist agents, each with a unique task:

1.  **On-Chain Analyst:** Analyzes a domain's history and state on the Doma Protocol to score its on-chain health and liquidity.
2.  **Web2 Authority Analyst:** Fetches and analyzes traditional SEO metrics like Domain Authority and organic traffic from sources like SE Ranking.
3.  **X Sentiment Agent:** Uses the xAI Grok API to research real-time sentiment and narrative velocity on X/Twitter.
4.  **Market Intelligence Agent:** Uses Perplexity to conduct deep, open-ended research on brandability, market trends, and comparable sales, enriched by the findings of the X Sentiment Agent.
5.  **"LLM-as-a-Model" Agents:** Utilizes Google's Gemini 1.5 Flash with massive-context prompts to simulate trained ML models for tasks like live momentum analysis and liquidity prediction.
6.  **The Aggregator:** A final, high-level LLM that synthesizes the reports from all specialist agents into a single, executive-level summary and a final "Peter Score."

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or later)
*   npm (or your preferred package manager)
*   A Vercel account for deployment.
*   API keys for:
    *   Doma Protocol
    *   Together AI
    *   Perplexity AI
    *   xAI (Grok)
    *   SE Ranking (or another SEO/traffic provider)
    *   Google Gemini

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/akash-mondal/peter-agents-api.git
    cd peter-agents-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create `.env` file:**
    Copy the `.env.example` file to `.env` and fill in your secret API keys.
    ```bash
    cp .env.example .env
    ```

4.  **Run the development server:**
    The server uses `tsx` for live-reloading on file changes.
    ```bash
    npm run dev
    ```
    The API will be available at `http://localhost:3001`.

5.  **Run tests (optional):**
    You can test individual agents using the test script. Modify `test-doma.ts` to call the agent you want to test, then run:
    ```bash
    npm run test:agent
    ```

### Deployment

This project is configured for easy, one-click deployment on **Vercel**.

1.  Push your code to a GitHub repository.
2.  Import the repository into your Vercel dashboard.
3.  In the Vercel project settings, add all the environment variables from your `.env` file.
4.  Click "Deploy." Vercel will handle the rest.

## 🌐 API Usage

The API exposes a single, powerful endpoint for analysis.

### `GET /api/analyze`

This endpoint triggers the full multi-agent analysis for a given domain.

**Query Parameters:**
*   `domain` (required): The domain name you want to analyze. e.g., `crypto.ai`.

**Example Request:**
You can test the live endpoint using `curl` in your terminal:

```bash
curl "https://peter-api-server.vercel.app/api/analyze?domain=crypto.ai" | jq .
```

**Successful Response (`200 OK`):**
The API will return a comprehensive JSON object containing the final synthesized report, including the `peter_score`, `executive_summary`, a breakdown of sub-scores, and a `deep_dive` section with the full reports from each individual agent.

```json
{
  "domain_name": "crypto.ai",
  "peter_score": 63,
  "executive_summary": "...",
  "scores": {
    "on_chain_health": 2,
    "liquidity": 1,
    "seo_authority": 2,
    "traffic": 4,
    "brandability": 9,
    "market_trend": 9
  },
  "deep_dive": {
    "on_chain_report": { ... },
    "web2_report": { ... },
    "market_intel_report": { ... },
    "momentum_report": { ... },
    "liquidity_report": { ... },
    "comps_report": { ... }
  }
}
```

**Error Response (`400` or `500`):**
If the analysis fails or the input is invalid, you will receive an error object.

```json
{
  "error": "The analysis failed. Check server logs."
}
```

## Built With

*   **Framework:** Node.js, Express.js on Vercel Serverless
*   **Language:** TypeScript
*   **AI Orchestration:**
    *   **Together AI:** For structured JSON generation and aggregation.
    *   **Perplexity AI:** For deep web research (`sonar-reasoning-pro`).
    *   **xAI (Grok):** For specialized X/Twitter sentiment analysis.
    *   **Google Gemini:** For "LLM-as-a-Model" tasks with massive context.
*   **Data Sources:**
    *   **Doma Protocol API**
    *   **SE Ranking API**
*   **Tooling:** `tsx` for development, `zod` for data validation.
