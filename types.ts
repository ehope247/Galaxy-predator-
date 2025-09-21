
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

export interface Match {
    id: number;
    utcDate: string;
    status: string;
    matchday: number;
    homeTeam: Team;
    awayTeam: Team;
    competition: {
        name: string;
        code: string;
        emblem: string;
    };
    score: {
        winner: string | null;
        fullTime: {
            home: number | null;
            away: number | null;
        };
    };
}

export interface FootballDataResponse {
    matches: Match[];
}

export interface TavilySearchResult {
    title: string;
    url: string;
    content: string;
    score: number;
    raw_content?: string;
}

export interface TavilyResponse {
    results: TavilySearchResult[];
}

export interface GeminiPrediction {
    predictedScore: {
        home: number;
        away: number;
    };
    reasoning: string;
    keyPlayer: string;
}
