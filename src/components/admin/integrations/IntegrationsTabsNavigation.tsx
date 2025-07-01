
import React from 'react';

interface IntegrationsTabsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const IntegrationsTabsNavigation = ({ activeTab, onTabChange }: IntegrationsTabsNavigationProps) => {
  const tabs = [
    { id: 'overview', label: '📊 Overview General' },
    { id: 'apollo', label: '🚀 Apollo Companies' },
    { id: 'contacts', label: '👥 Apollo Contacts' },
    { id: 'ads', label: '📈 Google Ads Attribution' },
    { id: 'analytics', label: '📊 Analytics Avanzados' },
    { id: 'performance', label: '⚡ Monitor Rendimiento' },
    { id: 'testing', label: '🧪 Testing & Health' },
    { id: 'status', label: '⚙️ Status & Logs' }
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default IntegrationsTabsNavigation;
