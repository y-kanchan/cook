import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useRecipes } from '../context/RecipesContext'
import Button from '../components/ui/Button'
import { toast } from 'react-hot-toast'

export default function RecipeDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { favorite, isFavorite } = useRecipes()
  const [r, setR] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [isAlreadySaved, setIsAlreadySaved] = useState(false)
  const [checkingFavorite, setCheckingFavorite] = useState(false)

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true)

        // Check if it's a MealDB recipe (starts with 'meal_')
        if (id && id.startsWith('meal_')) {
          const mealId = id.replace('meal_', '')
          const mealResponse = await fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
          )
          const mealData = await mealResponse.json()

          if (mealData.meals && mealData.meals.length > 0) {
            const convertedMeal = convertMealToRecipe(mealData.meals[0])
            setR(convertedMeal)
          } else {
            setR(null)
          }
        } else {
          // Try to fetch from local API
          const recipe = await api.getRecipe(id)
          setR(recipe)
        }
      } catch (error) {
        console.error('Error fetching recipe:', error)
        setR(null)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [id])

  // When recipe or user changes, check favorite status
  useEffect(() => {
    let mounted = true
    const check = async () => {
      if (!r || !user) {
        if (mounted) setIsAlreadySaved(false)
        return
      }
      try {
        setCheckingFavorite(true)
        const saved = await isFavorite(r.id)
        if (mounted) setIsAlreadySaved(!!saved)
      } catch (err) {
        console.error('Failed to check favorite', err)
      } finally {
        if (mounted) setCheckingFavorite(false)
      }
    }
    check()
    return () => { mounted = false }
  }, [r, user, isFavorite])

  // Convert MealDB meal to recipe format (same as in api.js)
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

  if (loading) return <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
  if (!r) return <div className="py-12 text-center text-sm text-gray-500">Not found.</div>

  // MealDB recipes can't be deleted by users
  const canDelete = user && user.id === r.createdBy && !r.id.startsWith('meal_')

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) return
    setDeleting(true)
    try {
      await toast.promise(async () => {
        // remove is provided by RecipesContext (removes from local json-server)
        await (await import('../context/RecipesContext')).useRecipes().remove(r.id)
      }, {
        loading: 'Deleting...',
        success: 'Recipe deleted',
        error: 'Failed to delete recipe',
      })
      navigate('/recipes')
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-yellow-600 hover:text-yellow-700 mb-4"
        aria-label="Go back"
      >
        <span className="text-lg">←</span> Back
      </button>

      <img
        src={r.imageUrl}
        alt={r.title}
        className="h-64 w-full rounded-lg object-cover"
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{r.title}</h1>
          <p className="mt-1 text-gray-600">{r.description}</p>
          <div className="mt-2 text-sm text-gray-500">{r.cuisine} • {r.category} • {r.difficulty}</div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={checkingFavorite || isAlreadySaved}
            onClick={async () => {
              if (!user) { toast.error('Please login to save recipes'); return }
              if (isAlreadySaved) { toast.error('Already saved'); return }
              try {
                const saved = await favorite(r.id)
                if (saved) {
                  setIsAlreadySaved(true)
                  toast.success('Saved to your cookbook')
                } else {
                  toast.error('Failed to save recipe')
                }
              } catch (err) {
                toast.error('Failed to save recipe')
              }
            }}
          >
            {checkingFavorite ? 'Checking...' : (isAlreadySaved ? 'Saved' : 'Save')}
          </Button>

          {canDelete && (
            <>
              <Button variant="secondary" onClick={() => navigate(`/edit/${r.id}`)}>Edit</Button>
              <Button variant="danger" disabled={deleting} onClick={handleDelete}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-2 font-semibold">Ingredients</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {r.ingredients.map((i, idx) => (<li key={idx}>{i.quantity} {i.name}</li>))}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 font-semibold">Steps</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          {r.steps.map((s, idx) => (<li key={idx}>{s}</li>))}
        </ol>
      </section>
    </div>
  )
}
