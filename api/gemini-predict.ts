// This serverless function securely calls the Gemini API.
import type { Match, TavilySearchResult } from '../types';

export const config = {
  runtime: 'edge',
};

// This schema is the JSON representation of the one previously defined using the SDK.
const predictionSchema = {
    type: "object",
    properties: {
        predictedScore: {
            type: "object",
            properties: {
                home: { type: "integer" },
                away: { type: "integer" }
            },
            required: ["home", "away"]
        },
        reasoning: {
            type: "string",
            description: "A concise analysis (2-3 sentences) explaining the prediction, considering team form, key matchups, and recent news."
        },
        keyPlayer: {
            type: "string",
            description: "The name of one player who is likely to have a significant impact on the match result."
        }
    },
    required: ["predictedScore", "reasoning", "keyPlayer"]
};

const formatNews = (news: TavilySearchResult[]): string => {
    if (!news || news.length === 0) return "No recent news available.";
    return news.map(item => `- ${item.title}: ${item.content}`).join('\\n');
};

const generatePrompt = (match: Match, homeNews: TavilySearchResult[], awayNews: TavilySearchResult[]): string => `
    Analyze the upcoming football match and provide a prediction.

    **Match Details:**
    - Competition: ${match.competition.name}
    - Home Team: ${match.homeTeam.name}
    - Away Team: ${match.awayTeam.name}
    - Match Date: ${new Date(match.utcDate).toUTCString()}

    **Recent News & Insights:**

    **${match.homeTeam.name} News:**
    ${formatNews(homeNews)}

    **${match.awayTeam.name} News:**
    ${formatNews(awayNews)}

    Based on all this information, provide your prediction in the required JSON format.
    Be a confident and expert football analyst. Your reasoning should be sharp and to the point.
`;

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

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: "Gemini API key is not configured." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    try {
        const { match, homeNews, awayNews } = await req.json() as { match: Match; homeNews: TavilySearchResult[]; awayNews: TavilySearchResult[] };
        
        const prompt = generatePrompt(match, homeNews, awayNews);
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: predictionSchema,
            }
        };

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API Error:", errorData);
            const errorMessage = errorData?.error?.message || "An unknown error occurred with the AI service.";
            return new Response(JSON.stringify({ error: "Failed to get a valid prediction from the AI model.", details: errorMessage }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }
        
        const data = await response.json();
        const jsonText = data.candidates[0].content.parts[0].text;
        
        // We send back the raw JSON string which the client will parse.
        return new Response(jsonText, {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return new Response(JSON.stringify({ error: 'Internal server error', details: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
}
