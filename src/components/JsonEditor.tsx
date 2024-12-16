import React from 'react';
import * as monaco from 'monaco-editor';
import Editor, { loader } from "@monaco-editor/react";

// Configure Monaco Editor to use local files
loader.config({ monaco });

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function JsonEditor({ value, onChange, error }: JsonEditorProps) {
  return (
    <div className="w-full">
      <Editor
        height="300px"
        defaultLanguage="json"
        defaultValue={value}
        onChange={(value) => onChange(value || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 12,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          wrappingIndent: "indent",
          automaticLayout: true,
        }}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}