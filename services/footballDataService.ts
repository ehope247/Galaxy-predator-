
import { FOOTBALL_DATA_API_URL, FOOTBALL_DATA_API_KEY } from '../constants';
import type { FootballDataResponse, Match } from '../types';

const PROXY_URL = 'https://corsproxy.io/?';

const headers = {
    'X-Auth-Token': FOOTBALL_DATA_API_KEY,
};

export const getFixtures = async (leagueCode: string): Promise<Match[]> => {
    // We fetch matches for the next 7 days
    const dateFrom = new Date();
    const dateTo = new Date();
    dateTo.setDate(dateFrom.getDate() + 7);

    const dateFromString = dateFrom.toISOString().split('T')[0];
    const dateToString = dateTo.toISOString().split('T')[0];

    const targetUrl = `${FOOTBALL_DATA_API_URL}/competitions/${leagueCode}/matches?dateFrom=${dateFromString}&dateTo=${dateToString}`;
    
    const response = await fetch(
        `${PROXY_URL}${encodeURIComponent(targetUrl)}`, 
        { headers }
    );
    
    if (!response.ok) {
        throw new Error(`Football-Data API error: ${response.statusText}`);
    }

    const data: FootballDataResponse = await response.json();
    return data.matches.filter(match => match.status === 'SCHEDULED' || match.status === 'TIMED');
};
