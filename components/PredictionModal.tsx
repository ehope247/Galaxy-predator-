
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import type { Match, TavilySearchResult, GeminiPrediction } from '../types';
import { getTeamNews } from '../services/tavilyService';
import { generatePrediction } from '../services/geminiService';
import { Loader } from './Loader';
import { CloseIcon, NewsIcon, BrainIcon, StarIcon } from './IconComponents';

interface PredictionModalProps {
    match: Match;
    onClose: () => void;
}

/**
 * PredictionContent is the core component that fetches and displays the AI prediction and related news.
 * It manages its own state for loading, data, and errors.
 */
const PredictionContent: React.FC<{ match: Match }> = ({ match }) => {
    // State for storing fetched news articles
    const [homeNews, setHomeNews] = useState<TavilySearchResult[]>([]);
    const [awayNews, setAwayNews] = useState<TavilySearchResult[]>([]);
    // State for the final AI prediction result
    const [prediction, setPrediction] = useState<GeminiPrediction | null>(null);
    // State to track the loading process (fetching news, then generating prediction) and any errors.
    const [status, setStatus] = useState<{ step: 'news' | 'prediction' | 'complete'; error: string | null }>({
        step: 'news',
        error: null,
    });

    /**
     * This function orchestrates the data fetching process.
     * It runs once when the component is first rendered.
     */
    const fetchDetails = useCallback(async () => {
        // Reset state and start the news fetching step
        setStatus({ step: 'news', error: null });
        try {
            // Step 1: Fetch news for both teams in parallel to save time.
            const [homeNewsData, awayNewsData] = await Promise.all([
                getTeamNews(match.homeTeam.name),
                getTeamNews(match.awayTeam.name)
            ]);
            // We only need the top 3 articles for the prediction prompt
            setHomeNews(homeNewsData.slice(0, 3));
            setAwayNews(awayNewsData.slice(0, 3));

            // Step 2: Once news is fetched, move to the prediction step.
            setStatus(s => ({ ...s, step: 'prediction' }));
            const predictionData = await generatePrediction(match, homeNewsData, awayNewsData);
            setPrediction(predictionData);

            // Final step: All data is loaded, mark as complete.
            setStatus({ step: 'complete', error: null });
        } catch (err) {
            console.error(err);
            // Handle and display specific, helpful error messages to the user.
            let errorMessage = 'Could not generate prediction. The service may be busy, please try again later.';
            if (err instanceof Error) {
                if (err.message.includes("Tavily API key is not configured")) {
                    errorMessage = "Please add your Tavily API key to the `constants.ts` file to fetch the latest news.";
                } else if (err.message.includes("Gemini API key")) {
                    errorMessage = "The AI Prediction service is not configured. Please ensure the `API_KEY` environment variable is set in your project settings.";
                } else if (err.message.includes("Failed to get a valid prediction")) {
                    errorMessage = "The AI model failed to generate a prediction. This might be due to a temporary service issue.";
                }
            }
            setStatus({ 
                step: 'complete',
                error: errorMessage 
            });
        }
    }, [match]);

    // The useEffect hook calls `fetchDetails` when the modal is opened.
    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);
    
    // --- RENDER LOGIC ---

    // Render an error message if something went wrong
    if (status.error) {
        return <div className="text-center p-8 text-red-400">{status.error}</div>;
    }

    // Render a loading indicator while fetching data
    if (status.step !== 'complete') {
        const loadingMessages = {
            news: 'Gathering latest team news & stats...',
            prediction: 'Consulting with our AI expert for the prediction...'
        };
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[300px]">
                <Loader />
                <p className="text-brand-text-muted text-center animate-fade-in">{loadingMessages[status.step]}</p>
            </div>
        );
    }

    // Render the final prediction view when data is successfully loaded
    return (
        <div className="animate-fade-in">
            <div className="p-6 bg-brand-surface/50 rounded-t-2xl">
                <div className="flex items-center justify-between space-x-4">
                    <div className="flex flex-col items-center w-1/3 text-center">
                        <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="w-16 h-16 object-contain mb-2" />
                        <span className="font-bold text-lg">{match.homeTeam.name}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-4xl md:text-5xl font-black text-white">{prediction?.predictedScore.home} - {prediction?.predictedScore.away}</span>
                        <span className="text-sm text-brand-text-muted mt-1">AI Predicted Score</span>
                    </div>
                    <div className="flex flex-col items-center w-1/3 text-center">
                        <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="w-16 h-16 object-contain mb-2" />
                        <span className="font-bold text-lg">{match.awayTeam.name}</span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <div className="bg-black/20 p-4 rounded-lg">
                    <h3 className="font-bold text-lg flex items-center mb-2 text-brand-primary"><BrainIcon className="w-5 h-5 mr-2" /> AI Analysis</h3>
                    <p className="text-brand-text-muted text-sm">{prediction?.reasoning}</p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg">
                    <h3 className="font-bold text-lg flex items-center mb-2 text-brand-primary"><StarIcon className="w-5 h-5 mr-2" /> Key Player to Watch</h3>
                    <p className="text-brand-text-muted text-sm">{prediction?.keyPlayer}</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg flex items-center mb-3 text-brand-primary"><NewsIcon className="w-5 h-5 mr-2" /> Latest News & Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <NewsSection teamName={match.homeTeam.name} news={homeNews} />
                        <NewsSection teamName={match.awayTeam.name} news={awayNews} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const NewsSection: React.FC<{teamName: string; news: TavilySearchResult[]}> = ({ teamName, news }) => (
    <div className="space-y-3">
        <h4 className="font-semibold text-white">{teamName}</h4>
        {news.length > 0 ? (
            news.map((item, index) => (
                <a href={item.url} target="_blank" rel="noopener noreferrer" key={index} className="block bg-black/20 p-3 rounded-md hover:bg-white/10 transition-colors">
                    <p className="text-sm font-semibold truncate text-brand-text">{item.title}</p>
                    <p className="text-xs text-brand-text-muted mt-1 line-clamp-2">{item.content}</p>
                </a>
            ))
        ) : (
            <p className="text-sm text-brand-text-muted p-3 bg-black/20 rounded-md">No recent news found.</p>
        )}
    </div>
);

export const PredictionModal: React.FC<PredictionModalProps> = ({ match, onClose }) => {
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div
                className="bg-brand-surface border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-up scrollbar-hide"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-brand-surface/80 backdrop-blur-lg p-4 flex justify-between items-center z-10 border-b border-white/10">
                    <h2 className="text-xl font-bold">{match.competition.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <PredictionContent match={match} />
            </div>
        </div>,
        modalRoot
    );
};
