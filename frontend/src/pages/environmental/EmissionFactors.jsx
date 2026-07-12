import React, { useState, useEffect } from 'react';
import { 
  getEmissionFactors, 
  createEmissionFactor, 
  updateEmissionFactor, 
  deleteEmissionFactor 
} from '../../services/environmentalService';
import { Leaf, Plus, Trash2, Edit3, AlertCircle, X, Check, Filter } from 'lucide-react';

function EmissionFactors() {
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSourceType, setSelectedSourceType] = useState('');

  // Form Fields for Create
  const [name, setName] = useState('');
  const [sourceType, setSourceType] = useState('Purchase');
  const [unit, setUnit] = useState('');
  const [co2eFactor, setCo2eFactor] = useState(0);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Active');

  // State for Edit/Update
  const [editingFactor, setEditingFactor] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSourceType, setEditSourceType] = useState('Purchase');
  const [editUnit, setEditUnit] = useState('');
  const [editCo2eFactor, setEditCo2eFactor] = useState(0);
  const [editEffectiveDate, setEditEffectiveDate] = useState('');
  const [editStatus, setEditStatus] = useState('Active');

  // Custom alert/modal states
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [submitError, setSubmitError] = useState(null);

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

  const fetchFactors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEmissionFactors(selectedSourceType);
      if (res.success) {
        setFactors(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch emission factors. Ensure database connection is active.');
      showToast('Database offline. Failed to fetch emission factors.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactors();
  }, [selectedSourceType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name || !sourceType || !unit || co2eFactor === '') {
      setSubmitError('Name, Source Type, Unit, and CO2e Factor are required');
      return;
    }

    try {
      const res = await createEmissionFactor({
        name,
        sourceType,
        unit,
        co2eFactor: Number(co2eFactor),
        effectiveDate,
        status
      });

      if (res.success) {
        showToast(`Emission Factor "${res.data.name}" created successfully!`, 'success');
        // Reset form
        setName('');
        setSourceType('Purchase');
        setUnit('');
        setCo2eFactor(0);
        setEffectiveDate(new Date().toISOString().split('T')[0]);
        setStatus('Active');
        setShowAddForm(false);
        fetchFactors();
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to create emission factor';
      setSubmitError(errMsg);
      showToast(errMsg, 'error');
    }
  };

  const handleEditClick = (factor) => {
    setEditingFactor(factor);
    setEditName(factor.name);
    setEditSourceType(factor.sourceType);
    setEditUnit(factor.unit);
    setEditCo2eFactor(factor.co2eFactor);
    setEditEffectiveDate(factor.effectiveDate ? factor.effectiveDate.split('T')[0] : '');
    setEditStatus(factor.status || 'Active');
    setSubmitError(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!editName || !editSourceType || !editUnit || editCo2eFactor === '') {
      setSubmitError('Name, Source Type, Unit, and CO2e Factor are required');
      return;
    }

    try {
      const res = await updateEmissionFactor(editingFactor._id, {
        name: editName,
        sourceType: editSourceType,
        unit: editUnit,
        co2eFactor: Number(editCo2eFactor),
        effectiveDate: editEffectiveDate,
        status: editStatus
      });

      if (res.success) {
        showToast(`Emission Factor "${res.data.name}" updated successfully!`, 'success');
        setEditingFactor(null);
        fetchFactors();
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to update emission factor';
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
      const res = await deleteEmissionFactor(id);
      if (res.success) {
        showToast('Emission factor deleted successfully', 'success');
        fetchFactors();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete emission factor. Database offline.', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in font-sans relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1 font-sans">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-400" />
            Emission Factors Configuration
          </h2>
          <p className="text-slate-400 text-sm font-medium">Manage conversion metrics for Scope 1, 2, and 3 CO2e calculations</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingFactor(null);
            setSubmitError(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-955 font-bold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition duration-300"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add Emission Factor'}
        </button>
      </div>

      {/* Add Form (Collapsible) */}
      {showAddForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-200">New Emission Factor</h3>
          
          {submitError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item Name / Source Description</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Diesel Fuel, Electricity Grid, Steel Purchasing"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source Category Type</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="Purchase">Purchase item</option>
                <option value="Manufacturing">Manufacturing input</option>
                <option value="Expense">Expense category</option>
                <option value="Fleet">Fleet/fuel type</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unit of Measurement</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. L, kWh, kg, km"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">CO2e Factor (kg CO2e per Unit)</label>
              <input
                type="number"
                step="any"
                value={co2eFactor}
                onChange={(e) => setCo2eFactor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Effective Date</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
              <div className="flex gap-4 pt-1.5">
                <label className="flex items-center gap-2 text-sm text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="radio"
                    checked={status === 'Active'}
                    onChange={() => setStatus('Active')}
                    className="text-emerald-500 focus:ring-0 bg-slate-950 border-slate-800"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="radio"
                    checked={status === 'Inactive'}
                    onChange={() => setStatus('Inactive')}
                    className="text-emerald-500 focus:ring-0 bg-slate-950 border-slate-800"
                  />
                  Inactive
                </label>
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-955 font-bold rounded-xl shadow-lg transition"
              >
                Create Emission Factor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Content List */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
          <Filter className="w-4 h-4 text-emerald-400" />
          Filter by Source:
        </div>
        <div className="flex flex-wrap gap-2">
          {['', 'Purchase', 'Manufacturing', 'Expense', 'Fleet'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedSourceType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                selectedSourceType === type 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {type || 'All'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-start gap-3 shadow-xl">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">API Access Error</h4>
            <p className="text-xs font-medium text-rose-400/90">{error}</p>
          </div>
        </div>
      )}

      {loading && factors.length === 0 ? (
        <div className="text-center py-12 text-slate-400 font-semibold">
          Loading emission factors...
        </div>
      ) : factors.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-xl space-y-4">
          <Leaf className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No emission factors configured</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium">
            Define conversion coefficients to enable automatic Scope 1, 2, and 3 calculations.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-955 font-bold rounded-xl transition"
          >
            Add First Factor
          </button>
        </div>
      ) : (
        /* Table Listing */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name / Source</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Source Type</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">CO2e Factor</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Unit</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Effective Date</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900">
                {factors.map((factor) => (
                  <tr key={factor._id} className="hover:bg-slate-850/30 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{factor.name}</div>
                    </td>
                    <td className="p-4 text-slate-300 font-semibold text-sm">
                      <span className="bg-slate-950 px-2.5 py-0.5 rounded border border-slate-850 text-slate-300">
                        {factor.sourceType}
                      </span>
                    </td>
                    <td className="p-4 text-emerald-400 font-mono font-bold text-sm">
                      {factor.co2eFactor}
                    </td>
                    <td className="p-4 text-slate-300 font-semibold text-sm">
                      {factor.unit}
                    </td>
                    <td className="p-4 text-slate-400 font-medium text-xs">
                      {factor.effectiveDate ? factor.effectiveDate.split('T')[0] : 'N/A'}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        factor.status === 'Active' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {factor.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEditClick(factor)}
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-950 border border-transparent hover:border-emerald-950 rounded-xl transition duration-200"
                        title="Edit Factor"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(factor._id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-950 border border-transparent hover:border-rose-950 rounded-xl transition duration-200"
                        title="Delete Factor"
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

      {/* Edit Emission Factor Modal */}
      {editingFactor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-lg w-full space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100">Edit Emission Factor</h3>
              <button
                onClick={() => setEditingFactor(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item Name / Description</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source Category Type</label>
                <select
                  value={editSourceType}
                  onChange={(e) => setEditSourceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Purchase">Purchase item</option>
                  <option value="Manufacturing">Manufacturing input</option>
                  <option value="Expense">Expense category</option>
                  <option value="Fleet">Fleet/fuel type</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit of Measurement</label>
                <input
                  type="text"
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CO2e Factor (kg CO2e / Unit)</label>
                <input
                  type="number"
                  step="any"
                  value={editCo2eFactor}
                  onChange={(e) => setEditCo2eFactor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Effective Date</label>
                <input
                  type="date"
                  value={editEffectiveDate}
                  onChange={(e) => setEditEffectiveDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                <div className="flex gap-4 pt-1.5">
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      checked={editStatus === 'Active'}
                      onChange={() => setEditStatus('Active')}
                      className="text-emerald-500 focus:ring-0 bg-slate-950 border-slate-800"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      checked={editStatus === 'Inactive'}
                      onChange={() => setEditStatus('Inactive')}
                      className="text-emerald-500 focus:ring-0 bg-slate-950 border-slate-800"
                    />
                    Inactive
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2 pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingFactor(null)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-955 font-bold rounded-xl shadow-lg transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-md w-full space-y-4 text-center animate-fade-in">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-100">Delete Emission Factor</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Are you sure you want to delete this emission factor? This action cannot be undone.
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
                className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold rounded-xl transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl bg-slate-900 border-slate-850 text-sm font-semibold max-w-sm animate-fade-in">
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

export default EmissionFactors;
