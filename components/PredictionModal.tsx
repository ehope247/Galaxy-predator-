import React, { useState, useEffect } from 'react';
import type { Match, TavilySearchResult, GeminiPrediction } from '../types';
import { getTeamNews } from '../services/tavilyService';
import { generatePrediction } from '../services/geminiService';
import { Loader } from './Loader';
import { XIcon } from './IconComponents';

interface PredictionModalProps {
    match: Match;
    onClose: () => void;
}

const NewsItem: React.FC<{ item: TavilySearchResult }> = ({ item }) => (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
        <p className="font-semibold text-brand-primary text-sm truncate">{item.title}</p>
        <p className="text-xs text-brand-text-muted mt-1 line-clamp-2">{item.content}</p>
    </a>
);

export const PredictionModal: React.FC<PredictionModalProps> = ({ match, onClose }) => {
    const [homeNews, setHomeNews] = useState<TavilySearchResult[]>([]);
    const [awayNews, setAwayNews] = useState<TavilySearchResult[]>([]);
    const [prediction, setPrediction] = useState<GeminiPrediction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState("Analyzing match data...");

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Step 1: Fetch news
                setLoadingMessage(`Gathering latest news for ${match.homeTeam.name}...`);
                const homeNewsData = await getTeamNews(match.homeTeam.name);
                setHomeNews(homeNewsData);

                setLoadingMessage(`Gathering latest news for ${match.awayTeam.name}...`);
                const awayNewsData = await getTeamNews(match.awayTeam.name);
                setAwayNews(awayNewsData);

                // Step 2: Generate prediction
                setLoadingMessage("Consulting with the AI... This may take a moment.");
                const predictionData = await generatePrediction(match, homeNewsData, awayNewsData);
                setPrediction(predictionData);

            } catch (err) {
                const message = err instanceof Error ? err.message : "An unknown error occurred.";
                setError(`Failed to generate prediction. ${message}`);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, [match]);

    const getWinnerStyling = (team: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | undefined) => {
        if (!prediction || !team) return '';
        if (prediction.predictedWinner === team) {
            return 'border-brand-primary/80 bg-brand-primary/10 shadow-lg shadow-brand-primary/10';
        }
        if (prediction.predictedWinner === 'DRAW' && team !== 'DRAW') {
             return 'border-white/20 bg-white/5';
        }
        return 'border-transparent opacity-50';
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-brand-surface border border-white/10 rounded-2xl w-[95vw] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-brand-primary/50 scrollbar-track-transparent p-6 md:p-8 relative transform animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-muted hover:text-white transition-colors">
                    <XIcon className="w-6 h-6" />
                </button>
                
                <div className="flex items-center justify-center space-x-4 md:space-x-8 mb-6">
                    <div className="flex flex-col items-center text-center">
                        <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain mb-2"/>
                        <p className="font-bold text-base sm:text-lg md:text-xl">{match.homeTeam.name}</p>
                    </div>
                    <div className="font-black text-2xl sm:text-3xl md:text-5xl text-brand-text-muted">VS</div>
                    <div className="flex flex-col items-center text-center">
                        <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain mb-2"/>
                        <p className="font-bold text-base sm:text-lg md:text-xl">{match.awayTeam.name}</p>
                    </div>
                </div>

                <hr className="border-white/10 my-6" />
                
                {isLoading && (
                    <div className="text-center py-16">
                        <div className="flex justify-center mb-4"><Loader /></div>
                        <p className="text-lg font-semibold animate-pulse">{loadingMessage}</p>
                        <p className="text-sm text-brand-text-muted mt-2">Please wait while we process the data.</p>
                    </div>
                )}

                {error && (
                    <div className="text-center py-16 text-red-400 bg-red-900/20 p-6 rounded-lg">
                        <p className="font-bold text-xl">Prediction Failed</p>
                        <p className="mt-2">{error}</p>
                    </div>
                )}

                {!isLoading && !error && prediction && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-white">AI Prediction Analysis</h2>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            {/* Score & Winner */}
                            <div className={`col-span-1 lg:col-span-3 grid grid-cols-3 items-center text-center p-4 rounded-xl border-2 transition-all duration-500 ${prediction.predictedWinner === 'DRAW' ? 'border-brand-primary/80 bg-brand-primary/10' : 'border-transparent'}`}>
                                <div className={`p-4 rounded-lg border-2 transition-all duration-500 ${getWinnerStyling('HOME_TEAM')}`}>
                                    <p className="font-bold text-lg">{match.homeTeam.shortName}</p>
                                    <p className="font-black text-4xl sm:text-5xl">{prediction.homeScore}</p>
                                </div>
                                <div className="font-bold text-xl text-brand-text-muted">
                                    <p>Predicted</p>
                                    <p>Score</p>
                                </div>
                                <div className={`p-4 rounded-lg border-2 transition-all duration-500 ${getWinnerStyling('AWAY_TEAM')}`}>
                                    <p className="font-bold text-lg">{match.awayTeam.shortName}</p>
                                    <p className="font-black text-4xl sm:text-5xl">{prediction.awayScore}</p>
                                </div>
                            </div>
                        </div>

                        {/* Statistical Outlook */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-center mb-4 text-brand-text">AI Statistical Outlook</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                                <div className="bg-white/5 p-3 rounded-lg text-center">
                                    <p className="text-xs sm:text-sm font-semibold text-brand-text-muted mb-1">Both Teams to Score</p>
                                    <p className={`font-bold text-xl sm:text-2xl ${prediction.bothTeamsToScore ? 'text-green-400' : 'text-red-400'}`}>
                                        {prediction.bothTeamsToScore ? 'Yes' : 'No'}
                                    </p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg text-center">
                                    <p className="text-xs sm:text-sm font-semibold text-brand-text-muted mb-1">Over/Under 2.5</p>
                                    <p className="font-bold text-xl sm:text-2xl text-brand-primary">{prediction.overUnderGoals}</p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg text-center col-span-2 md:col-span-1">
                                    <p className="text-xs sm:text-sm font-semibold text-brand-text-muted mb-2">Predicted Possession</p>
                                    <div className="flex justify-between items-center text-xs mb-1 px-1">
                                        <span className="font-bold">{match.homeTeam.shortName}</span>
                                        <span className="font-bold">{match.awayTeam.shortName}</span>
                                    </div>
                                    <div className="w-full bg-brand-secondary/30 rounded-full h-2.5">
                                        <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${prediction.predictedPossession.home}%` }}></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs mt-1 px-1">
                                        <span>{prediction.predictedPossession.home}%</span>
                                        <span>{prediction.predictedPossession.away}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reasoning */}
                        <div className="bg-white/5 p-4 rounded-lg mb-6">
                            <h3 className="font-bold text-lg text-brand-primary mb-2">AI Reasoning</h3>
                            <p className="text-brand-text-muted text-sm whitespace-pre-wrap">{prediction.reasoning}</p>
                        </div>

                        {/* News & Key Players */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <h3 className="font-bold text-lg mb-3 text-center">{match.homeTeam.shortName} - News & Key Players</h3>
                                <div className="bg-white/5 p-4 rounded-lg mb-4">
                                    <h4 className="font-semibold text-brand-primary mb-2 text-sm">Key Players to Watch</h4>
                                    <ul className="list-disc list-inside text-sm text-brand-text-muted space-y-1">
                                        {prediction.keyPlayers.home.map(p => <li key={p}>{p}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    {homeNews.slice(0, 3).map(item => <NewsItem key={item.url} item={item} />)}
                                </div>
                            </div>
                             <div>
                                <h3 className="font-bold text-lg mb-3 text-center">{match.awayTeam.shortName} - News & Key Players</h3>
                                <div className="bg-white/5 p-4 rounded-lg mb-4">
                                    <h4 className="font-semibold text-brand-primary mb-2 text-sm">Key Players to Watch</h4>
                                    <ul className="list-disc list-inside text-sm text-brand-text-muted space-y-1">
                                        {prediction.keyPlayers.away.map(p => <li key={p}>{p}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    {awayNews.slice(0, 3).map(item => <NewsItem key={item.url} item={item} />)}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};