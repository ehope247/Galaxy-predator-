
import React from 'react';
import { FootballIcon } from './IconComponents';

export const Header: React.FC = () => {
    return (
        <header className="py-6 border-b border-white/10">
            <div className="container mx-auto px-4 flex items-center justify-center">
                <FootballIcon className="w-8 h-8 mr-3 text-brand-primary" />
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-white">
                    AI Football Predictor
                </h1>
            </div>
        </header>
    );
};
