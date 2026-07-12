import React from 'react';
import { Leaf, Target, TrendingDown, ClipboardList } from 'lucide-react';

function EnvironmentalOverview() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-900/50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <Leaf className="w-12 h-12 text-emerald-400" />
        </div>
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-100">Environmental Dashboard</h2>
          <p className="text-slate-400 font-medium max-w-lg">
            Monitor, calculate, and report greenhouse gas emissions, track carbon targets, and manage sustainability goals.
          </p>
        </div>
      </div>

      {/* Placeholder Cards for Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carbon Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-emerald-500/30 transition duration-300 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex p-3 bg-slate-950 rounded-xl border border-slate-800">
              <ClipboardList className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200">Carbon Transactions</h3>
            <p className="text-sm text-slate-400 font-medium">
              Manual and automated carbon calculations mapped directly to ERP purchase orders, expenses, manufacturing lines, and fleet usage.
            </p>
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
              Skeleton Ready
            </span>
          </div>
        </div>

        {/* Sustainability Goals */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-emerald-500/30 transition duration-300 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex p-3 bg-slate-950 rounded-xl border border-slate-800">
              <Target className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200">Sustainability Goals</h3>
            <p className="text-sm text-slate-400 font-medium">
              Create, track, and monitor organization and department-wide reduction targets (e.g. reduce scope 1 & 2 carbon footprint).
            </p>
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
              Skeleton Ready
            </span>
          </div>
        </div>
      </div>

      {/* Scope Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-slate-200">Carbon Accounting Methodology</h3>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-4">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shrink-0 mt-0.5">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200">Scope 1, 2, & 3 Rollups</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Calculations translate raw units (e.g., liters of diesel, kWh electricity, kilograms of steel purchased) into metric tons of CO2 equivalent (tCO2e) based on active Emission Factors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnvironmentalOverview;
