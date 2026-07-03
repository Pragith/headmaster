export function useAdminApi<T>(path: string, options?: Parameters<typeof useFetch<T>>[1]) {
  return useFetch<T>(`/api/admin${path}`, {
    watch: false,
    ...options,
  })
}
