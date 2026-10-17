import React from 'react';

export default function BottomNav({ currentTab, onTabChange, isDarkMode }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'fitur', label: 'Fitur', icon: '🧩' },
    { id: 'musehealth', label: 'My Health', icon: '❤️' },
  ];

  return (
    <div className={`absolute bottom-0 left-0 right-0 border-t py-2 px-6 flex justify-around items-center z-40 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-white/90 backdrop-blur-md border-pink-100 text-gray-600'
    }`}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-4 rounded-2xl transition-all ${
              isActive 
                ? 'text-pink-500 font-bold scale-105' 
                : isDarkMode ? 'hover:text-gray-100 opacity-60' : 'hover:text-gray-900 opacity-70'
            }`}
          >
            <span className="text-xl mb-0.5">{tab.icon}</span>
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}