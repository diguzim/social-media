import type { ReactNode } from 'react';

interface AccountSettingFieldProps {
  label: string;
  value: ReactNode;
  rootTestId?: string;
  valueTestId?: string;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}

export function AccountSettingField({
  label,
  value,
  rootTestId,
  valueTestId,
  className,
  labelClassName,
  valueClassName,
}: AccountSettingFieldProps) {
  return (
    <div
      data-testid={rootTestId}
      className={`rounded-lg border border-slate-200 p-4 ${className ?? ''}`}
    >
      <p className={labelClassName ?? 'text-sm font-semibold text-slate-900'}>{label}</p>
      <p data-testid={valueTestId} className={valueClassName ?? 'mt-1 text-sm text-slate-600'}>
        {value}
      </p>
    </div>
  );
}
