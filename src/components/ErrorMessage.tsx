import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
}

export function ErrorMessage({ message = 'An error occurred. Please try again.' }: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center text-red-600">
        <AlertTriangle className="w-5 h-5 mr-2" />
        <span>{message}</span>
      </div>
    </div>
  );
}