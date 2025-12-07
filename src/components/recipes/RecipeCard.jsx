import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import { Link } from 'react-router-dom'
import { useRecipes } from '../../context/RecipesContext'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-hot-toast'

export default function RecipeCard({ recipe, showRemove = false, onRemove = null }){
  const { favorite, isFavorite } = useRecipes()
  const { user } = useAuth()
  const [isAlreadySaved, setIsAlreadySaved] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!user || showRemove) {
      setIsAlreadySaved(false)
      return
    }
    let mounted = true
    const check = async () => {
      try {
        setChecking(true)
        const saved = await isFavorite(recipe.id)
        if (mounted) setIsAlreadySaved(!!saved)
      } catch (err) {
        console.error('Error checking favorite status', err)
      } finally {
        if (mounted) setChecking(false)
      }
    }
    check()
    return () => { mounted = false }
  }, [user, recipe.id, isFavorite, showRemove])

  async function handleRemove() {
    if (!window.confirm('Remove this recipe from your cookbook?')) return
    try {
      await favorite(recipe.id)
      toast.success('Removed from your cookbook')
      if (onRemove) {
        onRemove(recipe.id)
      }
    } catch (err) {
      toast.error('Failed to remove recipe')
    }
  }

  async function handleSave() {
    if (!user) {
      toast.error('Please login to save recipes')
      return
    }

    if (isAlreadySaved) {
      toast.error('Already saved')
      return
    }

    try {
      const saved = await favorite(recipe.id)
      if (saved) {
        setIsAlreadySaved(true)
        toast.success('Recipe saved')
      } else {
        toast.error('Failed to save recipe')
      }
    } catch (err) {
      toast.error('Failed to save recipe')
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <img
        src={recipe.imageUrl}
        alt={recipe.title}
        className="h-40 w-full object-cover"
        loading="lazy"
      />
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 font-semibold">{recipe.title}</h3>
        <p className="line-clamp-2 text-sm text-gray-600">{recipe.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{recipe.cuisine} • {recipe.category}</span>
          <span>{recipe.difficulty}</span>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Link to={`/recipes/${recipe.id}`} className="text-sm text-primary-700">View</Link>

          {showRemove ? (
            <button
              onClick={handleRemove}
              className="text-sm text-red-500 hover:text-red-700 font-medium border-l pl-2"
            >
              Remove
            </button>
          ) : (
            <Button
              variant="secondary"
              disabled={checking || isAlreadySaved}
              onClick={handleSave}
            >
              {checking ? 'Checking...' : (isAlreadySaved ? 'Saved' : 'Save')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
