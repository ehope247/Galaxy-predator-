import React from 'react';
import type { Match } from '../types';
import { formatDate } from '../utils/formatDate';

interface MatchCardProps {
    match: Match;
    onSelect: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onSelect }) => {
    return (
        <div 
            className="bg-brand-surface/70 backdrop-blur-md border border-gray-800 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:border-brand-primary/50 hover:-translate-y-1 shadow-lg hover:shadow-brand-primary/10"
            onClick={onSelect}
            style={{boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.05)'}}
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    <img src={match.competition.emblem} alt={match.competition.name} className="w-6 h-6 object-contain"/>
                    <span className="text-sm text-brand-text-muted font-semibold">{match.competition.name}</span>
                </div>
                <span className="text-xs bg-brand-primary/10 text-brand-primary font-bold px-2 py-1 rounded">
                    Matchday {match.matchday}
                </span>
            </div>

            <div className="flex items-center justify-around text-center mb-4">
                <div className="flex flex-col items-center w-1/3">
                    <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="w-16 h-16 object-contain mb-2"/>
                    <p className="font-bold text-lg leading-tight min-h-[40px] flex items-center justify-center">{match.homeTeam.shortName}</p>
                </div>
                
                <div className="font-black text-4xl text-brand-text-muted">VS</div>
                
                <div className="flex flex-col items-center w-1/3">
                    <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="w-16 h-16 object-contain mb-2"/>
                    <p className="font-bold text-lg leading-tight min-h-[40px] flex items-center justify-center">{match.awayTeam.shortName}</p>
                </div>
            </div>

            <div className="text-center text-sm text-brand-text-muted mt-4 pt-4 border-t border-white/10">
                <p>{formatDate(match.utcDate)}</p>
            </div>

             <button 
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                className="w-full mt-4 bg-brand-primary text-black font-bold py-2 rounded-lg hover:bg-opacity-80 transition-colors shadow-md shadow-brand-primary/20"
            >
                Get AI Prediction
            </button>
        </div>
    );
};
