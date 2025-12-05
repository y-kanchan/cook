import { useState } from 'react'
import Input from '../components/ui/Input'
import TextArea from '../components/ui/TextArea'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import { useRecipes } from '../context/RecipesContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const cuisines = ['Italian', 'Indian', 'Mexican', 'Chinese', 'American', 'Thai', 'French']
const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack']
const difficulties = ['Easy', 'Medium', 'Hard']

export default function AddRecipe() {
  const { create } = useRecipes()
  const nav = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '', cuisine: '', category: '', difficulty: '', prepTime: 0, cookTime: 0, servings: 1, ingredients: [], steps: [] })
  const [ingredient, setIngredient] = useState({ name: '', quantity: '' })
  const [step, setStep] = useState('')
  function addIngredient() { if (!ingredient.name) return; setForm(f => ({ ...f, ingredients: [...f.ingredients, ingredient] })); setIngredient({ name: '', quantity: '' }) }
  function addStep() { if (!step) return; setForm(f => ({ ...f, steps: [...f.steps, step] })); setStep('') }
  async function submit(e) { e.preventDefault(); const r = await create(form); toast.success('Recipe created'); nav(`/recipes/${r.id}`) }
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold">Add Recipe</h1>
      <form onSubmit={submit} className="space-y-4">
        <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        <TextArea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
        <Input placeholder="Image URL" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} required />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select value={form.cuisine} onChange={e => setForm(f => ({ ...f, cuisine: e.target.value }))}>
            <option value="">Select Cuisine</option>
            {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
            <option value="">Select Difficulty</option>
            {difficulties.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>

        <div>
          <div className="mb-2 font-medium">Ingredients</div>
          <div className="flex gap-2">
            <Input placeholder="Quantity" value={ingredient.quantity} onChange={e => setIngredient(v => ({ ...v, quantity: e.target.value }))} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIngredient())} />
            <Input placeholder="Name" value={ingredient.name} onChange={e => setIngredient(v => ({ ...v, name: e.target.value }))} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIngredient())} />
            <Button type="button" variant="secondary" onClick={addIngredient}>Add</Button>
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {form.ingredients.map((i, idx) => (<li key={idx}>{i.quantity} {i.name}</li>))}
          </ul>
        </div>
        <div>
          <div className="mb-2 font-medium">Steps</div>
          <div className="flex gap-2">
            <Input placeholder="Add a step" value={step} onChange={e => setStep(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addStep())} />
            <Button type="button" variant="secondary" onClick={addStep}>Add</Button>
          </div>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {form.steps.map((s, idx) => (<li key={idx}>{s}</li>))}
          </ol>
        </div>
        <Button type="submit">Create</Button>
      </form>
    </div>
  )
}
