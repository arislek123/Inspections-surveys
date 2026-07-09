/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Ship, Plus, FileText, Check, AlertCircle, Trash2 } from 'lucide-react';
import { Vessel, Case } from '../types';

interface VesselsViewProps {
  vessels: Vessel[];
  cases: Case[];
  onAddVessel: (name: string, imo?: string, fleet?: string) => void;
  onDeleteVessel: (vesselId: string) => void;
  onSelectCase: (caseId: string) => void;
}

export default function VesselsView({ vessels, cases, onAddVessel, onDeleteVessel, onSelectCase }: VesselsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [imo, setImo] = useState('');
  const [fleet, setFleet] = useState('');

  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Vessel name is required.');
      return;
    }

    onAddVessel(name.trim(), imo.trim(), fleet.trim());
    
    // Reset
    setName('');
    setImo('');
    setFleet('');
    setShowAddForm(false);
  };

  const handleDeleteVessel = (vesselId: string, vesselName: string, linkedCasesCount: number) => {
    const message = linkedCasesCount > 0
      ? `Delete ${vesselName}? ${linkedCasesCount} linked case(s) will remain, but will become unassigned from this vessel.`
      : `Delete ${vesselName}?`;

    if (window.confirm(message)) {
      onDeleteVessel(vesselId);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 md:p-8" id="vessels-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-3 sm:space-y-0 border-b border-slate-100 pb-5" id="vessels-header">
        <div>
          <h2 className="text-lg font-sans font-bold text-slate-900 tracking-tight">Ship Fleet Registry</h2>
          <p className="text-sm text-slate-500 mt-1">Manage shipping fleet vessels, IMO registration tracking, and total technical backlog.</p>
        </div>
        <button
          type="button"
          id="btn-toggle-add-vessel"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-1.5 text-sm bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Vessel</span>
        </button>
      </div>

      {/* Add Vessel Form (Collapsible) */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-8 max-w-xl animate-fadeIn" id="add-vessel-form">
          <h3 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider mb-4">Register New Fleet Vessel</h3>
          {validationError && (
            <p className="text-sm text-red-600 mb-3 bg-red-50 p-2 rounded">{validationError}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-1">
              <label htmlFor="vessel-name-input" className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Vessel Name *</label>
              <input
                type="text"
                id="vessel-name-input"
                placeholder="e.g. M/V STEFANOS"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label htmlFor="vessel-imo-input" className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">IMO Number</label>
              <input
                type="text"
                id="vessel-imo-input"
                placeholder="e.g. 9428574"
                value={imo}
                onChange={(e) => setImo(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 font-mono"
              />
            </div>
            <div>
              <label htmlFor="vessel-fleet-input" className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Fleet Sub-division</label>
              <input
                type="text"
                id="vessel-fleet-input"
                placeholder="e.g. Bulk Carrier Division A"
                value={fleet}
                onChange={(e) => setFleet(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-vessel"
              className="px-4 py-1.5 text-sm bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg cursor-pointer shadow-sm transition-all"
            >
              Save Vessel
            </button>
          </div>
        </form>
      )}

      {/* Grid of Vessels */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="vessels-card-grid">
        {vessels.map((v) => {
          const vesselCases = cases.filter(c => c.vesselId === v.id);
          const openCases = vesselCases.filter(c => c.status !== 'Finished');
          const urgentCases = vesselCases.filter(c => c.status === 'Urgent' || c.priority === 'Critical');
          const finishedCases = vesselCases.filter(c => c.status === 'Finished');

          return (
            <div 
              key={v.id} 
              id={`vessel-card-${v.id}`}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="bg-slate-50 text-slate-600 p-2 rounded-lg border border-slate-100">
                      <Ship className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-sans font-bold text-slate-900 uppercase tracking-tight">{v.name}</h3>
                      <p className="text-xs font-mono text-slate-400">IMO: {v.imo || 'Not Registered'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {v.fleet && (
                      <span className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-100">
                        {v.fleet}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVessel(v.id, v.name, vesselCases.length);
                      }}
                      className="rounded-md border border-red-100 bg-red-50 p-1.5 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                      title="Delete vessel"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Counter Statistics bar */}
                <div className="grid grid-cols-3 gap-2 mt-5 py-3 border-y border-slate-100 text-center">
                  <div>
                    <span className="text-2xl font-sans font-bold text-slate-950 block leading-none">
                      {vesselCases.length}
                    </span>
                    <span className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wide">
                      Total Cases
                    </span>
                  </div>
                  <div>
                    <span className="text-2xl font-sans font-bold text-sky-600 block leading-none">
                      {openCases.length}
                    </span>
                    <span className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wide">
                      Active Cases
                    </span>
                  </div>
                  <div>
                    <span className="text-2xl font-sans font-bold text-red-600 block leading-none">
                      {urgentCases.length}
                    </span>
                    <span className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wide">
                      Urgent / Crit
                    </span>
                  </div>
                </div>

                {/* Specific active cases listed */}
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider">Active Case Backlog</h4>
                  
                  {openCases.slice(0, 3).map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => onSelectCase(c.id)}
                      className="p-2 bg-slate-50/50 hover:bg-slate-100/50 rounded-lg border border-slate-100 flex items-center justify-between text-sm cursor-pointer transition-colors"
                      title={c.subject}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-sans font-semibold text-slate-800 truncate">{c.subject}</p>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">Ref: {c.id} • {c.jobType}</p>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-sans font-bold uppercase shrink-0 ${
                        c.status === 'Urgent' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-slate-200/50 text-slate-700 border border-slate-200'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  ))}

                  {openCases.length > 3 && (
                    <p className="text-xs text-slate-400 italic pl-1">
                      + {openCases.length - 3} more active technical issues...
                    </p>
                  )}

                  {openCases.length === 0 && (
                    <p className="text-sm text-slate-400 py-2 italic text-center">No active surveys or issues logged.</p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 text-right">
                <span className="text-xs font-mono text-slate-400">
                  {finishedCases.length} successfully closed cases
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
