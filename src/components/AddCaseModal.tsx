/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Plus, ShieldAlert } from 'lucide-react';
import { Case, Vessel, Port, CaseStatus, CasePriority } from '../types';

interface AddCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCase: (newCase: Omit<Case, 'id' | 'createdDate' | 'lastUpdatedDate' | 'emails' | 'comments'>) => void;
  vessels: Vessel[];
  ports: Port[];
  jobTypes: string[];
  preselectedJobType?: string;
}

export default function AddCaseModal({ 
  isOpen, 
  onClose, 
  onAddCase, 
  vessels, 
  ports, 
  jobTypes,
  preselectedJobType
}: AddCaseModalProps) {
  
  // State for core fields
  const [vesselId, setVesselId] = useState(vessels[0]?.id || '');
  const [portId, setPortId] = useState(ports[0]?.id || '');
  const [jobType, setJobType] = useState(jobTypes[0] || 'Other');
  const [customJobType, setCustomJobType] = useState('');
  const [isCustomJob, setIsCustomJob] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (preselectedJobType) {
        setJobType(preselectedJobType);
        setIsCustomJob(false);
      } else {
        setJobType(jobTypes[0] || 'Other');
      }
    }
  }, [isOpen, preselectedJobType, jobTypes]);
  
  const [subject, setSubject] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('Technical Department');
  const [status, setStatus] = useState<CaseStatus>('In Progress');
  const [priority, setPriority] = useState<CasePriority>('Medium');
  const [details, setDetails] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [deadline, setDeadline] = useState('');

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error
    setValidationError('');

    // Validations
    if (!vesselId) {
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

    const selectedJobType = isCustomJob ? customJobType.trim() : jobType;
    if (!selectedJobType) {
      setValidationError('Please specify or select a job type.');
      return;
    }

    onAddCase({
      vesselId,
      portId,
      jobType: selectedJobType,
      subject: subject.trim(),
      responsiblePerson: responsiblePerson.trim(),
      status,
      priority,
      details: details.trim(),
      nextAction: nextAction.trim(),
      deadline: deadline || undefined,
      
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
    setVesselId(vessels[0]?.id || '');
    setPortId(ports[0]?.id || '');
    setJobType(jobTypes[0] || 'Other');
    setCustomJobType('');
    setIsCustomJob(false);
    setSubject('');
    setResponsiblePerson('Technical Department');
    setStatus('In Progress');
    setPriority('Medium');
    setDetails('');
    setNextAction('');
    setDeadline('');
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
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Quick 30-second entry for vessel surveys and inspections.</p>
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
            
            {/* Vessel Select */}
            <div>
              <label htmlFor="modal-vessel" className="block text-[11px] font-sans font-bold text-slate-700 uppercase tracking-wide mb-1">Vessel <span className="text-red-500">*</span></label>
              <select
                id="modal-vessel"
                value={vesselId}
                onChange={(e) => setVesselId(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                required
              >
                <option value="">-- Select Vessel --</option>
                {vessels.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} {v.imo ? `(IMO ${v.imo})` : ''}</option>
                ))}
              </select>
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
                <select
                  id="modal-job-type"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                  required
                >
                  {jobTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
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

            {/* Deadline / Target Date */}
            <div>
              <label htmlFor="modal-deadline" className="block text-[11px] font-sans font-bold text-slate-700 uppercase tracking-wide mb-1">Target Date / Deadline</label>
              <input
                type="date"
                id="modal-deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
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
                <option value="Urgent">Urgent (Soft Red)</option>
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
