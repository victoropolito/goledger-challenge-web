import { NavLink, Outlet } from "react-router-dom";

const linkBase =
  "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";
const linkInactive = 
  "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white";
const linkActive = 
  "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-white">
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[280px_1fr]">
        <aside className="border-b border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto xl:border-b-0 xl:border-r">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              GoLedger
            </p>
            <h1 className="mt-2 text-2xl font-bold">TV Shows Admin</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
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