import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { ScheduleTaskType } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { TaskInstanceList } from '../components/TaskInstanceList';
import { useTask } from '../hooks/useApi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export function TaskDetail() {
  const { type } = useParams();
  console.log("type",type)
  const { data: task, loading, error,refetch } = useTask(type as ScheduleTaskType);

  useEffect(() => {
    refetch();
  }, []);

  console.log("loading",loading)
  console.log("data",task)
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!task) return null;

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
              <p className="mt-1 text-sm text-gray-500">ID: {task.id}</p>
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