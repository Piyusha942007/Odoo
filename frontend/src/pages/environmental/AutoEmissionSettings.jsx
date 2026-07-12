import React, { useState, useEffect, useRef } from 'react';
import { getDepartments } from '../../services/departmentService';
import {
  getAutoEmissionSettings,
  saveAutoEmissionSettings,
  simulateErpRecord
} from '../../services/environmentalService';
import {
  Zap,
  ZapOff,
  FlaskConical,
  CheckCircle2,
  XCircle,
  SkipForward,
  AlertCircle,
  Plus,
  Trash2,
  ChevronDown,
  Loader2,
  Settings2,
  ArrowRight,
  ClipboardList,
  Factory,
  Car,
  CreditCard,
  ShoppingCart
} from 'lucide-react';

const SOURCE_TYPES = [
  { value: 'Purchase',      label: 'Purchase',      icon: ShoppingCart, color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/25'   },
  { value: 'Manufacturing', label: 'Manufacturing', icon: Factory,      color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/25' },
  { value: 'Expense',       label: 'Expense',       icon: CreditCard,   color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/25' },
  { value: 'Fleet',         label: 'Fleet',         icon: Car,          color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/25'   },
];

const DOC_PREFIXES = { Purchase: 'PO', Manufacturing: 'MO', Expense: 'EXP', Fleet: 'FLEET' };

// ── Toggle Switch ────────────────────────────────────────────
function ToggleSwitch({ enabled, onChange, loading }) {
  return (
    <button
      type="button"
      onClick={() => !loading && onChange(!enabled)}
      disabled={loading}
      aria-label="Toggle auto emission calculation"
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
        ${enabled ? 'bg-emerald-500 focus:ring-emerald-500' : 'bg-slate-700 focus:ring-slate-500'}
        ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300
        ${enabled ? 'translate-x-8' : 'translate-x-1'}`} />
    </button>
  );
}

// ── Dropdown ─────────────────────────────────────────────────
function Dropdown({ value, options, onChange, placeholder, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.value === value);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-xs font-bold text-slate-400 mb-1.5">{label}</label>}
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 hover:border-slate-600 transition">
        <span className={selected ? 'text-slate-200' : 'text-slate-500'}>{selected?.label || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 max-h-48 overflow-y-auto">
          {options.map(o => (
            <button key={o.value} type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition ${value === o.value ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-slate-800'}`}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AutoEmissionSettings() {
  const [toggleEnabled, setToggleEnabled]   = useState(false);
  const [toggleLoading, setToggleLoading]   = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [departments, setDepartments]       = useState([]);
  const [activeFactors, setActiveFactors]   = useState([]);

  // Simulator form state
  const [sourceType, setSourceType]         = useState('Purchase');
  const [department, setDepartment]         = useState('');
  const [sourceDocument, setSourceDocument] = useState('PO-2026-001');
  const [items, setItems]                   = useState([{ emissionFactorId: '', quantity: '' }]);
  const [simulating, setSimulating]         = useState(false);
  const [result, setResult]                 = useState(null);
  const [simError, setSimError]             = useState('');

  // Auto-update sourceDocument prefix when sourceType changes
  useEffect(() => {
    const prefix = DOC_PREFIXES[sourceType] || 'DOC';
    setSourceDocument(`${prefix}-2026-001`);
  }, [sourceType]);

  // Load initial data
  useEffect(() => {
    const load = async () => {
      try {
        const [settingsRes, deptsRes] = await Promise.all([
          getAutoEmissionSettings(),
          getDepartments()
        ]);
        if (settingsRes.success) {
          setToggleEnabled(settingsRes.data.autoEmissionCalculation);
          setActiveFactors(settingsRes.data.activeEmissionFactors || []);
        }
        if (deptsRes.success) setDepartments(deptsRes.data || []);
      } catch (e) {
        console.error('Failed to load settings:', e);
      } finally {
        setSettingsLoading(false);
      }
    };
    load();
  }, []);

  const handleToggle = async (value) => {
    setToggleLoading(true);
    try {
      const res = await saveAutoEmissionSettings({ autoEmissionCalculation: value });
      if (res.success) setToggleEnabled(value);
    } catch (e) {
      console.error('Failed to save toggle:', e);
    } finally {
      setToggleLoading(false);
    }
  };

  const addItem = () => setItems(prev => [...prev, { emissionFactorId: '', quantity: '' }]);
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it));

  const handleSimulate = async (e) => {
    e.preventDefault();
    setSimError('');
    setResult(null);

    if (!department) { setSimError('Please select a department.'); return; }
    if (!sourceDocument.trim()) { setSimError('Source Document ID is required.'); return; }
    const hasValidItem = items.some(it => it.emissionFactorId && Number(it.quantity) > 0);
    if (!hasValidItem) { setSimError('Add at least one item with an emission factor and quantity > 0.'); return; }

    setSimulating(true);
    try {
      const payload = {
        sourceType,
        department,
        sourceDocument: sourceDocument.trim(),
        items: items
          .filter(it => it.emissionFactorId && it.quantity)
          .map(it => ({ emissionFactorId: it.emissionFactorId, quantity: Number(it.quantity) }))
      };
      const res = await simulateErpRecord(payload);
      setResult(res.data || res);
    } catch (e) {
      setSimError(e?.response?.data?.message || e.message || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const factorOptions = activeFactors.map(f => ({
    value: f._id,
    label: `${f.name} (${f.co2eFactor} CO₂e/${f.unit})`
  }));
  const deptOptions = departments.map(d => ({ value: d._id, label: d.name }));

  const srcMeta = SOURCE_TYPES.find(s => s.value === sourceType) || SOURCE_TYPES[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in font-sans">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
          <Settings2 className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100">Auto Emission Calculation</h2>
          <p className="text-sm text-slate-400 font-medium mt-0.5">
            Control automatic Carbon Transaction generation from ERP source records.
          </p>
        </div>
      </div>

      {/* Toggle Card */}
      <div className={`bg-slate-900 border rounded-3xl p-6 shadow-xl transition-colors duration-300
        ${toggleEnabled ? 'border-emerald-500/30' : 'border-slate-800'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {toggleEnabled
                ? <Zap className="w-5 h-5 text-emerald-400" />
                : <ZapOff className="w-5 h-5 text-slate-500" />}
              <h3 className="text-base font-bold text-slate-200">Auto Emission Calculation</h3>
            </div>
            <p className="text-sm text-slate-400 font-medium max-w-lg">
              When <span className="font-bold text-slate-300">enabled</span>, Carbon Transactions are auto-generated
              from confirmed ERP records (Purchase, Manufacturing, Expense, Fleet) using the matched Emission Factor.
              When <span className="font-bold text-slate-300">disabled</span>, all transactions must be entered manually.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-sm font-bold ${toggleEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
              {settingsLoading ? '—' : toggleEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <ToggleSwitch enabled={toggleEnabled} onChange={handleToggle} loading={toggleLoading || settingsLoading} />
          </div>
        </div>

        {/* Status banner */}
        <div className={`mt-4 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors duration-300
          ${toggleEnabled
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-slate-800/60 border border-slate-700 text-slate-500'}`}>
          {toggleEnabled
            ? <><CheckCircle2 className="w-4 h-4" /> Auto Emission Calculation is ACTIVE — ERP records will generate Carbon Transactions automatically.</>
            : <><ZapOff className="w-4 h-4" /> Auto Emission Calculation is OFF — ERP simulation will return a disabled response.</>}
        </div>
      </div>

      {/* ERP Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-indigo-400" />
            ERP Record Simulator
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Submit a mock ERP record to test idempotency and auto-transaction generation.
          </p>
        </div>

        <form onSubmit={handleSimulate} className="space-y-5">

          {/* Source Type selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">Source Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SOURCE_TYPES.map(st => (
                <button key={st.value} type="button"
                  onClick={() => setSourceType(st.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition
                    ${sourceType === st.value
                      ? `${st.bg} ${st.border} ${st.color}`
                      : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                  <st.icon className="w-4 h-4" />
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dept + SourceDoc row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dropdown
              value={department}
              options={deptOptions}
              onChange={setDepartment}
              placeholder="Select department…"
              label="Department"
            />
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">
                Source Document ID
                <span className="text-slate-600 font-medium ml-1">(edit to test idempotency)</span>
              </label>
              <input
                type="text"
                value={sourceDocument}
                onChange={e => setSourceDocument(e.target.value)}
                placeholder="PO-2026-001"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400">
                Line Items <span className="text-slate-600 font-medium">(one per emission factor)</span>
              </label>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition">
                <Plus className="w-3.5 h-3.5" /> Add item
              </button>
            </div>

            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1">
                  {i === 0 && <label className="block text-[10px] font-bold text-slate-500 mb-1">Emission Factor</label>}
                  <Dropdown
                    value={item.emissionFactorId}
                    options={factorOptions}
                    onChange={v => updateItem(i, 'emissionFactorId', v)}
                    placeholder="Select factor…"
                  />
                </div>
                <div className="w-28">
                  {i === 0 && <label className="block text-[10px] font-bold text-slate-500 mb-1">Quantity</label>}
                  <input
                    type="number"
                    min="0.0001"
                    step="any"
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)}
                    className="mb-0.5 p-2 rounded-xl text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {simError && (
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {simError}
            </div>
          )}

          <button type="submit" disabled={simulating}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50">
            {simulating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              : <><FlaskConical className="w-4 h-4" /> Simulate ERP Record <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>

      {/* Result Panel */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-slate-400" />
              Simulation Result
              <span className="ml-1 text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-lg">
                {result.sourceDocument}
              </span>
            </h3>
          </div>

          {/* Disabled state */}
          {result.enabled === false && (
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
              <ZapOff className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-amber-400">Auto Emission Calculation Disabled</div>
                <div className="text-xs text-amber-400/70 font-medium mt-0.5">{result.message}</div>
              </div>
            </div>
          )}

          {/* Summary chips */}
          {result.enabled !== false && (
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> {result.created?.length || 0} Created
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-400">
                <SkipForward className="w-4 h-4" /> {result.skipped?.length || 0} Skipped
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-400">
                <XCircle className="w-4 h-4" /> {result.failed?.length || 0} Failed
              </div>
            </div>
          )}

          {/* Created */}
          {result.created?.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">✅ Created Transactions</div>
              {result.created.map((c, i) => (
                <div key={i} className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-4 py-3 text-xs font-mono space-y-0.5">
                  <div className="text-emerald-300 font-semibold">{c.factorName}</div>
                  <div className="text-slate-400">
                    Qty: <span className="text-slate-200">{c.quantity}</span> →{' '}
                    CO₂e: <span className="text-slate-200">{c.co2eAmount.toLocaleString()} kg</span>
                  </div>
                  <div className="text-slate-600">TX ID: {c.transactionId}</div>
                </div>
              ))}
            </div>
          )}

          {/* Skipped */}
          {result.skipped?.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">⏭ Skipped (Duplicates)</div>
              {result.skipped.map((s, i) => (
                <div key={i} className="bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3 text-xs font-mono space-y-0.5">
                  <div className="text-amber-300 font-semibold">{s.factorName}</div>
                  <div className="text-slate-400">{s.reason}</div>
                  {s.existingId && <div className="text-slate-600">Existing TX ID: {s.existingId}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Failed */}
          {result.failed?.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">❌ Failed Items</div>
              {result.failed.map((f, i) => (
                <div key={i} className="bg-rose-500/5 border border-rose-500/15 rounded-xl px-4 py-3 text-xs font-mono space-y-0.5">
                  <div className="text-rose-300 font-semibold">{f.factorName || f.emissionFactorId}</div>
                  <div className="text-slate-400">{f.reason}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
