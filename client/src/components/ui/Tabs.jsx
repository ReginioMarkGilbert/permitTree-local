import React, { useState } from 'react';

const Tabs = ({ children, defaultValue, className }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);

    return (
        <div className={className}>
            {React.Children.map(children, (child) => {
                if (child.type === TabsList) {
                    return React.cloneElement(child, { activeTab, setActiveTab });
                }
                if (child.type === TabsContent) {
                    return React.cloneElement(child, { activeTab });
                }
                return child;
            })}
        </div>
    );
};

const TabsList = ({ children, activeTab, setActiveTab }) => {
    return (
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-8">
            {React.Children.map(children, (child) =>
                React.cloneElement(child, { activeTab, setActiveTab })
            )}
        </div>
    );
};

const TabsTrigger = ({ children, value, activeTab, setActiveTab }) => {
    return (
        <button
            className={`w-full py-2 px-4 text-center cursor-pointer
                rounded-t-lg ${activeTab === value
                    ? 'bg-white border-b-2 border-green-600 text-black'
                    : 'bg-gray-100 text-gray-500'}
            `}
            onClick={() => setActiveTab(value)}
        >
            {children}
        </button>
    );
};

const TabsContent = ({ children, value, activeTab }) => {
    return activeTab === value ? <div>{children}</div> : null;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
