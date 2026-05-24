import React from "react";

interface EditableProps {
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * Renders an input/textarea in edit mode and the raw element otherwise.
 * The input uses `font: inherit` so it blends into whatever typographic
 * context it's placed in (heading, body copy, mono label, etc.).
 */
export const Editable: React.FC<EditableProps> = ({
  value,
  onChange,
  editing,
  multiline = false,
  placeholder,
  className,
  as: Tag = "span",
}) => {
  if (editing) {
    const InputTag = multiline ? "textarea" : "input";
    return (
      <InputTag
        type={multiline ? undefined : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          "editable-input",
          multiline ? "multiline" : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    );
  }

  const Element = Tag as React.ElementType;
  return (
    <Element className={className}>
      {value || <em className="opacity-40">{placeholder}</em>}
    </Element>
  );
};
