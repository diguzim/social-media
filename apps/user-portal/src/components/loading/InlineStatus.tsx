interface InlineStatusProps {
  message: string;
  tone?: 'info' | 'success' | 'warning' | 'error';
  dataTestId?: string;
  className?: string;
}

const TONE_CLASS_NAMES: Record<NonNullable<InlineStatusProps['tone']>, string> = {
  info: 'text-slate-500',
  success: 'text-green-600',
  warning: 'text-yellow-700',
  error: 'text-danger-600',
};

export function InlineStatus({
  message,
  tone = 'info',
  dataTestId,
  className = '',
}: InlineStatusProps) {
  return (
    <p
      data-testid={dataTestId}
      className={`text-sm font-medium ${TONE_CLASS_NAMES[tone]} ${className}`.trim()}
    >
      {message}
    </p>
  );
}
