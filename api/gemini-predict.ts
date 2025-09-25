// Vercel will automatically turn this file into a serverless function.
// This code runs on the server, not in the browser.

import { GoogleGenAI, Type } from "@google/genai";
import type { Match, TavilySearchResult, GeminiPrediction, MatchResult, H2HSummary } from '../types';

export const config = {
  runtime: 'edge',
};

// Helper function to fetch data from the football-data.org API
const fetchFootballData = async (url: string, apiKey: string) => {
    const response = await fetch(url, { headers: { 'X-Auth-Token': apiKey } });
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Football-Data API error at ${url}:`, errorText);
        // Return null instead of throwing to allow partial data predictions
        return null; 
    }
    return response.json();
};

// Helper function to format news content for the prompt
const formatNews = (teamName: string, news: TavilySearchResult[]): string => {
    if (!news || news.length === 0) {
        return `No recent news found for ${teamName}.`;
    }
    return `Recent news for ${teamName}:\n` + news.map(item => `- ${item.title}: ${item.content}`).join('\n');
};

const getTeamForm = (matches: any[], teamId: number): MatchResult[] => {
    if (!matches) return [];
    return matches.map((m: any): MatchResult => {
        const isHome = m.homeTeam.id === teamId;
        const opponent = isHome ? m.awayTeam.name : m.homeTeam.name;
        const score = `${m.score.fullTime.home} - ${m.score.fullTime.away}`;
        let result: 'W' | 'D' | 'L';
        if (m.score.winner === 'DRAW') {
            result = 'D';
        } else if ((isHome && m.score.winner === 'HOME_TEAM') || (!isHome && m.score.winner === 'AWAY_TEAM')) {
            result = 'W';
        } else {
            result = 'L';
        }
        return { opponent, result, score, location: isHome ? 'H' : 'A' };
    });
};

// Fallback prediction generator
const generateFallbackPrediction = (
    match: Match,
    h2hSummary: H2HSummary,
    homeForm: MatchResult[],
    awayForm: MatchResult[]
): GeminiPrediction => {
    let predictedWinner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW';
    let homeScore: number;
    let awayScore: number;

    // Simple logic: H2H is the main decider, then form
    if (h2hSummary.homeWins > h2hSummary.awayWins) {
        predictedWinner = 'HOME_TEAM';
        homeScore = 2;
        awayScore = 1;
    } else if (h2hSummary.awayWins > h2hSummary.homeWins) {
        predictedWinner = 'AWAY_TEAM';
        homeScore = 1;
        awayScore = 2;
    } else {
        // H2H is tied, check form
        const homeWins = homeForm.filter(f => f.result === 'W').length;
        const awayWins = awayForm.filter(f => f.result === 'W').length;
        if (homeWins > awayWins) {
            predictedWinner = 'HOME_TEAM';
            homeScore = 1;
            awayScore = 0;
        } else if (awayWins > homeWins) {
            predictedWinner = 'AWAY_TEAM';
            homeScore = 0;
            awayScore = 1;
        } else {
            predictedWinner = 'DRAW';
            homeScore = 1;
            awayScore = 1;
        }
    }

    return {
        predictedWinner,
        reasoning: "This is a simplified prediction based on historical head-to-head data and recent form, as the primary AI analyst was unavailable. Key factors considered were past results between the two clubs and their recent win/loss records.",
        confidence: 45,
        homeScore,
        awayScore,
        keyPlayers: {
            home: ["Team's top scorer", "Key midfielder"],
            away: ["Primary attacking threat", "Lead defender"],
        },
        bothTeamsToScore: homeScore > 0 && awayScore > 0,
        overUnderGoals: (homeScore + awayScore) > 2.5 ? 'OVER' : 'UNDER',
        predictedPossession: {
            home: 50,
            away: 50,
        },
        h2hSummary,
        form: { home: homeForm, away: awayForm },
        source: 'fallback_ml',
    };
};

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    
    const geminiApiKey = process.env.API_KEY;
    const footballApiKey = process.env.FOOTBALL_DATA_API_KEY;

    if (!geminiApiKey) {
        return new Response(JSON.stringify({ error: "Gemini API key is not configured." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
     if (!footballApiKey) {
        return new Response(JSON.stringify({ error: "Football Data API key is not configured." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { match, homeNews, awayNews } = await req.json() as { match: Match; homeNews: TavilySearchResult[]; awayNews: TavilySearchResult[] };
        
        // Fetch H2H and Form data
        const [h2hData, homeFormData, awayFormData] = await Promise.all([
            fetchFootballData(`https://api.football-data.org/v4/matches/${match.id}/head2head`, footballApiKey),
            fetchFootballData(`https://api.football-data.org/v4/teams/${match.homeTeam.id}/matches?status=FINISHED&limit=5`, footballApiKey),
            fetchFootballData(`https://api.football-data.org/v4/teams/${match.awayTeam.id}/matches?status=FINISHED&limit=5`, footballApiKey)
        ]);
        
        const h2hSummary: H2HSummary = h2hData?.aggregates ? {
            numberOfMatches: h2hData.aggregates.numberOfMatches,
            homeWins: h2hData.aggregates.homeTeam.wins,
            awayWins: h2hData.aggregates.awayTeam.wins,
            draws: h2hData.aggregates.homeTeam.draws,
        } : { numberOfMatches: 0, homeWins: 0, awayWins: 0, draws: 0 };

        const homeForm = getTeamForm(homeFormData?.matches, match.homeTeam.id);
        const awayForm = getTeamForm(awayFormData?.matches, match.awayTeam.id);
        
        try {
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });
            
            const systemInstruction = `You are a world-class football analyst. Your task is to predict the outcome of an upcoming football match.
Analyze the provided data which includes match details, head-to-head stats, recent team form, and the latest news for both teams.
Based on your analysis, provide a detailed prediction in JSON format.
Your prediction must include:
1.  The predicted winner ('HOME_TEAM', 'AWAY_TEAM', or 'DRAW').
2.  A detailed, data-driven reasoning for your prediction.
3.  A confidence score (0-100).
4.  The predicted final score (home and away goals).
5.  A list of key players for each team.
6.  A prediction for 'Both Teams to Score' (true/false).
7.  A prediction for 'Over/Under 2.5 Goals' ('OVER' or 'UNDER').
8.  The predicted match possession percentages for home and away teams.
9.  A summary of the head-to-head record.
10. A summary of the last 5 matches for each team.
The reasoning should be objective, data-driven, and cover all aspects provided.
Do not use markdown in your reasoning. Use newline characters for paragraph breaks.
Ensure the total possession is exactly 100%.`;
            
            const prompt = `
Please predict the outcome of the following football match:
- Competition: ${match.competition.name}
- Match: ${match.homeTeam.name} vs ${match.awayTeam.name}
- Date: ${match.utcDate}

Head-to-Head Summary:
- Total Matches: ${h2hSummary.numberOfMatches}
- ${match.homeTeam.name} Wins: ${h2hSummary.homeWins}
- ${match.awayTeam.name} Wins: ${h2hSummary.awayWins}
- Draws: ${h2hSummary.draws}

Recent Form (Last 5 Matches):
- ${match.homeTeam.name}: ${homeForm.map(f => f.result).join(', ') || 'No data'}
- ${match.awayTeam.name}: ${awayForm.map(f => f.result).join(', ') || 'No data'}

Here is the latest news available for each team:
${formatNews(match.homeTeam.name, homeNews)}
${formatNews(match.awayTeam.name, awayNews)}

Based on all this information, provide your detailed prediction.
`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    predictedWinner: { type: Type.STRING, description: "The predicted winner. Must be one of: 'HOME_TEAM', 'AWAY_TEAM', 'DRAW'." },
                    reasoning: { type: Type.STRING, description: "Detailed, data-driven reasoning for the prediction. Use newline characters for paragraphs, not markdown." },
                    confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 100." },
                    homeScore: { type: Type.INTEGER },
                    awayScore: { type: Type.INTEGER },
                    keyPlayers: {
                        type: Type.OBJECT,
                        properties: {
                            home: { type: Type.ARRAY, items: { type: Type.STRING } },
                            away: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["home", "away"]
                    },
                    bothTeamsToScore: { type: Type.BOOLEAN },
                    overUnderGoals: { type: Type.STRING, description: "Prediction for over/under 2.5 goals. Must be 'OVER' or 'UNDER'." },
                    predictedPossession: {
                        type: Type.OBJECT,
                        properties: {
                            home: { type: Type.INTEGER },
                            away: { type: Type.INTEGER }
                        },
                        required: ["home", "away"]
                    },
                    h2hSummary: {
                        type: Type.OBJECT,
                        properties: {
                            numberOfMatches: { type: Type.INTEGER },
                            homeWins: { type: Type.INTEGER },
                            awayWins: { type: Type.INTEGER },
                            draws: { type: Type.INTEGER }
                        },
                        required: ["numberOfMatches", "homeWins", "awayWins", "draws"]
                    },
                    form: {
                        type: Type.OBJECT,
                        properties: {
                            home: { type: Type.ARRAY, items: { 
                                type: Type.OBJECT,
                                properties: {
                                    opponent: { type: Type.STRING },
                                    result: { type: Type.STRING, description: "Match result. Must be one of: 'W', 'D', 'L'." },
                                    score: { type: Type.STRING },
                                    location: { type: Type.STRING, description: "Match location. Must be 'H' (Home) or 'A' (Away)." }
                                },
                                 required: ["opponent", "result", "score", "location"]
                            }},
                            away: { type: Type.ARRAY, items: { 
                                 type: Type.OBJECT,
                                properties: {
                                    opponent: { type: Type.STRING },
                                    result: { type: Type.STRING, description: "Match result. Must be one of: 'W', 'D', 'L'." },
                                    score: { type: Type.STRING },
                                    location: { type: Type.STRING, description: "Match location. Must be 'H' (Home) or 'A' (Away)." }
                                },
                                required: ["opponent", "result", "score", "location"]
                            }}
                        },
                        required: ["home", "away"]
                    }
                },
                required: ["predictedWinner", "reasoning", "confidence", "homeScore", "awayScore", "keyPlayers", "bothTeamsToScore", "overUnderGoals", "predictedPossession", "h2hSummary", "form"]
            };

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                    temperature: 0.5,
                }
            });
            
            const jsonText = response.text;
            
            if (!jsonText) {
                 throw new Error("The AI model returned an empty response.");
            }

            let prediction: GeminiPrediction = JSON.parse(jsonText);
            
            // Gemini might not have the form data, so we populate it from our earlier fetch
            prediction.form = { home: homeForm, away: awayForm };
            prediction.h2hSummary = h2hSummary;
            prediction.source = 'gemini';


            return new Response(JSON.stringify(prediction), {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        } catch (geminiError) {
            console.warn("Gemini prediction failed, generating fallback.", geminiError);
            const fallbackPrediction = generateFallbackPrediction(match, h2hSummary, homeForm, awayForm);
            return new Response(JSON.stringify(fallbackPrediction), {
                status: 200, // Still a success, just with fallback data
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }

    } catch (error) {
        console.error("Error in Gemini predict handler:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred on the server.";
        return new Response(JSON.stringify({ error: "Failed to generate AI prediction.", details: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
}