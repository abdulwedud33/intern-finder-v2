import { useQuery } from '@tanstack/react-query'
import { userService } from '@/services/userService'

// Hook for getting total users count
export function useUsersCount() {
  return useQuery({
    queryKey: ['usersCount'],
    queryFn: () => userService.getUsersCount(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
