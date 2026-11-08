import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navClass = ({ isActive }) =>
  `whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition sm:px-3 ${
    isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Learning Platform home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white shadow-sm">📘</span>
            <span className="hidden leading-tight sm:block">
              <span className="block font-semibold text-slate-900">Learning Platform</span>
              <span className="block text-xs text-slate-500">Assignment Module · Team 05</span>
            </span>
          </Link>
          <nav className="flex items-center gap-0.5 sm:gap-1">
            <NavLink to="/" end className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/sections" className={navClass}>
              Sections
            </NavLink>
            {/* On phones the Dashboard button covers this, leaving room for Sign out. */}
            <span className="hidden sm:inline-flex">
              <NavLink to="/assignments/new" className={navClass}>
                + New Assignment
              </NavLink>
            </span>
            <span className="ml-1 hidden max-w-40 truncate border-l border-slate-200 pl-3 text-sm text-slate-600 lg:block" title={user?.email}>
              {user?.displayName || user?.email}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:px-3"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
