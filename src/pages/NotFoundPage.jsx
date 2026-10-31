import { Link } from "react-router-dom";
import EmptyState from "../components/ui/EmptyState";

export default function NotFoundPage() {
  return (
    <EmptyState
      icon="🧭"
      title="Page not found"
      message="The link may be broken or the page has moved"
      action={
        <Link to="/" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
          Back to dashboard
        </Link>
      }
    />
  );
}
