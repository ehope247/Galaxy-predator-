import { TAVILY_API_URL, TAVILY_API_KEY } from '../constants';
import type { TavilyResponse, TavilySearchResult } from '../types';

export const getTeamNews = async (teamName: string): Promise<TavilySearchResult[]> => {
    const apiKey = TAVILY_API_KEY;
    if (!apiKey || apiKey === 'YOUR_TAVILY_API_KEY_HERE') {
        throw new Error("Tavily API key is not configured. Please add your key to the constants.ts file.");
    }

    const query = `latest news and injury updates for ${teamName} football club`;
    
    const response = await fetch(`https://corsproxy.io/?${TAVILY_API_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            api_key: apiKey,
            query: query,
            search_depth: "basic",
            include_answer: false,
            max_results: 5,
        }),
    });

    if (!response.ok) {
        throw new Error(`Tavily API error: ${response.statusText}`);
    }

    const data: TavilyResponse = await response.json();
    return data.results;
};