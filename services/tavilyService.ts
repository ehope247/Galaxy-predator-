import type { TavilyResponse, TavilySearchResult } from '../types';

export const getTeamNews = async (teamName: string): Promise<TavilySearchResult[]> => {
    // The request is now sent to our internal API route.
    const response = await fetch(`/api/tavily-search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // We only need to send the team name; the server handles the rest.
        body: JSON.stringify({ teamName }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Tavily API error: ${response.statusText}`);
    }

    const data: TavilyResponse = await response.json();
    return data.results;
};
