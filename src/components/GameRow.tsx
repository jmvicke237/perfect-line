import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Item } from '../types/game';

interface GameRowProps {
  rowId: string;
  prompt: string;
  items: Item[];
  isSubmitted: boolean;
  correctPositions?: boolean[];
}

interface SortableItemProps {
  id: string;
  name: string;
  isCorrect?: boolean;
  isWrong?: boolean;
}

export function SortableItem({ id, name, isCorrect, isWrong }: SortableItemProps) {
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

  // Determine color based on whether it's correct or not
  let className = "bg-slate-700 hover:bg-slate-600 p-1.5 md:p-2 rounded text-white text-xs md:text-sm shadow-md cursor-grab touch-manipulation transition-all text-center aspect-square flex items-center justify-center";
  
  if (isCorrect) {
    className = "bg-green-600 hover:bg-green-500 p-1.5 md:p-2 rounded text-white text-xs md:text-sm shadow-md cursor-grab touch-manipulation transition-all text-center aspect-square flex items-center justify-center";
  } else if (isWrong) {
    className = "bg-red-600 hover:bg-red-500 p-1.5 md:p-2 rounded text-white text-xs md:text-sm shadow-md cursor-grab touch-manipulation transition-all text-center aspect-square flex items-center justify-center";
  }

  if (isDragging) {
    className += " opacity-80 scale-105";
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      {...attributes}
      {...listeners}
    >
      {name}
    </div>
  );
}

export default function GameRow({ rowId: _, prompt, items, isSubmitted, correctPositions }: GameRowProps) {
  return (
    <div className="mb-4 md:mb-6 p-3 md:p-4 bg-slate-800/50 rounded-lg shadow-md">
      <div className="text-xs md:text-sm mb-2 md:mb-3 text-center font-medium">{prompt}</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {items.map((item, index) => (
          <SortableItem
            key={item.id}
            id={item.id}
            name={item.name}
            isCorrect={isSubmitted && correctPositions?.[index]}
            isWrong={isSubmitted && correctPositions && !correctPositions[index]}
          />
        ))}
      </div>
    </div>
  );
} 