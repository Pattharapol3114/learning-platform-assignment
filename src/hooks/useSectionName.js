import { cohortApi } from "../services/api";
import { useAsync } from "./useAsync";

// Resolves a cohortId to its human-readable Section name. Uses `knownName`
// when the caller already has it, otherwise fetches GET /api/cohorts/:id.
export function useSectionName(cohortId, knownName) {
  const skip = Boolean(knownName) || !cohortId;
  const { data, error, isLoading } = useAsync(
    (signal) => (skip ? Promise.resolve(null) : cohortApi.get(cohortId, { signal })),
    [cohortId, skip],
  );

  if (knownName) return { name: knownName, isLoading: false, notFound: false, isError: false };
  if (!cohortId) return { name: null, isLoading: false, notFound: true, isError: false };

  return {
    name: data?.name || null,
    isLoading,
    notFound: error?.status === 404 || Boolean(data && !data.name),
    isError: Boolean(error) && error.status !== 404,
  };
}
