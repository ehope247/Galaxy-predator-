import type { Match, TavilySearchResult, GeminiPrediction } from '../types';

export const generatePrediction = async (
    match: Match,
    homeNews: TavilySearchResult[],
    awayNews: TavilySearchResult[]
): Promise<GeminiPrediction> => {

    try {
        // The client-side code now calls our secure serverless function.
        const response = await fetch('/api/gemini-predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ match, homeNews, awayNews })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // Re-throw the specific error message sent from our serverless function.
            throw new Error(errorData.error || "Failed to get a valid prediction from the AI model.");
        }

        const prediction = await response.json() as GeminiPrediction;
        return prediction;
    } catch (error) {
        console.error("Error generating prediction:", error);
        if (error instanceof Error) {
            // Re-throw the error so it can be displayed in the UI.
            throw error;
        }
        throw new Error("An unexpected error occurred while generating the prediction.");
    }
};
