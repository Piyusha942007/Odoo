import React, { useState, useEffect, useRef } from 'react';
import { getDepartments, createDepartment, deleteDepartment, updateDepartment } from '../services/departmentService';
import { Building2, Plus, Trash2, AlertCircle, X, Check, Edit3, ChevronDown, Sparkles } from 'lucide-react';

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Dropdown open states
  const [parentDropdownOpen, setParentDropdownOpen] = useState(false);
  const [editParentDropdownOpen, setEditParentDropdownOpen] = useState(false);

  // Refs for clicking outside
  const parentRef = useRef(null);
  const editParentRef = useRef(null);

  // Form Fields for Create
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [head, setHead] = useState('');
  const [parentDepartment, setParentDepartment] = useState('');
  const [employeeCount, setEmployeeCount] = useState(0);
  const [status, setStatus] = useState('Active');
  
  // State for Edit/Update
  const [editingDept, setEditingDept] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editHead, setEditHead] = useState('');
  const [editParentDepartment, setEditParentDepartment] = useState('');
  const [editEmployeeCount, setEditEmployeeCount] = useState(0);
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (parentRef.current && !parentRef.current.contains(event.target)) {
        setParentDropdownOpen(false);
      }
      if (editParentRef.current && !editParentRef.current.contains(event.target)) {
        setEditParentDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDepartments();
      if (res.success) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch departments. Ensure database connection is active.');
      showToast('Database offline. Failed to fetch departments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name || !code) {
      setSubmitError('Name and Code are required');
      return;
    }

    try {
      const res = await createDepartment({
        name,
        code,
        head,
        parentDepartment: parentDepartment || null,
        employeeCount: Number(employeeCount),
        status
      });

      if (res.success) {
        showToast(`Department "${res.data.name}" created successfully!`, 'success');
        // Reset form
        setName('');
        setCode('');
        setHead('');
        setParentDepartment('');
        setEmployeeCount(0);
        setStatus('Active');
        setShowAddForm(false);
        fetchDepartments();
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to create department';
      setSubmitError(errMsg);
      showToast(errMsg, 'error');
    }
  };

  const handleEditClick = (dept) => {
    setEditingDept(dept);
    setEditName(dept.name);
    setEditCode(dept.code);
    setEditHead(dept.head || '');
    setEditParentDepartment(dept.parentDepartment?._id || dept.parentDepartment || '');
    setEditEmployeeCount(dept.employeeCount || 0);
    setEditStatus(dept.status || 'Active');
    setSubmitError(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!editName || !editCode) {
      setSubmitError('Name and Code are required');
      return;
    }

    try {
      const res = await updateDepartment(editingDept._id, {
        name: editName,
        code: editCode,
        head: editHead,
        parentDepartment: editParentDepartment || null,
        employeeCount: Number(editEmployeeCount),
        status: editStatus
      });

      if (res.success) {
        showToast(`Department "${res.data.name}" updated successfully!`, 'success');
        setEditingDept(null);
        fetchDepartments();
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to update department';
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
      const res = await deleteDepartment(id);
      if (res.success) {
        showToast('Department deleted successfully', 'success');
        fetchDepartments();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete department. Database connection offline.', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in font-sans relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1 font-sans">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            Departments Foundation
          </h2>
          <p className="text-slate-400 text-sm font-medium">Create, update, and manage your organizational units and ESG hierarchy</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingDept(null);
            setSubmitError(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-955 font-bold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition duration-300"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add Department'}
        </button>
      </div>

      {/* Add Form (Collapsible) */}
      {showAddForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-200">New Department Details</h3>
          
          {submitError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Purchasing, Supply Chain"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. PURCH, SUPPLY"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department Head</label>
              <input
                type="text"
                value={head}
                onChange={(e) => setHead(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-2" ref={parentRef}>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parent Department</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setParentDropdownOpen(!parentDropdownOpen)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 text-left flex justify-between items-center hover:border-slate-700 transition"
                >
                  <span className="truncate">
                    {parentDepartment ? (departments.find(d => d._id === parentDepartment)?.name || 'Select Department...') : 'None (Top Level)'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${parentDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {parentDropdownOpen && (
                  <div className="absolute z-30 w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl max-h-60 overflow-y-auto shadow-2xl py-1 divide-y divide-slate-900 animate-fade-in">
                    <button
                      type="button"
                      onClick={() => {
                        setParentDepartment('');
                        setParentDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-400 hover:bg-slate-900 hover:text-white transition font-medium"
                    >
                      None (Top Level)
                    </button>
                    {departments.map((dept) => (
                      <button
                        key={dept._id}
                        type="button"
                        onClick={() => {
                          setParentDepartment(dept._id);
                          setParentDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition"
                      >
                        {dept.name} <span className="text-slate-500 text-xs font-mono ml-1">({dept.code})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employee Count</label>
              <input
                type="number"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                min="0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('Active')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border transition ${
                    status === 'Active'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Inactive')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border transition ${
                    status === 'Inactive'
                      ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-955 font-bold rounded-xl shadow-lg transition"
              >
                Create Department
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content Grid */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-start gap-3 shadow-xl">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">API Access Error</h4>
            <p className="text-xs font-medium text-rose-400/90">{error}</p>
          </div>
        </div>
      )}

      {loading && departments.length === 0 ? (
        <div className="text-center py-12 text-slate-400 font-semibold">
          Loading departments...
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-xl space-y-4">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No departments configured yet</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium">
            Start modeling your ESG hierarchy by creating your organization's first department.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-955 font-bold rounded-xl transition"
          >
            Create First Department
          </button>
        </div>
      ) : (
        /* Table Listing */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Code / Name</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Dept Head</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Parent Department</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Employees</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900">
                {departments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-slate-850/30 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{dept.name}</div>
                      <code className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                        {dept.code}
                      </code>
                    </td>
                    <td className="p-4 text-slate-300 font-medium text-sm">
                      {dept.head || <span className="text-slate-500 italic">Unassigned</span>}
                    </td>
                    <td className="p-4 text-slate-300 font-medium text-sm">
                      {dept.parentDepartment ? (
                        <div className="flex flex-col">
                          <span className="text-slate-300">{dept.parentDepartment.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({dept.parentDepartment.code})</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                    <td className="p-4 text-center font-semibold text-slate-200 text-sm">
                      {dept.employeeCount}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        dept.status === 'Active' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {dept.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEditClick(dept)}
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-950 border border-transparent hover:border-emerald-950 rounded-xl transition duration-200"
                        title="Edit Department"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(dept._id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-950 border border-transparent hover:border-rose-950 rounded-xl transition duration-200"
                        title="Delete Department"
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

      {/* Edit Department Modal */}
      {editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_20px_rgba(16,185,129,0.1)] max-w-lg w-full space-y-4 animate-[zoom-in_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Edit Department
              </h3>
              <button
                onClick={() => setEditingDept(null)}
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department Code</label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department Head</label>
                <input
                  type="text"
                  value={editHead}
                  onChange={(e) => setEditHead(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-855 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Custom Edit Parent Department Select */}
              <div className="space-y-1" ref={editParentRef}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Parent Department</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEditParentDropdownOpen(!editParentDropdownOpen)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 text-left flex justify-between items-center hover:border-slate-700 transition"
                  >
                    <span className="truncate">
                      {editParentDepartment ? (departments.find(d => d._id === editParentDepartment)?.name || 'Select Department...') : 'None (Top Level)'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${editParentDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {editParentDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-950 border border-slate-850 rounded-xl shadow-2xl py-1 divide-y divide-slate-900 animate-fade-in">
                      <button
                        type="button"
                        onClick={() => {
                          setEditParentDepartment('');
                          setEditParentDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-900 hover:text-white transition font-medium"
                      >
                        None (Top Level)
                      </button>
                      {departments
                        .filter((d) => d._id !== editingDept._id) // Prevent self-parenting
                        .map((dept) => (
                          <button
                            key={dept._id}
                            type="button"
                            onClick={() => {
                              setEditParentDepartment(dept._id);
                              setEditParentDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition"
                          >
                            {dept.name} <span className="text-slate-500 text-xs font-mono ml-1">({dept.code})</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee Count</label>
                <input
                  type="number"
                  value={editEmployeeCount}
                  onChange={(e) => setEditEmployeeCount(e.target.value)}
                  min="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditStatus('Active')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      editStatus === 'Active'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus('Inactive')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      editStatus === 'Inactive'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                        : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
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
              <h3 className="text-lg font-bold text-slate-100">Delete Department</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Are you sure you want to delete this department? Any sub-departments will have their parent link removed. This action cannot be undone.
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

export default Departments;
