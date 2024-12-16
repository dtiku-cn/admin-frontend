import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';

export function TaskInstanceDetail() {
  const { taskId, instanceId } = useParams();

  // Mock data for demonstration
  const instance = {
    id: instanceId,
    start_time: '2024-03-15T10:00:00Z',
    end_time: '2024-03-15T10:01:23Z',
    logs: [
      { timestamp: '2024-03-15T10:00:00Z', level: 'INFO', message: 'Task started' },
      { timestamp: '2024-03-15T10:00:30Z', level: 'INFO', message: 'Processing data...' },
      { timestamp: '2024-03-15T10:01:23Z', level: 'INFO', message: 'Task completed successfully' }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to={`/tasks/${taskId}`}
                className="mr-4 text-gray-400 hover:text-gray-500"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h2 className="text-lg font-medium text-gray-900">Instance Details</h2>
            </div>
            <div className="flex items-center text-sm">
              {instance.end_time ? (
                <span className="flex items-center text-green-500">
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Completed
                </span>
              ) : (
                <span className="flex items-center text-yellow-500">
                  <Clock className="w-4 h-4 mr-1.5" />
                  Running
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-5 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Instance ID</h4>
              <p className="mt-1 text-sm text-gray-900">{instance.id}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Start Time</h4>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(instance.start_time).toLocaleString()}
              </p>
            </div>
            {instance.end_time && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">End Time</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(instance.end_time).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Execution Logs</h3>
        </div>
        <div className="px-6 py-5">
          <div className="space-y-4">
            {instance.logs.map((log, index) => (
              <div key={index} className="flex space-x-4 text-sm">
                <div className="text-gray-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
                <div className={`px-2 rounded ${
                  log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                  log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {log.level}
                </div>
                <div className="text-gray-900 flex-1">{log.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}