import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tags, AlertCircle, Package, ArrowRight, Eye, Search, Layers } from 'lucide-react';
import Modal from '../components/Modal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Categories = () => {
  const { isManager } = useAuth();
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category Products View Modal (Requirement: Click category to see products inside)
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [selectedCategoryView, setSelectedCategoryView] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');

  const fetchCategoriesAndProducts = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products?limit=200'),
      ]);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (prodRes.data.success) setAllProducts(prodRes.data.data);
    } catch (err) {
      console.error('Failed to load categories and products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndProducts();
  }, []);

  const handleOpenModal = (cat = null, e = null) => {
    if (e) e.stopPropagation();
    setError('');
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setDescription(cat.description || '');
    } else {
      setEditingCategory(null);
      setName('');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const handleViewCategoryProducts = (cat) => {
    setSelectedCategoryView(cat);
    setProductSearch('');
    // Filter products that belong to this category
    const prods = allProducts.filter((p) => {
      const catId = p.categoryId?._id || p.categoryId;
      return catId === cat._id;
    });
    setCategoryProducts(prods);
    setIsProductsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, { name, description });
      } else {
        await api.post('/categories', { name, description });
      }
      setIsModalOpen(false);
      fetchCategoriesAndProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategoriesAndProducts();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const filteredCategoryProducts = categoryProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Category Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Click any category card to view and manage all items inside that category.</p>
        </div>

        {isManager && (
          <button
            onClick={(e) => handleOpenModal(null, e)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-md shadow-red-500/20 hover:scale-105 transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* Grid of Category Cards */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 shadow-sm">
          <Tags className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>No categories found. Click "Add Category" to create your first category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const count = allProducts.filter(
              (p) => (p.categoryId?._id || p.categoryId) === cat._id
            ).length;

            return (
              <div
                key={cat._id}
                onClick={() => handleViewCategoryProducts(cat)}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-red-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-600 opacity-0 group-hover:opacity-100 transition"></div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-red-50 text-red-600 border border-red-100">
                      <Tags className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs">
                      {count} {count === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-red-600 transition mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-red-600 group-hover:translate-x-1 transition">
                    <span>Click to view products</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>

                  {isManager && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleOpenModal(cat, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(cat._id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category Products View Modal (Shows products inside selected category) */}
      <Modal
        isOpen={isProductsModalOpen}
        onClose={() => setIsProductsModalOpen(false)}
        title={`Category Products — ${selectedCategoryView?.name || ''}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-600">
              Showing <span className="font-bold text-slate-900">{categoryProducts.length}</span> products in category{' '}
              <span className="font-bold text-red-600">{selectedCategoryView?.name}</span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search inside category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {filteredCategoryProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              No products found in this category.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-500 uppercase">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Selling Price</th>
                    <th className="px-4 py-3">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredCategoryProducts.map((p) => {
                    let badge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    let statusLabel = 'IN STOCK';
                    if (p.stock === 0) {
                      badge = 'bg-rose-50 text-rose-700 border-rose-200';
                      statusLabel = 'OUT OF STOCK';
                    } else if (p.stock <= p.reorderLevel) {
                      badge = 'bg-amber-50 text-amber-700 border-amber-200';
                      statusLabel = 'LOW STOCK';
                    }

                    return (
                      <tr key={p._id} className="hover:bg-red-50/20 text-slate-800">
                        <td className="px-4 py-3 font-bold text-slate-900">{p.name}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{p.sku}</td>
                        <td className="px-4 py-3 text-slate-600">{p.supplierId?.company || 'N/A'}</td>
                        <td className="px-4 py-3 font-bold text-red-600">₹{p.sellingPrice.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded border text-[9px] font-extrabold ${badge}`}>
                            {p.stock} ({statusLabel})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        maxWidth="max-w-md"
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Laptops & Computers"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Category overview..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-500/20 hover:scale-105 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
