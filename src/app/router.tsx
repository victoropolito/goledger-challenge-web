import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/DashBoard";
import TvShowsPage from "../pages/TvShowsPage";
import SeasonsPage from "../pages/SeasonsPage";
import EpisodesPage from "../pages/EpisodesPage";
import WatchlistsPage from "../pages/WatchlistsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "tv-shows",
        element: <TvShowsPage />,
      },
      {
        path: "seasons",
        element: <SeasonsPage />,
      },
      {
        path: "episodes",
        element: <EpisodesPage />,
      },
      {
        path: "watchlist",
        element: <WatchlistsPage />,
      },
    ],
  },
]);