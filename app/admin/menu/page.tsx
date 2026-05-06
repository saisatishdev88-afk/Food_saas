'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMenu, createCategory, createMenuItem, updateMenuItem, deleteMenuItem, Category, MenuItem } from '@/api/menu';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/api/client';
import { useToast } from '@/components/ui/Toast';

export default function MenuPage() {
    const queryClient = useQueryClient();
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [itemToStockToggle, setItemToStockToggle] = useState<MenuItem | null>(null);
    const { success, error: toastError } = useToast();

    // Form states
    const [newCategoryName, setNewCategoryName] = useState('');
    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [itemDesc, setItemDesc] = useState('');
    const [itemIsVeg, setItemIsVeg] = useState(true);
    const [itemImageUrl, setItemImageUrl] = useState('');
    const [itemCategoryId, setItemCategoryId] = useState<number | null>(null);
    const [itemIsWhatsappVisible, setItemIsWhatsappVisible] = useState(false);
    const [itemIngredients, setItemIngredients] = useState<{inventory_item_id: number, quantity: number}[]>([]);

    const { data: dashboardData } = useQuery({
        queryKey: ['tenant-dashboard'],
        queryFn: async () => {
          const res = await api.get('/tenant/dashboard');
          return res.data;
        }
    });
    
    const isInventoryEnabled = dashboardData?.modules?.inventory === true;
    const isWhatsAppEnabled = dashboardData?.modules?.whatsapp_ordering === true;

    const { data: inventoryItems } = useQuery({
        queryKey: ['admin-inventory-items'],
        queryFn: async () => {
            const res = await api.get('/tenant/inventory');
            return res.data;
        },
        enabled: isInventoryEnabled
    });

    const { data: menu, isLoading } = useQuery({
        queryKey: ['admin-menu'],
        queryFn: () => fetchMenu(true)
    });

    const categoryMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-menu'] });
            setIsCategoryModalOpen(false);
            setNewCategoryName('');
            success('Category created successfully.');
        },
        onError: () => toastError('Failed to create category.')
    });

    const itemMutation = useMutation({
        mutationFn: (data: Partial<MenuItem>) => 
            itemToEdit ? updateMenuItem(itemToEdit.id, data) : createMenuItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-menu'] });
            closeItemModal();
            success(itemToEdit ? 'Dish updated successfully.' : 'Dish deployed successfully.');
        },
        onError: () => toastError('Failed to save dish.')
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-menu'] });
            success('Dish deleted successfully.');
        },
        onError: () => toastError('Failed to delete dish.')
    });

    const stockMutation = useMutation({
        mutationFn: ({ id, is_available }: { id: number, is_available: boolean }) => 
            updateMenuItem(id, { is_available }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-menu'] });
            setItemToStockToggle(null);
            success('Stock status updated.');
        },
        onError: () => toastError('Failed to update stock status.')
    });

    const openAddItem = () => {
        setItemToEdit(null);
        setItemName('');
        setItemPrice('');
        setItemDesc('');
        setItemIsVeg(true);
        setItemImageUrl('');
        setItemCategoryId(activeCategory || (categories?.[0]?.id ?? null));
        setItemIsWhatsappVisible(false);
        setItemIngredients([]);
        setIsItemModalOpen(true);
    };

    const openEditItem = (item: MenuItem) => {
        setItemToEdit(item);
        setItemName(item.name);
        setItemPrice(item.price.toString());
        setItemDesc(item.description || '');
        setItemIsVeg(item.is_veg);
        setItemImageUrl(item.image_url || '');
        setItemCategoryId(item.category_id);
        setItemIsWhatsappVisible(item.is_whatsapp_visible || false);
        setItemIngredients(item.ingredients?.map((i: any) => ({
            inventory_item_id: i.id,
            quantity: Number(i.pivot.quantity)
        })) || []);
        setIsItemModalOpen(true);
    };

    const closeItemModal = () => {
        setIsItemModalOpen(false);
        setItemToEdit(null);
    };

    if (isLoading) return <div className="p-10 text-center font-bold uppercase tracking-widest text-[10px] opacity-20">Synchronizing Kitchen Catalog...</div>;

    const categories = menu || [];
    const currentCategory = categories.find(c => c.id === activeCategory) || categories[0];

    return (
        <div className="p-6 lg:p-10 max-w-[1500px] mx-auto w-full space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/10 pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight uppercase text-on-surface leading-none">Catalog <span className="text-primary">Editor</span></h1>
                    <p className="text-on-surface-variant font-medium text-[11px] mt-1.5 opacity-60">Manage dishes, dietary types, and stock availability.</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setIsCategoryModalOpen(true)} variant="secondary" className="px-5 h-12 rounded-xl font-bold uppercase text-[9px] tracking-widest border-outline-variant/10 shadow-sm">
                        <span className="material-symbols-outlined mr-2 text-[16px]">grid_view</span>
                        New Category
                    </Button>
                    <Button onClick={openAddItem} className="px-6 h-12 rounded-xl bg-primary text-on-primary font-bold uppercase text-[9px] tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                        <span className="material-symbols-outlined mr-2 text-[16px]">add_circle</span>
                        Deploy New Dish
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Category Sidebar */}
                <aside className="lg:w-56 space-y-2 shrink-0">
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4 opacity-40 px-4">Categories</h3>
                    <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex-1 lg:w-full flex items-center justify-between px-5 py-3 rounded-xl transition-all whitespace-nowrap ${
                                    (activeCategory === cat.id || (!activeCategory && currentCategory?.id === cat.id))
                                    ? 'bg-[#1a1c1d] text-white shadow-md'
                                    : 'bg-white border border-outline-variant/10 text-on-surface hover:bg-slate-50'
                                }`}
                            >
                                <span className="font-bold text-xs uppercase tracking-tight">{cat.name}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ml-3 ${
                                    (activeCategory === cat.id || (!activeCategory && currentCategory?.id === cat.id))
                                    ? 'bg-white/10 text-white'
                                    : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {cat.menu_items?.length || 0}
                                </span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Items Grid */}
                <main className="flex-1">
                    {currentCategory ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {currentCategory.menu_items?.map(item => (
                                <Card key={item.id} className="relative group border border-outline-variant/10 rounded-3xl p-5 h-full flex flex-col shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex justify-between items-start gap-4 mb-5">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                <span className="text-[8px] font-bold uppercase tracking-wider text-on-surface-variant opacity-50">{item.is_veg ? 'VEG' : 'NON-VEG'}</span>
                                            </div>
                                            <h4 className="font-bold text-base text-on-surface leading-tight tracking-tight">{item.name}</h4>
                                            <p className="text-[11px] text-on-surface-variant line-clamp-2 opacity-70 leading-relaxed font-medium">{item.description}</p>
                                        </div>
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-outline-variant/5">
                                            <img 
                                                src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto pt-5 border-t border-outline-variant/5 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg text-primary tabular-nums tracking-tight">₹{Number(item.price).toFixed(2)}</span>
                                            <span className="text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Base Rate</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => setItemToStockToggle(item)}
                                                className={`h-8 px-3 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all border ${
                                                    item.is_available 
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-red-50 text-red-600 border-red-100'
                                                }`}
                                            >
                                                {item.is_available ? 'IN STOCK' : 'OUT STOCK'}
                                            </button>
                                            <button 
                                                onClick={() => openEditItem(item)}
                                                className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-[#1a1c1d] hover:text-white transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button 
                                                onClick={() => { if(confirm('Delete this item?')) deleteMutation.mutate(item.id) }}
                                                className="w-8 h-8 rounded-lg bg-red-50 text-red-300 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {(!currentCategory.menu_items || currentCategory.menu_items.length === 0) && (
                                <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-outline-variant/10">
                                    <span className="material-symbols-outlined text-3xl text-on-surface-variant opacity-20 mb-3 block">nutrition</span>
                                    <p className="text-on-surface-variant font-bold uppercase tracking-widest text-[9px] opacity-40">No items detected in this section</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center italic text-on-surface-variant opacity-30 font-bold uppercase tracking-widest text-xs">
                            Select a category to begin...
                        </div>
                    )}
                </main>
            </div>

            {/* Modals - All updated with smaller padding and fonts */}
            {isItemModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-10 w-full max-w-xl shadow-2xl scale-in-center border border-outline-variant/5 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <h2 className="text-xl font-bold uppercase tracking-tight mb-8">
                            {itemToEdit ? 'Modify Dish' : 'Initialize Dish'}
                        </h2>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Label</label>
                                    <input 
                                        className="w-full bg-slate-50 px-5 py-3.5 rounded-xl outline-none border border-outline-variant/10 focus:border-primary transition-all font-bold text-xs uppercase"
                                        placeholder="SIGNATURE BURGER"
                                        value={itemName}
                                        onChange={e => setItemName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Price (INR)</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-50 px-5 py-3.5 rounded-xl outline-none border border-outline-variant/10 focus:border-primary transition-all font-bold text-xs tabular-nums"
                                        placeholder="550.00"
                                        value={itemPrice}
                                        onChange={e => setItemPrice(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Visual Asset (URL)</label>
                                    <input 
                                        className="w-full bg-slate-50 px-5 py-3.5 rounded-xl outline-none border border-outline-variant/10 focus:border-primary transition-all font-bold text-[10px]"
                                        placeholder="https://images..."
                                        value={itemImageUrl}
                                        onChange={e => setItemImageUrl(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Dish Category</label>
                                    <select 
                                        className="w-full bg-slate-50 px-5 py-3.5 rounded-xl outline-none border border-outline-variant/10 focus:border-primary transition-all font-bold text-xs uppercase text-on-surface"
                                        value={itemCategoryId || ''}
                                        onChange={e => setItemCategoryId(Number(e.target.value))}
                                    >
                                        <option value="" disabled>Choose Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Type (Dietary)</label>
                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                        <button 
                                            onClick={() => setItemIsVeg(true)}
                                            className={`flex-1 h-9 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${itemIsVeg ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
                                        >Veg</button>
                                        <button 
                                            onClick={() => setItemIsVeg(false)}
                                            className={`flex-1 h-9 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${!itemIsVeg ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
                                        >Non-Veg</button>
                                    </div>
                                </div>
                            </div>

                            {isWhatsAppEnabled && (
                                <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                                            <span className="material-symbols-outlined text-[16px]">chat</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-tight text-green-900">WhatsApp Visibility</p>
                                            <p className="text-[8px] font-bold text-green-700/60 uppercase tracking-widest">Show this item in WhatsApp Menu</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setItemIsWhatsappVisible(!itemIsWhatsappVisible)}
                                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${itemIsWhatsappVisible ? 'bg-green-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${itemIsWhatsappVisible ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Description</label>
                                <textarea 
                                    className="w-full bg-slate-50 px-5 py-4 rounded-xl outline-none border border-outline-variant/10 focus:border-primary transition-all font-medium text-[11px] h-24 leading-relaxed"
                                    placeholder="Brief description of the dish..."
                                    value={itemDesc}
                                    onChange={e => setItemDesc(e.target.value)}
                                />
                            </div>

                            {isInventoryEnabled && (
                                <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Ingredients (Recipe Mapping)</label>
                                        <button 
                                            type="button"
                                            onClick={() => setItemIngredients([...itemIngredients, { inventory_item_id: 0, quantity: 1 }])}
                                            className="text-[9px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                                        >
                                            + Add Ingredient
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                        {itemIngredients.length === 0 ? (
                                            <p className="text-[10px] text-center italic text-on-surface-variant opacity-40 py-2">No ingredients mapped.</p>
                                        ) : itemIngredients.map((ing, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <select
                                                    value={ing.inventory_item_id}
                                                    onChange={e => {
                                                        const newIngs = [...itemIngredients];
                                                        newIngs[idx].inventory_item_id = Number(e.target.value);
                                                        setItemIngredients(newIngs);
                                                    }}
                                                    className="flex-1 bg-slate-50 px-3 py-2 rounded-lg outline-none border border-outline-variant/10 font-bold text-[10px] uppercase text-on-surface"
                                                >
                                                    <option value={0}>Select Ingredient</option>
                                                    {inventoryItems?.map((inv: any) => (
                                                        <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</option>
                                                    ))}
                                                </select>
                                                <input 
                                                    type="number"
                                                    step="0.01"
                                                    value={ing.quantity}
                                                    onChange={e => {
                                                        const newIngs = [...itemIngredients];
                                                        newIngs[idx].quantity = Number(e.target.value);
                                                        setItemIngredients(newIngs);
                                                    }}
                                                    className="w-20 bg-slate-50 px-3 py-2 rounded-lg outline-none border border-outline-variant/10 font-bold text-[10px] tabular-nums"
                                                    placeholder="Qty"
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const newIngs = itemIngredients.filter((_, i) => i !== idx);
                                                        setItemIngredients(newIngs);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 mt-10">
                            <Button variant="secondary" className="flex-1 h-12 rounded-xl font-bold uppercase text-[9px] tracking-widest border-outline-variant/10" onClick={closeItemModal}>Discard</Button>
                            <Button 
                                className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-bold uppercase text-[9px] tracking-widest shadow-lg" 
                                onClick={() => itemMutation.mutate({ 
                                    name: itemName, 
                                    price: Number(itemPrice), 
                                    description: itemDesc,
                                    category_id: itemCategoryId,
                                    is_veg: itemIsVeg,
                                    image_url: itemImageUrl || null,
                                    is_whatsapp_visible: itemIsWhatsappVisible,
                                    ...(isInventoryEnabled ? { ingredients: itemIngredients.filter(i => i.inventory_item_id !== 0) } : {})
                                } as any)}
                            >Save Dish</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                        <h2 className="text-xl font-bold uppercase tracking-tight mb-6">New Category</h2>
                        <div className="space-y-2 mb-8">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 opacity-50">Title</label>
                            <input 
                                className="w-full bg-slate-50 px-6 py-4 rounded-xl outline-none border border-outline-variant/10 focus:border-primary transition-all font-bold text-sm uppercase"
                                placeholder="e.g. STARTERS"
                                value={newCategoryName}
                                onChange={e => setNewCategoryName(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" className="flex-1 h-12 rounded-xl font-bold uppercase text-[9px] tracking-widest" onClick={() => setIsCategoryModalOpen(false)}>Abort</Button>
                            <Button className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-bold uppercase text-[9px] tracking-widest shadow-lg" onClick={() => categoryMutation.mutate({ name: newCategoryName })}>Create</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock Toggle Confirm */}
            {itemToStockToggle && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <Card className="max-w-xs w-full p-8 rounded-3xl text-center space-y-4 shadow-2xl">
                        <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${itemToStockToggle.is_available ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                            <span className="material-symbols-outlined text-2xl font-bold">{itemToStockToggle.is_available ? 'inventory_2' : 'check_circle'}</span>
                        </div>
                        <h3 className="text-lg font-bold uppercase tracking-tight">Toggle Status?</h3>
                        <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">Mark <span className="font-bold text-on-surface">"{itemToStockToggle.name}"</span> as {itemToStockToggle.is_available ? 'unavailable' : 'available'}?</p>
                        <div className="flex gap-3 pt-2">
                            <Button variant="secondary" className="flex-1 h-11 rounded-xl font-bold uppercase text-[9px] tracking-widest" onClick={() => setItemToStockToggle(null)}>No</Button>
                            <Button className="flex-1 h-11 rounded-xl bg-primary text-on-primary font-bold uppercase text-[9px] tracking-widest shadow-lg" onClick={() => stockMutation.mutate({ id: itemToStockToggle.id, is_available: !itemToStockToggle.is_available })}>Yes</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
