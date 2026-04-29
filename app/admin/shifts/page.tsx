'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import api from '@/api/client';

export default function ShiftsPage() {
  const [selectedDate, setSelectedDate] = React.useState<string>(new Date().toISOString().split('T')[0]);

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ['shifts', selectedDate],
    queryFn: async () => {
      const res = await api.get(`/tenant/shifts?date=${selectedDate}`);
      return res.data;
    }
  });

  return (
    <div className="p-8 lg:p-12 max-w-[1500px] mx-auto w-full space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/5 pb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-on-surface font-headline uppercase italic">Shift <span className="text-primary italic">Tracking</span></h2>
          <p className="text-on-surface-variant font-medium text-sm opacity-50">Monitor staff hours and active operational shifts.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex flex-col">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Filter by Date</label>
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-12 px-6 bg-white border border-outline-variant/10 rounded-xl outline-none focus:border-primary font-bold text-xs uppercase transition-all shadow-sm"
                />
            </div>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-outline-variant/5 overflow-hidden">
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="bg-[#fcfdff] border-b border-outline-variant/5 text-on-surface-variant uppercase text-[9px] font-black tracking-[0.2em]">
              <th className="py-6 px-10 w-[30%]">Staff Member</th>
              <th className="py-6 px-10 w-[20%]">Status</th>
              <th className="py-6 px-10 w-[25%]">Clock In</th>
              <th className="py-6 px-10 w-[25%]">Clock Out</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {isLoading ? (
              <tr><td colSpan={4} className="py-24 text-center font-black uppercase tracking-widest text-[10px] opacity-20">Loading shifts...</td></tr>
            ) : shifts.length === 0 ? (
              <tr><td colSpan={4} className="py-24 text-center italic opacity-20">No shifts recorded yet.</td></tr>
            ) : shifts.map((shift: any) => {
              const isActive = !shift.clock_out;
              return (
                <tr key={shift.id} className="hover:bg-[#fcfdff] transition-all group">
                  <td className="py-8 px-10">
                    <p className="font-black text-on-surface text-base tracking-tighter truncate italic font-headline">{shift.user?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40 truncate">{shift.user?.role || 'Staff'}</p>
                  </td>
                  <td className="py-8 px-10">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ${
                      isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-50 text-slate-500 ring-slate-200'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      {isActive ? 'Active Shift' : 'Completed'}
                    </span>
                  </td>
                  <td className="py-8 px-10">
                    <span className="font-black text-on-surface text-sm tracking-tighter tabular-nums font-headline">
                        {new Date(shift.clock_in).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-8 px-10">
                    <span className="font-black text-on-surface text-sm tracking-tighter tabular-nums font-headline">
                        {shift.clock_out ? new Date(shift.clock_out).toLocaleString() : '--'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
