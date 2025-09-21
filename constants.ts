
import type { League } from './types';

// --- IMPORTANT SETUP REQUIRED ---
// Welcome! To get the app running, you need to add your API keys to this file.
// This is the main configuration file for the application.
//
// HOW TO ADD YOUR KEYS:
// 1. You are looking at the correct file: `constants.ts`.
// 2. Replace the placeholder text (e.g., 'YOUR_FOOTBALL_DATA_API_KEY_HERE') with your actual API keys.
// 3. Save this file. The app will automatically use your new keys.
//
// NOTE: Your Google Gemini API key is handled securely and automatically. You do not need to add it here.
// It should be configured as an environment variable named `API_KEY` in your project's settings.

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
