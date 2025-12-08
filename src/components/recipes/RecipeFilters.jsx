import Input from '../ui/Input'
import Select from '../ui/Select'

const DEFAULT_CUISINES = ['Italian', 'Indian', 'Mexican', 'Chinese', 'American', 'Thai', 'French']
const DEFAULT_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack']
const DEFAULT_DIFFICULTIES = ['Easy', 'Medium', 'Hard']

export default function RecipeFilters({
  q, setQ,
  filters, setFilters,
  onApply,
  cuisines = DEFAULT_CUISINES,
  categories = DEFAULT_CATEGORIES,
  difficulties = DEFAULT_DIFFICULTIES,
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Input
        placeholder="Search recipes..."
        value={q}
        onChange={e => setQ(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onApply()}
      />
      <Select value={filters.cuisine} onChange={e => setFilters(v => ({ ...v, cuisine: e.target.value }))}>
        <option value="">All Cuisines</option>
        {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
      </Select>
      <Select value={filters.category} onChange={e => setFilters(v => ({ ...v, category: e.target.value }))}>
        <option value="">All Categories</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </Select>
      <Select value={filters.difficulty} onChange={e => setFilters(v => ({ ...v, difficulty: e.target.value }))}>
        <option value="">Any Difficulty</option>
        {difficulties.map(c => <option key={c} value={c}>{c}</option>)}
      </Select>
    </div> 
  )
}
 