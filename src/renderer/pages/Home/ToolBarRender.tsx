import logoSvg from '../../assets/logo.svg';
import { productName } from '../../../../package.json';
import { IoMdAdd } from 'react-icons/io';
import { BindingTypeFilter, TypeFilterSelect } from '../../components/TypeFilterSelect';

type ToolBarRenderProps = {
  typeFilter: BindingTypeFilter;
  setTypeFilter: (filter: BindingTypeFilter) => void;
  filterText: string;
  setFilterText: (text: string) => void;
  setIsModalOpen: (open: boolean) => void;
};

export const ToolBarRender: React.FC<ToolBarRenderProps> = ({
  typeFilter,
  setTypeFilter,
  filterText,
  setFilterText,
  setIsModalOpen,
}) => {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 bg-white/60 px-3 py-2 backdrop-blur-sm dark:border-white/5 dark:bg-gray-900/60">
      <h1 className="flex items-center gap-3 text-xl font-semibold">
        <img src={logoSvg} alt="Command Alias logo" className="h-7 w-7" />
        <span className="dark:text-white">{productName}</span>
      </h1>
      <div className="flex items-center gap-2">
        <TypeFilterSelect value={typeFilter} onChange={setTypeFilter} />
        <input
          type="text"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          placeholder="Search"
          className="h-9 w-72 rounded-md border border-black/10 bg-white/80 px-3.5 text-sm placeholder-gray-400 outline-none focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/30 dark:border-white/10 dark:bg-gray-800/70 dark:text-gray-100 dark:placeholder-gray-500"
        />
        <button type="button" onClick={() => setIsModalOpen(true)} className="">
          <IoMdAdd className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};
