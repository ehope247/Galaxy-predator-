export interface League {
    name: string;
    code: string;
    logo: string;
}

export interface Team {
    id: number;
    name: string;
    shortName: string;
    crest: string;
}

export interface Score {
    winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
    fullTime: {
        home: number | null;
        away: number | null;
    };
}

export interface Competition {
    name: string;
    code: string;
    emblem: string;
}

export interface Match {
    id: number;
    utcDate: string;
    status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'POSTPONED' | 'CANCELLED';
    matchday: number;
    homeTeam: Team;
    awayTeam: Team;
    competition: Competition;
    score: Score;
}

export interface FootballDataResponse {
    matches: Match[];
}

export interface TavilySearchResult {
    title: string;
    url: string;
    content: string;
    score: number;
    raw_content: string | null;
}

export interface TavilyResponse {
    results: TavilySearchResult[];
}

export interface MatchResult {
    opponent: string;
    result: 'W' | 'D' | 'L';
    score: string;
    location: 'H' | 'A';
}

export interface H2HSummary {
    numberOfMatches: number;
    homeWins: number;
    awayWins: number;
    draws: number;
}

export interface GeminiPrediction {
    predictedWinner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW';
    reasoning: string;
    confidence: number;
    homeScore: number;
    awayScore: number;
    keyPlayers: {
        home: string[];
        away: string[];
    };
    bothTeamsToScore: boolean;
    overUnderGoals: 'OVER' | 'UNDER';
    predictedPossession: {
        home: number;
        away: number;
    };
    h2hSummary: H2HSummary;
    form: {
        home: MatchResult[];
        away: MatchResult[];
    };
    source?: 'gemini' | 'fallback_ml';
}