'use client';

interface DataStatusBadgeProps {
  status: 'success' | 'error' | 'manual';
  label?: string;
  message?: string;
  compact?: boolean;
}

const STATUS_CONFIG = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Hentet automatisk',
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    label: 'Henting feilet',
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  manual: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-400',
    label: 'Manuell inndata nødvendig',
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
};

export default function DataStatusBadge({
  status,
  label,
  message,
  compact = false,
}: DataStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const displayLabel = label || config.label;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-inter font-medium rounded-sm border ${config.bg} ${config.border} ${config.text}`}
        title={message}
      >
        {config.icon}
        {displayLabel}
      </span>
    );
  }

  return (
    <div
      className={`flex items-start gap-2 px-3 py-2 text-xs font-inter border rounded-sm ${config.bg} ${config.border} ${config.text}`}
    >
      <span className="mt-0.5 flex-shrink-0">{config.icon}</span>
      <div>
        <span className="font-medium">{displayLabel}</span>
        {message && (
          <p className="mt-0.5 text-xs opacity-80 leading-relaxed">{message}</p>
        )}
      </div>
    </div>
  );
}
