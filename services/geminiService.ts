
import { GoogleGenAI, Type } from "@google/genai";
import type { Match, TavilySearchResult, GeminiPrediction } from '../types';
import { GEMINI_API_KEY } from "../constants";

const ai = new GoogleGenAI({ apiKey: AIzaSyCbIjQswVo9qr-PYxYkhgEmLq3FlLqw5Og });

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
        const response = await ai.models.generateContent({
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
        throw new Error("Failed to get a valid prediction from the AI model.");
    }
};
