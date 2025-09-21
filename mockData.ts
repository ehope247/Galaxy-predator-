import type { Match } from './types';

// Helper to generate a future date for realistic scheduling
const generateDate = (daysInFuture: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysInFuture);
    // Add a time to the date
    date.setHours(15, 0, 0, 0); 
    return date.toISOString();
};

export const MOCK_FIXTURES: Match[] = [
    {
        id: 1001,
        utcDate: generateDate(1),
        status: 'SCHEDULED',
        matchday: 1,
        homeTeam: {
            id: 65,
            name: 'Manchester City FC',
            shortName: 'Man City',
            crest: 'https://crests.football-data.org/65.png'
        },
        awayTeam: {
            id: 61,
            name: 'Chelsea FC',
            shortName: 'Chelsea',
            crest: 'https://crests.football-data.org/61.png'
        },
        competition: {
            name: 'Premier League',
            code: 'PL',
            emblem: 'https://crests.football-data.org/PL.png'
        },
        score: {
            winner: null,
            fullTime: { home: null, away: null }
        }
    },
    {
        id: 1002,
        utcDate: generateDate(2),
        status: 'SCHEDULED',
        matchday: 1,
        homeTeam: {
            id: 86,
            name: 'Real Madrid CF',
            shortName: 'Real Madrid',
            crest: 'https://crests.football-data.org/86.png'
        },
        awayTeam: {
            id: 81,
            name: 'FC Barcelona',
            shortName: 'Barça',
            crest: 'https://crests.football-data.org/81.png'
        },
        competition: {
            name: 'Premier League',
            code: 'PL',
            emblem: 'https://crests.football-data.org/PD.png'
        },
        score: {
            winner: null,
            fullTime: { home: null, away: null }
        }
    },
    {
        id: 1003,
        utcDate: generateDate(3),
        status: 'SCHEDULED',
        matchday: 1,
        homeTeam: {
            id: 5,
            name: 'FC Bayern München',
            shortName: 'Bayern',
            crest: 'https://crests.football-data.org/5.png'
        },
        awayTeam: {
            id: 4,
            name: 'Borussia Dortmund',
            shortName: 'Dortmund',
            crest: 'https://crests.football-data.org/4.png'
        },
        competition: {
            name: 'Premier League',
            code: 'PL',
            emblem: 'https://crests.football-data.org/BL1.png'
        },
        score: {
            winner: null,
            fullTime: { home: null, away: null }
        }
    },
     {
        id: 1004,
        utcDate: generateDate(4),
        status: 'SCHEDULED',
        matchday: 1,
        homeTeam: {
            id: 109,
            name: 'Juventus',
            shortName: 'Juve',
            crest: 'https://crests.football-data.org/109.png'
        },
        awayTeam: {
            id: 98,
            name: 'AC Milan',
            shortName: 'Milan',
            crest: 'https://crests.football-data.org/98.png'
        },
        competition: {
            name: 'Premier League',
            code: 'PL',
            emblem: 'https://crests.football-data.org/SA.png'
        },
        score: {
            winner: null,
            fullTime: { home: null, away: null }
        }
    }
];
