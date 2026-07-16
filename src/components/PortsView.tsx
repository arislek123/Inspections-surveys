/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Plus, Anchor, Compass, CheckCircle2 } from 'lucide-react';
import { Port, Case } from '../types';

interface PortsViewProps {
  ports: Port[];
  cases: Case[];
  onAddPort: (name: string, country: string, eta?: string, etb?: string, ets?: string) => void;
  onSelectCase: (caseId: string) => void;
}

export default function PortsView({ ports, cases, onAddPort, onSelectCase }: PortsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [eta, setEta] = useState('');
  const [etb, setEtb] = useState('');
  const [ets, setEts] = useState('');

  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Port name is required.');
      return;
    }
    if (!country.trim()) {
      setValidationError('Port country is required.');
      return;
    }

    onAddPort(
      name.trim(), 
      country.trim(), 
      eta || undefined, 
      etb || undefined, 
      ets || undefined
    );
    
    // Reset
    setName('');
    setCountry('');
    setEta('');
    setEtb('');
    setEts('');
    setShowAddForm(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 md:p-8" id="ports-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-3 sm:space-y-0 border-b border-slate-100 pb-5" id="ports-header">
        <div>
          <h2 className="text-lg font-sans font-bold text-slate-900 tracking-tight">Ports of Call Registry</h2>
          <p className="text-sm text-slate-500 mt-1">Manage maritime ports of attendance and inspect what technical cases are scheduled in each location.</p>
        </div>
        <button
          type="button"
          id="btn-toggle-add-port"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-1.5 text-sm bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Port</span>
        </button>
      </div>

      {/* Add Port Form (Collapsible) */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-8 max-w-xl animate-fadeIn" id="add-port-form">
          <h3 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider mb-4">Register New Port Location</h3>
          {validationError && (
            <p className="text-sm text-red-600 mb-3 bg-red-50 p-2 rounded">{validationError}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="port-name-input" className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Port Name *</label>
              <input
                type="text"
                id="port-name-input"
                placeholder="e.g. Santos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label htmlFor="port-country-input" className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Country *</label>
              <input
                type="text"
                id="port-country-input"
                placeholder="e.g. Brazil"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                required
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
              id="btn-save-port"
              className="px-4 py-1.5 text-sm bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg cursor-pointer shadow-sm transition-all"
            >
              Save Port
            </button>
          </div>
        </form>
      )}

      {/* Grid of Ports */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="ports-card-grid">
        {ports.map((p) => {
          const portCases = cases.filter(c => c.portId === p.id);
          const openCases = portCases.filter(c => c.status !== 'Finished');
          const urgentCases = portCases.filter(c => c.status === 'Urgent' || c.priority === 'Critical');

          return (
            <div 
              key={p.id} 
              id={`port-card-${p.id}`}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="bg-slate-50 text-slate-600 p-2 rounded-lg border border-slate-100">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-sans font-bold text-slate-900 uppercase tracking-tight">{p.name}</h3>
                      <p className="text-xs font-mono text-slate-400">{p.country}</p>
                    </div>
                  </div>
                  <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded text-[11px] font-mono font-bold border border-sky-100">
                    {openCases.length} active
                  </span>
                </div>

                {/* Counter Statistics bar */}
                <div className="grid grid-cols-2 gap-2 mt-5 py-3 border-y border-slate-100 text-center">
                  <div>
                    <span className="text-2xl font-sans font-bold text-slate-950 block leading-none">
                      {portCases.length}
                    </span>
                    <span className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wide">
                      Total Cases At Port
                    </span>
                  </div>
                  <div>
                    <span className="text-2xl font-sans font-bold text-red-600 block leading-none">
                      {urgentCases.length}
                    </span>
                    <span className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wide">
                      Urgent At Port
                    </span>
                  </div>
                </div>

                {/* Specific active cases listed */}
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider">Cases Scheduled</h4>
                  
                  {portCases.map((c) => (
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
                        c.status === 'Urgent' ? 'bg-red-50 text-red-700 border border-red-100' : 
                        c.status === 'Finished' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        'bg-slate-200/50 text-slate-700 border border-slate-200'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  ))}

                  {portCases.length === 0 && (
                    <p className="text-xs text-slate-400 py-2 italic text-center">No cases scheduled at this port.</p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 text-right">
                <span className="text-[9px] font-mono text-slate-400">
                  Attendance coordination with local agency required.
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
