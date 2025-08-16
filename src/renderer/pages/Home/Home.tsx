import { useEffect, useState } from 'react';
import type { CommandAlias } from '../../../main/database/entities/CommandAlias';
import { BindingModal } from '../../components/AddBindingModal/BindingModal';
import { type BindingTypeFilter } from '../../components/TypeFilterSelect';
import { TableRender } from './TableRender';
import { ToolBarRender } from './ToolBarRender';

/**
 * Home shows all key bindings in a CommandPalette-like list for quick scanning.
 */
export const Home = () => {
  const [bindings, setBindings] = useState<CommandAlias[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [typeFilter, setTypeFilter] = useState<BindingTypeFilter>('all');

  const loadBindings = async () => {
    try {
      const data = await window.electron.commandAlias.getAlias();
      setBindings(data);
    } catch (error) {
      console.error('Binding load failed', error);
    }
  };

  useEffect(() => {
    loadBindings();
  }, []);

  const handleAddBinding = async (binding: Omit<CommandAlias, 'id'>) => {
    try {
      await window.electron.commandAlias.addAlias(binding);
      await loadBindings();
    } catch (error) {
      console.error('Failed to add binding', error);
      throw error;
    }
  };

  // 2. Core processing: compute filtered list using text and type filters
  const filteredBindings = (() => {
    const q = filterText.trim().toLowerCase();
    return bindings.filter(b => {
      if (typeFilter !== 'all' && b.actionType !== typeFilter) return false;
      if (!q) return true;
      const hay = `${b.alias} ${b.target ?? ''} ${b.comment ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  })();
  const onDelete = (id: number) => {
    window.electron.commandAlias.remove(id);
    loadBindings();
  };

  const [editValue, setEditValue] = useState<CommandAlias | null>(null);
  const handleEditBinding = async (binding: CommandAlias) => {
    if (!editValue) return;
    try {
      await window.electron.commandAlias.update(binding);
      await loadBindings();
    } catch (error) {
      console.error('Failed to update binding', error);
      throw error;
    }
  };

  return (
    <>
      <BindingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddBinding}
        title="Add command alias"
      />
      {editValue !== null && (
        <BindingModal
          title="Edit command alias"
          value={editValue}
          isOpen={editValue !== null}
          onClose={() => setEditValue(null)}
          onSubmit={value => handleEditBinding({ ...value, id: editValue.id })}
          confirmText="Edit"
        />
      )}

      <div className="mx-auto max-w-4xl p-4">
        {/* Top toolbar: macOS-style header with controls on the right */}
        <ToolBarRender
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          filterText={filterText}
          setFilterText={setFilterText}
          setIsModalOpen={setIsModalOpen}
        />

        <TableRender filteredBindings={filteredBindings} onDelete={onDelete} onEdit={setEditValue} />
      </div>
    </>
  );
};

encodeURIComponent('hello');
