
import React from 'react';

export const Background: React.FC = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden bg-brand-bg">
            {/* Perspective Grid */}
            <div 
                className="absolute inset-0 opacity-10"
                style={{
                    perspective: '1000px'
                }}
            >
                <div 
                    className="absolute inset-0"
                    style={{
                        transform: 'rotateX(60deg) scale(2)',
                        backgroundImage: `
                            linear-gradient(to right, rgba(48, 197, 155, 0.2) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(48, 197, 155, 0.2) 1px, transparent 1px)
                        `,
                        backgroundSize: '4rem 4rem',
                    }}
                ></div>
            </div>

            {/* Stadium Field Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-stadium-green-dark/60 via-stadium-green-light/20 to-transparent"></div>

            {/* Sweeping Spotlights */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <div 
                    className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(48,197,155,0.1)_0%,transparent_40%)] animate-spotlight"
                    style={{ animationDelay: '0s' }}
                ></div>
                <div 
                    className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(230,0,122,0.05)_0%,transparent_40%)] animate-spotlight"
                    style={{ animationDelay: '-5s', animationDirection: 'reverse' }}
                ></div>
            </div>
        </div>
    );
};
