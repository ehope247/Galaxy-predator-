import type { League } from './types';

export const FOOTBALL_DATA_API_URL = 'https://api.football-data.org/v4';
export const TAVILY_API_URL = 'https://api.tavily.com/search';

// Hardcoded API keys to resolve environment variable issues in this context.
// In a production environment, these should be stored securely as environment variables.
export const FOOTBALL_DATA_API_KEY = 'aa5ce28e561641879baddc65c273298d';
export const TAVILY_API_KEY = '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';
export const GEMINI_API_KEY = 'AIzaSyCbIjQswVo9qr-PYxYkhgEmLq3FlLqw5Og';


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