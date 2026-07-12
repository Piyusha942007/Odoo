import React, { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import axios from 'axios';
import { 
  ShieldCheck, 
  Plus, 
  CheckCircle, 
  Search, 
  FileText, 
  Loader2, 
  Edit, 
  Trash2,
  Calendar,
  X,
  FileSignature,
  Filter,
  Bookmark,
  ChevronRight,
  BookOpen
} from 'lucide-react';

function PoliciesPage() {
  const { alert: customAlert, confirm: customConfirm } = useAlert();
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
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

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryStyles = (category) => {
    switch (category) {
      case 'Environmental':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10';
      case 'Social':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/10';
      default:
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/10';
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Archived':
        return 'bg-slate-500/10 text-slate-400 border border-slate-800';
      default:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    }
  };

  // Stats computation
  const totalPolicies = policies.length;
  const activePolicies = policies.filter(p => p.status === 'Active').length;
  const totalSignatures = allAcks.length;

  return (
    <div className="space-y-8 min-h-screen text-slate-100 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Governance Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">ESG Policy Catalog</h1>
          <p className="text-slate-400 text-sm max-w-2xl font-medium">Draft corporate compliance regulations, publish ESG declarations, and gather legally-binding employee signatures.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-bold transition-all duration-200 shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          Create Document
        </button>
      </div>

      {/* Analytics Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Policies</span>
          <p className="text-3xl font-black text-white mt-3">{totalPolicies}</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active / Published</span>
          <p className="text-3xl font-black text-emerald-400 mt-3">{activePolicies}</p>
        </div>
        <div className="col-span-2 md:col-span-1 bg-slate-900/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Signatures Collected</span>
          <p className="text-3xl font-black text-purple-400 mt-3">{totalSignatures}</p>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-500" />
          <input 
            type="text"
            placeholder="Search catalog index..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-250 placeholder-slate-650 focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-1.5 bg-slate-950/60 p-1 border border-white/5 rounded-2xl self-stretch sm:self-auto overflow-x-auto shrink-0 scrollbar-none">
          {['All', 'Environmental', 'Social', 'Governance'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === cat 
                  ? 'bg-slate-900 border border-white/10 text-white shadow-lg' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Policies grid & preview side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Policy cards list */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-24 bg-slate-900/20 border border-white/5 rounded-3xl text-slate-400 space-y-4">
              <Loader2 className="animate-spin text-blue-400" size={32} />
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">Indexing repository documents...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPolicies.map((policy) => (
                <div 
                  key={policy._id}
                  onClick={() => setSelectedPolicy(policy)}
                  className={`p-6 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                    selectedPolicy?._id === policy._id 
                      ? 'bg-slate-900/60 border-blue-500/40 shadow-xl shadow-blue-950/10 translate-x-1' 
                      : 'bg-slate-950/40 border-white/5 hover:border-white/10 hover:bg-slate-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase ${getCategoryStyles(policy.category)}`}>
                          {policy.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">Ver. {policy.version}</span>
                      </div>
                      <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors leading-snug">{policy.title}</h3>
                      <p className="text-slate-450 text-xs leading-relaxed line-clamp-2">{policy.description}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${getStatusStyles(policy.status)}`}>
                        {policy.status}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors">
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredPolicies.length === 0 && (
                <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl text-slate-500 bg-slate-950/20 space-y-3">
                  <BookOpen className="mx-auto text-slate-700 animate-pulse" size={36} />
                  <p className="text-sm font-bold text-slate-400">No matching ESG regulations</p>
                  <p className="text-xs text-slate-650 max-w-xs mx-auto">Please refine your search filter criteria or register a new corporate policy.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Policy detail panel */}
        <div className="bg-slate-950/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 h-fit space-y-6 shadow-2xl">
          {selectedPolicy ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-white/5 pb-5 gap-3">
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-white leading-snug">{selectedPolicy.title}</h2>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                    <Calendar size={12} className="text-blue-400" />
                    <span>Effective: {selectedPolicy.effectiveDate ? new Date(selectedPolicy.effectiveDate).toLocaleDateString() : 'Immediate'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[10px] font-black bg-slate-900 border border-white/5 text-slate-350 px-2 py-0.5 rounded">
                    V{selectedPolicy.version}
                  </span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleEditClick(selectedPolicy)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-blue-400 border border-white/5 transition-colors"
                      title="Edit Policy"
                    >
                      <Edit size={12} />
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedPolicy._id)}
                      className="p-2 rounded-xl bg-red-950/10 hover:bg-red-950/30 text-red-500 border border-red-900/10 transition-colors"
                      title="Delete Policy"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Description</h4>
                  <p className="text-slate-300 text-xs mt-2 leading-relaxed font-medium">{selectedPolicy.description}</p>
                </div>
                
                <div>
                  <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Document Content</h4>
                  <div className="bg-slate-950 border border-white/5 rounded-2xl p-4 mt-2 text-slate-300 text-xs leading-relaxed max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                    {selectedPolicy.content}
                  </div>
                </div>

                {/* Sign-off Form */}
                <div className="border-t border-white/5 pt-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileSignature className="text-blue-400" size={16} />
                    <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Signature Sign-off</h4>
                  </div>
                  <form onSubmit={handleAcknowledge} className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Type name to sign..."
                      required
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10"
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
                <div className="border-t border-white/5 pt-5 space-y-3">
                  <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Recorded Acknowledgements ({policyAcks.length})</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {policyAcks.map((ack) => (
                      <div key={ack._id} className="flex justify-between items-center bg-slate-900/10 border border-white/5 px-3.5 py-2.5 rounded-xl text-[10px]">
                        <span className="font-extrabold text-slate-200">{ack.employee}</span>
                        <span className="text-slate-550 font-bold">{new Date(ack.acknowledgedAt).toLocaleString()}</span>
                      </div>
                    ))}
                    {policyAcks.length === 0 && (
                      <p className="text-slate-600 text-xs italic text-center py-2">No signatures logged yet.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="py-24 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-center text-slate-600 mx-auto">
                <FileText size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-slate-350 text-sm font-bold">Select Policy Document</p>
                <p className="text-slate-500 text-xs px-6 leading-relaxed">Choose a document from the left catalog panel to review audit content requirements, check validation criteria, or record sign-offs.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create policy modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-950 border border-white/5 rounded-3xl p-6 shadow-2xl space-y-6 relative">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-black text-white">Create New ESG Policy</h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="create-title" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                  <input 
                    id="create-title"
                    type="text"
                    required
                    value={newPolicy.title}
                    onChange={e => setNewPolicy({...newPolicy, title: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 placeholder-slate-650"
                    placeholder="e.g. Environmental waste code"
                  />
                </div>
                <div>
                  <label htmlFor="create-category" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                  <select 
                    id="create-category"
                    value={newPolicy.category}
                    onChange={e => setNewPolicy({...newPolicy, category: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-350 focus:outline-none focus:border-blue-500/40 text-slate-200"
                  >
                    <option value="Environmental">Environmental</option>
                    <option value="Social">Social</option>
                    <option value="Governance">Governance</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="create-desc" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <input 
                  id="create-desc"
                  type="text"
                  required
                  value={newPolicy.description}
                  onChange={e => setNewPolicy({...newPolicy, description: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 placeholder-slate-650"
                  placeholder="Summary of the policy requirements."
                />
              </div>

              <div>
                <label htmlFor="create-content" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Policy Content</label>
                <textarea 
                  id="create-content"
                  required
                  rows={4}
                  value={newPolicy.content}
                  onChange={e => setNewPolicy({...newPolicy, content: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 placeholder-slate-650 leading-relaxed"
                  placeholder="Enter full policy document details..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="create-version" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Version</label>
                  <input 
                    id="create-version"
                    type="text"
                    required
                    value={newPolicy.version}
                    onChange={e => setNewPolicy({...newPolicy, version: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/40 placeholder-slate-655"
                    placeholder="1.0"
                  />
                </div>
                <div>
                  <label htmlFor="create-status" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Initial Status</label>
                  <select 
                    id="create-status"
                    value={newPolicy.status}
                    onChange={e => setNewPolicy({...newPolicy, status: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-350 focus:outline-none focus:border-blue-500/40 text-slate-200"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-350 rounded-xl text-xs font-bold transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-950 border border-white/5 rounded-3xl p-6 shadow-2xl space-y-6 relative">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-black text-white">Edit ESG Policy</h3>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-title" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                  <input 
                    id="edit-title"
                    type="text"
                    required
                    value={editingPolicy.title}
                    onChange={e => setEditingPolicy({...editingPolicy, title: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/40"
                  />
                </div>
                <div>
                  <label htmlFor="edit-category" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                  <select 
                    id="edit-category"
                    value={editingPolicy.category}
                    onChange={e => setEditingPolicy({...editingPolicy, category: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-350 focus:outline-none focus:border-blue-500/40 text-slate-250 font-bold"
                  >
                    <option value="Environmental">Environmental</option>
                    <option value="Social">Social</option>
                    <option value="Governance">Governance</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="edit-desc" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <input 
                  id="edit-desc"
                  type="text"
                  required
                  value={editingPolicy.description}
                  onChange={e => setEditingPolicy({...editingPolicy, description: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/40"
                />
              </div>

              <div>
                <label htmlFor="edit-content" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Policy Content</label>
                <textarea 
                  id="edit-content"
                  required
                  rows={4}
                  value={editingPolicy.content}
                  onChange={e => setEditingPolicy({...editingPolicy, content: e.target.value})}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/40 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-version" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Version</label>
                  <input 
                    id="edit-version"
                    type="text"
                    required
                    value={editingPolicy.version}
                    onChange={e => setEditingPolicy({...editingPolicy, version: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/40"
                  />
                </div>
                <div>
                  <label htmlFor="edit-status" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select 
                    id="edit-status"
                    value={editingPolicy.status}
                    onChange={e => setEditingPolicy({...editingPolicy, status: e.target.value})}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-slate-350 focus:outline-none focus:border-blue-500/40 text-slate-250 font-bold"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-350 rounded-xl text-xs font-bold transition-colors"
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
