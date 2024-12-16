import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import type { SystemConfig } from '../types';
import { Modal } from '../components/Modal';
import { JsonEditor } from '../components/JsonEditor';

export function SystemConfiguration() {
  const [configs] = useState<SystemConfig[]>([
    {
      id: 1,
      version: 1,
      key: 'EMAIL_SETTINGS',
      key_desc: 'Email Configuration',
      value: {
        smtp_host: 'smtp.example.com',
        smtp_port: 587,
        smtp_user: 'user@example.com'
      },
      created: '2024-03-15T00:00:00Z',
      modified: '2024-03-15T00:00:00Z'
    }
  ]);

  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null);
  const [jsonValue, setJsonValue] = useState('');
  const [jsonError, setJsonError] = useState<string>();

  const handleEdit = (config: SystemConfig) => {
    setEditingConfig(config);
    setJsonValue(JSON.stringify(config.value, null, 2));
    setJsonError(undefined);
  };

  const handleJsonChange = (value: string) => {
    setJsonValue(value);
    try {
      JSON.parse(value);
      setJsonError(undefined);
    } catch (e) {
      setJsonError('Invalid JSON format');
    }
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">System Configuration</h2>
        </div>
        
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {configs.map((config) => (
                <tr key={config.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{config.key}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{config.key_desc}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <pre className="text-xs bg-gray-50 p-2 rounded">
                      {JSON.stringify(config.value, null, 2)}
                    </pre>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(config.modified!).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(config)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!editingConfig}
        onClose={() => setEditingConfig(null)}
        title={`Edit ${editingConfig?.key_desc}`}
      >
        <JsonEditor
          value={jsonValue}
          onChange={handleJsonChange}
          error={jsonError}
        />
      </Modal>
    </>
  );
}