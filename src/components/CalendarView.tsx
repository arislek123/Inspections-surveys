/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, AlertTriangle, Clock, CheckCircle2, ChevronRight, Anchor } from 'lucide-react';
import { Case, Vessel, Port } from '../types';

interface CalendarViewProps {
  cases: Case[];
  vessels: Vessel[];
  ports: Port[];
  onSelectCase: (caseId: string) => void;
}

export default function CalendarView({ cases, vessels, ports, onSelectCase }: CalendarViewProps) {
  const [filterVessel, setFilterVessel] = useState('');

  // Helper resolvers
  const getVesselName = (id: string) => vessels.find(v => v.id === id)?.name || 'Unknown Vessel';
  const getPortName = (id: string) => ports.find(p => p.id === id)?.name || 'Unknown Port';

  // Filter out cases without deadlines/target dates
  const casesWithDeadlines = cases.filter(c => {
    const matchesVessel = !filterVessel || c.vesselId === filterVessel;
    return !!c.deadline && matchesVessel;
  });

  // Sort them chronologically
  const sortedDeadlines = [...casesWithDeadlines].sort((a, b) => {
    return new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime();
  });

  // Divide into groups
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);

  const overdue: Case[] = [];
  const dueThisWeek: Case[] = [];
  const dueLater: Case[] = [];
  const completedWithDeadlines: Case[] = [];

  sortedDeadlines.forEach((c) => {
    if (c.status === 'Finished') {
      completedWithDeadlines.push(c);
      return;
    }

    const deadlineDate = new Date(c.deadline!);
    deadlineDate.setHours(0, 0, 0, 0);

    if (deadlineDate.getTime() < today.getTime()) {
      overdue.push(c);
    } else if (deadlineDate.getTime() <= oneWeekLater.getTime()) {
      dueThisWeek.push(c);
    } else {
      dueLater.push(c);
    }
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 md:p-8" id="calendar-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-3 sm:space-y-0 border-b border-slate-100 pb-5" id="calendar-header">
        <div>
          <h2 className="text-base font-sans font-bold text-slate-900 tracking-tight">Survey & Service Deadline Tracker</h2>
          <p className="text-xs text-slate-500 mt-1">Chronological itinerary of technical cases, Class intermediate inspection target dates, and certificate expiries.</p>
        </div>

        {/* Quick Vessel Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-sans font-semibold text-slate-500 whitespace-nowrap">Filter Vessel:</span>
          <select
            id="calendar-vessel-filter"
            value={filterVessel}
            onChange={(e) => setFilterVessel(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">All Vessels</option>
            {vessels.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-8" id="calendar-content">
        
        {/* SECTION 1: CRITICAL OVERDUE */}
        <div id="calendar-overdue-section">
          <div className="flex items-center space-x-2 border-b border-red-100 pb-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <h3 className="text-xs font-sans font-bold text-red-700 uppercase tracking-wider">Overdue Deadlines ({overdue.length})</h3>
          </div>

          <div className="space-y-3">
            {overdue.map((c) => (
              <div 
                key={c.id} 
                onClick={() => onSelectCase(c.id)}
                className="bg-white hover:bg-red-50/10 border-l-4 border-red-500 border-y border-r border-slate-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer transition-all shadow-sm"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-red-600 uppercase tracking-wider">OVERDUE {c.deadline}</span>
                    <span>•</span>
                    <span>{getVesselName(c.vesselId)}</span>
                    <span>•</span>
                    <span>{getPortName(c.portId)}</span>
                  </div>
                  <h4 className="text-xs font-sans font-bold text-slate-900 mt-1">{c.subject}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    <strong>Next Action:</strong> {c.nextAction || 'None registered'}
                  </p>
                </div>
                
                <div className="mt-3 md:mt-0 flex items-center space-x-3 shrink-0">
                  <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-sans font-bold border border-red-100">
                    {c.status}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))}

            {overdue.length === 0 && (
              <p className="text-xs text-slate-400 italic py-2 pl-1">Great! No active overdue survey target dates.</p>
            )}
          </div>
        </div>

        {/* SECTION 2: DUE THIS WEEK */}
        <div id="calendar-week-section">
          <div className="flex items-center space-x-2 border-b border-sky-100 pb-2 mb-4">
            <Clock className="h-4 w-4 text-sky-600" />
            <h3 className="text-xs font-sans font-bold text-sky-800 uppercase tracking-wider">Due This Week ({dueThisWeek.length})</h3>
          </div>

          <div className="space-y-3">
            {dueThisWeek.map((c) => (
              <div 
                key={c.id} 
                onClick={() => onSelectCase(c.id)}
                className="bg-white hover:bg-sky-50/10 border-l-4 border-sky-500 border-y border-r border-slate-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer transition-all shadow-sm"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-sky-600">DUE {c.deadline}</span>
                    <span>•</span>
                    <span>{getVesselName(c.vesselId)}</span>
                    <span>•</span>
                    <span>{getPortName(c.portId)}</span>
                  </div>
                  <h4 className="text-xs font-sans font-bold text-slate-900 mt-1">{c.subject}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    <strong>Next Action:</strong> {c.nextAction || 'None registered'}
                  </p>
                </div>
                
                <div className="mt-3 md:mt-0 flex items-center space-x-3 shrink-0">
                  <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded text-[10px] font-sans font-bold border border-sky-100">
                    {c.status}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))}

            {dueThisWeek.length === 0 && (
              <p className="text-xs text-slate-400 italic py-2 pl-1">No major survey deadlines scheduled for the next 7 days.</p>
            )}
          </div>
        </div>

        {/* SECTION 3: UPCOMING LATER */}
        <div id="calendar-later-section">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 mb-4">
            <Calendar className="h-4 w-4 text-slate-600" />
            <h3 className="text-xs font-sans font-bold text-slate-600 uppercase tracking-wider">Upcoming Later ({dueLater.length})</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dueLater.map((c) => (
              <div 
                key={c.id} 
                onClick={() => onSelectCase(c.id)}
                className="bg-white hover:bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col justify-between cursor-pointer transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-slate-700">{c.deadline}</span>
                    <span>{getVesselName(c.vesselId)}</span>
                  </div>
                  <h4 className="text-xs font-sans font-bold text-slate-900 mt-1.5 line-clamp-1">{c.subject}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Port of Attendance: {getPortName(c.portId)}</p>
                </div>
                
                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-semibold border border-slate-200">
                    {c.status}
                  </span>
                  <span className="text-[10px] text-sky-600 font-semibold flex items-center">
                    <span>Inspect</span>
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}

            {dueLater.length === 0 && (
              <p className="text-xs text-slate-400 italic py-2 col-span-2">No future target dates recorded.</p>
            )}
          </div>
        </div>

        {/* SECTION 4: HISTORICAL RESOLVED WITH DEADLINES */}
        <div id="calendar-finished-section">
          <div className="flex items-center space-x-2 border-b border-emerald-100 pb-2 mb-4">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-sans font-bold text-emerald-700 uppercase tracking-wider">Completed / Closed Survey Deadlines ({completedWithDeadlines.length})</h3>
          </div>

          <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {completedWithDeadlines.map((c) => (
              <div 
                key={c.id} 
                onClick={() => onSelectCase(c.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 text-xs transition-colors"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-[10px] font-mono text-slate-400">
                    Target Date: {c.deadline} • Vessel: {getVesselName(c.vesselId)}
                  </p>
                  <h4 className="font-sans font-semibold text-slate-700 mt-1 truncate">{c.subject}</h4>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded text-[10px] font-sans font-bold border border-emerald-100">
                    Finished
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </div>
              </div>
            ))}

            {completedWithDeadlines.length === 0 && (
              <p className="text-xs text-slate-400 italic py-4 text-center">No closed survey deadlines in history logs.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
