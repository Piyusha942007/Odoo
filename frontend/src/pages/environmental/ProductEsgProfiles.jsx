import React, { useState, useEffect, useRef } from 'react';
import { 
  getProductEsgProfiles, 
  createProductEsgProfile, 
  updateProductEsgProfile, 
  deleteProductEsgProfile,
  getEmissionFactors
} from '../../services/environmentalService';
import { Leaf, Plus, Trash2, Edit3, AlertCircle, X, Check, Tag, ChevronDown, Sparkles } from 'lucide-react';

function ProductEsgProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields for Create
  const [productName, setProductName] = useState('');
  const [defaultEmissionFactor, setDefaultEmissionFactor] = useState('');
  const [category, setCategory] = useState('Purchase');
  const [notes, setNotes] = useState('');

  // Dropdown states (Create)
  const [factorDropdownOpen, setFactorDropdownOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

  // Edit fields
  const [editingProfile, setEditingProfile] = useState(null);
  const [editProductName, setEditProductName] = useState('');
  const [editDefaultEmissionFactor, setEditDefaultEmissionFactor] = useState('');
  const [editCategory, setEditCategory] = useState('Purchase');
  const [editNotes, setEditNotes] = useState('');

  // Dropdown states (Edit)
  const [editFactorDropdownOpen, setEditFactorDropdownOpen] = useState(false);
  const [editCatDropdownOpen, setEditCatDropdownOpen] = useState(false);

  // Alerts
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [submitError, setSubmitError] = useState(null);

  // Refs for clicking outside
  const factorRef = useRef(null);
  const catRef = useRef(null);
  const editFactorRef = useRef(null);
  const editCatRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Click outside to close custom select dropdown panels
  useEffect(() => {
    function handleClickOutside(event) {
      if (factorRef.current && !factorRef.current.contains(event.target)) {
        setFactorDropdownOpen(false);
      }
      if (catRef.current && !catRef.current.contains(event.target)) {
        setCatDropdownOpen(false);
      }
      if (editFactorRef.current && !editFactorRef.current.contains(event.target)) {
        setEditFactorDropdownOpen(false);
      }
      if (editCatRef.current && !editCatRef.current.contains(event.target)) {
        setEditCatDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const pRes = await getProductEsgProfiles();
      if (pRes.success) setProfiles(pRes.data);

      const fRes = await getEmissionFactors();
      if (fRes.success) setFactors(fRes.data.filter(f => f.status === 'Active'));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data. Ensure database connection is active.');
      showToast('Database offline. Failed to fetch data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!productName || !defaultEmissionFactor) {
      setSubmitError('Product Name and Default Emission Factor are required.');
      return;
    }

    try {
      const res = await createProductEsgProfile({
        productName,
        defaultEmissionFactor,
        category,
        notes
      });

      if (res.success) {
        showToast('Product ESG Profile created successfully!', 'success');
        setProductName('');
        setDefaultEmissionFactor('');
        setCategory('Purchase');
        setNotes('');
        setShowAddForm(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to create Product ESG Profile';
      setSubmitError(errMsg);
      showToast(errMsg, 'error');
    }
  };

  const handleEditClick = (p) => {
    setEditingProfile(p);
    setEditProductName(p.productName);
    setEditDefaultEmissionFactor(p.defaultEmissionFactor?._id || p.defaultEmissionFactor || '');
    setEditCategory(p.category || 'Purchase');
    setEditNotes(p.notes || '');
    setSubmitError(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!editProductName || !editDefaultEmissionFactor) {
      setSubmitError('Product Name and Default Emission Factor are required.');
      return;
    }

    try {
      const res = await updateProductEsgProfile(editingProfile._id, {
        productName: editProductName,
        defaultEmissionFactor: editDefaultEmissionFactor,
        category: editCategory,
        notes: editNotes
      });

      if (res.success) {
        showToast('Product ESG Profile updated successfully!', 'success');
        setEditingProfile(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to update Profile';
      setSubmitError(errMsg);
      showToast(errMsg, 'error');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ show: false, id: null });
    try {
      const res = await deleteProductEsgProfile(id);
      if (res.success) {
        showToast('Profile deleted successfully', 'success');
        loadData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete profile.', 'error');
    }
  };

  const getSelectedFactorLabel = (id) => {
    const factor = factors.find(f => f._id === id);
    return factor ? `${factor.name} (${factor.co2eFactor} kg CO2e / ${factor.unit})` : 'Select Default Factor...';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in font-sans relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1 font-sans">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Tag className="w-6 h-6 text-emerald-400" />
            Product ESG Profiles
          </h2>
          <p className="text-slate-400 text-sm font-medium">Link catalog products to default environmental emission metrics</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingProfile(null);
            setSubmitError(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-955 font-bold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition duration-300"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Create Profile'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-200">Map Product Default Factor</h3>
          
          {submitError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Recycled PET Resin, Diesel Fuel"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                required
              />
            </div>

            {/* Custom Create Factor Select */}
            <div className="space-y-2" ref={factorRef}>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Default Emission Factor</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFactorDropdownOpen(!factorDropdownOpen)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 text-left flex justify-between items-center hover:border-slate-700 transition"
                >
                  <span className="truncate">{getSelectedFactorLabel(defaultEmissionFactor)}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${factorDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {factorDropdownOpen && (
                  <div className="absolute z-30 w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl max-h-60 overflow-y-auto shadow-2xl py-1 divide-y divide-slate-900 animate-fade-in">
                    {factors.map((f) => (
                      <button
                        key={f._id}
                        type="button"
                        onClick={() => {
                          setDefaultEmissionFactor(f._id);
                          setFactorDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition flex justify-between items-center"
                      >
                        <span className="truncate">{f.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono ml-2 shrink-0">{f.co2eFactor} kg / {f.unit}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Custom Create Category Select */}
            <div className="space-y-2" ref={catRef}>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ESG Category</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 text-left flex justify-between items-center hover:border-slate-700 transition"
                >
                  <span>{category}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${catDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {catDropdownOpen && (
                  <div className="absolute z-30 w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl py-1 divide-y divide-slate-900 animate-fade-in">
                    {['Purchase', 'Manufacturing', 'Expense', 'Fleet'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCategory(c);
                          setCatDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Default Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. standard conversion for purchase items"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg transition"
              >
                Create Profile Mapping
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-start gap-3 shadow-xl">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">API Access Error</h4>
            <p className="text-xs font-medium text-rose-400/90">{error}</p>
          </div>
        </div>
      )}

      {loading && profiles.length === 0 ? (
        <div className="text-center py-12 text-slate-400 font-semibold">
          Loading catalog mapping profiles...
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-xl space-y-4">
          <Tag className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No Product Mapping Configured</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium">
            Link products inside your operations directory to default conversion indicators for automatic emission calculations.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition"
          >
            Create First Mapping Profile
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Catalog Product</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Default Emission Factor</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">ESG Category</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Notes</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900">
                {profiles.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-850/30 transition">
                    <td className="p-4 text-slate-200 font-bold text-sm">
                      {p.productName}
                    </td>
                    <td className="p-4 text-slate-300 font-semibold text-sm">
                      {p.defaultEmissionFactor?.name || <span className="text-slate-500 italic">Deleted Factor</span>}
                      {p.defaultEmissionFactor && (
                        <div className="text-[10px] text-slate-500">
                          {p.defaultEmissionFactor.co2eFactor} kg CO2e / {p.defaultEmissionFactor.unit}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-300">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-xs font-medium">
                      {p.notes || '—'}
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-950 border border-transparent hover:border-emerald-950 rounded-xl transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(p._id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-950 border border-transparent hover:border-rose-950 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_20px_rgba(16,185,129,0.1)] max-w-lg w-full space-y-4 animate-[zoom-in_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Edit Product Mapping
              </h3>
              <button
                onClick={() => setEditingProfile(null)}
                className="p-1.5 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {submitError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submitError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  value={editProductName}
                  onChange={(e) => setEditProductName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>

              {/* Custom Edit Factor Select */}
              <div className="space-y-1" ref={editFactorRef}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Default Factor</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEditFactorDropdownOpen(!editFactorDropdownOpen)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 text-left flex justify-between items-center hover:border-slate-700 transition"
                  >
                    <span className="truncate">{getSelectedFactorLabel(editDefaultEmissionFactor)}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${editFactorDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {editFactorDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-950 border border-slate-850 rounded-xl max-h-40 overflow-y-auto shadow-2xl py-1 divide-y divide-slate-900 animate-fade-in">
                      {factors.map((f) => (
                        <button
                          key={f._id}
                          type="button"
                          onClick={() => {
                            setEditDefaultEmissionFactor(f._id);
                            setEditFactorDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition flex justify-between items-center"
                        >
                          <span className="truncate">{f.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono ml-2 shrink-0">{f.co2eFactor} kg / {f.unit}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Edit Category Select */}
              <div className="space-y-1" ref={editCatRef}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ESG Category</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEditCatDropdownOpen(!editCatDropdownOpen)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 text-left flex justify-between items-center hover:border-slate-700 transition"
                  >
                    <span>{editCategory}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${editCatDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {editCatDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-950 border border-slate-855 rounded-xl shadow-2xl py-1 divide-y divide-slate-900 animate-fade-in">
                      {['Purchase', 'Manufacturing', 'Expense', 'Fleet'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setEditCategory(c);
                            setEditCatDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="sm:col-span-2 pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_20px_rgba(244,63,94,0.1)] max-w-md w-full space-y-4 text-center animate-[zoom-in_0.2s_ease-out]">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-100">Delete Product Profile</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Are you sure you want to delete this product default ESG profile mapping?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-slate-955 font-bold rounded-xl transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl bg-slate-950 border-slate-850 text-sm font-semibold max-w-sm animate-fade-in">
          {toast.type === 'success' ? (
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <span className={toast.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}>
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
}

export default ProductEsgProfiles;
