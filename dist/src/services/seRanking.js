// src/services/seRanking.ts
import axios from 'axios';
import 'dotenv/config';
const API_BASE_URL = 'https://api.seranking.com/v1';
const API_KEY = process.env.SE_RANKING_API_KEY; // Ensure SE_RANKING_API_KEY is in your .env file
/**
 * Fetches a comprehensive Web2 authority and traffic profile for a given domain
 * from the SE Ranking API. It makes three API calls in parallel for maximum efficiency.
 *
 * @param domain The domain name to query.
 * @returns A promise that resolves to the processed Web2 data object, or null on failure.
 */
export async function getSERankingData(domain) {
    if (!API_KEY) {
        console.warn("[SE Ranking Service] SE_RANKING_API_KEY not found in .env. Skipping API calls.");
        return null;
    }
    console.log(`[SE Ranking] Initiating data fetch for ${domain}...`);
    try {
        // --- We run all three necessary API calls in parallel using Promise.all ---
        const [summaryRes, historyRes, overviewRes] = await Promise.all([
            // Call 1: Get Backlink Summary (for Authority metrics)
            axios.get(`${API_BASE_URL}/backlinks/summary`, {
                params: { target: domain, mode: 'domain' },
                headers: { 'Authorization': `Token ${API_KEY}` }
            }),
            // Call 2: Get Domain History (for Traffic Trend)
            axios.get(`${API_BASE_URL}/domain/overview/history`, {
                params: { domain: domain, source: 'us', type: 'organic' }, // 'us' is a good default
                headers: { 'Authorization': `Token ${API_KEY}` }
            }),
            // Call 3: Get DB Overview (for current traffic and keyword stats)
            axios.get(`${API_BASE_URL}/domain/overview/db`, {
                params: { domain: domain, source: 'us' },
                headers: { 'Authorization': `Token ${API_KEY}` }
            }),
        ]);
        // --- Process the data from all three successful calls ---
        const summaryData = summaryRes.data?.summary?.[0];
        if (!summaryData)
            throw new Error("Backlink summary data is missing from SE Ranking response.");
        const historyData = historyRes.data;
        if (!historyData || !Array.isArray(historyData))
            throw new Error("Traffic history data is missing from SE Ranking response.");
        const overviewData = overviewRes.data?.organic;
        if (!overviewData)
            throw new Error("DB overview data is missing from SE Ranking response.");
        // Extracting the specific data points we need
        const domainAuthority = summaryData.domain_inlink_rank || 0;
        const referringDomains = summaryData.refdomains || 0;
        const dofollowReferringDomains = summaryData.dofollow_refdomains || 0;
        const totalBacklinks = summaryData.backlinks || 0;
        const monthlyTrafficHistory = historyData.map((monthData) => ({
            month: `${monthData.year}-${String(monthData.month).padStart(2, '0')}`,
            traffic: monthData.traffic_sum || 0
        })).slice(-12); // We only need the last 12 months for the trend
        const currentTraffic = overviewData.traffic || 0;
        const topRankingKeywords = (overviewData.top1_5 || 0) +
            (overviewData.top6_10 || 0) +
            (overviewData.top11_20 || 0) +
            (overviewData.top21_50 || 0) +
            (overviewData.top51_100 || 0);
        console.log(`[SE Ranking] Successfully fetched and processed data for ${domain}.`);
        // Combine into our final, clean data object, conforming to the interface
        return {
            domainAuthority,
            referringDomains,
            dofollowReferringDomains,
            totalBacklinks,
            monthlyTrafficHistory,
            currentTraffic,
            topRankingKeywords,
        };
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[SE Ranking] Axios error for ${domain}: ${error.message}`);
            // Log the specific error from the API if available
            console.error("API Response Error:", error.response?.data);
        }
        else {
            console.error(`[SE Ranking] An unexpected error occurred for ${domain}:`, error);
        }
        return null;
    }
}
