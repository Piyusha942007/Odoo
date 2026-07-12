import React, { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/socialApi';
import { FolderPlus, List, RefreshCw, Edit2, Trash2, Check, X } from 'lucide-react';

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState({ name: '', type: 'CSR Activity', status: 'Active' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', type: 'CSR Activity', status: 'Active' });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error("Error loading categories:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;

    try {
      const res = await createCategory(newCat);
      if (res.success) {
        setNewCat({ name: '', type: 'CSR Activity', status: 'Active' });
        loadCategories();
      }
    } catch (err) {
      alert("Error creating category: " + err.message);
    }
  };

  const handleEditClick = (cat) => {
    setEditingId(cat._id);
    setEditForm({ name: cat.name, type: cat.type, status: cat.status });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateCategory(editingId, editForm);
      if (res.success) {
        setEditingId(null);
        loadCategories();
      }
    } catch (err) {
      alert("Error updating category: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await deleteCategory(id);
      if (res.success) {
        loadCategories();
      }
    } catch (err) {
      alert("Error deleting category: " + err.message);
    }
  };

  return (
    <div className="flex-grow bg-slate-950 text-slate-100 p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Categories Master CRUD
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage Category definitions for CSR Activities and Gamification Challenges.</p>
        </div>
        <button
          onClick={loadCategories}
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl self-start">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-emerald-450" />
            Add Category
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Category Name</label>
              <input
                type="text"
                required
                value={newCat.name}
                onChange={(e) => setNewCat(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Module Scope</label>
              <select
                value={newCat.type}
                onChange={(e) => setNewCat(prev => ({ ...prev, type: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="CSR Activity" className="bg-slate-900 text-slate-100">CSR Activity</option>
                <option value="Challenge" className="bg-slate-900 text-slate-100">Challenge</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Initial Status</label>
              <select
                value={newCat.status}
                onChange={(e) => setNewCat(prev => ({ ...prev, status: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="Active" className="bg-slate-900 text-slate-100">Active</option>
                <option value="Inactive" className="bg-slate-900 text-slate-100">Inactive</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 transition text-slate-950 rounded-lg text-sm font-bold shadow-lg"
            >
              Initialize Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <List className="w-5 h-5 text-emerald-455" />
            Category Master Records
          </h3>

          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading master records...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No category records found. Use the creation form on the left.</div>
          ) : (
            <div className="space-y-2">
              {categories.map((c) => (
                <div key={c._id} className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-850">
                  {editingId === c._id ? (
                    <form onSubmit={handleUpdate} className="flex flex-wrap items-center gap-3 w-full">
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 text-xs focus:outline-none"
                      />
                      <select
                        value={editForm.type}
                        onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                        className="bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 text-xs"
                      >
                        <option value="CSR Activity">CSR Activity</option>
                        <option value="Challenge">Challenge</option>
                      </select>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                        className="bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 text-xs"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <div className="flex gap-1 ml-auto">
                        <button type="submit" className="p-1 bg-emerald-600 text-slate-950 rounded hover:bg-emerald-500">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className="p-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div>
                        <p className="font-bold text-sm text-slate-200">{c.name}</p>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{c.type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {c.status}
                        </span>
                        <button onClick={() => handleEditClick(c)} className="p-1 text-slate-400 hover:text-emerald-400 transition">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(c._id)} className="p-1 text-slate-400 hover:text-red-400 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoriesPage;
