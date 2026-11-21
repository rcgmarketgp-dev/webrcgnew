import React, { useState, useEffect } from 'react';

interface InlineTextProps {
  value: string;
  onChange: (next: string) => void;
  editable: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div' | 'strong';
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}

export const InlineText: React.FC<InlineTextProps> = ({
  value,
  onChange,
  editable,
  as = 'span',
  className = '',
  style,
  multiline = false,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (!editable) {
    const Tag = as;
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  if (editing) {
    if (multiline) {
      return (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            setEditing(false);
            if (draft !== value) onChange(draft);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDraft(value);
              setEditing(false);
            }
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
          rows={Math.max(3, draft.split('\n').length)}
          className={`w-full rounded-md bg-black/25 px-2 py-1 text-inherit outline-none ring-2 ring-[#F26A1B] ${className}`}
          style={style}
        />
      );
    }

    return (
      <input
        autoFocus
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft !== value) onChange(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setEditing(false);
            if (draft !== value) onChange(draft);
          } else if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
          e.stopPropagation();
        }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full rounded-md bg-black/25 px-2 py-0.5 text-inherit outline-none ring-2 ring-[#F26A1B] ${className}`}
        style={style}
      />
    );
  }

  const Tag = as;
  return (
    <Tag
      data-interactive-content="true"
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      onClick={(e) => {
        if (e.detail === 2) {
          e.stopPropagation();
          setEditing(true);
        }
      }}
      title="دبل‌کلیک برای ویرایش مستقیم / Double-click to edit"
      className={`${className} cursor-text rounded transition-shadow hover:ring-1 hover:ring-[#F26A1B]/60`}
      style={style}
    >
      {value}
    </Tag>
  );
};
