import { ReactNode, CSSProperties } from 'react';

export const LABEL_WIDTH_PX = 110;

export const FieldRow: React.FC<{
  label: string;
  children: ReactNode;
  htmlFor?: string;
  labelWidthPx?: number;
  className?: string;
  style?: CSSProperties;
}> = ({ label, children, htmlFor, labelWidthPx = LABEL_WIDTH_PX, className = '', style }) => (
  <div className={`flex items-start gap-1 ${className}`} style={style}>
    <label
      htmlFor={htmlFor}
      className="pt-1 text-sm font-medium leading-6 text-gray-800 dark:text-gray-100"
      style={{ width: labelWidthPx }}
    >
      {label}
    </label>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);
