// src/services/seRanking.ts

import axios from 'axios';
import 'dotenv/config';

const API_BASE_URL = 'https://api.seranking.com/v1';
const API_KEY = process.env.SE_RANKING_API_KEY;

// Helper function to introduce a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


export interface Web2AuthorityData {
  domainAuthority: number;
  referringDomains: number;
  dofollowReferringDomains: number;
  totalBacklinks: number;
  monthlyTrafficHistory: Array<{ month: string; traffic: number }>;
  currentTraffic: number;
  topRankingKeywords: number;
}

export async function getSERankingData(domain: string): Promise<Web2AuthorityData | null> {
  if (!API_KEY) {
    console.warn("[SE Ranking Service] SE_RANKING_API_KEY not found in .env. Skipping API calls.");
    return null;
  }
  
  console.log(`[SE Ranking] Initiating data fetch for ${domain}...`);

  try {
    // --- CORRECTED: Using sequential await WITH an explicit delay ---

    console.log(`[SE Ranking] Fetching backlink summary...`);
    const summaryRes = await axios.get(`${API_BASE_URL}/backlinks/summary`, {
      params: { target: domain, mode: 'domain' },
      headers: { 'Authorization': `Token ${API_KEY}` }
    });

    // WAIT for 500ms before the next call to respect rate limits
    await sleep(500);

    console.log(`[SE Ranking] Fetching traffic history...`);
    const historyRes = await axios.get(`${API_BASE_URL}/domain/overview/history`, {
      params: { domain: domain, source: 'us', type: 'organic' },
      headers: { 'Authorization': `Token ${API_KEY}` }
    });

    // WAIT for 500ms before the final call
    await sleep(500);

    console.log(`[SE Ranking] Fetching current overview...`);
    const overviewRes = await axios.get(`${API_BASE_URL}/domain/overview/db`, {
      params: { domain: domain, source: 'us' },
      headers: { 'Authorization': `Token ${API_KEY}` }
    });

    // --- Process the data ---

    const summaryData = summaryRes.data?.summary?.[0];
    if (!summaryData) throw new Error("Backlink summary data is missing from SE Ranking response.");

    const historyData = historyRes.data;
    if (!historyData || !Array.isArray(historyData)) throw new Error("Traffic history data is missing from SE Ranking response.");

    const overviewData = overviewRes.data?.organic;
    if (!overviewData) throw new Error("DB overview data is missing from SE Ranking response.");
    
    const domainAuthority = summaryData.domain_inlink_rank || 0;
    const referringDomains = summaryData.refdomains || 0;
    const dofollowReferringDomains = summaryData.dofollow_refdomains || 0;
    const totalBacklinks = summaryData.backlinks || 0;

    const monthlyTrafficHistory = historyData.map((monthData: any) => ({
        month: `${monthData.year}-${String(monthData.month).padStart(2, '0')}`,
        traffic: monthData.traffic_sum || 0
    })).slice(-12);

    const currentTraffic = overviewData.traffic || 0;
    const topRankingKeywords = 
        (overviewData.top1_5 || 0) + 
        (overviewData.top6_10 || 0) + 
        (overviewData.top11_20 || 0) + 
        (overviewData.top21_50 || 0) + 
        (overviewData.top51_100 || 0);

    console.log(`[SE Ranking] Successfully fetched and processed data for ${domain}.`);
    
    return {
      domainAuthority,
      referringDomains,
      dofollowReferringDomains,
      totalBacklinks,
      monthlyTrafficHistory,
      currentTraffic,
      topRankingKeywords,
    };

  } catch (error) {
    if (axios.isAxiosError(error)) {
        console.error(`[SE Ranking] Axios error for ${domain}: ${error.message}`);
        console.error("API Response Error:", error.response?.data);
    } else {
        console.error(`[SE Ranking] An unexpected error occurred for ${domain}:`, error);
    }
    return null;
  }
}