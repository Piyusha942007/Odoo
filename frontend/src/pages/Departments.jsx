import React, { useState, useEffect } from 'react';
import { getDepartments, createDepartment, deleteDepartment } from '../services/departmentService';
import { Building2, Plus, Trash2, AlertCircle, X, Check } from 'lucide-react';

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [head, setHead] = useState('');
  const [parentDepartment, setParentDepartment] = useState('');
  const [employeeCount, setEmployeeCount] = useState(0);
  const [status, setStatus] = useState('Active');
  const [submitError, setSubmitError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

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
    setSuccessMsg(null);

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
        setSuccessMsg(`Department "${res.data.name}" created successfully!`);
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
      setSubmitError(err.response?.data?.message || 'Failed to create department');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? Any sub-departments will have their parent link removed.')) {
      return;
    }
    try {
      const res = await deleteDepartment(id);
      if (res.success) {
        fetchDepartments();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete department.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1 font-sans">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            Departments Foundation
          </h2>
          <p className="text-slate-400 text-sm font-medium">Create and manage your organizational units and ESG hierarchy</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setSubmitError(null);
            setSuccessMsg(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition duration-300"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add Department'}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

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

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parent Department</label>
              <select
                value={parentDepartment}
                onChange={(e) => setParentDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="">None (Top Level)</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
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
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="radio"
                    checked={status === 'Active'}
                    onChange={() => setStatus('Active')}
                    className="text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-slate-950 border-slate-800"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="radio"
                    checked={status === 'Inactive'}
                    onChange={() => setStatus('Inactive')}
                    className="text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-slate-950 border-slate-800"
                  />
                  Inactive
                </label>
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg transition"
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
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition"
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
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(dept._id)}
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
    </div>
  );
}

export default Departments;
