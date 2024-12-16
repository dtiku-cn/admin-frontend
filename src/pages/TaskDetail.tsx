import React from 'react';
import { useParams } from 'react-router-dom';
import type { ScheduleTask } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { TaskInstanceList } from '../components/TaskInstanceList';

export function TaskDetail() {
  const { id } = useParams();
  const task: ScheduleTask = {
    id: 1,
    version: 1,
    ty: 'CRON',
    desc: 'Daily Backup',
    active: true,
    context: { schedule: '0 0 * * *' },
    run_count: 365,
    instances: [
      {
        id: 'inst_1',
        start_time: '2024-03-15T10:00:00Z',
        end_time: '2024-03-15T10:01:23Z'
      },
      {
        id: 'inst_2',
        start_time: '2024-03-15T11:00:00Z',
        end_time: '2024-03-15T11:01:15Z'
      },
      {
        id: 'inst_3',
        start_time: '2024-03-15T12:00:00Z'
      }
    ],
    created: '2023-03-15T00:00:00Z',
    modified: '2024-03-15T00:00:00Z'
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Task Details</h2>
        </div>
        
        <div className="px-6 py-5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-medium text-gray-900">{task.desc}</h3>
              <p className="mt-1 text-sm text-gray-500">ID: {id}</p>
            </div>
            <StatusBadge active={task.active} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Type</h4>
              <p className="mt-1 text-sm text-gray-900">{task.ty}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Run Count</h4>
              <p className="mt-1 text-sm text-gray-900">{task.run_count}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Created</h4>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(task.created!).toLocaleString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Last Modified</h4>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(task.modified!).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Context</h4>
            <pre className="mt-1 bg-gray-50 p-4 rounded-md text-sm">
              {JSON.stringify(task.context, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <TaskInstanceList taskId={task.id!} instances={task.instances} />
    </div>
  );
}