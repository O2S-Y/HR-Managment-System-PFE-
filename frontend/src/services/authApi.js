import { http } from './http'

export const authApi = {
  login: async ({ email, password }) => {
    const res = await http.post('/api/auth/login', { email, password })
    return res.data
  },
}

