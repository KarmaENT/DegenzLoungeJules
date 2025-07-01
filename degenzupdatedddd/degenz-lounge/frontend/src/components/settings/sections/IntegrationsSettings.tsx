import React, { useState } from 'react';

const IntegrationsSettings: React.FC = () => {
  const [slackWebhook, setSlackWebhook] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');

  const handleExportJson = () => {
    console.log('Exporting all data as JSON...');
    // Placeholder for actual export logic
  };

  const handleExportMarkdown = () => {
    console.log('Exporting agent library as Markdown...');
    // Placeholder for actual export logic
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-6 text-gray-100">Integrations</h3>
      <div className="space-y-6">
        {/* Webhook Configuration Setting */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <h4 className="text-lg font-medium text-gray-300 mb-3">Webhook Configuration</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="slack-webhook" className="block text-sm font-medium text-gray-300 mb-1">Slack Webhook URL</label>
              <input 
                id="slack-webhook"
                type="url"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                placeholder="Enter Slack Webhook URL"
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">Configure a webhook to send notifications or data to Slack.</p>
            </div>
            <div>
              <label htmlFor="discord-webhook" className="block text-sm font-medium text-gray-300 mb-1">Discord Webhook URL</label>
              <input 
                id="discord-webhook"
                type="url"
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
                placeholder="Enter Discord Webhook URL"
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">Configure a webhook to send notifications or data to Discord.</p>
            </div>
          </div>
        </div>

        {/* Data Export Options Setting */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <h4 className="text-lg font-medium text-gray-300 mb-3">Data Export Options</h4>
          <div className="space-y-3">
            <button 
              onClick={handleExportJson}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Export All Data as JSON
            </button>
            <button 
              onClick={handleExportMarkdown}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Export Agent Library as Markdown
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">Export your DeGeNz Lounge data in various formats.</p>
        </div>

        {/* Reset Button */}
        <div className="mt-8">
          <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
            Reset Integration Settings to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsSettings;

