/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  FileText, 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  PauseCircle, 
  RotateCcw, 
  Play, 
  Inbox, 
  Ship, 
  MapPin, 
  TrendingUp, 
  ArrowUpRight 
} from 'lucide-react';
import { Case, Vessel, Port } from '../types';

interface DashboardViewProps {
  cases: Case[];
  vessels: Vessel[];
  ports: Port[];
  onSelectCase: (caseId: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({ 
  cases, 
  vessels, 
  ports, 
  onSelectCase, 
  setActiveTab 
}: DashboardViewProps) {
  
  // Calculate stats
  const totalCases = cases.length;
  const openCases = cases.filter(c => c.status !== 'Finished').length;
  const urgentCases = cases.filter(c => c.status === 'Urgent').length;
  const finishedCases = cases.filter(c => c.status === 'Finished').length;
  const postponedCases = cases.filter(c => c.status === 'Postponed').length;
  const reopenedCases = cases.filter(c => c.status === 'Postponed but Reopened').length;
  const inProgressCases = cases.filter(c => c.status === 'In Progress').length;
  const awaitingReplyCases = cases.filter(c => c.status === 'Awaiting Reply').length;

  // Cases per Vessel
  const vesselStats = vessels.map(v => {
    const vesselCases = cases.filter(c => c.vesselId === v.id);
    const totalCount = vesselCases.length;
    const openCount = vesselCases.filter(c => c.status !== 'Finished').length;
    const urgentCount = vesselCases.filter(c => c.status === 'Urgent' || c.priority === 'Critical').length;
    return {
      vessel: v,
      totalCount,
      openCount,
      urgentCount,
    };
  }).sort((a, b) => b.totalCount - a.totalCount);

  // Cases per Port
  const portStats = ports.map(p => {
    const portCases = cases.filter(c => c.portId === p.id);
    const totalCount = portCases.length;
    const openCount = portCases.filter(c => c.status !== 'Finished').length;
    return {
      port: p,
      totalCount,
      openCount,
    };
  }).sort((a, b) => b.totalCount - a.totalCount);

  // Cases per Job Type
  const jobTypeCounts: { [key: string]: number } = {};
  cases.forEach(c => {
    jobTypeCounts[c.jobType] = (jobTypeCounts[c.jobType] || 0) + 1;
  });
  const jobTypeStats = Object.keys(jobTypeCounts).map(type => ({
    type,
    count: jobTypeCounts[type],
  })).sort((a, b) => b.count - a.count);

  // Recent operational updates (sorted by last updated date)
  const recentCases = [...cases]
    .sort((a, b) => new Date(b.lastUpdatedDate).getTime() - new Date(a.lastUpdatedDate).getTime())
    .slice(0, 4);

  // Helper to resolve Vessel Name
  const getVesselName = (id: string) => vessels.find(v => v.id === id)?.name || 'Unknown Vessel';
  const getPortName = (id: string) => ports.find(p => p.id === id)?.name || 'Unknown Port';

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 md:p-8" id="dashboard-view-container">
      {/* Welcome Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-3 md:space-y-0 border-b border-slate-100 pb-5" id="dashboard-header-section">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">Technical Operations Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time status of ship inspections, surveys, and technical repair cases.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-sans font-medium text-slate-600">Local Time (UTC-7)</p>
          <p className="text-sm font-mono font-bold text-slate-800">2026-07-05 05:29</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8" id="dashboard-kpi-grid">
        {/* Open Cases */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Open Cases</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-4xl font-sans font-bold text-slate-900 leading-none">{openCases}</p>
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Out of {totalCases}</span>
          </div>
        </div>

        {/* Urgent */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Urgent</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-4xl font-sans font-bold text-red-600 leading-none">{urgentCases}</p>
            <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 font-medium">High Prio</span>
          </div>
        </div>

        {/* Awaiting Reply */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Awaiting Reply</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-4xl font-sans font-bold text-amber-600 leading-none">{awaitingReplyCases}</p>
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-medium">Pending</span>
          </div>
        </div>

        {/* Finished */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Finished (MTD)</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-4xl font-sans font-bold text-emerald-600 leading-none">{finishedCases}</p>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-medium font-sans">Closed</span>
          </div>
        </div>

        {/* Postponed */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Postponed</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-4xl font-sans font-bold text-slate-400 leading-none">{postponedCases}</p>
            <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">Deferred</span>
          </div>
        </div>
      </div>

      {/* Sub-status breakdown bar (In Progress, Awaiting Reply, Reopened, Postponed) */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm mb-8" id="dashboard-status-breakdown">
        <h4 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider mb-4">Case Phase Breakdown (Active Cases)</h4>
        <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100">
          <div style={{ width: `${openCases ? (inProgressCases/openCases)*100 : 0}%` }} className="bg-sky-500" title={`In Progress: ${inProgressCases}`} />
          <div style={{ width: `${openCases ? (awaitingReplyCases/openCases)*100 : 0}%` }} className="bg-amber-500" title={`Awaiting Reply: ${awaitingReplyCases}`} />
          <div style={{ width: `${openCases ? (reopenedCases/openCases)*100 : 0}%` }} className="bg-indigo-500" title={`Postponed But Reopened: ${reopenedCases}`} />
          <div style={{ width: `${openCases ? (postponedCases/openCases)*100 : 0}%` }} className="bg-slate-300" title={`Postponed: ${postponedCases}`} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-2">
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500 inline-block" />
            <span className="text-sm text-slate-600 font-sans">In Progress: <strong>{inProgressCases}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="text-sm text-slate-600 font-sans">Awaiting Reply: <strong>{awaitingReplyCases}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 inline-block" />
            <span className="text-sm text-slate-600 font-sans">Reopened: <strong>{reopenedCases}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300 inline-block" />
            <span className="text-sm text-slate-600 font-sans">Postponed: <strong>{postponedCases}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Analysis Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8" id="dashboard-analysis-layout">
        {/* Cases per Vessel (2/3 width on large) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <Ship className="h-4 w-4 text-slate-700" />
              <h4 className="text-base font-sans font-bold text-slate-800">Fleet Overview & Active Cases</h4>
            </div>
            <button 
              id="dashboard-view-vessels-btn"
              onClick={() => setActiveTab('vessels')}
              className="text-xs text-sky-600 hover:text-sky-700 font-sans font-bold flex items-center space-x-1 cursor-pointer"
            >
              <span>Manage Vessels</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          
          <div className="space-y-4 flex-1 justify-center flex flex-col">
            {vesselStats.map(({ vessel, totalCount, openCount, urgentCount }) => {
              const percentage = totalCases > 0 ? (totalCount / totalCases) * 100 : 0;
              return (
                <div key={vessel.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-sans font-bold text-slate-800">{vessel.name}</span>
                    <div className="flex items-center space-x-2 font-mono text-slate-500 text-xs">
                      <span>{openCount} active / {totalCount} total</span>
                      {urgentCount > 0 && (
                        <span className="bg-red-50 text-red-700 px-1.5 py-0.2 border border-red-100 rounded font-sans font-bold text-[10px] uppercase tracking-wider">
                          {urgentCount} Urgent
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${percentage}%` }} 
                      className={`h-full rounded-full ${urgentCount > 0 ? 'bg-red-500' : 'bg-slate-700'}`} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Ports Overview (1/3 width on large) */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-slate-700" />
              <h4 className="text-base font-sans font-bold text-slate-800">Active Cases per Port</h4>
            </div>
            <button 
              id="dashboard-view-ports-btn"
              onClick={() => setActiveTab('ports')}
              className="text-xs text-sky-600 hover:text-sky-700 font-sans font-bold flex items-center space-x-1 cursor-pointer"
            >
              <span>Ports List</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3 flex-1 justify-center flex flex-col">
            {portStats.slice(0, 5).map(({ port, totalCount, openCount }) => {
              const maxCases = Math.max(...portStats.map(ps => ps.totalCount)) || 1;
              const fillPct = (totalCount / maxCases) * 100;
              return (
                <div key={port.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-sans font-bold text-slate-800 truncate">{port.name}</p>
                    <p className="text-xs font-mono text-slate-400">{port.country}</p>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0 ml-4">
                    <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div style={{ width: `${fillPct}%` }} className="bg-sky-500 h-full rounded-full" />
                    </div>
                    <span className="text-sm font-mono font-bold text-slate-700 w-4 text-right">{totalCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-recent-and-jobtypes">
        {/* Cases per Job Type (1/3 width) */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 mb-5">
            <TrendingUp className="h-4 w-4 text-slate-700" />
            <h4 className="text-base font-sans font-bold text-slate-800">Cases by Job Category</h4>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
            {jobTypeStats.map((stat, idx) => {
              const maxCount = Math.max(...jobTypeStats.map(js => js.count)) || 1;
              const fillPct = (stat.count / maxCount) * 100;
              return (
                <div key={stat.type} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-sans text-slate-600 truncate mr-2">{stat.type}</span>
                    <span className="font-mono font-bold text-slate-800">{stat.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${fillPct}%` }} className="bg-slate-400 h-full rounded-full" />
                  </div>
                </div>
              );
            })}
            {jobTypeStats.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No cases logged yet.</p>
            )}
          </div>
        </div>

        {/* Recent Operational Updates (2/3 width) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <h4 className="text-base font-sans font-bold text-slate-800 mb-5">Recent Operational Updates</h4>
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-72">
            {recentCases.map((c) => {
              // Status Styling aligned to Design HTML specifications
              let statusStyle = 'bg-slate-100 text-slate-600 border-slate-200';
              if (c.status === 'In Worklist') statusStyle = 'bg-slate-100 text-slate-600 border-slate-200';
              else if (c.status === 'In Progress') statusStyle = 'bg-blue-50 text-blue-700 border-blue-100';
              else if (c.status === 'Awaiting Reply') statusStyle = 'bg-amber-50 text-amber-700 border-amber-100';
              else if (c.status === 'Finished') statusStyle = 'bg-emerald-50 text-emerald-700 border-emerald-100';
              else if (c.status === 'Postponed but Reopened') statusStyle = 'bg-indigo-50 text-indigo-700 border-indigo-100';
              else if (c.status === 'Postponed') statusStyle = 'bg-slate-100 text-slate-500 border-slate-200';
              else if (c.status === 'Urgent') statusStyle = 'bg-red-50 text-red-700 border-red-100';

              return (
                <div 
                  key={c.id} 
                  id={`dashboard-recent-case-${c.id}`}
                  onClick={() => onSelectCase(c.id)}
                  className="py-3.5 flex items-start justify-between cursor-pointer hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-400">{c.id}</span>
                      <span className="text-sm font-sans font-bold text-slate-700">{getVesselName(c.vesselId)}</span>
                      <span className="text-sm text-slate-400">•</span>
                      <span className="text-sm text-slate-500 font-sans truncate">{getPortName(c.portId)}</span>
                    </div>
                    <p className="text-sm font-sans font-semibold text-slate-900 mt-1 truncate">{c.subject}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                      Next Action: <span className="text-slate-700">{c.nextAction || 'None'}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 bg-slate-50 rounded text-xs font-sans font-bold uppercase tracking-tighter border ${statusStyle}`}>
                      {c.status}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(c.lastUpdatedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
            {recentCases.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-10">No cases recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
