import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  Package,
  IndianRupee,
  ShoppingBag,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Equipment',
  'Irrigation',
  'Tools',
  'Bio-Fertilizers',
  'Other',
];

const UNITS = ['kg', 'liter', 'bag (50kg)', 'packet', 'piece', 'set', 'meter'];

const SellerPortal = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    stockQuantity: '',
    unit: 'kg',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, ordersRes] = await Promise.all([
        api.get('/products/seller/my-listings'),
        api.get('/orders/seller/sales').catch(() => ({ data: { data: [] } })),
      ]);
      setProducts(prodRes.data.data || []);
      setSalesOrders(ordersRes.data.data || []);
    } catch (err) {
      console.error('Error loading seller data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity || 0), 0);
  const totalSalesRevenue = salesOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      price: '',
      stockQuantity: '',
      unit: 'kg',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      price: product.price,
      stockQuantity: product.stockQuantity,
      unit: product.unit || 'kg',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      category: 'Crops/Produce',
      description: 'Farmer produce listed for sale',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      price: Number(formData.price),
      originalPrice: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (err) {
      alert('Error deleting product listing');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            {t('nav.seller_portal')}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Manage your agricultural supply listings, inventory stocks, and buyer sales
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" />
          {t('marketplace.add_product')}
        </button>
      </div>

      {/* Seller KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Active Catalog Listings
          </p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-950 dark:text-white font-heading">
            {products.length} Products
          </p>
          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-1">Available for farmer orders</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 dark:border-amber-900/40 dark:bg-amber-950/30">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Total Inventory Valuation
          </p>
          <p className="mt-2 text-2xl font-extrabold text-amber-950 dark:text-white font-heading">
            ₹{totalInventoryValue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-1">Sum of current active stocks</p>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-5 dark:border-sky-900/40 dark:bg-sky-950/30">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
            Sales Fulfilled
          </p>
          <p className="mt-2 text-2xl font-extrabold text-sky-950 dark:text-white font-heading">
            {salesOrders.length} Orders
          </p>
          <p className="text-[11px] text-sky-700/80 dark:text-sky-400 mt-1">
            ₹{totalSalesRevenue.toLocaleString('en-IN')} Total Volume
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading seller listings..." />
      ) : products.length === 0 ? (
        <EmptyState
          title="No Products Listed Yet"
          message="Publish your first agricultural seed, fertilizer, or equipment product to start selling to farmers."
          icon={Store}
          actionText={t('marketplace.add_product')}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-4">
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="h-20 w-20 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                  />
                  <div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {p.category}
                    </span>
                    <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white font-heading line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                      ₹{p.price.toLocaleString('en-IN')} <span className="text-[10px] text-slate-400 font-normal">/ {p.unit}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                  <span className="text-slate-500">Stock Inventory:</span>
                  <span className={`font-bold ${p.stockQuantity > 0 ? 'text-slate-800 dark:text-slate-200' : 'text-red-500'}`}>
                    {p.stockQuantity} {p.unit}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Listing Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product Listing' : 'Add New Agricultural Product'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Crop Name *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Wheat, Tomato, Onion"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Quantity *
              </label>
              <input
                type="number"
                required
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                placeholder="100"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Price per unit (₹) *
            </label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g. 50"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/40">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Expected Income
            </p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-950 dark:text-white font-heading">
              ₹{((Number(formData.price) || 0) * (Number(formData.stockQuantity) || 0)).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
            >
              {editingProduct ? 'Save Changes' : 'Publish Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SellerPortal;
