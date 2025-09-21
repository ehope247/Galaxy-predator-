
import React from 'react';

export const Background: React.FC = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-brand-bg to-black animate-gradient-bg bg-[length:200%_200%]"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,170,255,0.1),rgba(255,255,255,0))]"></div>
        </div>
    );
};
