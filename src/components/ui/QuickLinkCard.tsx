import { Link } from "react-router-dom";

type QuickLinkCardProps = {
  to: string;
  title: string;
  description: string;
};

export default function QuickLinkCard({
  to,
  title,
  description,
}: QuickLinkCardProps) {
  return (
    <Link
      to={to}
      className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700 hover:bg-zinc-800/80"
    >
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
    </Link>
  );
}