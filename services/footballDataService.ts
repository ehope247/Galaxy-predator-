import { FOOTBALL_DATA_API_URL, FOOTBALL_DATA_API_KEY } from '../constants';
import type { FootballDataResponse, Match } from '../types';

export const getFixtures = async (leagueCode: string): Promise<Match[]> => {
    const apiKey = FOOTBALL_DATA_API_KEY;
    if (!apiKey) {
        throw new Error("Football Data API key is not configured in constants.ts.");
    }

    const headers = {
        'X-Auth-Token': apiKey,
    };

    // We fetch matches for the next 7 days
    const dateFrom = new Date();
    const dateTo = new Date();
    dateTo.setDate(dateFrom.getDate() + 7);

    const dateFromString = dateFrom.toISOString().split('T')[0];
    const dateToString = dateTo.toISOString().split('T')[0];

    const targetUrl = `${FOOTBALL_DATA_API_URL}/competitions/${leagueCode}/matches?dateFrom=${dateFromString}&dateTo=${dateToString}`;
    
    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`, { headers });
    
    if (!response.ok) {
        throw new Error(`Football-Data API error: ${response.statusText}`);
    }

    const data: FootballDataResponse = await response.json();
    return data.matches.filter(match => match.status === 'SCHEDULED' || match.status === 'TIMED');
};