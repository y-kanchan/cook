import { useEffect, useState } from 'react'
import { useRecipes } from '../context/RecipesContext'
import { useAuth } from '../context/AuthContext'
import RecipeGrid from '../components/recipes/RecipeGrid'
 
export default function SavedRecipes() {
  const { favorites } = useRecipes()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
 
  useEffect(() => {
    if (!user) return
    setLoading(true)
    favorites().then(setItems).finally(() => setLoading(false))
  }, [user, favorites])

  function handleRemoveRecipe(recipeId) {
    setItems(prev => prev.filter(item => item.id !== recipeId))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">My Cookbook</h1>
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">No saved recipes yet. Start saving your favorites!</div>
      ) : (
        <RecipeGrid 
          items={items} 
          showRemove={true}
          onRemove={handleRemoveRecipe}
        />
      )}
    </div>
  )
}
