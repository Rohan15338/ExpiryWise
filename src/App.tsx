import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { Product, ProductStatus, StorageLocation, NotificationItem } from './types';
import { 
  getUserProducts, 
  addProduct, 
  addMultipleProducts, 
  updateProduct, 
  deleteProduct, 
  markProductAsConsumed, 
  markProductAsWasted, 
  computeUserMetrics, 
  exportUserDataAsCSV 
} from './services/storageService';
import { generateNotifications, sound } from './services/notificationService';
import { getProductStatus } from './utils/dateUtils';

// Views
import { Navbar, ActiveTab } from './components/Navbar';
import { OverviewView } from './views/OverviewView';
import { MyKitchenView } from './views/MyKitchenView';
import { BillScannerView } from './views/BillScannerView';
import { WelcomeGuestView } from './views/WelcomeGuestView';

// Modals & Drawers
import { AddProductModal } from './components/AddProductModal';
import { BillScannerModal } from './components/BillScannerModal';
import { RecipeModal } from './components/RecipeModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthModal } from './components/AuthModal';
import { ReplenishDrawer } from './components/ReplenishDrawer';

import { 
  LayoutDashboard, 
  Refrigerator, 
  ScanLine, 
  Plus
} from 'lucide-react';

export function App() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Navigation Menu Page State
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Inventory State
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // Kitchen View Filter presets when navigating from Overview
  const [kitchenStatusPreset, setKitchenStatusPreset] = useState<ProductStatus | 'all'>('all');
  const [kitchenLocationPreset, setKitchenLocationPreset] = useState<StorageLocation | 'All'>('All');

  // Modals & Drawers
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);
  const [isReplenishOpen, setIsReplenishOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [recipeSelectedIngredient, setRecipeSelectedIngredient] = useState<string[]>([]);

  const reloadProducts = () => {
    if (!user) {
      setProducts([]);
      setNotifications([]);
      return;
    }
    const userProds = getUserProducts(user.id);
    setProducts(userProds);
    const notifs = generateNotifications(userProds);
    setNotifications(notifs);
  };

  useEffect(() => {
    reloadProducts();
  }, [user]);

  // Metrics
  const metrics = useMemo(() => {
    if (!user) return { totalTracked: 0, consumedCount: 0, wastedCount: 0, moneySaved: 0, moneyWasted: 0, co2PreventedKg: 0 };
    return computeUserMetrics(user.id);
  }, [products, user]);

  const expiringItemNames = useMemo(() => {
    return products
      .filter(p => !p.isConsumed && !p.isWasted && (p.category === 'Food' || p.category === 'Beverages'))
      .filter(p => {
        const status = getProductStatus(p.expiryDate);
        return status === 'expiring_today' || status === 'expiring_soon';
      })
      .map(p => p.name);
  }, [products]);

  // Product Actions
  const handleSaveProduct = (prodData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, prodData);
      setEditingProduct(null);
    } else {
      addProduct(prodData);
    }
    reloadProducts();
  };

  const handleAddMultiple = (newItems: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    addMultipleProducts(newItems);
    reloadProducts();
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsAddOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Remove this product from your inventory?')) {
      deleteProduct(id);
      reloadProducts();
    }
  };

  const handleMarkConsumed = (id: string) => {
    markProductAsConsumed(id);
    reloadProducts();
  };

  const handleMarkWasted = (id: string) => {
    markProductAsWasted(id);
    reloadProducts();
  };

  const handleReAddProduct = (pastProd: Product) => {
    if (!user) return;
    sound.playSuccess();
    addProduct({
      userId: user.id,
      name: pastProd.name,
      brand: pastProd.brand,
      category: pastProd.category,
      quantity: pastProd.quantity,
      purchaseDate: new Date().toISOString().slice(0, 10),
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      storageLocation: pastProd.storageLocation,
      reminderPreference: pastProd.reminderPreference ?? 2,
      price: pastProd.price,
      notes: 'Restocked!'
    });
    reloadProducts();
  };

  const handleOpenRecipeForSpecificItem = (productName?: string) => {
    if (productName) {
      setRecipeSelectedIngredient([productName]);
    } else {
      setRecipeSelectedIngredient(expiringItemNames.length > 0 ? expiringItemNames : ['milk', 'banana']);
    }
    setIsRecipeOpen(true);
  };

  const handleNavigateToKitchen = (filter?: ProductStatus | 'all', location?: string) => {
    if (filter) setKitchenStatusPreset(filter);
    if (location) setKitchenLocationPreset(location as StorageLocation);
    setActiveTab('kitchen');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportCSV = () => {
    if (!user) return;
    const csv = exportUserDataAsCSV(user.id);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExpiryWise_Inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    sound.playSuccess();
  };

  const handlePrint = () => {
    window.print();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl animate-bounce">
            🌱
          </div>
          <p className="text-sm font-semibold text-slate-600">Loading ExpiryWise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-16 md:pb-0">
      
      {/* Top Navigation Bar with Page Tabs */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddProduct={() => {
          setEditingProduct(null);
          setIsAddOpen(true);
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNotifications={() => setIsNotifOpen(true)}
        notifications={notifications}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!user ? (
          <WelcomeGuestView
            onOpenSignUp={() => {
              setAuthMode('signup');
              setIsAuthOpen(true);
            }}
            onOpenLogin={() => {
              setAuthMode('login');
              setIsAuthOpen(true);
            }}
            onExploreDemo={() => {
              setAuthMode('login');
              setIsAuthOpen(true);
            }}
          />
        ) : (
          <>
            {/* PAGE 1: Overview */}
            {activeTab === 'overview' && (
              <OverviewView
                products={products}
                onNavigateToKitchen={handleNavigateToKitchen}
                onNavigateToScanner={() => {
                  setActiveTab('scan');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAddProduct={() => {
                  setEditingProduct(null);
                  setIsAddOpen(true);
                }}
                onOpenRecipes={() => handleOpenRecipeForSpecificItem()}
                moneySaved={metrics.moneySaved}
                co2PreventedKg={metrics.co2PreventedKg}
              />
            )}

            {/* PAGE 2: My Products / My Kitchen */}
            {activeTab === 'kitchen' && (
              <MyKitchenView
                products={products}
                initialStatusFilter={kitchenStatusPreset}
                initialLocationFilter={kitchenLocationPreset}
                onOpenAddProduct={() => {
                  setEditingProduct(null);
                  setIsAddOpen(true);
                }}
                onNavigateToScanner={() => setActiveTab('scan')}
                onOpenReplenish={() => setIsReplenishOpen(true)}
                onOpenRecipes={handleOpenRecipeForSpecificItem}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onMarkConsumed={handleMarkConsumed}
                onMarkWasted={handleMarkWasted}
                onExportCSV={handleExportCSV}
                onPrintInventory={handlePrint}
              />
            )}

            {/* PAGE 3: Bill Scanning */}
            {activeTab === 'scan' && (
              <BillScannerView
                onAddMultiple={handleAddMultiple}
                onNavigateToKitchen={() => setActiveTab('kitchen')}
                userId={user.id}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar for Instant 1-Tap Switching */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => {
            sound.playSuccess();
            setActiveTab('overview');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'overview' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Overview</span>
        </button>

        <button
          onClick={() => {
            sound.playSuccess();
            setActiveTab('kitchen');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'kitchen' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Refrigerator className="w-5 h-5" />
          <span className="text-[10px]">My Kitchen</span>
        </button>

        <button
          onClick={() => {
            sound.playSuccess();
            setActiveTab('scan');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'scan' ? 'text-teal-700 font-bold' : 'text-slate-500'
          }`}
        >
          <ScanLine className="w-5 h-5" />
          <span className="text-[10px]">Scan Bill</span>
        </button>

        <button
          onClick={() => {
            sound.playSuccess();
            setEditingProduct(null);
            setIsAddOpen(true);
          }}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-emerald-600 font-semibold cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-[10px]">Add</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200/80 bg-white/70 backdrop-blur-xs text-center text-xs text-slate-500 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 font-['Outfit']">🌱 ExpiryWise</span>
            <span>—</span>
            <span>Know before it expires. Waste less.</span>
          </div>
          <div className="text-[11px] text-slate-400">
            All-in-one Smart Expiry Tracking & Waste Prevention • SQLite Database Enabled
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {user && (
        <>
          <AddProductModal
            isOpen={isAddOpen}
            onClose={() => {
              setIsAddOpen(false);
              setEditingProduct(null);
            }}
            onSave={handleSaveProduct}
            initialProduct={editingProduct}
            userId={user.id}
          />

          <BillScannerModal
            isOpen={isScanModalOpen}
            onClose={() => setIsScanModalOpen(false)}
            onAddMultiple={handleAddMultiple}
            userId={user.id}
          />

          <RecipeModal
            isOpen={isRecipeOpen}
            onClose={() => setIsRecipeOpen(false)}
            expiringItemNames={recipeSelectedIngredient}
          />

          <NotificationDrawer
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            notifications={notifications}
            onSelectProduct={(productId) => {
              setActiveTab('kitchen');
              setIsNotifOpen(false);
            }}
          />

          <UserProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
          />

          <ReplenishDrawer
            isOpen={isReplenishOpen}
            onClose={() => setIsReplenishOpen(false)}
            products={products}
            onReAddProduct={handleReAddProduct}
            onPermanentlyDelete={(id) => {
              deleteProduct(id);
              reloadProducts();
            }}
          />
        </>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

    </div>
  );
}

export default App;
