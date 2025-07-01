import React from 'react';

interface TabProps {
  id: string;
  label: string;
  children?: React.ReactNode;
}

interface TabsProps {
  activeTab: string;
  onChange: (tabId: string) => void;
  children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ children }) => {
  return <>{children}</>;
};

export const Tabs: React.FC<TabsProps> = ({ activeTab, onChange, children }) => {
  // Filter out only Tab components
  const tabs = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Tab
  ) as React.ReactElement<TabProps>[];

  return (
    <div className="tabs-container">
      <div className="tabs-header flex border-b border-gray-700 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.props.id}
            className={`py-2 px-4 font-medium ${
              activeTab === tab.props.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => onChange(tab.props.id)}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {tabs.find((tab) => tab.props.id === activeTab)?.props.children}
      </div>
    </div>
  );
};
