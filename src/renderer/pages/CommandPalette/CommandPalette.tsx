import { useState, useEffect } from 'react';

interface KeyBinding {
  id: string;
  sequence: string;
  comment?: string;
}

export default function CommandPalette() {
  const [bindings, setBindings] = useState<KeyBinding[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const loadBindings = async () => {
      try {
        const data = await window.electron.spaceTrigger.getKeyBindings();
        setBindings(data);
      } catch (error) {
        console.error('Failed to load bindings', error);
      }
    };
    loadBindings();
  }, []);

  const filteredBindings = bindings.filter(b => b.sequence.toLowerCase().includes(filter.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setSelectedIndex(prev => Math.min(prev + 1, filteredBindings.length - 1));
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (filteredBindings[selectedIndex]) {
          // Execute selected command
          console.log('Executing:', filteredBindings[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredBindings, selectedIndex]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-96 overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
        <input
          type="text"
          className="w-full bg-gray-900 p-4 text-white placeholder-gray-400 focus:outline-none"
          placeholder="Type to filter commands..."
          value={filter}
          onChange={e => {
            setFilter(e.target.value);
            setSelectedIndex(0);
          }}
          autoFocus
        />

        <div className="max-h-96 overflow-y-auto">
          {filteredBindings.map((binding, index) => (
            <div
              key={binding.id}
              className={`flex items-center gap-4 border-t border-gray-700 p-4 ${
                index === selectedIndex ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-700'
              }`}
            >
              <span className="font-mono">{binding.sequence}</span>
              <span className="flex-1 truncate">{binding.comment}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
