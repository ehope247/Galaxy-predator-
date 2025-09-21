import type { League } from './types';

// --- IMPORTANT ---
// To run the application, replace the placeholder values below with your actual API keys.
// For security, do not commit your secret keys to a public repository.
export const FOOTBALL_DATA_API_KEY = 'YOUR_FOOTBALL_DATA_API_KEY_HERE';
export const TAVILY_API_KEY = 'YOUR_TAVILY_API_KEY_HERE';

export const FOOTBALL_DATA_API_URL = 'https://api.football-data.org/v4';
export const TAVILY_API_URL = 'https://api.tavily.com/search';

export const LEAGUES: League[] = [
    { name: 'Premier League', code: 'PL', logo: 'https://crests.football-data.org/PL.png' },
    { name: 'Champions League', code: 'CL', logo: 'https://crests.football-data.org/CL.png' },
    { name: 'Bundesliga', code: 'BL1', logo: 'https://crests.football-data.org/BL1.png' },
    { name: 'La Liga', code: 'PD', logo: 'https://crests.football-data.org/PD.png' },
    { name: 'Serie A', code: 'SA', logo: 'https://crests.football-data.org/SA.png' },
    { name: 'Ligue 1', code: 'FL1', logo: 'https://crests.football-data.org/FL1.png' },
    { name: 'Eredivisie', code: 'DED', logo: 'https://crests.football-data.org/DED.png' },
    { name: 'Primeira Liga', code: 'PPL', logo: 'https://crests.football-data.org/PPL.png' },
    { name: 'Championship', code: 'ELC', logo: 'https://crests.football-data.org/ELC.png' },
    { name: 'Série A', code: 'BSA', logo: 'https://crests.football-data.org/BSA.png' },
];