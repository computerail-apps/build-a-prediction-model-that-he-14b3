import { Button } from '@/lib/ui/Button';

export function CategoryFilter({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => (
        <Button
          key={c}
          size="sm"
          variant={active === c ? 'default' : 'ghost'}
          onClick={() => onChange(c)}
        >
          {c}
        </Button>
      ))}
    </div>
  );
}
