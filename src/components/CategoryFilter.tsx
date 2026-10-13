import { Button } from '@/lib/ui/Button';

interface CategoryFilterProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => (
        <Button
          key={c}
          size="sm"
          variant={active === c ? 'default' : 'outline'}
          onClick={() => onChange(c)}
          className="transition-colors duration-150"
        >
          {c}
        </Button>
      ))}
    </div>
  );
}
