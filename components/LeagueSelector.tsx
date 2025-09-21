
import React from 'react';
import type { League } from '../types';

interface LeagueSelectorProps {
    leagues: League[];
    selectedLeague: League;
    onSelectLeague: (league: League) => void;
}

export const LeagueSelector: React.FC<LeagueSelectorProps> = ({ leagues, selectedLeague, onSelectLeague }) => {
    return (
        <div className="flex justify-center">
            <div className="bg-brand-surface/50 backdrop-blur-sm p-2 rounded-xl border border-white/10">
                <div className="flex space-x-1 items-center overflow-x-auto pb-2 scrollbar-hide">
                    {leagues.map((league) => (
                        <button
                            key={league.code}
                            onClick={() => onSelectLeague(league)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out flex-shrink-0 flex items-center space-x-2
                                ${selectedLeague.code === league.code 
                                    ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/20' 
                                    : 'text-brand-text-muted hover:bg-white/10 hover:text-white'
                                }`}
                        >
                           <img src={league.logo} alt={league.name} className="w-5 h-5 object-contain"/>
                           <span>{league.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
