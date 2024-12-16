import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useApi';
import { StatusBadge } from '../components/StatusBadge';
import { TaskControls } from '../components/TaskControls';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { api } from '../api/serverApi';
import { ScheduleTaskType } from '../types';

export function TaskScheduling() {
  const navigate = useNavigate();
  const { data: tasks, loading, error, refetch } = useTasks();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!tasks) return null;

  const handleToggleActive = async (type: ScheduleTaskType) => {
    await api.toggleTaskActive(type);
    refetch();
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
                  {task.instances[0]?.start_time ? 
                    new Date(task.instances[0].start_time).toLocaleString() : 
                    'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <TaskControls
                    active={task.active}
                    onToggleActive={() => handleToggleActive(task.ty!)}
                    onRefresh={refetch}
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