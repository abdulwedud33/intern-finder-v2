import { api } from './api'

export interface UsersCountResponse {
  success: boolean
  data: {
    totalUsers: number
    internCount: number
    companyCount: number
  }
}

export const userService = {
  // Get total users count (interns + companies)
  getUsersCount: async (): Promise<UsersCountResponse> => {
    const response = await api.get('/users/count')
    return response.data
  }
}
