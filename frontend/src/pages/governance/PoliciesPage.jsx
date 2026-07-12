import React, { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import axios from 'axios';
import { ShieldCheck, Plus, CheckCircle, Search, FileText, Loader2, Edit, Trash2 } from 'lucide-react';

function PoliciesPage() {
  const { alert: customAlert, confirm: customConfirm } = useAlert();
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    description: '',
    category: 'Governance',
    content: '',
    status: 'Draft',
    version: '1.0'
  });

  const [editingPolicy, setEditingPolicy] = useState(null);
  const [employeeName, setEmployeeName] = useState('');
  const [policyAcks, setPolicyAcks] = useState([]);
  const [allAcks, setAllAcks] = useState([]);
  const [isSubmittingAck, setIsSubmittingAck] = useState(false);

  const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/governance/policies`;

  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL);
      if (response.data && response.data.success) {
        if (response.data.data.length > 0) {
          setPolicies(response.data.data);
        } else {
          // Seed default policies to Mongo if database is empty
          const defaults = [
            {
              title: 'Code of Business Conduct & Ethics',
              description: 'Defines the rules and expectations for ethical operations, whistleblowing, and corruption prevention.',
              category: 'Governance',
              content: 'All employees must adhere to the highest standard of professional ethics. Corruption, bribery, and unsafe labor practices are strictly prohibited...',
              status: 'Active',
              version: '1.2'
            },
            {
              title: 'Zero Waste & Recycling Policy',
              description: 'Mandates office waste minimization and corporate recycling rules.',
              category: 'Environmental',
              content: 'This policy governs our corporate goal of recycling 100% of e-waste and paper materials. Single-use plastics are prohibited in corporate office pantries...',
              status: 'Active',
              version: '2.0'
            },
            {
              title: 'Diversity, Equity, and Inclusion Policy',
              description: 'Sets diversity targets and fair employment expectations.',
              category: 'Social',
              content: 'EcoSphere is committed to maintaining a diverse workspace. We target at least 40% female leadership representation and operate an active equal opportunity framework...',
              status: 'Draft',
              version: '1.0'
            }
          ];
          
          for (const item of defaults) {
            await axios.post(API_URL, item);
          }
          
          const refetched = await axios.get(API_URL);
          if (refetched.data && refetched.data.success) {
            setPolicies(refetched.data.data);
          }
        }
      }
    } catch (err) {
      console.error('Error loading policies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAcknowledgements = async () => {
    try {
      const response = await axios.get(`${API_URL}/acknowledgements`);
      if (response.data && response.data.success) {
        setAllAcks(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching acknowledgements:', err);
    }
  };

  useEffect(() => {
    fetchPolicies();
    fetchAcknowledgements();
  }, []);

  useEffect(() => {
    if (selectedPolicy) {
      const filtered = allAcks.filter(ack => {
        const policyId = typeof ack.policy === 'object' ? ack.policy._id : ack.policy;
        return policyId === selectedPolicy._id;
      });
      setPolicyAcks(filtered);
    }
  }, [selectedPolicy, allAcks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_URL, newPolicy);
      if (response.data && response.data.success) {
        setPolicies([response.data.data, ...policies]);
        setSelectedPolicy(response.data.data);
        setNewPolicy({
          title: '',
          description: '',
          category: 'Governance',
          content: '',
          status: 'Draft',
          version: '1.0'
        });
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error('Error creating policy:', err);
      customAlert('Error', 'Failed to save policy to MongoDB database.', 'error');
    }
  };

  const handleEditClick = (policy) => {
    setEditingPolicy({ ...policy });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_URL}/${editingPolicy._id}`, editingPolicy);
      if (response.data && response.data.success) {
        setPolicies(policies.map(p => p._id === editingPolicy._id ? response.data.data : p));
        setSelectedPolicy(response.data.data);
        setShowEditModal(false);
      }
    } catch (err) {
      console.error('Error updating policy:', err);
      customAlert('Error', 'Failed to update policy in MongoDB database.', 'error');
    }
  };

  const handleDelete = async (policyId) => {
    const isConfirmed = await customConfirm('Delete Policy', 'Are you sure you want to delete this policy? This will delete all associated signatures.', 'error');
    if (!isConfirmed) {
      return;
    }
    try {
      const response = await axios.delete(`${API_URL}/${policyId}`);
      if (response.data && response.data.success) {
        setPolicies(policies.filter(p => p._id !== policyId));
        if (selectedPolicy?._id === policyId) {
          setSelectedPolicy(null);
        }
        fetchAcknowledgements();
      }
    } catch (err) {
      console.error('Error deleting policy:', err);
      customAlert('Error', 'Failed to delete policy from database.', 'error');
    }
  };

  const handleAcknowledge = async (e) => {
    e.preventDefault();
    if (!employeeName.trim()) return;
    try {
      setIsSubmittingAck(true);
      const response = await axios.post(`${API_URL}/${selectedPolicy._id}/acknowledge`, { employee: employeeName });
      if (response.data && response.data.success) {
        setEmployeeName('');
        await fetchAcknowledgements();
      }
    } catch (err) {
      console.error('Error signing policy:', err);
      customAlert('Error', 'Failed to submit signature.', 'error');
    } finally {
      setIsSubmittingAck(false);
    }
  };

  const filteredPolicies = policies.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">ESG Policy Manager</h1>
          <p className="text-slate-400 mt-2 font-medium">Create, publish, and track employee acknowledgements of ESG policies.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-bold transition-all duration-200 shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          Create Policy
        </button>
      </div>

      {/* Control bar */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-3.5 text-slate-500" />
          <input 
            type="text"
            placeholder="Search policies by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-900 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-800 transition-colors"
          />
        </div>
      </div>

      {/* Policies grid & preview side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Policy cards list */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-950/60 border border-slate-900 rounded-2xl text-slate-400 space-y-3">
              <Loader2 className="animate-spin text-emerald-400" size={24} />
              <p className="text-xs font-medium">Fetching ESG policies from MongoDB...</p>
            </div>
          ) : (
            <>
              {filteredPolicies.map((policy) => (
                <div 
                  key={policy._id}
                  onClick={() => setSelectedPolicy(policy)}
                  className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    selectedPolicy?._id === policy._id 
                      ? 'bg-slate-900/60 border-emerald-500/30' 
                      : 'bg-slate-950/60 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                        policy.category === 'Environmental' 
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50' 
                          : policy.category === 'Social'
                          ? 'bg-blue-950/40 text-blue-400 border border-blue-900/50'
                          : 'bg-purple-950/40 text-purple-400 border border-purple-900/50'
                      }`}>
                        {policy.category}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-2">{policy.title}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2 mt-1.5">{policy.description}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        policy.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {policy.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">Ver. {policy.version}</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredPolicies.length === 0 && (
                <div className="p-12 text-center border border-dashed border-slate-900 rounded-2xl text-slate-550">
                  No policies found matching your search.
                </div>
              )}
            </>
          )}
        </div>

        {/* Selected Policy detail panel */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 h-fit space-y-6">
          {selectedPolicy ? (
            <>
              <div className="flex justify-between items-start border-b border-slate-900 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">{selectedPolicy.title}</h2>
                  <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                    Effective: {selectedPolicy.effectiveDate ? new Date(selectedPolicy.effectiveDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[11px] font-semibold bg-slate-905 border border-slate-900 text-slate-300 px-2 py-0.5 rounded-md">
                    V{selectedPolicy.version}
                  </span>
                  <div className="flex gap-1.5 mt-1">
                    <button 
                      onClick={() => handleEditClick(selectedPolicy)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-850 transition-colors"
                      title="Edit Policy"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedPolicy._id)}
                      className="p-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/20 text-red-500 border border-red-900/30 transition-colors"
                      title="Delete Policy"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Summary</h4>
                  <p className="text-slate-355 text-xs mt-1.5 leading-relaxed">{selectedPolicy.description}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Content</h4>
                  <div className="bg-slate-900/40 border border-slate-900/50 rounded-xl p-4 mt-2 text-slate-300 text-xs leading-relaxed max-h-48 overflow-y-auto">
                    {selectedPolicy.content}
                  </div>
                </div>

                {/* Sign-off Form */}
                <div className="border-t border-slate-900 pt-4 mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-emerald-400" size={16} />
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Policy Sign-off</h4>
                  </div>
                  <form onSubmit={handleAcknowledge} className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Enter name to sign..."
                      required
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700"
                    />
                    <button 
                      type="submit" 
                      disabled={isSubmittingAck}
                      className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:from-indigo-850 disabled:to-violet-950 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/10"
                    >
                      {isSubmittingAck ? 'Signing...' : 'Sign'}
                    </button>
                  </form>
                </div>

                {/* Active Signatures list */}
                <div className="border-t border-slate-900 pt-4 mt-4 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Signatures ({policyAcks.length})</h4>
                  <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                    {policyAcks.map((ack) => (
                      <div key={ack._id} className="flex justify-between items-center bg-slate-900/20 border border-slate-900/40 px-3 py-2 rounded-xl text-[10px]">
                        <span className="font-semibold text-slate-300">{ack.employee}</span>
                        <span className="text-slate-500">{new Date(ack.acknowledgedAt).toLocaleString()}</span>
                      </div>
                    ))}
                    {policyAcks.length === 0 && (
                      <p className="text-slate-500 text-xs italic">No signatures recorded yet.</p>
                    )}
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="py-20 text-center space-y-3">
              <FileText size={40} className="mx-auto text-slate-700" />
              <p className="text-slate-400 text-sm font-semibold">Select a Policy</p>
              <p className="text-slate-500 text-xs px-6">Click on any ESG policy to view its contents, configuration, and sign-off status.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create policy modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-white">Create New ESG Policy</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Title</label>
                  <input 
                    type="text"
                    required
                    value={newPolicy.title}
                    onChange={e => setNewPolicy({...newPolicy, title: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                    placeholder="e.g. Supplier Sustainability Code"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Category</label>
                  <select 
                    value={newPolicy.category}
                    onChange={e => setNewPolicy({...newPolicy, category: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                  >
                    <option value="Environmental">Environmental</option>
                    <option value="Social">Social</option>
                    <option value="Governance">Governance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Description</label>
                <input 
                  type="text"
                  required
                  value={newPolicy.description}
                  onChange={e => setNewPolicy({...newPolicy, description: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                  placeholder="A brief summary of the policy mandate."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Policy Content</label>
                <textarea 
                  required
                  rows={4}
                  value={newPolicy.content}
                  onChange={e => setNewPolicy({...newPolicy, content: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                  placeholder="Enter full policy document details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Version</label>
                  <input 
                    type="text"
                    required
                    value={newPolicy.version}
                    onChange={e => setNewPolicy({...newPolicy, version: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                    placeholder="1.0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Initial Status</label>
                  <select 
                    value={newPolicy.status}
                    onChange={e => setNewPolicy({...newPolicy, status: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-350 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-md shadow-indigo-500/10"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit policy modal */}
      {showEditModal && editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-white">Edit ESG Policy</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Title</label>
                  <input 
                    type="text"
                    required
                    value={editingPolicy.title}
                    onChange={e => setEditingPolicy({...editingPolicy, title: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Category</label>
                  <select 
                    value={editingPolicy.category}
                    onChange={e => setEditingPolicy({...editingPolicy, category: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                  >
                    <option value="Environmental">Environmental</option>
                    <option value="Social">Social</option>
                    <option value="Governance">Governance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Description</label>
                <input 
                  type="text"
                  required
                  value={editingPolicy.description}
                  onChange={e => setEditingPolicy({...editingPolicy, description: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Policy Content</label>
                <textarea 
                  required
                  rows={4}
                  value={editingPolicy.content}
                  onChange={e => setEditingPolicy({...editingPolicy, content: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Version</label>
                  <input 
                    type="text"
                    required
                    value={editingPolicy.version}
                    onChange={e => setEditingPolicy({...editingPolicy, version: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Status</label>
                  <select 
                    value={editingPolicy.status}
                    onChange={e => setEditingPolicy({...editingPolicy, status: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-350 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-md shadow-indigo-500/10"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PoliciesPage;
