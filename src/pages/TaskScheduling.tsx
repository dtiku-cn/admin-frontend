import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ScheduleTask } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { TaskControls } from '../components/TaskControls';

export function TaskScheduling() {
  const navigate = useNavigate();
  const [tasks] = useState<ScheduleTask[]>([
    {
      id: 1,
      version: 1,
      ty: 'CRON',
      desc: 'Daily Backup',
      active: true,
      context: { schedule: '0 0 * * *' },
      run_count: 365,
      instances: { last_run: '2024-03-15T00:00:00Z' },
      created: '2023-03-15T00:00:00Z',
      modified: '2024-03-15T00:00:00Z'
    }
  ]);

  const handleToggleActive = (taskId: number) => {
    // Implementation for toggling task active state
  };

  const handleRefresh = (taskId: number) => {
    // Implementation for refreshing task
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900">Task Scheduling</h2>
      </div>
      
      <div className="border-t border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr 
                key={task.id} 
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge active={task.active} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.desc}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.ty}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.run_count}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.instances.last_run ? new Date(task.instances.last_run).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <TaskControls
                    active={task.active}
                    onToggleActive={() => handleToggleActive(task.id!)}
                    onRefresh={() => handleRefresh(task.id!)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}