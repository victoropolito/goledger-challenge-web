import { NavLink, Outlet } from "react-router-dom";

const linkBase =
  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors";
const linkInactive = "text-zinc-300 hover:bg-zinc-800 hover:text-white";
const linkActive = "bg-zinc-100 text-zinc-900";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="grid min-h-screen grid-cols-[260px_1fr]">
        <aside className="border-r border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-8">
            <h1 className="text-xl font-bold">GoLedger Challenge</h1>
            <p className="mt-2 text-sm text-zinc-400">
              TV Shows catalog dashboard
            </p>
          </div>

          <nav className="space-y-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/tv-shows"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              TV Shows
            </NavLink>

            <NavLink
              to="/seasons"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Seasons
            </NavLink>

            <NavLink
              to="/episodes"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Episodes
            </NavLink>

            <NavLink
              to="/watchlist"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Watchlist
            </NavLink>
          </nav>
        </aside>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}