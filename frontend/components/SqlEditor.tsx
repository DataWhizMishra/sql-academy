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
    // Custom theme tuned to the app palette: Midnight Blue surface, Electric
    // Cyan keywords, Scrabble gold strings.
    monaco.editor.defineTheme('scrabble-academy', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword.sql', foreground: '00F0FF', fontStyle: 'bold' },
        { token: 'operator.sql', foreground: '00F0FF' },
        { token: 'string.sql', foreground: 'E6B981' },
        { token: 'number.sql', foreground: 'B28DFF' },
        { token: 'comment', foreground: 'A0A4B8', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#1E212B',
        'editor.foreground': '#FFFFFF',
        'editorLineNumber.foreground': '#A0A4B8',
        'editorCursor.foreground': '#00F0FF',
        'editor.selectionBackground': '#00F0FF26',
        'editor.lineHighlightBackground': '#262A36',
      },
    });
    monaco.editor.setTheme('scrabble-academy');

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
        theme="scrabble-academy"
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
