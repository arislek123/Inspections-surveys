/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { MapPin, Plus, Trash2, Edit3, Archive, RotateCcw, Eye } from 'lucide-react';
import { Port, Case } from '../types';

interface PortsViewProps {
  ports: Port[];
  cases: Case[];
  onAddPort: (name: string, country: string, eta?: string, etb?: string, ets?: string) => void;
  onUpdatePort: (port: Port) => void;
  onArchivePort: (portId: string, archived: boolean) => void;
  onDeletePort: (portId: string) => void;
  onSelectCase: (caseId: string) => void;
}

const emptyPortForm = { name: '', country: '', eta: '', etb: '', ets: '' };

export default function PortsView({
  ports,
  cases,
  onAddPort,
  onUpdatePort,
  onArchivePort,
  onDeletePort,
  onSelectCase,
}: PortsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyPortForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [validationError, setValidationError] = useState('');

  const visiblePorts = useMemo(
    () => ports.filter(p => showArchived || !p.archived).sort((a, b) => a.name.localeCompare(b.name)),
    [ports, showArchived]
  );

  const resetForm = () => {
    setForm(emptyPortForm);
    setEditingId(null);
    setValidationError('');
  };

  const getPortMetrics = (portId: string) => {
    const portCases = cases.filter(c => c.portId === portId);
    const openCases = portCases.filter(c => c.status !== 'Finished' && c.status !== 'Postponed');
    const criticalCases = portCases.filter(c => c.priority === 'Critical' || c.status === 'Urgent');
    const latestCase = [...portCases].sort((a, b) => new Date(b.lastUpdatedDate).getTime() - new Date(a.lastUpdatedDate).getTime())[0];
    return { portCases, openCases, criticalCases, latestCase };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!form.name.trim()) {
      setValidationError('Port name is required.');
      return;
    }
    if (!form.country.trim()) {
      setValidationError('Port country is required.');
      return;
    }

    const duplicate = ports.some(p =>
      p.id !== editingId &&
      p.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
      p.country.trim().toLowerCase() === form.country.trim().toLowerCase()
    );
    if (duplicate) {
      setValidationError('A port with this name/country already exists.');
      return;
    }

    if (editingId) {
      const existing = ports.find(p => p.id === editingId);
      if (!existing) return;
      onUpdatePort({
        ...existing,
        name: form.name.trim(),
        country: form.country.trim(),
        eta: form.eta.trim(),
        etb: form.etb.trim(),
        ets: form.ets.trim(),
      });
    } else {
      onAddPort(form.name.trim(), form.country.trim(), form.eta.trim(), form.etb.trim(), form.ets.trim());
    }

    resetForm();
    setShowAddForm(false);
  };

  const handleStartEdit = (port: Port) => {
    setEditingId(port.id);
    setForm({
      name: port.name || '',
      country: port.country || '',
      eta: port.eta || '',
      etb: port.etb || '',
      ets: port.ets || '',
    });
    setShowAddForm(true);
  };

  const handleDeletePort = (portId: string, portName: string, linkedCasesCount: number) => {
    const message = linkedCasesCount > 0
      ? `Delete ${portName}? ${linkedCasesCount} linked case(s) will remain, but will become unassigned from this port. Continue?`
      : `Delete ${portName}? This cannot be undone.`;

    if (window.confirm(message)) {
      onDeletePort(portId);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 md:p-8" id="ports-view-container">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-3 border-b border-slate-100 pb-5" id="ports-header">
        <div>
          <h2 className="text-lg font-sans font-bold text-slate-900 tracking-tight">Port Calls Registry</h2>
          <p className="text-sm text-slate-500 mt-1">Manage ports, planned attendance dates and linked technical cases.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-1.5 text-sm border font-semibold rounded-lg shadow-sm ${showArchived ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
          <button
            type="button"
            id="btn-toggle-add-port"
            onClick={() => { resetForm(); setShowAddForm(!showAddForm); }}
            className="px-4 py-1.5 text-sm bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Port</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6 max-w-4xl animate-fadeIn" id="add-port-form">
          <h3 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider mb-4">{editingId ? 'Edit Port Call' : 'Register New Port Location'}</h3>
          {validationError && <p className="text-sm text-red-600 mb-3 bg-red-50 p-2 rounded">{validationError}</p>}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label htmlFor="port-name-input" className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Port Name *</label>
              <input type="text" id="port-name-input" placeholder="e.g. Santos" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500" required />
            </div>
            <div>
              <label htmlFor="port-country-input" className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Country *</label>
              <input type="text" id="port-country-input" placeholder="e.g. Brazil" value={form.country} onChange={(e) => setForm(prev => ({ ...prev, country: e.target.value }))} className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500" required />
            </div>
            <div>
              <label htmlFor="port-eta-input" className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">ETA</label>
              <input type="date" id="port-eta-input" value={form.eta} onChange={(e) => setForm(prev => ({ ...prev, eta: e.target.value }))} className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
            </div>
            <div>
              <label htmlFor="port-etb-input" className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">ETB</label>
              <input type="date" id="port-etb-input" value={form.etb} onChange={(e) => setForm(prev => ({ ...prev, etb: e.target.value }))} className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
            </div>
            <div>
              <label htmlFor="port-ets-input" className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">ETS</label>
              <input type="date" id="port-ets-input" value={form.ets} onChange={(e) => setForm(prev => ({ ...prev, ets: e.target.value }))} className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => { resetForm(); setShowAddForm(false); }} className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg font-medium transition-all">Cancel</button>
            <button type="submit" id="btn-save-port" className="px-4 py-1.5 text-sm bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg cursor-pointer shadow-sm transition-all">{editingId ? 'Save Port Changes' : 'Save Port'}</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden" id="ports-table-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[760px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-sans font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Port</th>
                <th className="px-5 py-3">Open Cases</th>
                <th className="px-5 py-3">Critical</th>
                <th className="px-5 py-3">Latest Case</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {visiblePorts.map((p) => {
                const metrics = getPortMetrics(p.id);
                return (
                  <tr key={p.id} className={`${p.archived ? 'bg-slate-50 text-slate-400' : 'hover:bg-slate-50/70'} transition-colors`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-slate-50 text-slate-600 p-2 rounded-lg border border-slate-100"><MapPin className="h-4 w-4" /></div>
                        <div>
                          <p className="font-bold text-slate-900 uppercase">{p.name}</p>
                          <p className="text-xs font-mono text-slate-400">{p.country}</p>
                          {p.archived && <span className="text-[10px] bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-bold uppercase">Archived</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-bold text-sky-700">{metrics.openCases.length}</td>
                    <td className="px-5 py-3 font-bold text-red-600">{metrics.criticalCases.length}</td>
                    <td className="px-5 py-3">
                      {metrics.latestCase ? (
                        <button type="button" onClick={() => onSelectCase(metrics.latestCase.id)} className="text-left text-sky-700 hover:text-sky-900">
                          <span className="font-semibold block truncate max-w-[320px]">{metrics.latestCase.subject}</span>
                          <span className="text-xs text-slate-400 font-mono">{metrics.latestCase.id}</span>
                        </button>
                      ) : <span className="text-slate-300">No cases scheduled</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        {metrics.latestCase && <button type="button" onClick={() => onSelectCase(metrics.latestCase.id)} className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded" title="Open latest case"><Eye className="h-4 w-4" /></button>}
                        <button type="button" onClick={() => handleStartEdit(p)} className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded" title="Edit port"><Edit3 className="h-4 w-4" /></button>
                        <button type="button" onClick={() => onArchivePort(p.id, !p.archived)} className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded" title={p.archived ? 'Restore port' : 'Archive port'}>{p.archived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}</button>
                        <button type="button" onClick={() => handleDeletePort(p.id, p.name, metrics.portCases.length)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete port"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visiblePorts.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">No ports registered yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
