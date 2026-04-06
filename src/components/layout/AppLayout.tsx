import { NavLink, Outlet } from "react-router-dom";

const linkBase =
  "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";
const linkInactive = "text-zinc-300 hover:bg-zinc-800 hover:text-white";
const linkActive = "bg-white text-zinc-900";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[280px_1fr]">
        <aside className="border-b border-zinc-800 bg-zinc-900/60 p-6 xl:border-b-0 xl:border-r">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              GoLedger
            </p>
            <h1 className="mt-2 text-2xl font-bold">TV Shows Admin</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Catálogo de séries, temporadas, episódios e watchlists.
            </p>
          </div>

          <nav className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
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
              Séries
            </NavLink>

            <NavLink
              to="/seasons"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Temporadas
            </NavLink>

            <NavLink
              to="/episodes"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Episódios
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

        <main className="p-5 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}