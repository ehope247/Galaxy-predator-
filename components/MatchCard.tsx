
import React from 'react';
import type { Match } from '../types';

interface MatchCardProps {
    match: Match;
    onSelect: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onSelect }) => {
    const matchDate = new Date(match.utcDate);

    return (
        <div className="bg-brand-surface/50 border border-white/10 rounded-2xl p-5 backdrop-blur-lg transition-all duration-300 hover:border-brand-primary/50 hover:shadow-2xl hover:shadow-brand-primary/10 transform hover:-translate-y-1">
            <div className="flex justify-between items-center text-xs text-brand-text-muted mb-4">
                <span>{match.competition.name}</span>
                <span>{matchDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
            
            <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col items-center w-1/3 text-center">
                    <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="w-12 h-12 md:w-16 md:h-16 object-contain mb-2" />
                    <span className="font-bold text-sm md:text-base">{match.homeTeam.name}</span>
                </div>
                
                <div className="flex flex-col items-center text-center">
                    <span className="text-2xl md:text-3xl font-black">{matchDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="text-xs text-brand-text-muted">VS</span>
                </div>

                <div className="flex flex-col items-center w-1/3 text-center">
                    <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="w-12 h-12 md:w-16 md:h-16 object-contain mb-2" />
                    <span className="font-bold text-sm md:text-base">{match.awayTeam.name}</span>
                </div>
            </div>
            
            <button 
                onClick={onSelect}
                className="mt-6 w-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 hover:bg-brand-primary hover:text-black font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
                View Prediction
            </button>
        </div>
    );
};
