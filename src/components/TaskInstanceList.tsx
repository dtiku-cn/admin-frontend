import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import type { TaskInstance } from '../types';

interface TaskInstanceListProps {
  taskId: number;
  instances: TaskInstance[];
}

export function TaskInstanceList({ taskId, instances }: TaskInstanceListProps) {
  const navigate = useNavigate();

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Task Instances</h3>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {instances.map((instance) => (
            <li 
              key={instance.id}
              onClick={() => navigate(`/tasks/${taskId}/instances/${instance.id}`)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <div className="flex text-sm">
                      <p className="font-medium text-indigo-600 truncate">{instance.id}</p>
                    </div>
                    <div className="mt-2 flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>Started: {new Date(instance.start_time).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex-shrink-0 sm:mt-0">
                    {instance.end_time ? (
                      <div className="flex items-center text-sm text-green-500">
                        <CheckCircle className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        Completed
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-yellow-500">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        Running
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}