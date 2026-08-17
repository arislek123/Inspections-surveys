/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronDown, ChevronUp, Plus, ShieldAlert } from 'lucide-react';
import { Case, Vessel, Port, PortCall, CaseStatus, CasePriority } from '../types';

interface AddCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCase: (newCase: Omit<Case, 'id' | 'createdDate' | 'lastUpdatedDate' | 'emails' | 'comments'>) => void;
  vessels: Vessel[];
  ports: Port[];
  portCalls: PortCall[];
  jobTypes: string[];
  preselectedJobType?: string;
}

export default function AddCaseModal({ 
  isOpen, 
  onClose, 
  onAddCase, 
  vessels, 
  ports,
  portCalls,
  jobTypes,
  preselectedJobType
}: AddCaseModalProps) {
  
  // State for core fields
  const [vesselId, setVesselId] = useState('');
  const [portId, setPortId] = useState(ports[0]?.id || '');
  const [jobType, setJobType] = useState('');
  const [customJobType, setCustomJobType] = useState('');
  const [isCustomJob, setIsCustomJob] = useState(false);
  const [vesselSearch, setVesselSearch] = useState('');
  const [jobTypeSearch, setJobTypeSearch] = useState('');
  const [showVesselSuggestions, setShowVesselSuggestions] = useState(false);
  const [showJobTypeSuggestions, setShowJobTypeSuggestions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVesselId('');
      setVesselSearch('');
      const nextJobType = preselectedJobType || '';
      setJobType(nextJobType);
      setJobTypeSearch(nextJobType);
      setIsCustomJob(false);
      setShowVesselSuggestions(false);
      setShowJobTypeSuggestions(false);
    }
  }, [isOpen, preselectedJobType]);
  
  const [subject, setSubject] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('Technical Department');
  const [status, setStatus] = useState<CaseStatus>('In Progress');
  const [priority, setPriority] = useState<CasePriority>('Medium');
  const [details, setDetails] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [deadline, setDeadline] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [dateSource, setDateSource] = useState<'manual' | 'portCall'>('manual');
  const [selectedPortCallId, setSelectedPortCallId] = useState('');

  // State for advanced fields
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [agent, setAgent] = useState('');
  const [vendor, setVendor] = useState('');
  const [surveyor, setSurveyor] = useState('');
  const [authority, setAuthority] = useState('');
  const [eta, setEta] = useState('');
  const [etb, setEtb] = useState('');
  const [ets, setEts] = useState('');
  const [attachments, setAttachments] = useState('');
  const [notes, setNotes] = useState('');

  const [validationError, setValidationError] = useState('');

  const getVesselName = (id: string) => vessels.find(v => v.id === id)?.name || 'Unknown Vessel';
  const getPortName = (id: string) => ports.find(p => p.id === id)?.name || 'Unknown Port';
  const formatVesselLabel = (vessel: Vessel) => `${vessel.name}${vessel.imo ? ` (IMO ${vessel.imo})` : ''}`;
  const selectVessel = (vessel: Vessel) => {
    setVesselId(vessel.id);
    setVesselSearch(formatVesselLabel(vessel));
    setShowVesselSuggestions(false);
  };
  const selectJobType = (type: string) => {
    setJobType(type);
    setJobTypeSearch(type);
    setShowJobTypeSuggestions(false);
  };

  const availablePortCalls = portCalls
    .filter(call => !call.archived && (!vesselId || call.vesselId === vesselId))
    .sort((a, b) => (a.etb || a.eta || '').localeCompare(b.etb || b.eta || ''));

  const filteredVessels = useMemo(() => {
    const term = vesselSearch.trim().toLowerCase();
    const sortedVessels = [...vessels].sort((a, b) => a.name.localeCompare(b.name));
    if (!term) return sortedVessels;
    return sortedVessels.filter(v => {
      const searchable = `${formatVesselLabel(v)} ${v.name} ${v.imo || ''} ${v.fleet || ''}`.toLowerCase();
      return searchable.includes(term);
    });
  }, [vessels, vesselSearch]);

  const filteredJobTypes = useMemo(() => {
    const term = jobTypeSearch.trim().toLowerCase();
    const sortedJobTypes = [...jobTypes].sort((a, b) => a.localeCompare(b));
    return !term ? sortedJobTypes : sortedJobTypes.filter(t => t.toLowerCase().includes(term));
  }, [jobTypes, jobTypeSearch]);

  const applyPortCallToCase = (callId: string) => {
    setSelectedPortCallId(callId);
    const call = portCalls.find(pc => pc.id === callId);
    if (!call) return;
    setVesselId(call.vesselId);
    const linkedVessel = vessels.find(v => v.id === call.vesselId);
    if (linkedVessel) setVesselSearch(formatVesselLabel(linkedVessel));
    setPortId(call.portId);
    setDeadline(call.etb || call.eta || '');
    setEta(call.eta || '');
    setEtb(call.etb || '');
    setEts(call.ets || '');
    if (call.agent) setAgent(call.agent);
  };


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error
    setValidationError('');

    // Validations
    const matchedVessel = filteredVessels.length === 1 ? filteredVessels[0] : vessels.find(v => formatVesselLabel(v).toLowerCase() === vesselSearch.trim().toLowerCase() || v.name.toLowerCase() === vesselSearch.trim().toLowerCase());
    const finalVesselId = vesselId || matchedVessel?.id || '';

    if (!finalVesselId) {
      setValidationError('Please select a vessel.');
      return;
    }
    if (!portId) {
      setValidationError('Please select a port.');
      return;
    }
    if (!subject.trim()) {
      setValidationError('Job subject is required.');
      return;
    }
    if (!responsiblePerson.trim()) {
      setValidationError('Responsible person is required.');
      return;
    }
    if (dateSource === 'portCall') {
      const selectedCall = portCalls.find(pc => pc.id === selectedPortCallId);
      if (!selectedCall) {
        setValidationError('Please select a vessel port call or use manual target date.');
        return;
      }
      if (!selectedCall.etb && !selectedCall.eta) {
        setValidationError('Selected port call has no ETB or ETA. Add ETB/ETA in Ports or use manual target date.');
        return;
      }
    }
    if (!deadline) {
      setValidationError('Target date / deadline is required.');
      return;
    }

    const matchedJobType = filteredJobTypes.length === 1 ? filteredJobTypes[0] : jobTypes.find(type => type.toLowerCase() === jobTypeSearch.trim().toLowerCase());
    const selectedJobType = isCustomJob ? customJobType.trim() : (matchedJobType || jobType);
    if (!selectedJobType) {
      setValidationError('Please specify or select a job type.');
      return;
    }

    onAddCase({
      vesselId: finalVesselId,
      portId,
      jobType: selectedJobType,
      subject: subject.trim(),
      responsiblePerson: responsiblePerson.trim(),
      status,
      priority,
      details: details.trim(),
      nextAction: nextAction.trim(),
      deadline,
      poNumber: poNumber.trim(),
      portCallId: dateSource === 'portCall' ? selectedPortCallId : undefined,
      
      // Advanced optional
      agent: agent.trim() || undefined,
      vendor: vendor.trim() || undefined,
      surveyor: surveyor.trim() || undefined,
      authority: authority.trim() || undefined,
      eta: eta || undefined,
      etb: etb || undefined,
      ets: ets || undefined,
      attachments: attachments.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    // Reset and close
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setVesselId('');
    setPortId(ports[0]?.id || '');
    setJobType('');
    setCustomJobType('');
    setIsCustomJob(false);
    setVesselSearch('');
    setJobTypeSearch('');
    setShowVesselSuggestions(false);
    setShowJobTypeSuggestions(false);
    setSubject('');
    setResponsiblePerson('Technical Department');
    setStatus('In Progress');
    setPriority('Medium');
    setDetails('');
    setNextAction('');
    setDeadline('');
    setPoNumber('');
    setDateSource('manual');
    setSelectedPortCallId('');
    setAgent('');
    setVendor('');
    setSurveyor('');
    setAuthority('');
    setEta('');
    setEtb('');
    setEts('');
    setAttachments('');
    setNotes('');
    setShowAdvanced(false);
    setValidationError('');
  };

  const commonSupts = [
    'Technical Department',
    'Assistant Superintendent',
    'Technical Superintendent',
    'Marine Superintendent',
    'Captain / Chief Engineer',
  ];

  return (
    <div id="add-case-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div 
        id="add-case-modal-container"
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-slate-100 overflow-hidden flex flex-col my-8 max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-[#0f172a] px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div>
            <h3 className="text-sm font-sans font-bold tracking-tight uppercase">Log New Technical Case</h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Quick entry for vessel surveys, services and technical follow-up jobs.</p>
          </div>
          <button 
            id="btn-close-case-modal"
            onClick={() => { resetForm(); onClose(); }} 
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {validationError && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg flex items-center space-x-2 text-xs" id="modal-validation-error">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Core Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Vessel Search Select */}
            <div className="relative">
              <label htmlFor="modal-vessel-search" className="block text-[11px] font-sans font-bold text-slate-700 uppercase tracking-wide mb-1">Vessel <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="modal-vessel-search"
                value={vesselSearch}
                onFocus={() => setShowVesselSuggestions(true)}
                onBlur={() => setTimeout(() => setShowVesselSuggestions(false), 120)}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  const currentVessel = vessels.find(v => v.id === vesselId);
                  setVesselSearch(nextValue);
                  setShowVesselSuggestions(true);
                  if (!currentVessel || formatVesselLabel(currentVessel) !== nextValue) setVesselId('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Tab' && filteredVessels.length === 1) {
                    event.preventDefault();
                    selectVessel(filteredVessels[0]);
                    setTimeout(() => document.getElementById('modal-port')?.focus(), 0);
                  }
                  if (event.key === 'Enter' && filteredVessels.length > 0) {
                    event.preventDefault();
                    selectVessel(filteredVessels[0]);
                  }
                }}
                placeholder="Search vessel"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-sans text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                autoComplete="off"
                required
              />
              {showVesselSuggestions && filteredVessels.length > 0 && (
                <div className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                  {filteredVessels.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        selectVessel(v);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs font-sans hover:bg-sky-50 transition-colors ${vesselId === v.id ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700'}`}
                    >
                      <span className="block">{v.name}</span>
                      {v.imo && <span className="block text-[10px] text-slate-400 font-mono">IMO {v.imo}</span>}
                    </button>
                  ))}
                </div>
              )}
              {showVesselSuggestions && vesselSearch.trim() && filteredVessels.length === 1 && (
                <p className="text-[10px] text-slate-400 mt-1">Press Tab to select {filteredVessels[0].name}</p>
              )}
              {vesselSearch.trim() && !vesselId && filteredVessels.length === 0 && (
                <p className="text-[11px] text-red-500 mt-1">No vessel found.</p>
              )}
            </div>

            {/* Port Select */}
            <div>
              <label htmlFor="modal-port" className="block text-[11px] font-sans font-bold text-slate-700 uppercase tracking-wide mb-1">Port <span className="text-red-500">*</span></label>
              <select
                id="modal-port"
                value={portId}
                onChange={(e) => setPortId(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                required
              >
                <option value="">-- Select Port --</option>
                {ports.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.country})</option>
                ))}
              </select>
            </div>

            {/* Job Type Selector */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-sans font-bold text-slate-700 uppercase tracking-wide">Job Type <span className="text-red-500">*</span></label>
                <button
                  type="button"
                  id="btn-toggle-custom-job"
                  onClick={() => setIsCustomJob(!isCustomJob)}
                  className="text-[10px] text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
                >
                  {isCustomJob ? 'Select from predefined list' : '+ Add custom job type'}
                </button>
              </div>

              {isCustomJob ? (
                <input
                  type="text"
                  id="modal-custom-job"
                  value={customJobType}
                  onChange={(e) => setCustomJobType(e.target.value)}
                  placeholder="Enter custom job type (e.g. Scrubber overhaul)"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                  required
                />
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    id="modal-job-type-search"
                    value={jobTypeSearch}
                    onFocus={() => setShowJobTypeSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowJobTypeSuggestions(false), 120)}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setJobTypeSearch(nextValue);
                      setShowJobTypeSuggestions(true);
                      if (jobType !== nextValue) setJobType('');
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Tab' && filteredJobTypes.length === 1) {
                        event.preventDefault();
                        selectJobType(filteredJobTypes[0]);
                        setTimeout(() => document.getElementById('modal-subject')?.focus(), 0);
                      }
                      if (event.key === 'Enter' && filteredJobTypes.length > 0) {
                        event.preventDefault();
                        selectJobType(filteredJobTypes[0]);
                      }
                    }}
                    placeholder="Search job type"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-sans text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                    autoComplete="off"
                    required
                  />
                  {showJobTypeSuggestions && filteredJobTypes.length > 0 && (
                    <div className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                      {filteredJobTypes.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            selectJobType(t);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs font-sans hover:bg-sky-50 transition-colors ${jobType === t ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                  {showJobTypeSuggestions && jobTypeSearch.trim() && filteredJobTypes.length === 1 && (
                    <p className="text-[10px] text-slate-400 mt-1">Press Tab to select {filteredJobTypes[0]}</p>
                  )}
                  {jobTypeSearch.trim() && !jobType && filteredJobTypes.length === 0 && (
                    <p className="text-[11px] text-slate-400 mt-1">No matching job type. Use + Add custom job type.</p>
                  )}
                </div>
              )}
            </div>

            {/* Subject of Job */}
            <div className="md:col-span-2">
              <label htmlFor="modal-subject" className="block text-[11px] font-sans font-bold text-slate-700 uppercase tracking-wide mb-1">Subject of Job <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="modal-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Intermediate Class Survey / BWTS Sensor Recalibration"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                required
              />
            </div>

            {/* Responsible Person */}
            <div>
              <label htmlFor="modal-responsible" className="block text-[11px] font-sans font-bold text-slate-700 uppercase tracking-wide mb-1">Responsible Person <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="modal-responsible"
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                list="supts-list"
                placeholder="Name of Superintendent"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                required
              />
              <datalist id="supts-list">
                {commonSupts.map(supt => (
                  <option key={supt} value={supt} />
                ))}
              </datalist>
            </div>

            {/* Date Source */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-sans font-bold text-slate-700 uppercase tracking-wide mb-1">Target Date Source</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setDateSource('manual'); setSelectedPortCallId(''); }}
                  className={`border rounded-lg px-3 py-2 text-xs font-bold text-left ${dateSource === 'manual' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                >
                  Manual fixed date
                </button>
                <button
                  type="button"
                  onClick={() => setDateSource('portCall')}
                  className={`border rounded-lg px-3 py-2 text-xs font-bold text-left ${dateSource === 'portCall' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                >
                  From vessel port call ETA / ETB
                </button>
              </div>
            </div>

            {dateSource === 'portCall' && (
              <div className="md:col-span-2">
                <label htmlFor="modal-port-call" className="block text-[11px] font-sans font-bold text-slate-700 uppercase tracking-wide mb-1">Select Scheduled Port Call <span className="text-red-500">*</span></label>
                <select
                  id="modal-port-call"
                  value={selectedPortCallId}
                  onChange={(e) => applyPortCallToCase(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                >
                  <option value="">Select vessel call</option>
                  {availablePortCalls.map(call => (
                    <option key={call.id} value={call.id}>
                      {getVesselName(call.vesselId)} → {getPortName(call.portId)} | Target: {call.etb || call.eta || 'No ETA/ETB'} | ETB: {call.etb || '-'} | ETA: {call.eta || '-'} | Agent: {call.agent || '-'}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">Linked jobs automatically use ETB when available; if ETB is empty, ETA is used.</p>
              </div>
            )}

            {/* Deadline / Target Date */}
            <div>
              <label htmlFor="modal-deadline" className="block text-[11px] font-sans font-bold text-slate-700 uppercase tracking-wide mb-1">Target Date / Deadline <span className="text-red-500">*</span></label>
              <input
                type="date"
                id="modal-deadline"
                value={deadline}
                onChange={(e) => { setDeadline(e.target.value); if (dateSource === 'portCall') setDateSource('manual'); }}
                disabled={dateSource === 'portCall'}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all disabled:bg-slate-100 disabled:text-slate-500"
                required
              />
            </div>

            {/* PO Number */}
            <div>
              <label htmlFor="modal-po-number" className="block text-[11px] font-sans font-bold text-slate-700 uppercase tracking-wide mb-1">PO Number</label>
              <input
                type="text"
                id="modal-po-number"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="Optional, e.g. PO-7030-S260006"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="modal-status" className="block text-[11px] font-sans font-bold text-slate-700 uppercase tracking-wide mb-1">Status</label>
              <select
                id="modal-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as CaseStatus)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
              >
                <option value="In Progress">In Progress (Soft Blue)</option>
                <option value="Awaiting Reply">Awaiting Reply (Soft Amber)</option>
                <option value="Postponed">Postponed (Soft Grey)</option>
                <option value="Postponed but Reopened">Postponed but Reopened (Soft Purple/Orange)</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="modal-priority" className="block text-[11px] font-sans font-bold text-slate-700 uppercase tracking-wide mb-1">Priority Level</label>
              <select
                id="modal-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as CasePriority)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical / Immediate</option>
              </select>
            </div>

            {/* Next Action */}
            <div className="md:col-span-2">
              <label htmlFor="modal-next-action" className="block text-[11px] font-sans font-bold text-slate-700 uppercase tracking-wide mb-1">Immediate Next Action</label>
              <input
                type="text"
                id="modal-next-action"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="What needs to happen next? (e.g. Request quote from maker)"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>

            {/* Short Details */}
            <div className="md:col-span-2">
              <label htmlFor="modal-details" className="block text-[11px] font-sans font-bold text-slate-700 uppercase tracking-wide mb-1">Case Background / Scope of Work</label>
              <textarea
                id="modal-details"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what needs to be checked, serviced or inspected. Include technical problems, parts, or compliance needs..."
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg p-3 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Advanced / Optional Accordion */}
          <div className="border border-slate-100 rounded-lg overflow-hidden animate-fadeIn" id="modal-advanced-accordion">
            <button
              type="button"
              id="btn-toggle-advanced"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full bg-slate-50/50 hover:bg-slate-50 px-4 py-3 text-xs font-sans font-bold text-slate-700 flex items-center justify-between transition-colors border-b border-slate-100 cursor-pointer"
            >
              <span>{showAdvanced ? 'Hide Logistics & Surveyor Info' : 'Show Logistics & Surveyor Info (Agent, Vendor, Class, ETA/ETB/ETS)'}</span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showAdvanced && (
              <div className="p-4 bg-white space-y-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                {/* Agent */}
                <div className="md:col-span-1">
                  <label htmlFor="modal-agent" className="block text-[10px] font-sans font-bold text-slate-600 uppercase tracking-wide mb-1">Local Port Agent</label>
                  <input
                    type="text"
                    id="modal-agent"
                    value={agent}
                    onChange={(e) => setAgent(e.target.value)}
                    placeholder="e.g. GAC Singapore"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* Vendor / Service Company */}
                <div>
                  <label htmlFor="modal-vendor" className="block text-[10px] font-sans font-bold text-slate-600 uppercase tracking-wide mb-1">Service Vendor / Maker</label>
                  <input
                    type="text"
                    id="modal-vendor"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="e.g. Wartsila SGP"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* Surveyor / Inspector */}
                <div>
                  <label htmlFor="modal-surveyor" className="block text-[10px] font-sans font-bold text-slate-600 uppercase tracking-wide mb-1">Individual Surveyor / Inspector</label>
                  <input
                    type="text"
                    id="modal-surveyor"
                    value={surveyor}
                    onChange={(e) => setSurveyor(e.target.value)}
                    placeholder="e.g. Mr. S. Alvez (BV)"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* Class / Flag Involved */}
                <div>
                  <label htmlFor="modal-authority" className="block text-[10px] font-sans font-bold text-slate-600 uppercase tracking-wide mb-1">Authority Involved (Class, Flag, Port)</label>
                  <input
                    type="text"
                    id="modal-authority"
                    value={authority}
                    onChange={(e) => setAuthority(e.target.value)}
                    placeholder="e.g. ABS / Marshall Islands Flag"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* ETA */}
                <div>
                  <label htmlFor="modal-eta" className="block text-[10px] font-sans font-bold text-slate-600 uppercase tracking-wide mb-1">Estimated Time of Arrival (ETA)</label>
                  <input
                    type="datetime-local"
                    id="modal-eta"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* ETB */}
                <div>
                  <label htmlFor="modal-etb" className="block text-[10px] font-sans font-bold text-slate-600 uppercase tracking-wide mb-1">Estimated Time of Berthing (ETB)</label>
                  <input
                    type="datetime-local"
                    id="modal-etb"
                    value={etb}
                    onChange={(e) => setEtb(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* ETS */}
                <div>
                  <label htmlFor="modal-ets" className="block text-[10px] font-sans font-bold text-slate-600 uppercase tracking-wide mb-1">Estimated Time of Sailing (ETS)</label>
                  <input
                    type="datetime-local"
                    id="modal-ets"
                    value={ets}
                    onChange={(e) => setEts(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* Document References / Attachments list */}
                <div>
                  <label htmlFor="modal-attachments" className="block text-[10px] font-sans font-bold text-slate-600 uppercase tracking-wide mb-1">Document References / Attachment Names</label>
                  <input
                    type="text"
                    id="modal-attachments"
                    value={attachments}
                    onChange={(e) => setAttachments(e.target.value)}
                    placeholder="e.g. manual_revisions_v3.pdf, dnv_survey_list.xlsx"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* Additional Notes */}
                <div className="md:col-span-2">
                  <label htmlFor="modal-notes" className="block text-[10px] font-sans font-bold text-slate-600 uppercase tracking-wide mb-1">Internal Logistical Notes</label>
                  <textarea
                    id="modal-notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any other private logistical notes or instructions..."
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2.5 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              id="btn-cancel-modal"
              onClick={() => { resetForm(); onClose(); }}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-modal"
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-all flex items-center space-x-1 cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Log Technical Case</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
