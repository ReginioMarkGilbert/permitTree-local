import React, { useState } from 'react';
import clsx from 'clsx';
import './styles/Tabs.css';

const Tabs = ({ children, defaultValue, className }) => {
    const [selectedTab, setSelectedTab] = useState(defaultValue);

    return (
        <div className={clsx('tabs-container', className)}>
            {React.Children.map(children, (child) => {
                if (child.type === TabsList) {
                    return React.cloneElement(child, { selectedTab, setSelectedTab });
                } else {
                    return React.cloneElement(child, { selectedTab });
                }
            })}
        </div>
    );
};

const TabsList = ({ children, selectedTab, setSelectedTab }) => {
    return (
        <div className="tabs-list-container bg-gray-200 p-1 rounded-lg flex justify-between mb-4">
            {React.Children.map(children, (child) =>
                React.cloneElement(child, { selectedTab, setSelectedTab })
            )}
        </div>
    );
};

const TabsTrigger = ({ children, value, selectedTab, setSelectedTab }) => {
    const isActive = selectedTab === value;
    return (
        <button
            className={clsx(
                'tabs-trigger py-2 px-4 transition-all flex-1 rounded-md',
                isActive ? 'bg-white text-black shadow-md' : 'text-gray-500'
            )}
            onClick={() => setSelectedTab(value)}
        >
            {children}
        </button>
    );
};

const TabsContent = ({ children, value, selectedTab }) => {
    return selectedTab === value ? <div className="tabs-content">{children}</div> : null;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
