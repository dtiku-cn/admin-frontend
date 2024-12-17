import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TaskScheduling } from './pages/TaskScheduling';
import { TaskDetail } from './pages/TaskDetail';
import { TaskInstanceDetail } from './pages/TaskInstanceDetail';
import { SystemConfiguration } from './pages/SystemConfig';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/tasks" replace />} />
          <Route path="tasks" element={<TaskScheduling />} />
          <Route path="tasks/:type" element={<TaskDetail />} />
          <Route path="tasks/:type/instances/:instanceId" element={<TaskInstanceDetail />} />
          <Route path="config" element={<SystemConfiguration />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;