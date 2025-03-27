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
  value?: number;
  isCorrect?: boolean;
  isWrong?: boolean;
  isSubmitted?: boolean;
}

export function SortableItem({ id, name, value, isCorrect, isWrong, isSubmitted }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const transformString = CSS.Transform.toString(transform);
  
  const style = {
    transition,
    zIndex: isDragging ? 100 : 1,
    backgroundColor: isCorrect ? '#16a34a' : isWrong ? '#dc2626' : '#334155',
    color: 'white',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isDragging ? 0.8 : 1,
    transform: isDragging ? `${transformString} scale(1.05)` : transformString,
    flexDirection: 'column' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {name}
      {isSubmitted && value !== undefined && (
        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.9 }}>
          ({value})
        </div>
      )}
    </div>
  );
}

export default function GameRow({ rowId: _, prompt, items, isSubmitted, correctPositions }: GameRowProps) {
  return (
    <div style={{ 
      marginBottom: '1rem', 
      padding: '0.75rem', 
      backgroundColor: 'rgba(30, 41, 59, 0.5)', 
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ 
        fontSize: '0.875rem', 
        marginBottom: '0.5rem', 
        textAlign: 'center', 
        fontWeight: 500,
        color: 'white'
      }}>
        {prompt}
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '0.5rem'
      }}>
        {items.map((item, index) => (
          <SortableItem
            key={item.id}
            id={item.id}
            name={item.name}
            value={item.value}
            isCorrect={isSubmitted && correctPositions?.[index]}
            isWrong={isSubmitted && correctPositions && !correctPositions[index]}
            isSubmitted={isSubmitted}
          />
        ))}
      </div>
    </div>
  );
} 