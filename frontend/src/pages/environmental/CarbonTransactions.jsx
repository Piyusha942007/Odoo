import React, { useState, useEffect, useRef } from 'react';
import { 
  getCarbonTransactions, 
  createCarbonTransaction, 
  updateCarbonTransaction, 
  deleteCarbonTransaction,
  getEmissionFactors
} from '../../services/environmentalService';
import { getDepartments } from '../../services/departmentService';
import { ClipboardList, Plus, Trash2, Edit3, AlertCircle, X, Check, Filter, Cpu, Calendar, ChevronDown, Sparkles } from 'lucide-react';

function CarbonTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [factors, setFactors] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCalcType, setSelectedCalcType] = useState('');

  // Form Fields for Create
  const [department, setDepartment] = useState('');
  const [sourceDocument, setSourceDocument] = useState('');
  const [emissionFactor, setEmissionFactor] = useState('');
  const [quantity, setQuantity] = useState('');
  const [calculationType, setCalculationType] = useState('Manual');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Dropdown open states (Create Form)
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [factorDropdownOpen, setFactorDropdownOpen] = useState(false);

  // State for Edit/Update
  const [editingTx, setEditingTx] = useState(null);
  const [editDepartment, setEditDepartment] = useState('');
  const [editSourceDocument, setEditSourceDocument] = useState('');
  const [editEmissionFactor, setEditEmissionFactor] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editCalculationType, setEditCalculationType] = useState('Manual');
  const [editDate, setEditDate] = useState('');

  // Dropdown open states (Edit Form)
  const [editDeptDropdownOpen, setEditDeptDropdownOpen] = useState(false);
  const [editFactorDropdownOpen, setEditFactorDropdownOpen] = useState(false);

  // Custom alerts/modal states
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [submitError, setSubmitError] = useState(null);

  // Refs for clicking outside to close dropdowns
  const deptRef = useRef(null);
  const factorRef = useRef(null);
  const editDeptRef = useRef(null);
  const editFactorRef = useRef(null);

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

  // Click outside to close custom select panels
  useEffect(() => {
    function handleClickOutside(event) {
      if (deptRef.current && !deptRef.current.contains(event.target)) {
        setDeptDropdownOpen(false);
      }
      if (factorRef.current && !factorRef.current.contains(event.target)) {
        setFactorDropdownOpen(false);
      }
      if (editDeptRef.current && !editDeptRef.current.contains(event.target)) {
        setEditDeptDropdownOpen(false);
      }
      if (editFactorRef.current && !editFactorRef.current.contains(event.target)) {
        setEditFactorDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load baseline master data
  const loadMasterData = async () => {
    try {
      const deptsRes = await getDepartments();
      if (deptsRes.success) setDepartments(deptsRes.data);
      
      const factorsRes = await getEmissionFactors();
      if (factorsRes.success) {
        setFactors(factorsRes.data.filter(f => f.status === 'Active'));
      }
    } catch (err) {
      console.error('Failed to load master configuration data:', err);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCarbonTransactions(selectedDepartment, selectedCalcType);
      if (res.success) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch transactions. Ensure database connection is active.');
      showToast('Database offline. Failed to fetch transactions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [selectedDepartment, selectedCalcType]);

  const getPreviewCO2e = (factorId, qty) => {
    if (!factorId || !qty || isNaN(qty) || Number(qty) <= 0) return 0;
    const selectedFactor = factors.find(f => f._id === factorId);
    if (!selectedFactor) return 0;
    return Number(qty) * selectedFactor.co2eFactor;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!department || !sourceDocument || !emissionFactor || !quantity || Number(quantity) <= 0) {
      setSubmitError('All fields are required. Quantity must be greater than 0.');
      return;
    }

    try {
      const res = await createCarbonTransaction({
        department,
        sourceDocument,
        emissionFactor,
        quantity: Number(quantity),
        calculationType,
        date
      });

      if (res.success) {
        showToast('Carbon transaction logged successfully!', 'success');
        setDepartment('');
        setSourceDocument('');
        setEmissionFactor('');
        setQuantity('');
        setCalculationType('Manual');
        setDate(new Date().toISOString().split('T')[0]);
        setShowAddForm(false);
        fetchTransactions();
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to log carbon transaction';
      setSubmitError(errMsg);
      showToast(errMsg, 'error');
    }
  };

  const handleEditClick = (tx) => {
    setEditingTx(tx);
    setEditDepartment(tx.department?._id || tx.department || '');
    setEditSourceDocument(tx.sourceDocument);
    setEditEmissionFactor(tx.emissionFactor?._id || tx.emissionFactor || '');
    setEditQuantity(tx.quantity);
    setEditCalculationType(tx.calculationType || 'Manual');
    setEditDate(tx.date ? tx.date.split('T')[0] : '');
    setSubmitError(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!editDepartment || !editSourceDocument || !editEmissionFactor || !editQuantity || Number(editQuantity) <= 0) {
      setSubmitError('All fields are required. Quantity must be greater than 0.');
      return;
    }

    try {
      const res = await updateCarbonTransaction(editingTx._id, {
        department: editDepartment,
        sourceDocument: editSourceDocument,
        emissionFactor: editEmissionFactor,
        quantity: Number(editQuantity),
        calculationType: editCalculationType,
        date: editDate
      });

      if (res.success) {
        showToast('Carbon transaction updated successfully!', 'success');
        setEditingTx(null);
        fetchTransactions();
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to update carbon transaction';
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
      const res = await deleteCarbonTransaction(id);
      if (res.success) {
        showToast('Transaction deleted successfully', 'success');
        fetchTransactions();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete transaction.', 'error');
    }
  };

  const getSelectedDeptLabel = (id) => {
    const dept = departments.find(d => d._id === id);
    return dept ? `${dept.name} (${dept.code})` : 'Select Department...';
  };

  const getSelectedFactorLabel = (id) => {
    const factor = factors.find(f => f._id === id);
    return factor ? `${factor.name} (${factor.co2eFactor} kg CO2e / ${factor.unit})` : 'Select Emission Factor...';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in font-sans relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1 font-sans">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-cyan-400" />
            Carbon Transactions Ledger
          </h2>
          <p className="text-slate-400 text-sm font-medium">Record activity quantities and automatically calculate equivalent carbon weights</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingTx(null);
            setSubmitError(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-955 font-bold rounded-xl shadow-lg hover:shadow-cyan-500/20 transition duration-300"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Log Transaction'}
        </button>
      </div>

      {/* Add Form (Collapsible) */}
      {showAddForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-200">Log Activity Emissions</h3>
          
          {submitError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Custom Department Select Dropdown */}
            <div className="space-y-2" ref={deptRef}>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department Owner</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 text-left flex justify-between items-center hover:border-slate-700 transition"
                >
                  <span className="truncate">{getSelectedDeptLabel(department)}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${deptDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {deptDropdownOpen && (
                  <div className="absolute z-30 w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl max-h-60 overflow-y-auto shadow-2xl py-1 divide-y divide-slate-900">
                    {departments.map((d) => (
                      <button
                        key={d._id}
                        type="button"
                        onClick={() => {
                          setDepartment(d._id);
                          setDeptDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition"
                      >
                        {d.name} <span className="text-slate-500 text-xs font-mono ml-1">({d.code})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source Document (PO, Fleet #, Expense Ref)</label>
              <input
                type="text"
                value={sourceDocument}
                onChange={(e) => setSourceDocument(e.target.value)}
                placeholder="e.g. PO-991024, EXP-FUEL-23"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                required
              />
            </div>

            {/* Custom Emission Factor Select Dropdown */}
            <div className="space-y-2" ref={factorRef}>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion Factor Source</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFactorDropdownOpen(!factorDropdownOpen)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 text-left flex justify-between items-center hover:border-slate-700 transition"
                >
                  <span className="truncate">{getSelectedFactorLabel(emissionFactor)}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${factorDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {factorDropdownOpen && (
                  <div className="absolute z-30 w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl max-h-60 overflow-y-auto shadow-2xl py-1 divide-y divide-slate-900 animate-fade-in">
                    {factors.map((f) => (
                      <button
                        key={f._id}
                        type="button"
                        onClick={() => {
                          setEmissionFactor(f._id);
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

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity Quantity (Raw Units)</label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 500 (Liters, kWh)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                required
              />
              {emissionFactor && quantity && Number(quantity) > 0 && (
                <div className="text-xs text-cyan-400 font-bold flex items-center gap-1 mt-1">
                  <Cpu className="w-3.5 h-3.5 animate-spin" />
                  Preview: {(getPreviewCO2e(emissionFactor, quantity)).toFixed(4)} kg CO₂e
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Log Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calculation Mode</label>
              <div className="flex gap-4 pt-1.5">
                <label className="flex items-center gap-2 text-sm text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="radio"
                    checked={calculationType === 'Manual'}
                    onChange={() => setCalculationType('Manual')}
                    className="text-cyan-500 focus:ring-0 bg-slate-950 border-slate-800"
                  />
                  Manual Entry
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="radio"
                    checked={calculationType === 'Auto'}
                    onChange={() => setCalculationType('Auto')}
                    className="text-cyan-500 focus:ring-0 bg-slate-950 border-slate-800"
                  />
                  Auto ERP Recalculation
                </label>
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-955 font-bold rounded-xl shadow-lg transition"
              >
                Log Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Content List */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
          <Filter className="w-4 h-4 text-cyan-400" />
          Filter by Department:
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDepartment('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              selectedDepartment === '' 
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Departments
          </button>
          {departments.map((d) => (
            <button
              key={d._id}
              onClick={() => setSelectedDepartment(d._id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                selectedDepartment === d._id 
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {d.name}
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

      {loading && transactions.length === 0 ? (
        <div className="text-center py-12 text-slate-400 font-semibold">
          Loading transactions ledger...
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-xl space-y-4">
          <ClipboardList className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No Transactions Mapped</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium">
            No carbon accounting records found. Start logging activities to calculate equivalent greenhouse gas emissions.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-955 font-bold rounded-xl transition"
          >
            Log First Transaction
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date / Doc</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Emission Source</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Activity Data</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Calculated CO₂e</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Type</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-850/30 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {tx.date ? tx.date.split('T')[0] : 'N/A'}
                      </div>
                      <code className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded font-mono">
                        {tx.sourceDocument}
                      </code>
                    </td>
                    <td className="p-4 text-slate-300 font-semibold text-sm">
                      {tx.department?.name || <span className="text-slate-500 italic">Deleted Dept</span>}
                    </td>
                    <td className="p-4 text-slate-300 font-semibold text-sm">
                      {tx.emissionFactor?.name || <span className="text-slate-500 italic">Deleted Factor</span>}
                      <div className="text-[10px] text-slate-500">
                        {tx.emissionFactor?.co2eFactor || 0} kg / {tx.emissionFactor?.unit || 'unit'}
                      </div>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-slate-300 text-sm">
                      {tx.quantity} {tx.emissionFactor?.unit || ''}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-emerald-400 text-sm">
                      {(tx.co2eAmount).toFixed(3)} kg
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.calculationType === 'Auto' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}>
                        {tx.calculationType}
                      </span>
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEditClick(tx)}
                        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-950 border border-transparent hover:border-cyan-950 rounded-xl transition duration-200"
                        title="Edit Transaction"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(tx._id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-950 border border-transparent hover:border-rose-950 rounded-xl transition duration-200"
                        title="Delete Transaction"
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

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_20px_rgba(6,182,212,0.1)] max-w-lg w-full space-y-4 animate-[zoom-in_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Edit Carbon Transaction
              </h3>
              <button
                onClick={() => setEditingTx(null)}
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
              
              {/* Custom Edit Department Select */}
              <div className="space-y-1" ref={editDeptRef}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department Owner</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEditDeptDropdownOpen(!editDeptDropdownOpen)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 text-left flex justify-between items-center hover:border-slate-700 transition"
                  >
                    <span className="truncate">{getSelectedDeptLabel(editDepartment)}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${editDeptDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {editDeptDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-950 border border-slate-850 rounded-xl max-h-40 overflow-y-auto shadow-2xl py-1 divide-y divide-slate-900 animate-fade-in">
                      {departments.map((d) => (
                        <button
                          key={d._id}
                          type="button"
                          onClick={() => {
                            setEditDepartment(d._id);
                            setEditDeptDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition"
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source Document</label>
                <input
                  type="text"
                  value={editSourceDocument}
                  onChange={(e) => setEditSourceDocument(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              {/* Custom Edit Factor Select */}
              <div className="space-y-1" ref={editFactorRef}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion Factor</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEditFactorDropdownOpen(!editFactorDropdownOpen)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 text-left flex justify-between items-center hover:border-slate-700 transition"
                  >
                    <span className="truncate">{getSelectedFactorLabel(editEmissionFactor)}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${editFactorDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {editFactorDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-950 border border-slate-850 rounded-xl max-h-40 overflow-y-auto shadow-2xl py-1 divide-y divide-slate-900 animate-fade-in">
                      {factors.map((f) => (
                        <button
                          key={f._id}
                          type="button"
                          onClick={() => {
                            setEditEmissionFactor(f._id);
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

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activity Quantity</label>
                <input
                  type="number"
                  step="any"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  required
                />
                {editEmissionFactor && editQuantity && Number(editQuantity) > 0 && (
                  <div className="text-xs text-cyan-400 font-bold flex items-center gap-1 mt-1">
                    <Cpu className="w-3.5 h-3.5 animate-spin" />
                    Preview: {(getPreviewCO2e(editEmissionFactor, editQuantity)).toFixed(4)} kg CO₂e
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Log Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calculation Type</label>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      checked={editCalculationType === 'Manual'}
                      onChange={() => setEditCalculationType('Manual')}
                      className="text-cyan-500 focus:ring-0 bg-slate-950 border-slate-850"
                    />
                    Manual
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      checked={editCalculationType === 'Auto'}
                      onChange={() => setEditCalculationType('Auto')}
                      className="text-cyan-500 focus:ring-0 bg-slate-950 border-slate-855"
                    />
                    Auto
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2 pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-955 font-bold rounded-xl shadow-lg transition"
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
              <h3 className="text-lg font-bold text-slate-100">Delete Carbon Record</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Are you sure you want to delete this carbon accounting transaction? This action cannot be undone.
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
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl bg-slate-950 border-slate-850 text-sm font-semibold max-w-sm animate-fade-in">
          {toast.type === 'success' ? (
            <Check className="w-5 h-5 text-cyan-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <span className={toast.type === 'success' ? 'text-cyan-400' : 'text-rose-400'}>
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
}

export default CarbonTransactions;
