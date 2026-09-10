/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { MapPin, Plus, Trash2, Edit3, Archive, RotateCcw, Eye, Ship, CalendarDays } from 'lucide-react';
import { Port, Case, Vessel, PortCall } from '../types';

interface PortsViewProps {
  ports: Port[];
  vessels: Vessel[];
  cases: Case[];
  portCalls: PortCall[];
  onAddPort: (name: string, country: string) => void;
  onUpdatePort: (port: Port) => void;
  onArchivePort: (portId: string, archived: boolean) => void;
  onDeletePort: (portId: string) => void;
  onAddPortCall: (portCall: Omit<PortCall, 'id'>) => void;
  onUpdatePortCall: (portCall: PortCall) => void;
  onDeletePortCall: (portCallId: string) => void;
  onSelectCase: (caseId: string) => void;
}

const emptyPortForm = { name: '', country: '' };
const emptyCallForm = { vesselId: '', portId: '', eta: '', etb: '', ets: '', agent: '' };

export default function PortsView({
  ports,
  vessels,
  cases,
  portCalls,
  onAddPort,
  onUpdatePort,
  onArchivePort,
  onDeletePort,
  onAddPortCall,
  onUpdatePortCall,
  onDeletePortCall,
  onSelectCase,
}: PortsViewProps) {
  const [showAddPortForm, setShowAddPortForm] = useState(false);
  const [showAddCallForm, setShowAddCallForm] = useState(false);
  const [portForm, setPortForm] = useState(emptyPortForm);
  const [callForm, setCallForm] = useState(emptyCallForm);
  const [callVesselSearch, setCallVesselSearch] = useState('');
  const [callPortSearch, setCallPortSearch] = useState('');
  const [showCallVesselSuggestions, setShowCallVesselSuggestions] = useState(false);
  const [showCallPortSuggestions, setShowCallPortSuggestions] = useState(false);
  const [dateInputKey, setDateInputKey] = useState(0);
  const [editingPortId, setEditingPortId] = useState<string | null>(null);
  const [editingCallId, setEditingCallId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [callScope, setCallScope] = useState<'operational' | 'history'>('operational');
  const [portListMode, setPortListMode] = useState<'withCalls' | 'all'>('withCalls');

  const getVesselName = (vesselId: string) => vessels.find(v => v.id === vesselId)?.name || 'Unknown Vessel';
  const getPortName = (portId: string) => ports.find(p => p.id === portId)?.name || 'Unknown Port';
  const formatVesselLabel = (vessel: Vessel) => `${vessel.name}${vessel.imo ? ` (IMO ${vessel.imo})` : ''}`;
  const formatPortLabel = (port: Port) => `${port.name}${port.country ? ` (${port.country})` : ''}`;
  const selectCallVessel = (vessel: Vessel) => {
    setCallForm(prev => ({ ...prev, vesselId: vessel.id }));
    setCallVesselSearch(formatVesselLabel(vessel));
    setShowCallVesselSuggestions(false);
  };
  const selectCallPort = (port: Port) => {
    setCallForm(prev => ({ ...prev, portId: port.id }));
    setCallPortSearch(formatPortLabel(port));
    setShowCallPortSuggestions(false);
  };
  const toLocalDateInput = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const todayDateValue = toLocalDateInput(new Date());

  const activeVessels = vessels.filter(v => !v.archived);
  const activePorts = ports.filter(p => !p.archived);

  const filteredCallVessels = useMemo(() => {
    const term = callVesselSearch.trim().toLowerCase();
    const sorted = [...activeVessels].sort((a, b) => a.name.localeCompare(b.name));
    if (!term) return sorted;
    return sorted.filter(v => `${formatVesselLabel(v)} ${v.name} ${v.imo || ''} ${v.fleet || ''}`.toLowerCase().includes(term));
  }, [activeVessels, callVesselSearch]);

  const filteredCallPorts = useMemo(() => {
    const term = callPortSearch.trim().toLowerCase();
    const sorted = [...activePorts].sort((a, b) => a.name.localeCompare(b.name));
    if (!term) return sorted;
    return sorted.filter(p => `${formatPortLabel(p)} ${p.name} ${p.country || ''}`.toLowerCase().includes(term));
  }, [activePorts, callPortSearch]);

  const isPortCallInOperationalWindow = (call: PortCall) => {
    const dateValue = call.etb || call.eta || call.ets;
    if (!dateValue) return false;
    const date = new Date(`${dateValue}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const earliest = new Date(today);
    earliest.setDate(today.getDate() - 30);
    return date.getTime() >= earliest.getTime();
  };

  const isVisiblePortCall = (call: PortCall) => {
    if (callScope === 'history') return true;
    return isPortCallInOperationalWindow(call);
  };

  const visiblePorts = useMemo(
    () => ports
      .filter(p => showArchived || !p.archived)
      .filter(p => portListMode === 'all' || portCalls.some(pc => pc.portId === p.id && (showArchived || !pc.archived) && isVisiblePortCall(pc)))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [ports, portCalls, showArchived, portListMode, callScope]
  );

  const isOpenJob = (c: Case) => c.status !== 'Finished' && c.status !== 'Postponed';
  const scrollToForm = (targetId: string) => {
    window.setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const resetPortForm = () => {
    setPortForm(emptyPortForm);
    setEditingPortId(null);
    setValidationError('');
  };

  const resetCallForm = () => {
    setCallForm(emptyCallForm);
    setCallVesselSearch('');
    setCallPortSearch('');
    setShowCallVesselSuggestions(false);
    setShowCallPortSuggestions(false);
    setDateInputKey(prev => prev + 1);
    setEditingCallId(null);
    setValidationError('');
  };

  const getPortMetrics = (portId: string) => {
    const portCases = cases.filter(c => c.portId === portId);
    const openCases = portCases.filter(isOpenJob);
    const criticalCases = openCases.filter(c => c.priority === 'Critical');
    const latestCase = [...openCases].sort((a, b) => new Date(b.lastUpdatedDate).getTime() - new Date(a.lastUpdatedDate).getTime())[0];
    const calls = portCalls
      .filter(pc => pc.portId === portId && (showArchived || !pc.archived) && isVisiblePortCall(pc))
      .sort((a, b) => (a.etb || a.eta || a.ets || '').localeCompare(b.etb || b.eta || b.ets || ''));
    return { portCases, openCases, criticalCases, latestCase, calls };
  };

  const handlePortSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!portForm.name.trim()) {
      setValidationError('Port name is required.');
      return;
    }
    if (!portForm.country.trim()) {
      setValidationError('Port country is required.');
      return;
    }

    const duplicate = ports.some(p =>
      p.id !== editingPortId &&
      p.name.trim().toLowerCase() === portForm.name.trim().toLowerCase() &&
      p.country.trim().toLowerCase() === portForm.country.trim().toLowerCase()
    );
    if (duplicate) {
      setValidationError('A port with this name/country already exists.');
      return;
    }

    if (editingPortId) {
      const existing = ports.find(p => p.id === editingPortId);
      if (!existing) return;
      onUpdatePort({
        ...existing,
        name: portForm.name.trim(),
        country: portForm.country.trim(),
      });
    } else {
      onAddPort(portForm.name.trim(), portForm.country.trim());
    }

    resetPortForm();
    setShowAddPortForm(false);
  };

  const handleCallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const matchedVessel = callForm.vesselId
      ? vessels.find(v => v.id === callForm.vesselId)
      : (filteredCallVessels.length === 1 ? filteredCallVessels[0] : vessels.find(v => formatVesselLabel(v).toLowerCase() === callVesselSearch.trim().toLowerCase() || v.name.toLowerCase() === callVesselSearch.trim().toLowerCase()));
    const matchedPort = callForm.portId
      ? ports.find(p => p.id === callForm.portId)
      : (filteredCallPorts.length === 1 ? filteredCallPorts[0] : ports.find(p => formatPortLabel(p).toLowerCase() === callPortSearch.trim().toLowerCase() || p.name.toLowerCase() === callPortSearch.trim().toLowerCase()));

    if (!matchedVessel) {
      setValidationError('Vessel is required for a port call.');
      return;
    }
    if (!matchedPort) {
      setValidationError('Port is required for a port call.');
      return;
    }

    const payload = {
      vesselId: matchedVessel.id,
      portId: matchedPort.id,
      eta: callForm.eta || '',
      etb: callForm.etb || '',
      ets: callForm.ets || '',
      agent: callForm.agent.trim(),
      archived: false,
    };

    if (editingCallId) {
      onUpdatePortCall({ ...payload, id: editingCallId });
    } else {
      onAddPortCall(payload);
    }

    resetCallForm();
    setShowAddCallForm(false);
  };

  const handleStartEditPort = (port: Port) => {
    setEditingPortId(port.id);
    setPortForm({ name: port.name || '', country: port.country || '' });
    setShowAddPortForm(true);
    setShowAddCallForm(false);
    scrollToForm('port-edit-form');
  };

  const handleStartEditCall = (call: PortCall) => {
    setEditingCallId(call.id);
    setCallForm({
      vesselId: call.vesselId || '',
      portId: call.portId || '',
      eta: call.eta || '',
      etb: call.etb || '',
      ets: call.ets || '',
      agent: call.agent || '',
    });
    const linkedVessel = vessels.find(v => v.id === call.vesselId);
    const linkedPort = ports.find(p => p.id === call.portId);
    setCallVesselSearch(linkedVessel ? formatVesselLabel(linkedVessel) : '');
    setCallPortSearch(linkedPort ? formatPortLabel(linkedPort) : '');
    setDateInputKey(prev => prev + 1);
    setShowAddCallForm(true);
    setShowAddPortForm(false);
    scrollToForm('port-call-edit-form');
  };

  const handleDeletePort = (portId: string, portName: string, linkedCasesCount: number, linkedCallsCount: number) => {
    const message = linkedCasesCount > 0 || linkedCallsCount > 0
      ? `Delete ${portName}? ${linkedCasesCount} linked case(s) will become unassigned and ${linkedCallsCount} port call(s) will be removed. Continue?`
      : `Delete ${portName}? This cannot be undone.`;

    if (window.confirm(message)) onDeletePort(portId);
  };

  const handleDeleteCall = (call: PortCall) => {
    const linkedCasesCount = cases.filter(c => c.portCallId === call.id).length;
    const message = linkedCasesCount > 0
      ? `Delete this port call? ${linkedCasesCount} linked job(s) will keep their current date, but will no longer auto-update from this call.`
      : 'Delete this port call?';
    if (window.confirm(message)) onDeletePortCall(call.id);
  };

  const formatDate = (value?: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB') : '-';

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 md:p-8" id="ports-view-container">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-3 border-b border-slate-100 pb-5" id="ports-header">
        <div>
          <h2 className="text-lg font-sans font-bold text-slate-900 tracking-tight">Port Calls Registry</h2>
          <p className="text-sm text-slate-500 mt-1">Manage ports and planned vessel calls. Linked jobs auto-update from port-call ETB/ETA.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-1 rounded-xl bg-white border border-slate-200 shadow-sm p-1" title="Operational window means last 30 days plus all upcoming port calls">
            <span className="hidden xl:inline px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Window</span>
            <button
              type="button"
              onClick={() => setCallScope('operational')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${callScope === 'operational' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Operational
            </button>
            <button
              type="button"
              onClick={() => setCallScope('history')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${callScope === 'history' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              History
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-white border border-slate-200 shadow-sm p-1" title="Filter the port list">
            <span className="hidden xl:inline px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Ports</span>
            <button
              type="button"
              onClick={() => setPortListMode('withCalls')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${portListMode === 'withCalls' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              title="Show only ports with calls in the selected window"
            >
              With Calls
            </button>
            <button
              type="button"
              onClick={() => setPortListMode('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${portListMode === 'all' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              All Ports
            </button>
          </div>


          <button
            type="button"
            onClick={() => { resetCallForm(); setShowAddCallForm(!showAddCallForm); setShowAddPortForm(false); }}
            className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Ship className="h-4 w-4" />
            <span>Add Vessel Call</span>
          </button>
          <button
            type="button"
            id="btn-toggle-add-port"
            onClick={() => { resetPortForm(); setShowAddPortForm(!showAddPortForm); setShowAddCallForm(false); }}
            className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Port</span>
          </button>
        </div>
      </div>

      {(showAddPortForm || showAddCallForm) && validationError && (
        <p className="text-sm text-red-600 mb-3 bg-red-50 p-2 rounded border border-red-100">{validationError}</p>
      )}

      {showAddPortForm && (
        <form id="port-edit-form" onSubmit={handlePortSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6 max-w-3xl animate-fadeIn">
          <h3 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider mb-4">{editingPortId ? 'Edit Port' : 'Register New Port'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Port Name *</label>
              <input type="text" value={portForm.name} onChange={(e) => setPortForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500" required />
            </div>
            <div>
              <label className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Country *</label>
              <input type="text" value={portForm.country} onChange={(e) => setPortForm(prev => ({ ...prev, country: e.target.value }))} className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500" required />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => { resetPortForm(); setShowAddPortForm(false); }} className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg font-medium">Cancel</button>
            <button type="submit" className="px-4 py-1.5 text-sm bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg cursor-pointer shadow-sm">{editingPortId ? 'Save Port Changes' : 'Save Port'}</button>
          </div>
        </form>
      )}

      {showAddCallForm && (
        <form id="port-call-edit-form" onSubmit={handleCallSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6 max-w-6xl animate-fadeIn">
          <h3 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider mb-4">{editingCallId ? 'Edit Vessel Port Call' : 'Add Vessel Port Call'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div className="relative">
              <label className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Vessel *</label>
              <input
                type="text"
                value={callVesselSearch}
                onFocus={() => setShowCallVesselSuggestions(true)}
                onBlur={() => setTimeout(() => setShowCallVesselSuggestions(false), 120)}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  const currentVessel = vessels.find(v => v.id === callForm.vesselId);
                  setCallVesselSearch(nextValue);
                  setShowCallVesselSuggestions(true);
                  if (!currentVessel || formatVesselLabel(currentVessel) !== nextValue) setCallForm(prev => ({ ...prev, vesselId: '' }));
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Tab' && filteredCallVessels.length === 1) {
                    event.preventDefault();
                    selectCallVessel(filteredCallVessels[0]);
                  }
                  if (event.key === 'Enter' && filteredCallVessels.length > 0) {
                    event.preventDefault();
                    selectCallVessel(filteredCallVessels[0]);
                  }
                }}
                placeholder="Search vessel"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                autoComplete="off"
                required
              />
              {showCallVesselSuggestions && filteredCallVessels.length > 0 && (
                <div className="absolute z-40 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                  {filteredCallVessels.map(v => (
                    <button key={v.id} type="button" onMouseDown={(event) => { event.preventDefault(); selectCallVessel(v); }} className={`w-full px-3 py-2 text-left text-xs hover:bg-sky-50 ${callForm.vesselId === v.id ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700'}`}>
                      <span className="block">{v.name}</span>
                      {v.imo && <span className="block text-[10px] text-slate-400 font-mono">IMO {v.imo}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <label className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Port *</label>
              <input
                type="text"
                value={callPortSearch}
                onFocus={() => setShowCallPortSuggestions(true)}
                onBlur={() => setTimeout(() => setShowCallPortSuggestions(false), 120)}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  const currentPort = ports.find(p => p.id === callForm.portId);
                  setCallPortSearch(nextValue);
                  setShowCallPortSuggestions(true);
                  if (!currentPort || formatPortLabel(currentPort) !== nextValue) setCallForm(prev => ({ ...prev, portId: '' }));
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Tab' && filteredCallPorts.length === 1) {
                    event.preventDefault();
                    selectCallPort(filteredCallPorts[0]);
                  }
                  if (event.key === 'Enter' && filteredCallPorts.length > 0) {
                    event.preventDefault();
                    selectCallPort(filteredCallPorts[0]);
                  }
                }}
                placeholder="Search port"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                autoComplete="off"
                required
              />
              {showCallPortSuggestions && filteredCallPorts.length > 0 && (
                <div className="absolute z-40 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                  {filteredCallPorts.map(p => (
                    <button key={p.id} type="button" onMouseDown={(event) => { event.preventDefault(); selectCallPort(p); }} className={`w-full px-3 py-2 text-left text-xs hover:bg-sky-50 ${callForm.portId === p.id ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700'}`}>
                      <span className="block">{p.name}</span>
                      {p.country && <span className="block text-[10px] text-slate-400 font-mono">{p.country}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between"><label className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide">ETA</label><button type="button" onClick={() => setCallForm(prev => ({ ...prev, eta: todayDateValue }))} className="text-[10px] font-bold text-sky-600 hover:text-sky-800">Today</button></div>
              <input key={`eta-${dateInputKey}`} type="date" value={callForm.eta} onChange={(e) => setCallForm(prev => ({ ...prev, eta: e.target.value }))} className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between"><label className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide">ETB</label><button type="button" onClick={() => setCallForm(prev => ({ ...prev, etb: todayDateValue }))} className="text-[10px] font-bold text-sky-600 hover:text-sky-800">Today</button></div>
              <input key={`etb-${dateInputKey}`} type="date" value={callForm.etb} onChange={(e) => setCallForm(prev => ({ ...prev, etb: e.target.value }))} className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between"><label className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide">ETS</label><button type="button" onClick={() => setCallForm(prev => ({ ...prev, ets: todayDateValue }))} className="text-[10px] font-bold text-sky-600 hover:text-sky-800">Today</button></div>
              <input key={`ets-${dateInputKey}`} type="date" value={callForm.ets} onChange={(e) => setCallForm(prev => ({ ...prev, ets: e.target.value }))} className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Agent</label>
              <input type="text" value={callForm.agent} onChange={(e) => setCallForm(prev => ({ ...prev, agent: e.target.value }))} placeholder="Agent name" className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4">Linked jobs use ETB when available; if ETB is empty, ETA is used. New date fields are cleared every time you add a call, so the picker opens on the current month.</p>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => { resetCallForm(); setShowAddCallForm(false); }} className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg font-medium">Cancel</button>
            <button type="submit" className="px-4 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer shadow-sm">{editingCallId ? 'Save Port Call' : 'Add Port Call'}</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {visiblePorts.map((p) => {
          const metrics = getPortMetrics(p.id);
          return (
            <div key={p.id} className={`bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden ${p.archived ? 'opacity-60' : ''}`}>
              <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 text-slate-600 p-2 rounded-lg border border-slate-100"><MapPin className="h-4 w-4" /></div>
                  <div>
                    <p className="font-bold text-slate-900 uppercase">{p.name}</p>
                    <p className="text-xs font-mono text-slate-400">{p.country}</p>
                  </div>
                  {p.archived && <span className="text-[10px] bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-bold uppercase">Archived</span>}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-sky-700">{metrics.openCases.length} open case(s)</span>
                  <span className="font-bold text-red-600">{metrics.criticalCases.length} critical</span>
                  <div className="flex justify-end items-center gap-1.5">
                    {metrics.latestCase && <button type="button" onClick={() => onSelectCase(metrics.latestCase.id)} className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded" title="Open latest case"><Eye className="h-4 w-4" /></button>}
                    <button type="button" onClick={() => handleStartEditPort(p)} className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded" title="Edit port"><Edit3 className="h-4 w-4" /></button>
                    <button type="button" onClick={() => onArchivePort(p.id, !p.archived)} className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded" title={p.archived ? 'Restore port' : 'Archive port'}>{p.archived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}</button>
                    <button type="button" onClick={() => handleDeletePort(p.id, p.name, metrics.portCases.length, metrics.calls.length)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete port"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="h-4 w-4 text-sky-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Planned Vessel Calls</h3>
                </div>

                {metrics.calls.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-slate-100">
                    <table className="w-full text-left min-w-[760px]">
                      <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-2">Vessel</th>
                          <th className="px-4 py-2">ETA</th>
                          <th className="px-4 py-2">ETB</th>
                          <th className="px-4 py-2">ETS</th>
                          <th className="px-4 py-2">Agent</th>
                          <th className="px-4 py-2">Linked Jobs</th>
                          <th className="px-4 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {metrics.calls.map(call => {
                          const linkedJobs = cases.filter(c => c.portCallId === call.id && (callScope === 'history' || isOpenJob(c)));
                          return (
                            <tr key={call.id} className="hover:bg-slate-50">
                              <td className="px-4 py-2 font-bold text-slate-900">{getVesselName(call.vesselId)}</td>
                              <td className="px-4 py-2 font-mono text-slate-600">{formatDate(call.eta)}</td>
                              <td className="px-4 py-2 font-mono text-sky-700 font-bold">{formatDate(call.etb)}</td>
                              <td className="px-4 py-2 font-mono text-slate-600">{formatDate(call.ets)}</td>
                              <td className="px-4 py-2 text-slate-600">{call.agent || '-'}</td>
                              <td className="px-4 py-2">
                                {linkedJobs.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    {linkedJobs.slice(0, 3).map(job => (
                                      <button key={job.id} onClick={() => onSelectCase(job.id)} className="text-left text-sky-700 hover:text-sky-900 truncate max-w-[250px]">
                                        {job.subject}
                                      </button>
                                    ))}
                                    {linkedJobs.length > 3 && <span className="text-slate-400">+{linkedJobs.length - 3} more</span>}
                                  </div>
                                ) : <span className="text-slate-300">No linked jobs</span>}
                              </td>
                              <td className="px-4 py-2 text-right">
                                <button type="button" onClick={() => handleStartEditCall(call)} className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded" title="Edit call"><Edit3 className="h-4 w-4 inline" /></button>
                                <button type="button" onClick={() => handleDeleteCall(call)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete call"><Trash2 className="h-4 w-4 inline" /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">No vessel calls in the selected operational window.</p>
                )}
              </div>
            </div>
          );
        })}

        {visiblePorts.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-12 text-center text-slate-400">No ports registered yet.</div>
        )}
      </div>
    </div>
  );
}
