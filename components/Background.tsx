
import React from 'react';

export const Background: React.FC = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden bg-brand-bg">
            {/* Animated Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-bg via-black to-brand-bg animate-gradient-bg bg-[length:400%_400%]"></div>
            
            {/* Subtle Grid Pattern */}
            <div 
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                }}
            ></div>

            {/* Pulsing Lights */}
            <div className="absolute -bottom-1/3 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(0,170,255,0.15),transparent_40%)] animate-pulse-slow"></div>
            <div 
                className="absolute -top-1/3 -right-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(230,0,122,0.1),transparent_40%)] animate-pulse-slow"
                style={{ animationDelay: '4s' }}
            ></div>
        </div>
    );
};