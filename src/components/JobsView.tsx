/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { FileText, Plus, Trash2, Edit3, Check, X, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Case, Vessel, Port } from '../types';

interface JobsViewProps {
  jobTypes: string[];
  cases: Case[];
  vessels: Vessel[];
  ports: Port[];
  onAddJobType: (type: string) => void;
  onDeleteJobType: (type: string) => void;
  onUpdateJobType: (oldType: string, newType: string) => void;
  onSelectCase: (caseId: string) => void;
  onOpenQuickAdd: (preselectedJobType?: string) => void;
  onDeleteCase: (caseId: string) => void;
}

export default function JobsView({
  jobTypes,
  cases,
  vessels,
  ports,
  onAddJobType,
  onDeleteJobType,
  onUpdateJobType,
  onSelectCase,
  onOpenQuickAdd,
  onDeleteCase,
}: JobsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [editingTypeName, setEditingTypeName] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState('');
  const [validationError, setValidationError] = useState('');
  const [confirmingDeleteType, setConfirmingDeleteType] = useState<string | null>(null);
  const [confirmingDeleteCase, setConfirmingDeleteCase] = useState<string | null>(null);

  const getVesselName = (id: string) => vessels.find(v => v.id === id)?.name || 'Unknown Vessel';
  const getPortName = (id: string) => ports.find(p => p.id === id)?.name || 'Unknown Port';

  const handleExportExcel = () => {
    // 1. Prepare Cases Sheet Data
    const casesData = cases.map(c => ({
      'Case ID': c.id,
      'Vessel Name': getVesselName(c.vesselId),
      'Port Name': getPortName(c.portId),
      'Job Type / Category': c.jobType,
      'Subject': c.subject,
      'Responsible Person': c.responsiblePerson,
      'Status': c.status,
      'Priority': c.priority,
      'Created Date': c.createdDate ? new Date(c.createdDate).toLocaleDateString() : 'N/A',
      'Last Updated Date': c.lastUpdatedDate ? new Date(c.lastUpdatedDate).toLocaleDateString() : 'N/A',
      'Deadline': c.deadline || 'N/A',
      'Next Action Description': c.nextAction || '',
      'Next Action Responsible': c.nextActionResponsible || '',
      'Next Action Due Date': c.nextActionDueDate || '',
      'Next Action Reminder': c.nextActionReminder || '',
      'Port Agent': c.agent || '',
      'Vendor/Service Maker': c.vendor || '',
      'Surveyor': c.surveyor || '',
      'Class/Authority': c.authority || '',
      'Detailed Description': c.details || '',
      'Additional Notes': c.notes || ''
    }));

    // 2. Prepare Jobs/Job Categories Sheet Data
    const jobsData = jobTypes.map(type => {
      const associatedCases = cases.filter(c => c.jobType === type);
      const urgentCount = associatedCases.filter(c => c.status === 'Urgent' || c.priority === 'Critical').length;
      const completedCount = associatedCases.filter(c => c.status === 'Finished').length;
      const activeCount = associatedCases.length - completedCount;

      return {
        'Job Category Name': type,
        'Total Logged Cases': associatedCases.length,
        'Active Cases': activeCount,
        'Urgent / Critical Cases': urgentCount,
        'Completed/Closed Cases': completedCount
      };
    });

    // Create workbook & sheets
    const wb = XLSX.utils.book_new();
    const wsCases = XLSX.utils.json_to_sheet(casesData);
    const wsJobs = XLSX.utils.json_to_sheet(jobsData);

    // Set column widths for Cases sheet
    const maxW_cases = [
      { wch: 15 }, // Case ID
      { wch: 20 }, // Vessel Name
      { wch: 15 }, // Port Name
      { wch: 25 }, // Job Type
      { wch: 40 }, // Subject
      { wch: 25 }, // Responsible Person
      { wch: 15 }, // Status
      { wch: 12 }, // Priority
      { wch: 15 }, // Created Date
      { wch: 15 }, // Last Updated Date
      { wch: 12 }, // Deadline
      { wch: 40 }, // Next Action Description
      { wch: 20 }, // Next Action Responsible
      { wch: 15 }, // Next Action Due Date
      { wch: 25 }, // Next Action Reminder
      { wch: 20 }, // Port Agent
      { wch: 20 }, // Vendor
      { wch: 15 }, // Surveyor
      { wch: 15 }, // Class
      { wch: 50 }, // Detailed Description
      { wch: 30 }  // Additional Notes
    ];
    wsCases['!cols'] = maxW_cases;

    // Set column widths for Jobs sheet
    const maxW_jobs = [
      { wch: 30 }, // Job Category Name
      { wch: 20 }, // Total Logged Cases
      { wch: 22 }, // Active Cases
      { wch: 22 }, // Urgent / Critical Cases
      { wch: 22 }  // Completed/Closed Cases
    ];
    wsJobs['!cols'] = maxW_jobs;

    XLSX.utils.book_append_sheet(wb, wsCases, 'Technical Cases');
    XLSX.utils.book_append_sheet(wb, wsJobs, 'Job Categories Summary');

    // Write file and trigger browser download
    XLSX.writeFile(wb, `Maritime_TechOps_Jobs_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const cleanName = newTypeName.trim();
    if (!cleanName) {
      setValidationError('Job Type name is required.');
      return;
    }

    if (jobTypes.some((t) => t.toLowerCase() === cleanName.toLowerCase())) {
      setValidationError('This Job Type already exists.');
      return;
    }

    onAddJobType(cleanName);
    setNewTypeName('');
    setShowAddForm(false);
  };

  const handleStartEditing = (type: string) => {
    setEditingTypeName(type);
    setEditedValue(type);
  };

  const handleSaveEdit = (oldType: string) => {
    const cleanEdited = editedValue.trim();
    if (!cleanEdited) return;

    if (cleanEdited.toLowerCase() === oldType.toLowerCase()) {
      setEditingTypeName(null);
      return;
    }

    if (
      jobTypes.some(
        (t) => t.toLowerCase() === cleanEdited.toLowerCase() && t !== oldType
      )
    ) {
      alert('A job type with this name already exists.');
      return;
    }

    onUpdateJobType(oldType, cleanEdited);
    setEditingTypeName(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 md:p-8" id="jobs-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-3 sm:space-y-0 border-b border-slate-100 pb-5" id="jobs-header">
        <div>
          <h2 className="text-lg font-sans font-bold text-slate-900 tracking-tight">Jobs & Job Categories</h2>
          <p className="text-sm text-slate-500 mt-1">Manage technical inspect jobs, edit or register job types, and view job backlog metrics.</p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            id="btn-export-jobs-excel"
            onClick={handleExportExcel}
            className="px-4 py-1.5 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            title="Export cases and categories list to Excel"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export to Excel</span>
          </button>
          <button
            type="button"
            id="btn-toggle-add-jobtype"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-1.5 text-sm bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Job Type</span>
          </button>
        </div>
      </div>

      {/* Add Job Type Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-8 max-w-xl animate-fadeIn" id="add-jobtype-form">
          <h3 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider mb-4">Create New Job Type</h3>
          {validationError && (
            <p className="text-sm text-red-600 mb-3 bg-red-50 p-2 rounded">{validationError}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 items-end mb-4">
            <div className="flex-1">
              <label htmlFor="jobtype-name-input" className="block text-xs font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Job Type Name *</label>
              <input
                type="text"
                id="jobtype-name-input"
                placeholder="e.g. Main Engine Decarbonization"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
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
              id="btn-save-jobtype"
              className="px-4 py-1.5 text-sm bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg cursor-pointer shadow-sm transition-all"
            >
              Save Job Type
            </button>
          </div>
        </form>
      )}

      {/* Grid of Job Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="jobs-card-grid">
        {jobTypes.map((type) => {
          const associatedCases = cases.filter((c) => c.jobType === type);
          const openCases = associatedCases.filter((c) => c.status !== 'Finished');
          const finishedCases = associatedCases.filter((c) => c.status === 'Finished');
          const urgentCases = associatedCases.filter(
            (c) => c.status === 'Urgent' || c.priority === 'Critical'
          );

          const isEditing = editingTypeName === type;

          return (
            <div
              key={type}
              id={`jobtype-card-${type.replace(/\s+/g, '-')}`}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    <div className="bg-slate-50 text-slate-600 p-2 rounded-lg border border-slate-100 shrink-0">
                      <FileText className="h-5 w-5 text-sky-600" />
                    </div>
                    {isEditing ? (
                      <div className="flex items-center gap-1 w-full">
                        <input
                          type="text"
                          value={editedValue}
                          onChange={(e) => setEditedValue(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <button
                          onClick={() => handleSaveEdit(type)}
                          className="p-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingTypeName(null)}
                          className="p-1 bg-slate-50 text-slate-400 border border-slate-100 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="min-w-0">
                        <h3 className="text-sm font-sans font-bold text-slate-900 tracking-tight truncate group hover:text-clip hover:whitespace-normal" title={type}>
                          {type}
                        </h3>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
                          Job Category
                        </p>
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      {confirmingDeleteType === type ? (
                        <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded border border-red-100 animate-fadeIn shrink-0">
                          <span className="text-[10px] font-sans font-bold text-red-700 uppercase">Delete Category?</span>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteJobType(type);
                              setConfirmingDeleteType(null);
                            }}
                            className="text-[10px] bg-red-600 hover:bg-red-700 text-white font-bold px-1.5 py-0.5 rounded cursor-pointer transition-all shrink-0"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingDeleteType(null)}
                            className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-1.5 py-0.5 rounded cursor-pointer transition-all shrink-0"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEditing(type)}
                            className="text-slate-400 hover:text-sky-600 p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Edit Job Type Name"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteType(type)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Delete Job Type"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Counter Statistics Bar */}
                <div className="grid grid-cols-3 gap-2 mt-5 py-3 border-y border-slate-100 text-center">
                  <div>
                    <span className="text-xl font-sans font-bold text-slate-950 block leading-none">
                      {associatedCases.length}
                    </span>
                    <span className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wide">
                      Total Jobs
                    </span>
                  </div>
                  <div>
                    <span className="text-xl font-sans font-bold text-sky-600 block leading-none">
                      {openCases.length}
                    </span>
                    <span className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wide">
                      Active
                    </span>
                  </div>
                  <div>
                    <span className="text-xl font-sans font-bold text-red-600 block leading-none">
                      {urgentCases.length}
                    </span>
                    <span className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wide">
                      Urgent
                    </span>
                  </div>
                </div>

                {/* Specific active cases of this type listed */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider">Associated Cases</h4>
                    <button
                      onClick={() => onOpenQuickAdd(type)}
                      className="text-[10px] text-sky-600 hover:text-sky-700 font-bold hover:underline cursor-pointer"
                    >
                      + Add Case
                    </button>
                  </div>

                  {openCases.slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => onSelectCase(c.id)}
                      className="p-2 bg-slate-50/50 hover:bg-slate-100/50 rounded-lg border border-slate-100 flex items-center justify-between text-sm cursor-pointer transition-colors group/case"
                      title={c.subject}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-sans font-semibold text-slate-800 text-xs truncate">
                          {c.subject}
                        </p>
                        <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                          Ref: {c.id}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {confirmingDeleteCase === c.id ? (
                          <div className="flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 animate-fadeIn shrink-0">
                            <span className="text-[9px] font-sans font-bold text-red-700 uppercase">Delete?</span>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteCase(c.id);
                                setConfirmingDeleteCase(null);
                              }}
                              className="text-[9px] bg-red-600 hover:bg-red-700 text-white font-bold px-1 py-0.2 rounded cursor-pointer transition-all shrink-0"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingDeleteCase(null)}
                              className="text-[9px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-1 py-0.2 rounded cursor-pointer transition-all shrink-0"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-sans font-bold uppercase ${
                                c.status === 'Urgent'
                                  ? 'bg-red-50 text-red-700 border border-red-100'
                                  : 'bg-slate-200/50 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {c.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => setConfirmingDeleteCase(c.id)}
                              className="text-slate-400 hover:text-red-600 p-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Delete Case"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {openCases.length > 3 && (
                    <p className="text-[10px] text-slate-400 italic pl-1">
                      + {openCases.length - 3} more active jobs...
                    </p>
                  )}

                  {openCases.length === 0 && (
                    <p className="text-xs text-slate-400 py-2 italic text-center">
                      No active cases logged for this category.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  {finishedCases.length} closed
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
