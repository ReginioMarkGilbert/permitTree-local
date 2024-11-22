import React, { useState } from 'react';
import clsx from 'clsx';
import './styles/Tabs.css';

const Tabs = ({ children, defaultValue, className }) => {
    const [selectedTab, setSelectedTab] = useState(defaultValue);

    // Create a new object for tab-related props
    const tabProps = {
        selectedTab,
        setSelectedTab
    };

    return (
        <div className={clsx('tabs-container', className)} data-state={selectedTab}>
            {React.Children.map(children, (child) => {
                if (!child) return null;

                // Only pass tab props to TabsList and TabsContent components
                if (child.type === TabsList || child.type === TabsContent) {
                    return React.cloneElement(child, tabProps);
                }
                return child;
            })}
        </div>
    );
};

const TabsList = ({ children, selectedTab, setSelectedTab, className }) => {
    return (
        <div className={clsx("tabs-list-container bg-gray-200 p-1 rounded-lg flex justify-between mb-4", className)}>
            {React.Children.map(children, (child) => {
                if (!child) return null;
                return React.cloneElement(child, { selectedTab, setSelectedTab });
            })}
        </div>
    );
};

const TabsTrigger = ({ children, value, selectedTab, setSelectedTab, className }) => {
    const isActive = selectedTab === value;

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            data-state={isActive ? "active" : "inactive"}
            className={clsx(
                'tabs-trigger py-2 px-4 transition-all flex-1 rounded-md',
                isActive ? 'bg-white text-black shadow-md' : 'text-gray-500',
                className
            )}
            onClick={() => setSelectedTab(value)}
        >
            {children}
        </button>
    );
};

const TabsContent = ({ children, value, selectedTab, className }) => {
    const isSelected = selectedTab === value;

    if (!isSelected) return null;

    return (
        <div
            role="tabpanel"
            data-state={isSelected ? "active" : "inactive"}
            className={clsx("tabs-content", className)}
        >
            {children}
        </div>
    );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
