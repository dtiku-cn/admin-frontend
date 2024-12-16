import React, { useEffect, useState } from 'react';
import { Edit2 } from 'lucide-react';
import { useConfigs } from '../hooks/useApi';
import { Modal } from '../components/Modal';
import { JsonEditor } from '../components/JsonEditor';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { api } from '../api/serverApi';
import type { SystemConfig } from '../types';

export function SystemConfiguration() {
  const { data: configs, loading, error, refetch } = useConfigs();
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null);
  const [jsonValue, setJsonValue] = useState('');
  const [jsonError, setJsonError] = useState<string>();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!configs) return null;

  const handleEdit = (config: SystemConfig) => {
    setEditingConfig(config);
    setJsonValue(JSON.stringify(config.value, null, 2));
    setJsonError(undefined);
  };

  const handleSave = async () => {
    if (editingConfig && !jsonError) {
      try {
        const parsedValue = JSON.parse(jsonValue);
        await api.updateConfigValue(editingConfig.key!, parsedValue);
        await refetch();
        setEditingConfig(null);
      } catch (e) {
        setJsonError('Failed to save configuration');
      }
    }
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
        onSave={handleSave}
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