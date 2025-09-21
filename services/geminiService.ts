
import { GoogleGenAI, Type } from "@google/genai";
import type { Match, TavilySearchResult, GeminiPrediction } from '../types';

let ai: GoogleGenAI | null = null;

const getGenAIClient = (): GoogleGenAI => {
    // The GoogleGenAI SDK is initialized with the API key from the environment variables.
    // This is a security best practice and is assumed to be pre-configured in the execution environment.
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

const predictionSchema = {
    type: Type.OBJECT,
    properties: {
        predictedScore: {
            type: Type.OBJECT,
            properties: {
                home: { type: Type.INTEGER },
                away: { type: Type.INTEGER }
            },
            required: ["home", "away"]
        },
        reasoning: {
            type: Type.STRING,
            description: "A concise analysis (2-3 sentences) explaining the prediction, considering team form, key matchups, and recent news."
        },
        keyPlayer: {
            type: Type.STRING,
            description: "The name of one player who is likely to have a significant impact on the match result."
        }
    },
    required: ["predictedScore", "reasoning", "keyPlayer"]
};

const formatNews = (news: TavilySearchResult[]): string => {
    if (!news || news.length === 0) return "No recent news available.";
    return news.map(item => `- ${item.title}: ${item.content}`).join('\n');
};

export const generatePrediction = async (
    match: Match,
    homeNews: TavilySearchResult[],
    awayNews: TavilySearchResult[]
): Promise<GeminiPrediction> => {

    const prompt = `
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

    try {
        const genAI = getGenAIClient();
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: predictionSchema,
            }
        });

        const jsonText = response.text.trim();
        const prediction = JSON.parse(jsonText) as GeminiPrediction;
        return prediction;
    } catch (error) {
        console.error("Error generating prediction from Gemini:", error);
        // This generic error is shown if the API key is missing from the environment or is invalid.
        if (error instanceof Error && (error.message.includes("API key") || error.message.includes("provide an API key"))) {
             throw new Error("Gemini API key is not configured.");
        }
        throw new Error("Failed to get a valid prediction from the AI model.");
    }
};
