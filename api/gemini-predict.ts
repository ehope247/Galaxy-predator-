// Vercel will automatically turn this file into a serverless function.
// This code runs on the server, not in the browser.

import { GoogleGenAI, Type } from "@google/genai";
import type { Match, TavilySearchResult, GeminiPrediction } from '../types';

export const config = {
  runtime: 'edge',
};

// Helper function to format news content for the prompt
const formatNews = (teamName: string, news: TavilySearchResult[]): string => {
    if (!news || news.length === 0) {
        return `No recent news found for ${teamName}.`;
    }
    return `Recent news for ${teamName}:\n` + news.map(item => `- ${item.title}: ${item.content}`).join('\n');
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
    
    // The API key is read from environment variables on the server.
    if (!process.env.API_KEY) {
        return new Response(JSON.stringify({ error: "Gemini API key is not configured. Please set the API_KEY environment variable." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { match, homeNews, awayNews } = await req.json() as { match: Match; homeNews: TavilySearchResult[]; awayNews: TavilySearchResult[] };
        
        // FIX: Initialize GoogleGenAI with a named apiKey parameter
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const homeTeam = match.homeTeam.name;
        const awayTeam = match.awayTeam.name;

        const systemInstruction = `You are a world-class football analyst. Your task is to predict the outcome of an upcoming football match.
Analyze the provided data which includes match details, team information, and recent news for both teams (including potential injuries, form, and morale).
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
The reasoning should be objective, data-driven, and cover aspects like team form, head-to-head record (if known), player availability, and tactical considerations.
Do not use markdown in your reasoning. Use newline characters for paragraph breaks.
Ensure the total possession is exactly 100%.`;
        
        const prompt = `
Please predict the outcome of the following football match:
- Competition: ${match.competition.name}
- Match: ${homeTeam} vs ${awayTeam}
- Date: ${match.utcDate}

Here is the latest information available for each team:

${formatNews(homeTeam, homeNews)}

${formatNews(awayTeam, awayNews)}

Based on all this information, provide your detailed prediction.
`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                predictedWinner: { 
                    type: Type.STRING,
                    description: "The predicted winning team. Can be 'HOME_TEAM', 'AWAY_TEAM', or 'DRAW'.",
                },
                reasoning: { 
                    type: Type.STRING, 
                    description: "A detailed, data-driven analysis explaining the prediction. Should cover team form, key players, injuries, and tactical analysis. Use newlines for paragraphs."
                },
                confidence: { 
                    type: Type.NUMBER, 
                    description: "A score from 0 to 100 representing the confidence in the prediction."
                },
                homeScore: { 
                    type: Type.INTEGER, 
                    description: "The predicted number of goals for the home team."
                },
                awayScore: { 
                    type: Type.INTEGER, 
                    description: "The predicted number of goals for the away team."
                },
                keyPlayers: {
                    type: Type.OBJECT,
                    properties: {
                        home: { 
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of 2-3 key players for the home team who could influence the match."
                        },
                        away: { 
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of 2-3 key players for the away team who could influence the match."
                        }
                    },
                    required: ["home", "away"]
                },
                bothTeamsToScore: {
                    type: Type.BOOLEAN,
                    description: "Whether both teams are predicted to score. true or false."
                },
                overUnderGoals: {
                    type: Type.STRING,
                    description: "Prediction for total goals being over or under 2.5. Can be 'OVER' or 'UNDER'."
                },
                predictedPossession: {
                    type: Type.OBJECT,
                    properties: {
                        home: {
                            type: Type.INTEGER,
                            description: "Predicted possession percentage for the home team."
                        },
                        away: {
                            type: Type.INTEGER,
                            description: "Predicted possession percentage for the away team."
                        }
                    },
                    required: ["home", "away"]
                }
            },
            required: ["predictedWinner", "reasoning", "confidence", "homeScore", "awayScore", "keyPlayers", "bothTeamsToScore", "overUnderGoals", "predictedPossession"]
        };

        const response = await ai.models.generateContent({
            // FIX: Use gemini-2.5-flash model as per guidelines
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.5,
            }
        });
        
        // FIX: Access the text property directly for the response as per guidelines
        const jsonText = response.text;
        
        if (!jsonText) {
             throw new Error("The AI model returned an empty response.");
        }

        const prediction: GeminiPrediction = JSON.parse(jsonText);

        return new Response(JSON.stringify(prediction), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error("Error in Gemini predict handler:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred on the server.";
        return new Response(JSON.stringify({ error: "Failed to generate AI prediction.", details: message }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
             },
        });
    }
}