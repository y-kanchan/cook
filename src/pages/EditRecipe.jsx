import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import TextArea from '../components/ui/TextArea'
import Button from '../components/ui/Button'
import { api } from '../utils/api'
import { useRecipes } from '../context/RecipesContext'
import { toast } from 'react-hot-toast'

export default function EditRecipe() {
  const { id } = useParams()
  const nav = useNavigate()
  const { update } = useRecipes()
  const [form, setForm] = useState(null)
  const [imageError, setImageError] = useState('')
  const [imageLoadError, setImageLoadError] = useState(false)

  useEffect(() => { api.getRecipe(id).then(setForm) }, [id])

  if (!form) return <div className="py-12 text-center text-sm text-gray-500">Loading...</div>

  function validateImageUrl(url) {
    if (!url) return 'Image URL is required'
    try {
      new URL(url)
    } catch {
      return 'Please enter a valid URL'
    }
    // Check if it's an image URL (basic check)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext))
    const isImageHost = url.includes('unsplash.com') || url.includes('images.') || url.includes('imgur') || url.includes('i.imgur') || url.includes('googleusercontent.com') || url.includes('gstatic.com') || url.includes('google.com')
    if (!hasImageExtension && !isImageHost) {
      return 'Please enter a valid image URL'
    }
    return ''
  }

  function handleImageUrlChange(e) {
    const url = e.target.value
    setForm(f => ({ ...f, imageUrl: url }))
    setImageLoadError(false)
    const error = validateImageUrl(url)
    setImageError(error)
  }

  function addIngredient(){ setForm(f=>({...f, ingredients:[...f.ingredients, { name:'', quantity:'' }]})) }
  function addStep(){ setForm(f=>({...f, steps:[...f.steps, '' ]})) }

  async function submit(e){
    e.preventDefault()
    const error = validateImageUrl(form.imageUrl)
    if (error) {
      toast.error(error)
      return
    }
    if (form.ingredients.length === 0) {
      toast.error('Please add at least one ingredient')
      return
    }
    if (form.steps.length === 0) {
      toast.error('Please add at least one step')
      return
    }
    try{
      await toast.promise(update(id, form), {
        loading: 'Saving...',
        success: 'Recipe saved',
        error: 'Failed to save',
      })
      nav(`/recipes/${id}`)
    } catch(err){ /* error toast already shown */ }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold">Edit Recipe</h1>
      <form onSubmit={submit} className="space-y-4">
        <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        <TextArea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
        <div>
          <Input
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={handleImageUrlChange}
            required
          />
          {(imageError || imageLoadError) && (
            <p className="mt-1 text-sm text-red-600">
              {imageError || 'Image failed to load. Please check the URL.'}
            </p>
          )}
          {form.imageUrl && !imageError && !imageLoadError && (
            <div className="mt-2">
              <img
                src={form.imageUrl}
                alt="Preview"
                className="h-32 w-full rounded object-cover"
                onError={() => setImageLoadError(true)}
                onLoad={() => setImageLoadError(false)}
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input placeholder="Cuisine" value={form.cuisine} onChange={e => setForm(f => ({ ...f, cuisine: e.target.value }))} />
          <Input placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          <Input placeholder="Difficulty" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input type="number" placeholder="Prep (min)" value={form.prepTime} onChange={e => setForm(f => ({ ...f, prepTime: Number(e.target.value) }))} />
          <Input type="number" placeholder="Cook (min)" value={form.cookTime} onChange={e => setForm(f => ({ ...f, cookTime: Number(e.target.value) }))} />
          <Input type="number" placeholder="Servings" value={form.servings} onChange={e => setForm(f => ({ ...f, servings: Number(e.target.value) }))} />
        </div>
        <div>
          <div className="mb-2 font-medium">Ingredients</div>
          <Button type="button" variant="secondary" onClick={addIngredient}>Add Ingredient</Button>
          <ul className="mt-2 space-y-2">
            {form.ingredients.map((i, idx) => (
              <li key={idx} className="flex gap-2">
                <Input placeholder="Qty" value={i.quantity} onChange={e => setForm(f => { const copy = [...f.ingredients]; copy[idx] = { ...copy[idx], quantity: e.target.value }; return { ...f, ingredients: copy } })} />
                <Input placeholder="Name" value={i.name} onChange={e => setForm(f => { const copy = [...f.ingredients]; copy[idx] = { ...copy[idx], name: e.target.value }; return { ...f, ingredients: copy } })} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-2 font-medium">Steps</div>
          <Button type="button" variant="secondary" onClick={addStep}>Add Step</Button>
          <ol className="mt-2 space-y-2">
            {form.steps.map((s, idx) => (
              <li key={idx} className="flex gap-2">
                <Input value={s} onChange={e => setForm(f => { const copy = [...f.steps]; copy[idx] = e.target.value; return { ...f, steps: copy } })} />
              </li>
            ))}
          </ol>
        </div>
        <Button type="submit">Save</Button>
      </form>
    </div>
  )
}
