import React, { useState, useMemo } from 'react';
import { Product, ProductStatus, Category, StorageLocation } from '../types';
import { getProductStatus } from '../utils/dateUtils';
import { FilterToolbar } from '../components/FilterToolbar';
import { ProductCard } from '../components/ProductCard';
import { ProductListItem } from '../components/ProductListItem';
import { 
  Plus, 
  Receipt, 
  Search, 
  ShoppingCart, 
  ChefHat, 
  Package,
  Sparkles
} from 'lucide-react';
import { sound } from '../services/notificationService';

interface MyKitchenViewProps {
  products: Product[];
  initialStatusFilter?: ProductStatus | 'all';
  initialLocationFilter?: StorageLocation | 'All';
  onOpenAddProduct: () => void;
  onNavigateToScanner: () => void;
  onOpenReplenish: () => void;
  onOpenRecipes: (ingredient?: string) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onMarkConsumed: (id: string) => void;
  onMarkWasted: (id: string) => void;
  onExportCSV: () => void;
  onPrintInventory: () => void;
}

export const MyKitchenView: React.FC<MyKitchenViewProps> = ({
  products,
  initialStatusFilter = 'all',
  initialLocationFilter = 'All',
  onOpenAddProduct,
  onNavigateToScanner,
  onOpenReplenish,
  onOpenRecipes,
  onEditProduct,
  onDeleteProduct,
  onMarkConsumed,
  onMarkWasted,
  onExportCSV,
  onPrintInventory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all' | 'consumed'>(initialStatusFilter);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedLocation, setSelectedLocation] = useState<StorageLocation | 'All'>(initialLocationFilter);
  const [sortBy, setSortBy] = useState<'expiry_asc' | 'expiry_desc' | 'name_asc' | 'created_desc'>('expiry_asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Consumed filter
        if (statusFilter === 'consumed') {
          return p.isConsumed || p.isWasted;
        } else {
          if (p.isConsumed || p.isWasted) return false;
        }

        // Status filter
        if (statusFilter !== 'all') {
          const s = getProductStatus(p.expiryDate);
          if (s !== statusFilter) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Location filter
        if (selectedLocation !== 'All' && p.storageLocation !== selectedLocation) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = (p.brand || '').toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchLoc = p.storageLocation.toLowerCase().includes(q);
          const matchNotes = (p.notes || '').toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchCat && !matchLoc && !matchNotes) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'expiry_asc') {
          return a.expiryDate.localeCompare(b.expiryDate);
        } else if (sortBy === 'expiry_desc') {
          return b.expiryDate.localeCompare(a.expiryDate);
        } else if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        } else {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [products, statusFilter, selectedCategory, selectedLocation, searchQuery, sortBy]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
              My Products & Kitchen Inventory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {filteredProducts.length} Items
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Manage all household items, categories, storage locations, and expiries
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenReplenish}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Shopping / Restock List</span>
            <span className="sm:hidden">Restock</span>
          </button>

          <button
            onClick={() => {
              sound.playSuccess();
              onOpenAddProduct();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by name, brand, storage location, or notes..."
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden text-slate-800 placeholder-slate-400 shadow-2xs font-medium"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filters & Sorting Toolbar */}
      <FilterToolbar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExportCSV={onExportCSV}
        onPrintInventory={onPrintInventory}
      />

      {/* Active Filter Chips */}
      {(statusFilter !== 'all' || selectedCategory !== 'All' || selectedLocation !== 'All' || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Active Filters:</span>
          
          {statusFilter !== 'all' && (
            <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white font-medium flex items-center gap-1.5">
              <span>Status: {statusFilter.replace('_', ' ')}</span>
              <button onClick={() => setStatusFilter('all')} className="hover:text-rose-300">×</button>
            </span>
          )}

          {selectedCategory !== 'All' && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-medium flex items-center gap-1.5">
              <span>Category: {selectedCategory}</span>
              <button onClick={() => setSelectedCategory('All')} className="hover:text-rose-600">×</button>
            </span>
          )}

          {selectedLocation !== 'All' && (
            <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-900 font-medium flex items-center gap-1.5">
              <span>Location: {selectedLocation}</span>
              <button onClick={() => setSelectedLocation('All')} className="hover:text-rose-600">×</button>
            </span>
          )}

          {searchQuery && (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-medium flex items-center gap-1.5">
              <span>Search: "{searchQuery}"</span>
              <button onClick={() => setSearchQuery('')} className="hover:text-rose-600">×</button>
            </span>
          )}

          <button
            onClick={() => {
              setStatusFilter('all');
              setSelectedCategory('All');
              setSelectedLocation('All');
              setSearchQuery('');
            }}
            className="text-slate-500 hover:text-slate-800 underline font-medium ml-1 cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* Products Grid or List View */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
            🌱
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              No products match your criteria
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {searchQuery || statusFilter !== 'all' || selectedCategory !== 'All'
                ? 'Try clearing active filters or searching for another item.'
                : 'Your inventory is currently empty. Add products manually or scan a shopping bill!'}
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={onNavigateToScanner}
              className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-teal-200"
            >
              <Receipt className="w-4 h-4" />
              <span>Scan Shopping Bill</span>
            </button>
            <button
              onClick={() => {
                sound.playSuccess();
                onOpenAddProduct();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
              onMarkConsumed={onMarkConsumed}
              onMarkWasted={onMarkWasted}
              onShowRecipeForProduct={onOpenRecipes}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredProducts.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
              onMarkConsumed={onMarkConsumed}
              onMarkWasted={onMarkWasted}
              onShowRecipeForProduct={onOpenRecipes}
            />
          ))}
        </div>
      )}

    </div>
  );
};
