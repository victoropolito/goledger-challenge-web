import { useTheme } from "../../hooks/useTheme";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 -mx-5 mb-6 flex flex-col gap-4 border-b border-zinc-200 bg-white/80 px-5 py-4 backdrop-blur md:-mx-8 md:flex-row md:items-center md:justify-between md:px-8 dark:border-zinc-800 dark:bg-zinc-950/80">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 md:text-2xl dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <button
          onClick={toggleTheme}
          className="relative flex h-8 w-14 items-center rounded-full bg-zinc-200 transition-colors dark:bg-zinc-700"
          aria-label="Alternar tema"
        >
          <span
            className={`absolute left-1 flex h-6 w-6 transform items-center justify-center rounded-full transition-transform ${
              theme === "dark" ? "translate-x-6" : "translate-x-0"
            }`}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </span>
        </button>
        {action}
      </div>
    </header>
  );
}