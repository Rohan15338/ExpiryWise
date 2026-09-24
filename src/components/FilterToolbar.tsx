import React from 'react';
import { Category, StorageLocation, ProductStatus } from '../types';
import { CATEGORY_ICONS, LOCATION_ICONS } from '../services/shelfLifeData';
import { 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  MapPin, 
  Download, 
  Printer,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface FilterToolbarProps {
  selectedCategory: Category | 'All';
  onSelectCategory: (cat: Category | 'All') => void;
  selectedLocation: StorageLocation | 'All';
  onSelectLocation: (loc: StorageLocation | 'All') => void;
  statusFilter: ProductStatus | 'all' | 'consumed';
  onStatusFilterChange: (status: ProductStatus | 'all' | 'consumed') => void;
  sortBy: 'expiry_asc' | 'expiry_desc' | 'name_asc' | 'created_desc';
  onSortByChange: (sort: 'expiry_asc' | 'expiry_desc' | 'name_asc' | 'created_desc') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onExportCSV: () => void;
  onPrintInventory: () => void;
}

const CATEGORIES: (Category | 'All')[] = ['All', 'Food', 'Beverages', 'Medicine', 'Cosmetics', 'Household', 'Other'];
const LOCATIONS: (StorageLocation | 'All')[] = ['All', 'Fridge', 'Freezer', 'Pantry', 'Medicine Cabinet', 'Bathroom', 'Vanity', 'Kitchen Shelf', 'Other'];

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedLocation,
  onSelectLocation,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  onExportCSV,
  onPrintInventory
}) => {
  return (
    <div className="space-y-3 bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs">
      
      {/* Row 1: Category Filter Pills */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const icon = cat === 'All' ? '✨' : CATEGORY_ICONS[cat]?.icon || '📦';
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{icon}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* View mode toggle (Grid vs List) */}
        <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Row 2: Storage Location Pills & Sorting Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        
        {/* Storage Location Dropdown or Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Location:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {LOCATIONS.slice(0, 5).map((loc) => {
              const isSelected = selectedLocation === loc;
              const icon = loc === 'All' ? '🏠' : LOCATION_ICONS[loc as StorageLocation]?.icon || '📦';
              return (
                <button
                  key={loc}
                  onClick={() => onSelectLocation(loc)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{loc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort & Export controls */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="text-xs font-semibold text-slate-700 bg-transparent outline-hidden cursor-pointer"
            >
              <option value="expiry_asc">Expiry: Soonest First</option>
              <option value="expiry_desc">Expiry: Latest First</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="created_desc">Recently Added</option>
            </select>
          </div>

          <button
            onClick={onExportCSV}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onPrintInventory}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
            title="Print Inventory / Grocery List"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
