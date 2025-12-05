import axios from 'axios'

const API_URL = 'http://localhost:3001'

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Recipe API
export const api = {
  async init() {
    // Check if server is running
    try {
      await axiosInstance.get('/recipes')
    } catch (error) {
      console.error('JSON-Server not running. Please start it with: npm run server')
      throw new Error('Backend server is not running')
    }
  },

  async listRecipes({ q = '', cuisine = '', category = '', difficulty = '' } = {}) {
    try {
      let url = '/recipes'
      const params = new URLSearchParams()
      
      if (q) params.append('q', q)
      if (cuisine) params.append('cuisine', cuisine)
      if (category) params.append('category', category)
      if (difficulty) params.append('difficulty', difficulty)
      
      const queryString = params.toString()
      if (queryString) url += `?${queryString}`
      
      const response = await axiosInstance.get(url)
      let items = response.data
      
      // Client-side filtering for search query (json-server doesn't support full-text search)
      if (q) {
        const searchTerm = q.toLowerCase()
        items = items.filter(r => 
          r.title.toLowerCase().includes(searchTerm) || 
          r.description.toLowerCase().includes(searchTerm)
        )
      }
      
      return items
    } catch (error) {
      console.error('Error fetching recipes:', error)
      throw error
    }
  },

  async getRecipe(id) {
    try {
      const response = await axiosInstance.get(`/recipes/${id}`)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) return null
      console.error('Error fetching recipe:', error)
      throw error
    }
  },

  async createRecipe(data, userId) {
    try {
      const recipe = {
        ...data,
        id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        createdBy: userId,
        createdAt: new Date().toISOString(),
      }
      const response = await axiosInstance.post('/recipes', recipe)
      return response.data
    } catch (error) {
      console.error('Error creating recipe:', error)
      throw error
    }
  },

  async updateRecipe(id, patch) {
    try {
      const response = await axiosInstance.patch(`/recipes/${id}`, patch)
      return response.data
    } catch (error) {
      console.error('Error updating recipe:', error)
      throw error
    }
  },

  async deleteRecipe(id) {
    try {
      await axiosInstance.delete(`/recipes/${id}`)
      return true
    } catch (error) {
      console.error('Error deleting recipe:', error)
      throw error
    }
  },

  async myRecipes(userId) {
    try {
      const response = await axiosInstance.get(`/recipes?createdBy=${userId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching user recipes:', error)
      throw error
    }
  },

  async listFavorites(userId) {
    try {
      const response = await axiosInstance.get('/favorites')
      const favorites = response.data
      const userFavorites = favorites[userId] || {}
      const favoriteIds = Object.keys(userFavorites)
      
      if (favoriteIds.length === 0) return []
      
      const recipesResponse = await axiosInstance.get('/recipes')
      const allRecipes = recipesResponse.data
      return allRecipes.filter(r => favoriteIds.includes(r.id))
    } catch (error) {
      console.error('Error fetching favorites:', error)
      throw error
    }
  },

  async toggleFavorite(userId, recipeId) {
    try {
      const response = await axiosInstance.get('/favorites')
      const favorites = response.data
      
      favorites[userId] = favorites[userId] || {}
      
      if (favorites[userId][recipeId]) {
        delete favorites[userId][recipeId]
      } else {
        favorites[userId][recipeId] = true
      }
      
      await axiosInstance.put('/favorites', favorites)
      return !!favorites[userId][recipeId]
    } catch (error) {
      console.error('Error toggling favorite:', error)
      throw error
    }
  },
}

// Authentication API
export const auth = {
  async login(email, password) {
    try {
      const response = await axiosInstance.get(`/users?email=${email}&password=${password}`)
      const users = response.data
      
      if (users.length === 0) {
        throw new Error('Invalid credentials')
      }
      
      const user = users[0]
      const { password: _, ...safeUser } = user
      
      // Store user in localStorage for session persistence
      localStorage.setItem('cb_user', JSON.stringify(safeUser))
      
      return safeUser
    } catch (error) {
      if (error.message === 'Invalid credentials') throw error
      console.error('Error logging in:', error)
      throw new Error('Login failed')
    }
  },

  async register({ name, email, password }) {
    try {
      // Check if email already exists
      const existingUsers = await axiosInstance.get(`/users?email=${email}`)
      
      if (existingUsers.data.length > 0) {
        throw new Error('Email already registered')
      }
      
      const newUser = {
        id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        name,
        email,
        password,
      }
      
      const response = await axiosInstance.post('/users', newUser)
      const { password: _, ...safeUser } = response.data
      
      // Store user in localStorage for session persistence
      localStorage.setItem('cb_user', JSON.stringify(safeUser))
      
      return safeUser
    } catch (error) {
      if (error.message === 'Email already registered') throw error
      console.error('Error registering:', error)
      throw new Error('Registration failed')
    }
  },

  me() {
    const userStr = localStorage.getItem('cb_user')
    return userStr ? JSON.parse(userStr) : null
  },

  logout() {
    localStorage.removeItem('cb_user')
  },
}
