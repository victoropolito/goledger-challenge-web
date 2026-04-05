type PageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-zinc-400 md:text-base">{description}</p>
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}