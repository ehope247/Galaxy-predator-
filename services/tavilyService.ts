
import { TAVILY_API_URL, TAVILY_API_KEY } from '../constants';
import type { TavilyResponse, TavilySearchResult } from '../types';

const PROXY_URL = 'https://corsproxy.io/?';

export const getTeamNews = async (teamName: string): Promise<TavilySearchResult[]> => {
    const query = `latest news and injury updates for ${teamName} football club`;
    
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(TAVILY_API_URL)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TAVILY_API_KEY}`,
        },
        body: JSON.stringify({
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
