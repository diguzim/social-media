interface AccountSubpageHeaderProps {
  title: string;
  description: string;
  testIdPrefix: string;
}

export function AccountSubpageHeader({
  title,
  description,
  testIdPrefix,
}: AccountSubpageHeaderProps) {
  return (
    <>
      <h2 data-testid={`${testIdPrefix}-title`} className="text-2xl font-semibold text-slate-900">
        {title}
      </h2>
      <p data-testid={`${testIdPrefix}-description`} className="mt-1 text-sm text-slate-600">
        {description}
      </p>
    </>
  );
}
