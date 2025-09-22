import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Background } from './components/Background';
import { LeagueSelector } from './components/LeagueSelector';
import { MatchCard } from './components/MatchCard';
import { PredictionModal } from './components/PredictionModal';
import { Loader } from './components/Loader';
import { getFixtures } from './services/footballDataService';
import { LEAGUES } from './constants';
import type { Match, League } from './types';

const App: React.FC = () => {
    const [selectedLeague, setSelectedLeague] = useState<League>(LEAGUES[0]);
    const [fixtures, setFixtures] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    const fetchFixtures = useCallback(async (leagueCode: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getFixtures(leagueCode);
            setFixtures(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred while fetching match data.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFixtures(selectedLeague.code);
    }, [selectedLeague, fetchFixtures]);

    const handleSelectMatch = (match: Match) => {
        setSelectedMatch(match);
    };

    return (
        <>
            <Background />
            <div className="relative min-h-screen font-sans overflow-x-hidden">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <LeagueSelector
                        leagues={LEAGUES}
                        selectedLeague={selectedLeague}
                        onSelectLeague={setSelectedLeague}
                    />
                    
                    {isLoading && <div className="mt-20 flex justify-center"><Loader /></div>}

                    {error && (
                        <div className="mt-12 text-center text-red-400 bg-red-900/20 p-4 rounded-lg max-w-2xl mx-auto">
                            <p className="font-bold text-lg">Data Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {!isLoading && !error && (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 animate-fade-in">
                            {fixtures.map((match) => (
                                <MatchCard key={match.id} match={match} onSelect={() => handleSelectMatch(match)} />
                            ))}
                        </div>
                    )}
                </main>
                
                {selectedMatch && (
                    <PredictionModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
                )}
            </div>
        </>
    );
};

export default App;
