import { useAuth } from '../context/AuthContext'
import { storage, KEYS } from '../utils/localStorage'
import sampleRecipes from '../data/sampleRecipes.json'

export default function Profile() {
  const { user } = useAuth()

  const handleResetData = () => {
    if (window.confirm('This will reset all recipes to the sample data. Are you sure?')) {
      // Clear the seed flag and reset recipes
      storage.remove(KEYS.seed)
      storage.set(KEYS.recipes, sampleRecipes)
      storage.remove(KEYS.favorites)

      alert('Sample data has been reset! The page will now reload.')
      window.location.reload()
    }
  }

  if (!user) return null
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Profile</h1>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-gray-500">Name</div>
        <div className="font-medium">{user.name}</div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-gray-500">Email</div>
        <div className="font-medium">{user.email}</div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div>
          <div className="text-sm font-medium mb-1">Developer Tools</div>
          <div className="text-xs text-gray-500">Reset sample recipes to default data</div>
        </div>
        <button
          onClick={handleResetData}
          className="w-full rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
        >
          Reset Sample Data
        </button>
      </div>
    </div>
  )
}
