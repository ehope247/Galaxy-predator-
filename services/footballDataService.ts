import type { FootballDataResponse, Match } from '../types';

export const getFixtures = async (leagueCode: string): Promise<Match[]> => {
    // The client now calls our own secure, server-side API route.
    // This route will handle the API key and fetch the data from the external service.
    const response = await fetch(`/api/football-data?leagueCode=${leagueCode}`);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // The error message from our serverless function is now displayed to the user.
        throw new Error(errorData.error || `API error: ${response.statusText}`);
    }

    const data: FootballDataResponse = await response.json();
    // Filter for only upcoming matches.
    return data.matches.filter(match => match.status === 'SCHEDULED' || match.status === 'TIMED');
};
