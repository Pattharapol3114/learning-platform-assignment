import { useCallback, useEffect, useState } from "react";

// Runs `asyncFn(signal)` on mount and whenever `deps` change.
// Aborts in-flight requests on unmount / re-run so stale responses never land.
export function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fn = useCallback(asyncFn, deps);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ status: "loading", data: prev.data, error: null }));

    fn(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: "success", data, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setState({ status: "error", data: null, error });
      });

    return () => controller.abort();
  }, [fn, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    ...state,
    isLoading: state.status === "loading",
    isError: state.status === "error",
    reload,
  };
}
