import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Row, Item } from '../types/game';

interface GameRowProps {
  row: Row;
  items: Item[];
  isSubmitted: boolean;
  results?: boolean[];
  rowIndex?: number;
}

// NYT Connections colors
const categoryColors = [
  { bg: 'bg-yellow-200', border: 'border-yellow-400', text: 'text-yellow-900' }, // Yellow (easiest)
  { bg: 'bg-green-200', border: 'border-green-400', text: 'text-green-900' },    // Green 
  { bg: 'bg-blue-200', border: 'border-blue-400', text: 'text-blue-900' },       // Blue
  { bg: 'bg-purple-200', border: 'border-purple-400', text: 'text-purple-900' }  // Purple (hardest)
];

const SortableItem = ({ id, name, isCorrect, categoryIndex }: { id: string; name: string; isCorrect?: boolean; categoryIndex?: number }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
  };

  let colorClasses = 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50';
  
  if (isCorrect !== undefined && categoryIndex !== undefined) {
    const category = categoryColors[categoryIndex];
    colorClasses = `${category.bg} ${category.border} ${category.text}`;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        aspect-square flex items-center justify-center
        text-center font-medium text-sm sm:text-base p-1
        border rounded-md shadow-sm
        transition-all duration-200
        ${isDragging ? 'opacity-80 scale-105 ring-2 ring-blue-400 cursor-grabbing' : 'cursor-grab'}
        ${colorClasses}
      `}
    >
      {name}
    </div>
  );
};

export const GameRow = ({ row, items, isSubmitted, results, rowIndex = 0 }: GameRowProps) => {
  return (
    <div className="mb-6 w-full">
      {!isSubmitted && (
        <div className="text-base font-medium mb-3 text-gray-200 text-center">{row.prompt}</div>
      )}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {items.map((item, index) => (
          <SortableItem
            key={item.id}
            id={item.id}
            name={item.name}
            isCorrect={isSubmitted ? results?.[index] : undefined}
            categoryIndex={isSubmitted && results?.every(r => r) ? rowIndex : undefined}
          />
        ))}
      </div>
    </div>
  );
}; 