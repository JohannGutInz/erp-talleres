import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SearchInputProps {
  placeholder?: string
  value?: string
  onChange: (value: string) => void
  debounce?: number
}

export function SearchInput({ placeholder = 'Buscar...', value = '', onChange, debounce = 300 }: SearchInputProps) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    const t = setTimeout(() => onChange(local), debounce)
    return () => clearTimeout(t)
  }, [local, debounce, onChange])

  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-3 py-2 text-sm border border-surface-border rounded-lg bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand w-64"
      />
    </div>
  )
}
