import React from 'react';
import { Calendar } from 'lucide-react';

function CsrActivities() {
  return (
    <div className="flex-grow bg-slate-950 text-slate-100 flex items-center justify-center p-8">
      <div className="text-center max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <Calendar className="w-12 h-12 text-emerald-450 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">CSR Activities Skeleton</h2>
        <p className="text-sm text-slate-400">
          This is the CSR Activities page skeleton. Hour 2 will implement CSR Activities CRUD, and Hour 3 will implement Employee Participation workflows.
        </p>
      </div>
    </div>
  );
}

export default CsrActivities;
