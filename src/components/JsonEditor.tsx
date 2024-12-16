import React from 'react';
import Editor from "@monaco-editor/react";

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