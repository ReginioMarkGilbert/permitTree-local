import React from 'react';

const Avatar = ({ src, alt, fallback, className }) => {
    return (
        <div className={`relative inline-block ${className}`}>
            {src ? (
                <img src={src} alt={alt} className="rounded-full w-full h-full object-cover" />
            ) : (
                <div className="rounded-full w-full h-full bg-green-500 flex items-center justify-center text-white">
                    {fallback}
                </div>
            )}
        </div>
    );
};

export const AvatarImage = ({ src, alt }) => {
    return <img src={src} alt={alt} className="rounded-full w-full h-full object-cover" />;
};

export const AvatarFallback = ({ children }) => {
    return (
        <div className="rounded-full w-full h-full bg-green-500 flex items-center justify-center text-white">
            {children}
        </div>
    );
};

export { Avatar };
