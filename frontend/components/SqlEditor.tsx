'use client';

import Editor, { OnMount } from '@monaco-editor/react';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRunShortcut?: () => void;
  height?: string;
}

export function SqlEditor({ value, onChange, onRunShortcut, height = '280px' }: SqlEditorProps) {
  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunShortcut?.();
    });
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-primary border-b border-border">
        <span className="text-xs font-mono text-foreground/70">query.sql</span>
        <span className="text-xs font-mono text-foreground/50">Ctrl/Cmd + Enter to run</span>
      </div>
      <Editor
        height={height}
        defaultLanguage="sql"
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange(v ?? '')}
        onMount={handleMount}
        options={{
          fontSize: 14,
          fontFamily: '"JetBrains Mono", monospace',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          padding: { top: 16 },
          tabSize: 2,
        }}
      />
    </div>
  );
}
