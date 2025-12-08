import { useState, useEffect, useRef, useMemo } from 'react'
import RecipeGrid from '../components/recipes/RecipeGrid'
import RecipeFilters from '../components/recipes/RecipeFilters'
import { useRecipes } from '../context/RecipesContext'
import { mealdb } from '../utils/api'
import Loader from '../components/ui/Loader'

const RECIPES_PER_PAGE = 24
  
export default function Recipes() {
  const { recipes: localRecipes, loading: localLoading, refresh } = useRecipes()
  const [allRecipes, setAllRecipes] = useState([])
  const [filteredRecipes, setFilteredRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState({ cuisine: '', category: '', difficulty: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [mealdbRecipes, setMealdbRecipes] = useState([])
  const mounted = useRef(false)
  const [isFetchingMealdb, setIsFetchingMealdb] = useState(false)

  // Fetch MealDB recipes once on mount
  useEffect(() => {
    const fetchMealdbRecipes = async () => {
      try {
        setIsFetchingMealdb(true)
        const allMeals = await mealdb.getAllMeals()
        setMealdbRecipes(allMeals)
      } catch (error) {
        console.error('Failed to load MealDB recipes:', error)
        setMealdbRecipes([])
      } finally {
        setIsFetchingMealdb(false)
      }
    }

    fetchMealdbRecipes()
  }, [])

  // Combine recipes whenever local or mealdb recipes change
  useEffect(() => {
    const combined = [...localRecipes, ...mealdbRecipes]
    setAllRecipes(combined)
    setCurrentPage(1) // Reset to first page
  }, [localRecipes, mealdbRecipes])

  // Compute dynamic filter option lists (memoized)
  const cuisinesOptions = useMemo(() => {
    const set = new Set()
    allRecipes.forEach(r => {
      if (r?.cuisine && typeof r.cuisine === 'string') set.add(r.cuisine)
    })
    return Array.from(set).sort()
  }, [allRecipes])

  const categoriesOptions = useMemo(() => {
    const set = new Set()
    allRecipes.forEach(r => {
      if (r?.category && typeof r.category === 'string') set.add(r.category)
    })
    return Array.from(set).sort()
  }, [allRecipes])

  const difficultiesOptions = useMemo(() => {
    const set = new Set()
    allRecipes.forEach(r => {
      if (r?.difficulty && typeof r.difficulty === 'string') set.add(r.difficulty)
    })
    return Array.from(set).sort()
  }, [allRecipes])

  // Filter recipes based on search and filters (case-insensitive)
  useEffect(() => {
    let filtered = allRecipes.slice()

    if (q && q.trim()) {
      const searchTerm = q.toLowerCase().trim()
      filtered = filtered.filter(r =>
        (r.title || '').toLowerCase().includes(searchTerm) ||
        (r.description || '').toLowerCase().includes(searchTerm)
      )
    }

    if (filters.cuisine) {
      const fc = filters.cuisine.toLowerCase().trim()
      filtered = filtered.filter(r => ((r.cuisine || '').toLowerCase().trim() === fc))
    }

    if (filters.category) {
      const fc = filters.category.toLowerCase().trim()
      filtered = filtered.filter(r => ((r.category || '').toLowerCase().trim() === fc))
    }

    if (filters.difficulty) {
      const fd = filters.difficulty.toLowerCase().trim()
      filtered = filtered.filter(r => ((r.difficulty || '').toLowerCase().trim() === fd))
    }

    setFilteredRecipes(filtered)
    setCurrentPage(1) // Reset to first page when filters change
    setLoading(localLoading || isFetchingMealdb)
  }, [allRecipes, q, filters, localLoading, isFetchingMealdb])

  async function apply() {
    await refresh({ q, ...filters })
  }

  useEffect(() => {
    if (mounted.current) {
      apply()
    } else {
      mounted.current = true
    }
  }, [filters])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE))
  const startIndex = (currentPage - 1) * RECIPES_PER_PAGE
  const endIndex = startIndex + RECIPES_PER_PAGE
  const currentRecipes = filteredRecipes.slice(startIndex, endIndex)

  const pageNumbers = []
  const maxPagesToShow = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">All Recipes</h1>
      <p className="text-sm text-gray-600">
        Showing {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
      </p>
      <RecipeFilters
        q={q}
        setQ={setQ}
        filters={filters}
        setFilters={setFilters}
        onApply={apply}
        cuisines={cuisinesOptions.length ? cuisinesOptions : undefined}
        categories={categoriesOptions.length ? categoriesOptions : undefined}
        difficulties={difficultiesOptions.length ? difficultiesOptions : undefined}
      />

      {loading ? (
        <Loader />
      ) : filteredRecipes.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">No recipes found.</div>
      ) : (
        <>
          <RecipeGrid items={currentRecipes} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-md border px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                ← Previous
              </button>

              {startPage > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    1
                  </button>
                  {startPage > 2 && <span className="px-2">...</span>}
                </>
              )}

              {pageNumbers.map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    currentPage === page
                      ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && <span className="px-2">...</span>}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
