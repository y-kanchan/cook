import axios from 'axios'

const API_URL = 'http://localhost:3001'
const MEALDB_URL = 'https://www.themealdb.com/api/json/v1/1'

// Create axios instances
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const mealdbInstance = axios.create({
  baseURL: MEALDB_URL,
})

// Convert MealDB meal to our recipe format
function convertMealToRecipe(meal) {
  const ingredients = []
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]
    const measure = meal[`strMeasure${i}`]
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        name: ingredient,
        quantity: (measure || '').trim() || '1',
      })
    }
  }

  const instructions = meal.strInstructions || ''
  const steps = instructions
    .split('.')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  return {
    id: `meal_${meal.idMeal}`,
    title: meal.strMeal,
    description: `${meal.strArea} ${meal.strCategory} dish`,
    imageUrl: meal.strMealThumb,
    cuisine: meal.strArea || 'International',
    category: meal.strCategory || 'Dinner',
    difficulty: 'Medium',
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    ingredients,
    steps: steps.slice(0, 8),
    createdBy: 'mealdb',
    createdAt: new Date().toISOString(),
  }
}

// MealDB API
export const mealdb = {
  async getRandomMeals(count = 3) {
    try {
      const meals = []
      for (let i = 0; i < count; i++) {
        const response = await mealdbInstance.get('/random.php')
        meals.push(convertMealToRecipe(response.data.meals[0]))
      }
      return meals
    } catch (error) {
      console.error('Error fetching random meals from MealDB:', error)
      throw error
    }
  },

  async searchMeals(searchTerm) {
    try {
      const response = await mealdbInstance.get(`/search.php?s=${searchTerm}`)
      if (!response.data.meals) return []
      return response.data.meals.map(meal => convertMealToRecipe(meal))
    } catch (error) {
      console.error('Error searching meals:', error)
      throw error
    }
  },

  async getMealsByCategory(category) {
    try {
      const response = await mealdbInstance.get(`/filter.php?c=${encodeURIComponent(category)}`)
      if (!response.data.meals) return []

      // Get full meal details for each
      const mealsWithDetails = await Promise.allSettled(
        response.data.meals.map(meal =>
          mealdbInstance.get(`/lookup.php?i=${meal.idMeal}`)
            .then(res => {
              if (res.data?.meals?.[0]) {
                return convertMealToRecipe(res.data.meals[0])
              }
              return null
            })
        )
      )

      return mealsWithDetails
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value)
    } catch (error) {
      console.error(`Error fetching meals by category "${category}":`, error)
      throw error
    }
  },

  async getAllCategories() {
    try {
      const response = await mealdbInstance.get('/categories.php')
      return response.data.categories.map(cat => cat.strCategory)
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  },

  async getAllMeals({ limit = 150, perCategoryLimit = 15 } = {}) {
    try {
      console.log('🔍 Fetching all MealDB categories and recipes...')
      
      // 1. Fetch all available categories dynamically
      const categoriesResp = await mealdbInstance.get('/categories.php')
      const allCategories = (categoriesResp.data?.categories || []).map(c => c.strCategory).filter(Boolean)
      console.log(`📂 Found ${allCategories.length} categories from MealDB:`, allCategories)

      const collected = new Map() // key: recipe.id, value: recipe obj

      // Helper to add meal (dedupe by id)
      const addMeal = (meal) => {
        if (!meal || !meal.id) return
        if (!collected.has(meal.id)) collected.set(meal.id, meal)
      }

      // 2. For each category, fetch filter list and then lookup details (limited)
      for (const category of allCategories) {
        try {
          const filterResp = await mealdbInstance.get(`/filter.php?c=${encodeURIComponent(category)}`)
          const list = filterResp.data?.meals || []
          
          if (!list.length) {
            console.log(`  ⚠️  Category "${category}" returned 0 meals`)
            continue
          }

          console.log(`  📥 Category "${category}": ${list.length} meals found, fetching up to ${perCategoryLimit}...`)

          // Limit number of items per category to avoid too many lookups
          const ids = list.map(m => m.idMeal).slice(0, perCategoryLimit)

          // Lookup details for each id in parallel (use allSettled to tolerate failures)
          const lookupPromises = ids.map(id =>
            mealdbInstance.get(`/lookup.php?i=${id}`)
              .then(res => res.data?.meals?.[0] || null)
              .catch(err => {
                console.warn(`    ⚠️  Lookup failed for meal ${id}:`, err.message)
                return null
              })
          )
          const lookupResults = await Promise.all(lookupPromises)

          for (const meal of lookupResults) {
            if (meal) {
              try {
                const converted = convertMealToRecipe(meal)
                addMeal(converted)
              } catch (e) {
                console.warn(`    ⚠️  Failed to convert meal ${meal.idMeal}:`, e.message)
              }
            }
          }

          console.log(`  ✓ Category "${category}": ${collected.size} total recipes collected so far`)

          // Stop early if we've gathered enough
          if (collected.size >= limit) {
            console.log(`✓ Reached target limit of ${limit} recipes`)
            break
          }
        } catch (err) {
          // Keep going with next category
          console.warn(`⚠️  MealDB category fetch failed for "${category}":`, err?.message || err)
          continue
        }
      }

      // 3. If still below limit, fill using random.php
      let randomFill = 0
      while (collected.size < limit && randomFill < 30) {
        try {
          const r = await mealdbInstance.get('/random.php')
          const meal = r.data?.meals?.[0]
          if (meal) {
            const converted = convertMealToRecipe(meal)
            addMeal(converted)
            randomFill++
          }
        } catch (err) {
          console.warn('⚠️  random.php fetch failed:', err?.message)
          break
        }
      }

      if (randomFill > 0) {
        console.log(`✓ Added ${randomFill} additional recipes from random.php`)
      }

      // 4. Return array of unique recipes (limit applied)
      const result = Array.from(collected.values()).slice(0, limit)
      console.log(`✅ Total recipes fetched: ${result.length}`)
      console.log('Recipe categories:', [...new Set(result.map(r => r.category))].sort().join(', '))
      
      return result
    } catch (error) {
      console.error('❌ Error fetching all meals from MealDB:', error)
      throw error
    }
  },
}

// Recipe API (Local JSON Server)
export const api = {
  async init() {
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

      // Fetch both local and MealDB recipes
      const recipesResponse = await axiosInstance.get('/recipes')
      const allRecipes = recipesResponse.data
      const localFavorites = allRecipes.filter(r => favoriteIds.includes(r.id))

      // Fetch MealDB recipes if any favorites are from MealDB
      const mealdbFavorites = []
      for (const favId of favoriteIds) {
        if (favId.startsWith('meal_')) {
          try {
            const mealId = favId.replace('meal_', '')
            const mealResponse = await fetch(
              `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
            )
            const mealData = await mealResponse.json()
            if (mealData.meals && mealData.meals.length > 0) {
              mealdbFavorites.push(convertMealToRecipe(mealData.meals[0]))
            }
          } catch (err) {
            console.error(`Failed to fetch MealDB recipe ${favId}:`, err)
          }
        }
      }

      return [...localFavorites, ...mealdbFavorites]
    } catch (error) {
      console.error('Error fetching favorites:', error)
      throw error
    }
  },

  async isFavorite(userId, recipeId) {
    try {
      const response = await axiosInstance.get('/favorites')
      const favorites = response.data || {}
      const userFavorites = favorites[userId] || {}
      return !!userFavorites[recipeId]
    } catch (error) {
      console.error('Error checking favorite status:', error)
      return false
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
