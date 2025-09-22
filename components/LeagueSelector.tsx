import React, { useState, useRef, useEffect } from 'react';
import type { League } from '../types';
import { ChevronDownIcon } from './IconComponents';

interface LeagueSelectorProps {
    leagues: League[];
    selectedLeague: League;
    onSelectLeague: (league: League) => void;
}

export const LeagueSelector: React.FC<LeagueSelectorProps> = ({ leagues, selectedLeague, onSelectLeague }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [indicatorStyle, setIndicatorStyle] = useState({});

    useEffect(() => {
        const selectedIndex = leagues.findIndex(l => l.code === selectedLeague.code);
        const selectedItem = itemRefs.current[selectedIndex];
        
        if (selectedItem) {
             // Center the selected item in the scroll view
            selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            
            // Wait for layout to settle before calculating indicator position
            setTimeout(() => {
                 const container = containerRef.current;
                 if (container) {
                    const containerRect = container.getBoundingClientRect();
                    const itemRect = selectedItem.getBoundingClientRect();
                    setIndicatorStyle({
                        left: `${itemRect.left - containerRect.left + container.scrollLeft}px`,
                        width: `${itemRect.width}px`,
                    });
                 }
            }, 100);
        }
    }, [selectedLeague, leagues]);

    const handleSelect = (league: League) => {
        onSelectLeague(league);
        setIsOpen(false);
    };

    return (
        <div className="flex justify-center my-4">
            <div className="relative w-full max-w-sm md:max-w-none">
                {/* Mobile Dropdown Button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full flex items-center justify-between bg-brand-surface/50 backdrop-blur-sm p-3 rounded-xl border border-white/10 text-lg font-bold"
                    >
                        <div className="flex items-center space-x-3">
                            <img src={selectedLeague.logo} alt={selectedLeague.name} className="w-6 h-6 object-contain"/>
                            <span>{selectedLeague.name}</span>
                        </div>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                        <div className="absolute top-full mt-2 w-full bg-brand-surface border border-gray-700 rounded-xl shadow-2xl p-2 z-20 animate-slide-down-fade">
                            <ul className="space-y-1">
                                {leagues.map((league) => (
                                    <li key={league.code}>
                                        <button
                                            onClick={() => handleSelect(league)}
                                            className={`w-full text-left flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                                                selectedLeague.code === league.code
                                                    ? 'bg-brand-primary text-black font-semibold'
                                                    : 'hover:bg-white/10'
                                            }`}
                                        >
                                            <img src={league.logo} alt={league.name} className="w-6 h-6 object-contain"/>
                                            <span>{league.name}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Desktop Horizontal List */}
                <div 
                    ref={containerRef}
                    className="hidden md:flex bg-brand-surface/50 backdrop-blur-sm p-2 rounded-xl border border-white/10 relative"
                >
                    <div className="flex space-x-1 items-center overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {leagues.map((league, index) => (
                            <button
                                key={league.code}
                                // FIX: The ref callback function should not return a value. Using a block body for the arrow function ensures it returns undefined.
                                ref={el => { itemRefs.current[index] = el; }}
                                onClick={() => handleSelect(league)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ease-in-out flex-shrink-0 flex items-center space-x-2 relative z-10
                                    ${selectedLeague.code === league.code 
                                        ? 'text-black' 
                                        : 'text-brand-text-muted hover:text-white'
                                    }`}
                            >
                               <img src={league.logo} alt={league.name} className="w-5 h-5 object-contain"/>
                               <span>{league.name}</span>
                            </button>
                        ))}
                    </div>
                    <div 
                        className="absolute bottom-2 h-10 bg-brand-primary rounded-lg shadow-lg shadow-brand-primary/20 transition-all duration-500 ease-in-out"
                        style={indicatorStyle}
                    />
                </div>
            </div>
        </div>
    );
};