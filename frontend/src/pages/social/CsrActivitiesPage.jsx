import React, { useEffect, useState } from 'react';
import { getCsrActivities, createCsrActivity, updateCsrActivity, deleteCsrActivity, getCategories, getDepartments } from '../../services/socialApi';
import { Calendar, Plus, Edit2, Trash2, Check, X, RefreshCw } from 'lucide-react';

function CsrActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [newAct, setNewAct] = useState({ title: '', category: '', department: '', description: '', date: '', points: 50, status: 'Active' });
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', category: '', department: '', description: '', date: '', points: 50, status: 'Active' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [actRes, catRes, deptRes] = await Promise.all([
        getCsrActivities(),
        getCategories(),
        getDepartments()
      ]);

      if (actRes.success) setActivities(actRes.data);
      if (catRes.success) {
        const filteredCats = catRes.data.filter(c => c.type === 'CSR Activity');
        setCategories(filteredCats);
        if (filteredCats.length > 0) setNewAct(prev => ({ ...prev, category: filteredCats[0]._id }));
      }
      if (deptRes.success) {
        setDepartments(deptRes.data);
        if (deptRes.data.length > 0) setNewAct(prev => ({ ...prev, department: deptRes.data[0]._id }));
      }
    } catch (err) {
      console.error("Error loading CSR data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newAct.title || !newAct.category || !newAct.department || !newAct.date) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await createCsrActivity(newAct);
      if (res.success) {
        setNewAct({ title: '', category: categories[0]?._id || '', department: departments[0]?._id || '', description: '', date: '', points: 50, status: 'Active' });
        setShowCreate(false);
        loadData();
      }
    } catch (err) {
      alert("Error creating CSR activity: " + err.message);
    }
  };

  const handleEditClick = (act) => {
    setEditingId(act._id);
    setEditForm({
      title: act.title,
      category: act.category?._id || '',
      department: act.department?._id || '',
      description: act.description || '',
      date: act.date ? new Date(act.date).toISOString().split('T')[0] : '',
      points: act.points || 50,
      status: act.status || 'Active'
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateCsrActivity(editingId, editForm);
      if (res.success) {
        setEditingId(null);
        loadData();
      }
    } catch (err) {
      alert("Error updating CSR Activity: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    try {
      const res = await deleteCsrActivity(id);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert("Error deleting CSR Activity: " + err.message);
    }
  };

  return (
    <div className="flex-grow bg-slate-950 text-slate-100 p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            CSR Activities CRUD
          </h2>
          <p className="text-slate-400 text-sm mt-1">Add, update, and manage company CSR Activity templates and records.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 transition text-slate-955 font-bold rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            Create CSR Activity
          </button>
          <button onClick={loadData} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-semibold">Activity Title *</label>
            <input
              type="text"
              required
              value={newAct.title}
              onChange={(e) => setNewAct(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-semibold">Category *</label>
            <select
              required
              value={newAct.category}
              onChange={(e) => setNewAct(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id} className="bg-slate-900 text-slate-100">{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-semibold">Department *</label>
            <select
              required
              value={newAct.department}
              onChange={(e) => setNewAct(prev => ({ ...prev, department: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id} className="bg-slate-900 text-slate-100">{d.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Date *</label>
              <input
                type="date"
                required
                value={newAct.date}
                onChange={(e) => setNewAct(prev => ({ ...prev, date: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Points</label>
              <input
                type="number"
                value={newAct.points}
                onChange={(e) => setNewAct(prev => ({ ...prev, points: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm"
              />
            </div>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs text-slate-400 mb-1 font-semibold">Description</label>
            <textarea
              value={newAct.description}
              onChange={(e) => setNewAct(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="col-span-1 md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-xs bg-emerald-600 text-slate-950 rounded-lg font-bold">Save Activity</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading activities...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No CSR activities registered. Click "Create CSR Activity" to start.</div>
      ) : (
        <div className="space-y-4">
          {activities.map((act) => (
            <div key={act._id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative">
              {editingId === act._id ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                    />
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      className="bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-sm focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id} className="bg-slate-900 text-slate-100">{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-slate-950 font-bold rounded text-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded text-xs flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] bg-slate-850 px-2 py-0.5 rounded border border-slate-700 text-emerald-400 font-semibold uppercase">
                        {act.category?.name}
                      </span>
                      <h3 className="text-lg font-bold mt-2 text-slate-100">{act.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Date: {new Date(act.date).toLocaleDateString()} &middot; Department: {act.department?.name || 'All'}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg">
                      +{act.points} pts
                    </span>
                  </div>
                  <p className="text-slate-350 text-sm mb-4 leading-relaxed">{act.description}</p>
                  <div className="flex gap-2 justify-end border-t border-slate-850 pt-4 mt-2">
                    <button onClick={() => handleEditClick(act)} className="p-1.5 text-slate-400 hover:text-emerald-400 transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(act._id)} className="p-1.5 text-slate-400 hover:text-red-400 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CsrActivitiesPage;
