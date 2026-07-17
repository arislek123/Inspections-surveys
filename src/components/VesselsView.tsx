/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Ship, Plus, Trash2, Edit3, Archive, RotateCcw, LayoutGrid, Table2, Eye } from 'lucide-react';
import { Vessel, Case, Port } from '../types';

interface VesselsViewProps {
  vessels: Vessel[];
  cases: Case[];
  ports: Port[];
  onAddVessel: (name: string, imo?: string, fleet?: string) => void;
  onUpdateVessel: (vessel: Vessel) => void;
  onArchiveVessel: (vesselId: string, archived: boolean) => void;
  onDeleteVessel: (vesselId: string) => void;
  onSelectCase: (caseId: string) => void;
}

const emptyForm = { name: '', imo: '', fleet: '' };

export default function VesselsView({
  vessels,
  cases,
  ports,
  onAddVessel,
  onUpdateVessel,
  onArchiveVessel,
  onDeleteVessel,
  onSelectCase,
}: VesselsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showArchived, setShowArchived] = useState(false);

  const visibleVessels = useMemo(
    () => vessels.filter(v => showArchived || !v.archived).sort((a, b) => a.name.localeCompare(b.name)),
    [vessels, showArchived]
  );

  const getPortName = (portId: string) => ports.find(p => p.id === portId)?.name || 'Unassigned port';

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setValidationError('');
  };

  const getVesselMetrics = (vesselId: string) => {
    const vesselCases = cases.filter(c => c.vesselId === vesselId);
    const openCases = vesselCases.filter(c => c.status !== 'Finished' && c.status !== 'Postponed');
    const criticalCases = vesselCases.filter(c => c.priority === 'Critical' || c.status === 'Urgent');
    const sortedByUpdate = [...vesselCases].sort(
      (a, b) => new Date(b.lastUpdatedDate).getTime() - new Date(a.lastUpdatedDate).getTime()
    );
    const sortedByDate = [...openCases].sort((a, b) => {
      const aDate = a.deadline || a.etb || a.eta || a.lastUpdatedDate;
      const bDate = b.deadline || b.etb || b.eta || b.lastUpdatedDate;
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    });
    const nextCase = sortedByDate[0];
    return {
      vesselCases,
      openCases,
      criticalCases,
      nextCase,
      latestCase: sortedByUpdate[0],
      latestUpdate: sortedByUpdate[0]?.lastUpdatedDate,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!form.name.trim()) {
      setValidationError('Vessel name is required.');
      return;
    }

    const duplicate = vessels.some(v =>
      v.id !== editingId &&
      v.name.trim().toLowerCase() === form.name.trim().toLowerCase()
    );
    if (duplicate) {
      setValidationError('A vessel with this name already exists.');
      return;
    }

    if (editingId) {
      const existing = vessels.find(v => v.id === editingId);
      if (!existing) return;
      onUpdateVessel({
        ...existing,
        name: form.name.trim(),
        imo: form.imo.trim(),
        fleet: form.fleet.trim(),
      });
    } else {
      onAddVessel(form.name.trim(), form.imo.trim(), form.fleet.trim());
    }

    resetForm();
    setShowAddForm(false);
  };

  const handleStartEdit = (vessel: Vessel) => {
    setEditingId(vessel.id);
    setForm({ name: vessel.name || '', imo: vessel.imo || '', fleet: vessel.fleet || '' });
    setShowAddForm(true);
  };

  const handleDeleteVessel = (vesselId: string, vesselName: string, linkedCasesCount: number) => {
    const message = linkedCasesCount > 0
      ? `Delete ${vesselName}? ${linkedCasesCount} linked case(s) will remain, but will become unassigned from this vessel. Continue?`
      : `Delete ${vesselName}? This cannot be undone.`;

    if (window.confirm(message)) {
      onDeleteVessel(vesselId);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 md:p-8" id="vessels-view-container">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-3 border-b border-slate-100 pb-5" id="vessels-header">
        <div>
          <h2 className="text-lg font-sans font-bold text-slate-900 tracking-tight">Ship Fleet Registry</h2>
          <p className="text-sm text-slate-500 mt-1">Compact fleet list with open cases, urgent items, next attendance and latest update.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            className="px-3 py-1.5 text-sm bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1.5 shadow-sm hover:bg-slate-50"
          >
            {viewMode === 'table' ? <LayoutGrid className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
            <span>{viewMode === 'table' ? 'Card View' : 'Table View'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-1.5 text-sm border font-semibold rounded-lg shadow-sm ${showArchived ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
          <button
            type="button"
            id="btn-toggle-add-vessel"
            onClick={() => { resetForm(); setShowAddForm(!showAddForm); }}
            className="px-4 py-1.5 text-sm bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Vessel</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6 max-w-3xl animate-fadeIn" id="add-vessel-form">
          <h3 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider mb-4">{editingId ? 'Edit Vessel' : 'Register New Fleet Vessel'}</h3>
          {validationError && (
            <p className="text-sm text-red-600 mb-3 bg-red-50 p-2 rounded">{validationError}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="vessel-name-input" className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Vessel Name *</label>
              <input
                type="text"
                id="vessel-name-input"
                placeholder="e.g. M/V STEFANOS"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label htmlFor="vessel-imo-input" className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">IMO Number</label>
              <input
                type="text"
                id="vessel-imo-input"
                placeholder="e.g. 9428574"
                value={form.imo}
                onChange={(e) => setForm(prev => ({ ...prev, imo: e.target.value }))}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
              />
            </div>
            <div>
              <label htmlFor="vessel-fleet-input" className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Fleet / Group</label>
              <input
                type="text"
                id="vessel-fleet-input"
                placeholder="e.g. Bulk Carrier Fleet A"
                value={form.fleet}
                onChange={(e) => setForm(prev => ({ ...prev, fleet: e.target.value }))}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => { resetForm(); setShowAddForm(false); }} className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg font-medium transition-all">
              Cancel
            </button>
            <button type="submit" id="btn-save-vessel" className="px-4 py-1.5 text-sm bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg cursor-pointer shadow-sm transition-all">
              {editingId ? 'Save Vessel Changes' : 'Save Vessel'}
            </button>
          </div>
        </form>
      )}

      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden" id="vessels-table-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-sans font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Vessel</th>
                  <th className="px-5 py-3">Open Cases</th>
                  <th className="px-5 py-3">Critical</th>
                  <th className="px-5 py-3">Next Port</th>
                  <th className="px-5 py-3">Next Attendance</th>
                  <th className="px-5 py-3">Latest Update</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {visibleVessels.map((v) => {
                  const metrics = getVesselMetrics(v.id);
                  const nextCase = metrics.nextCase;
                  const latestCase = metrics.latestCase;
                  return (
                    <tr key={v.id} className={`${v.archived ? 'bg-slate-50 text-slate-400' : 'hover:bg-slate-50/70'} transition-colors`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-slate-50 text-slate-600 p-2 rounded-lg border border-slate-100">
                            <Ship className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 uppercase">{v.name}</p>
                            <p className="text-xs font-mono text-slate-400">IMO: {v.imo || 'Not Registered'} {v.fleet ? `• ${v.fleet}` : ''}</p>
                            {v.archived && <span className="text-[10px] bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-bold uppercase">Archived</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-bold text-sky-700">{metrics.openCases.length}</td>
                      <td className="px-5 py-3 font-bold text-red-600">{metrics.criticalCases.length}</td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-700">{nextCase?.portId ? getPortName(nextCase.portId) : '—'}</p>
                        <p className="text-xs text-slate-400">{nextCase?.subject || 'No active case'}</p>
                      </td>
                      <td className="px-5 py-3">
                        {nextCase ? (
                          <button type="button" onClick={() => onSelectCase(nextCase.id)} className="text-left text-sky-700 hover:text-sky-900 font-semibold">
                            {nextCase.deadline || nextCase.etb || nextCase.eta || 'Open case'}
                            <span className="block text-xs text-slate-400 font-normal truncate max-w-[220px]">{nextCase.jobType}</span>
                          </button>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-500">
                        {metrics.latestUpdate ? new Date(metrics.latestUpdate).toLocaleDateString() : '—'}
                        {latestCase && <button type="button" onClick={() => onSelectCase(latestCase.id)} className="ml-2 text-sky-600 hover:text-sky-800 font-bold">View</button>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          {nextCase && (
                            <button type="button" onClick={() => onSelectCase(nextCase.id)} className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded" title="Open next case"><Eye className="h-4 w-4" /></button>
                          )}
                          <button type="button" onClick={() => handleStartEdit(v)} className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded" title="Edit vessel"><Edit3 className="h-4 w-4" /></button>
                          <button type="button" onClick={() => onArchiveVessel(v.id, !v.archived)} className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded" title={v.archived ? 'Restore vessel' : 'Archive vessel'}>{v.archived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}</button>
                          <button type="button" onClick={() => handleDeleteVessel(v.id, v.name, metrics.vesselCases.length)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete vessel"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visibleVessels.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">No vessels registered yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="vessels-card-grid">
          {visibleVessels.map((v) => {
            const metrics = getVesselMetrics(v.id);
            return (
              <div key={v.id} id={`vessel-card-${v.id}`} className={`bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between ${v.archived ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="bg-slate-50 text-slate-600 p-2 rounded-lg border border-slate-100"><Ship className="h-5 w-5" /></div>
                    <div className="min-w-0">
                      <h3 className="text-base font-sans font-bold text-slate-900 uppercase tracking-tight truncate">{v.name}</h3>
                      <p className="text-xs font-mono text-slate-400">IMO: {v.imo || 'Not Registered'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => handleStartEdit(v)} className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded" title="Edit vessel"><Edit3 className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => onArchiveVessel(v.id, !v.archived)} className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded" title={v.archived ? 'Restore vessel' : 'Archive vessel'}>{v.archived ? <RotateCcw className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}</button>
                    <button type="button" onClick={() => handleDeleteVessel(v.id, v.name, metrics.vesselCases.length)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete vessel"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-5 py-3 border-y border-slate-100 text-center">
                  <div><span className="text-2xl font-bold text-slate-950 block">{metrics.vesselCases.length}</span><span className="text-[10px] font-bold text-slate-400 uppercase">Total</span></div>
                  <div><span className="text-2xl font-bold text-sky-600 block">{metrics.openCases.length}</span><span className="text-[10px] font-bold text-slate-400 uppercase">Open</span></div>
                  <div><span className="text-2xl font-bold text-red-600 block">{metrics.criticalCases.length}</span><span className="text-[10px] font-bold text-slate-400 uppercase">Critical</span></div>
                </div>
                <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
                  {metrics.vesselCases
                    .sort((a, b) => new Date(b.lastUpdatedDate).getTime() - new Date(a.lastUpdatedDate).getTime())
                    .map((c) => (
                    <button key={c.id} type="button" onClick={() => onSelectCase(c.id)} className="w-full p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-800 truncate text-sm">{c.subject}</p>
                        <span className="text-[10px] shrink-0 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 font-bold">{getPortName(c.portId)}</span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">{c.id} • {c.status} • PO: {c.poNumber || 'MISSING'}</p>
                    </button>
                  ))}
                  {metrics.vesselCases.length === 0 && <p className="text-sm text-slate-400 py-3 italic text-center">No surveys or issues logged.</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
