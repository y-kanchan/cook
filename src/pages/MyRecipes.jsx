import { useEffect, useState } from 'react'
import { useRecipes } from '../context/RecipesContext'
import { useAuth } from '../context/AuthContext'
import RecipeGrid from '../components/recipes/RecipeGrid'

export default function MyRecipes(){
  const { myRecipes } = useRecipes()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    myRecipes().then(setItems).finally(() => setLoading(false))
  }, [user, myRecipes])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">My Recipes</h1>
      {loading ? <div className="py-12 text-center text-sm text-gray-500">Loading...</div> : <RecipeGrid items={items} />}
    </div>
  )
}
