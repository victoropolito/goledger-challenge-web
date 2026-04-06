import { Link } from "react-router-dom";

type QuickLinkCardProps = {
  to: string;
  title: string;
  description: string;
};

export default function QuickLinkCard({ to, title, description }: QuickLinkCardProps) {
  return (
    <Link
      to={to}
      className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80"
    >
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{description}</p>
    </Link>
  );
}