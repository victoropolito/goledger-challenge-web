# GoLedger Challenge Web - TV Shows Admin

This is an administrative dashboard. The system allows complete management of a TV shows catalog, including seasons, episodes, and the creation of custom lists (Watchlists).

## 🚀 Features

- **Dashboard**: Overview with quick catalog statistics and navigation shortcuts.
- **TV Shows Management**: Full CRUD with sorting (by title and recommended age) and a search filter.
- **Seasons Management**: Associate seasons with TV shows using searchable dropdowns, along with filtering and dynamic sorting.
- **Episodes Management**: Associate episodes with seasons using searchable dropdowns, manage ratings and release dates, plus sorting and search filters.
- **Watchlists**: Create custom lists and associate multiple TV shows (includes a search filter to easily find shows).
- **Dark/Light Mode**: Seamlessly integrated theme toggle with user preference saved in `localStorage`.
- **Enhanced UX**: 
  - Sticky top navbar and sidebar that follow the user's scroll.
  - Dynamic "sticky" creation/editing forms that remain visible alongside the lists on desktop screens.
  - Dynamic pagination with a quick page selection dropdown.

## 🛠 Tech Stack

This project was developed using the most modern technologies in the front-end ecosystem:

- **[React 19](https://react.dev/)**: Core library for building the user interface.
- **[Vite](https://vitejs.dev/)**: Lightning-fast build tool and dev server.
- **[TypeScript](https://www.typescriptlang.org/)**: Static typing for better code safety and scalability.
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Utility-first CSS framework for rapid and responsive styling.
- **[React Router DOM v7](https://reactrouter.com/)**: Application routing (Dashboard, TV Shows, Seasons, etc.).
- **[TanStack Query v5 (React Query)](https://tanstack.com/query/latest)**: Asynchronous state management, caching, and API request handling.
- **[Axios](https://axios-http.com/)**: HTTP client for backend communication.

## ⚙️ Prerequisites

Before you begin, ensure you have **Node.js** (version 18 or higher) installed on your machine.

## 📦 Environment Variables

Create a `.env` file in the root of the project with the following variables to configure the API communication (replace with the actual GoLedger backend values):

```env
VITE_API_BASE_URL=[https://api-url-do-backend.com](https://api-url-do-backend.com)
VITE_API_BASIC_USER=your_api_user
VITE_API_BASIC_PASS=your_api_password
```

## 🏃 How to run the project locally

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/victoropolito/goledger-challenge-web.git](https://github.com/victoropolito/goledger-challenge-web.git)
   ```

2. **Navigate to the project directory:**
   ```bash
   cd goledger-challenge-web
   ```

3. **Install the dependencies:**
   ```bash
   npm install
   # or yarn install
   # or pnpm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   # or yarn dev
   # or pnpm dev
   ```

5. **Open in your browser:**
   The project will typically be available at `http://localhost:5173`.

## 📂 Project Structure

The main architecture is located inside the `src/` folder:

- `/api`: Axios clients and request functions for each entity (episodes, seasons, tvShows, watchlists).
- `/app`: Global configurations, React Query providers, and Router setup.
- `/components`: 
  - `/layout`: Structural components (Navbar, Sidebar, Base Layout).
  - `/ui`: Generic reusable components (Cards, Alerts, Pagination, Empty states).
  - `/[entity]`: Specific forms for each module.
- `/hooks`: Custom hooks (e.g., `useTheme` for the Dark/Light mode).
- `/lib`: Utility functions (date formatting, etc.).
- `/pages`: Main pages rendered by the routes.
- `/types`: Global TypeScript types and API response definitions.

## 📝 Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in the development mode.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run lint`: Runs ESLint to find and fix problems in the code.
- `npm run preview`: Locally previews the production build.
