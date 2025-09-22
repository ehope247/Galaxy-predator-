import React, { useState, useEffect } from 'react';
import type { Match, TavilySearchResult, GeminiPrediction, MatchResult } from '../types';
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

const FormResultBadge: React.FC<{ result: 'W' | 'D' | 'L' }> = ({ result }) => {
    const baseClasses = "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold";
    const styles = {
        W: 'bg-green-500/80 text-white',
        D: 'bg-gray-500/80 text-white',
        L: 'bg-red-500/80 text-white',
    };
    return <div className={`${baseClasses} ${styles[result]}`}>{result}</div>;
};

const FormTable: React.FC<{ title: string; form: MatchResult[] }> = ({ title, form }) => (
    <div>
        <h3 className="font-bold text-lg mb-3 text-center">{title}</h3>
        <div className="bg-brand-surface/50 border border-gray-700 p-2 sm:p-3 rounded-lg overflow-x-auto">
            {form.length > 0 ? (
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[300px]">
                    <thead>
                        <tr className="border-b-2 border-gray-600 text-brand-text-muted bg-black/20">
                            <th className="p-2 font-semibold text-center">Loc</th>
                            <th className="p-2 font-semibold">Opponent</th>
                            <th className="p-2 font-semibold text-center">Score</th>
                            <th className="p-2 font-semibold text-center">Res</th>
                        </tr>
                    </thead>
                    <tbody>
                        {form.map((item, index) => (
                            <tr key={index} className="border-b border-gray-800 last:border-b-0 hover:bg-white/5">
                                <td className="p-2 text-center">
                                    <span className="font-bold text-brand-text-muted w-5 h-5 flex items-center justify-center bg-black/30 rounded-full text-xs mx-auto">{item.location}</span>
                                </td>
                                <td className="p-2 font-semibold truncate">{item.opponent}</td>
                                <td className="p-2 text-center font-mono font-bold">{item.score}</td>
                                <td className="p-2">
                                    <div className="flex justify-center">
                                        <FormResultBadge result={item.result} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <p className="text-sm text-brand-text-muted text-center py-4">No recent match data available.</p>}
        </div>
    </div>
);


export const PredictionModal: React.FC<PredictionModalProps> = ({ match, onClose }) => {
    const [prediction, setPrediction] = useState<GeminiPrediction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState("Analyzing match data...");
    
    const [homeNews, setHomeNews] = useState<TavilySearchResult[]>([]);
    const [awayNews, setAwayNews] = useState<TavilySearchResult[]>([]);


    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                setLoadingMessage(`Gathering latest news for 2025/26 season...`);
                const [homeNewsData, awayNewsData] = await Promise.all([
                    getTeamNews(match.homeTeam.name),
                    getTeamNews(match.awayTeam.name)
                ]);
                setHomeNews(homeNewsData);
                setAwayNews(awayNewsData);

                setLoadingMessage("Fetching stats & consulting with the AI...");
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
                className="bg-brand-surface border border-gray-700 rounded-2xl w-[95vw] sm:w-full max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-brand-primary/50 scrollbar-track-transparent p-4 sm:p-6 md:p-8 relative transform animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-muted hover:text-white transition-colors z-10">
                    <XIcon className="w-6 h-6" />
                </button>
                
                <div className="flex items-center justify-center space-x-2 sm:space-x-4 md:space-x-8 mb-6">
                    <div className="flex flex-col items-center text-center w-1/3">
                        <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain mb-2"/>
                        <p className="font-bold text-sm sm:text-lg md:text-xl">{match.homeTeam.name}</p>
                    </div>
                    <div className="font-black text-xl sm:text-3xl md:text-5xl text-brand-text-muted">VS</div>
                    <div className="flex flex-col items-center text-center w-1/3">
                        <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain mb-2"/>
                        <p className="font-bold text-sm sm:text-lg md:text-xl">{match.awayTeam.name}</p>
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
                    <div className="animate-fade-in space-y-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-white">AI Prediction Analysis</h2>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 grid grid-cols-3 items-center text-center p-4 rounded-xl border-2 bg-black/20 transition-all duration-500">
                                <div className={`p-2 sm:p-4 rounded-lg border-2 transition-all duration-500 ${getWinnerStyling('HOME_TEAM')}`}>
                                    <p className="font-bold text-sm sm:text-lg">{match.homeTeam.shortName}</p>
                                    <p className="font-black text-3xl sm:text-5xl">{prediction.homeScore}</p>
                                </div>
                                <div className="font-bold text-base sm:text-xl text-brand-text-muted px-1">
                                    <p>Predicted</p>
                                    <p>Score</p>
                                    {prediction.predictedWinner === 'DRAW' && <p className="text-xs sm:text-sm text-brand-primary mt-1">(Draw)</p>}
                                </div>
                                <div className={`p-2 sm:p-4 rounded-lg border-2 transition-all duration-500 ${getWinnerStyling('AWAY_TEAM')}`}>
                                    <p className="font-bold text-sm sm:text-lg">{match.awayTeam.shortName}</p>
                                    <p className="font-black text-3xl sm:text-5xl">{prediction.awayScore}</p>
                                </div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg border border-gray-800">
                                <h3 className="font-bold text-base sm:text-lg text-brand-primary mb-2">AI Reasoning</h3>
                                <p className="text-brand-text-muted text-xs sm:text-sm whitespace-pre-wrap max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">{prediction.reasoning}</p>
                            </div>
                        </div>

                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-brand-surface/50 border border-gray-700 p-4 rounded-lg">
                                <h3 className="text-base sm:text-lg font-bold text-center mb-3 text-brand-text">Head-to-Head</h3>
                                {prediction.h2hSummary.numberOfMatches > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-center text-sm sm:text-base">
                                            <thead className="bg-black/20">
                                                <tr className="text-brand-text-muted">
                                                    <th className="p-2 font-semibold">{match.homeTeam.shortName} Wins</th>
                                                    <th className="p-2 font-semibold">Draws</th>
                                                    <th className="p-2 font-semibold">{match.awayTeam.shortName} Wins</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="font-bold text-xl sm:text-2xl">
                                                    <td className="p-2 text-brand-primary">{prediction.h2hSummary.homeWins}</td>
                                                    <td className="p-2">{prediction.h2hSummary.draws}</td>
                                                    <td className="p-2 text-brand-secondary">{prediction.h2hSummary.awayWins}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <p className="text-center text-xs text-brand-text-muted mt-2">Based on {prediction.h2hSummary.numberOfMatches} matches</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-brand-text-muted text-center py-4">No head-to-head data available.</p>
                                )}
                            </div>

                             <div className="bg-brand-surface/50 border border-gray-700 p-4 rounded-lg">
                                <h3 className="text-base sm:text-lg font-bold text-center mb-3 text-brand-text">AI Statistical Outlook</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-center">
                                    <div className="bg-black/20 p-2 rounded-lg">
                                        <p className="text-xs font-semibold text-brand-text-muted mb-1">BTTS</p>
                                        <p className={`font-bold text-lg ${prediction.bothTeamsToScore ? 'text-green-400' : 'text-red-400'}`}>{prediction.bothTeamsToScore ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div className="bg-black/20 p-2 rounded-lg">
                                        <p className="text-xs font-semibold text-brand-text-muted mb-1">Over/Under 2.5</p>
                                        <p className="font-bold text-lg text-brand-primary">{prediction.overUnderGoals}</p>
                                    </div>
                                    <div className="bg-black/20 p-2 rounded-lg col-span-2 md:col-span-1">
                                        <p className="text-xs font-semibold text-brand-text-muted mb-1">Possession</p>
                                        <p className="font-bold text-lg">{prediction.predictedPossession.home}% / {prediction.predictedPossession.away}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormTable title={`${match.homeTeam.shortName} - Recent Form`} form={prediction.form.home} />
                            <FormTable title={`${match.awayTeam.shortName} - Recent Form`} form={prediction.form.away} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <h3 className="font-bold text-lg mb-3 text-center">{match.homeTeam.shortName} - News & Key Players</h3>
                                <div className="bg-white/5 border border-gray-800 p-4 rounded-lg mb-4">
                                    <h4 className="font-semibold text-brand-primary mb-2 text-sm">Key Players to Watch</h4>
                                    <ul className="list-disc list-inside text-sm text-brand-text-muted space-y-1">
                                        {prediction.keyPlayers.home.map(p => <li key={p}>{p}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    {homeNews.slice(0, 2).map(item => <NewsItem key={item.url} item={item} />)}
                                </div>
                            </div>
                             <div>
                                <h3 className="font-bold text-lg mb-3 text-center">{match.awayTeam.shortName} - News & Key Players</h3>
                                <div className="bg-white/5 border border-gray-800 p-4 rounded-lg mb-4">
                                    <h4 className="font-semibold text-brand-primary mb-2 text-sm">Key Players to Watch</h4>
                                    <ul className="list-disc list-inside text-sm text-brand-text-muted space-y-1">
                                        {prediction.keyPlayers.away.map(p => <li key={p}>{p}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    {awayNews.slice(0, 2).map(item => <NewsItem key={item.url} item={item} />)}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};
