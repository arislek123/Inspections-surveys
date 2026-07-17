/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Settings, Plus, Trash2, Download, Upload, RefreshCw, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { Case, Vessel, Port } from '../types';

interface SettingsViewProps {
  jobTypes: string[];
  onAddJobType: (type: string) => void;
  onDeleteJobType: (type: string) => void;
  onImportFullDatabase: (data: { cases: Case[]; vessels: Vessel[]; ports: Port[]; jobTypes: string[] }) => void;
  onClearDatabase: () => void;
  cases: Case[];
  vessels: Vessel[];
  ports: Port[];
}

export default function SettingsView({ 
  jobTypes, 
  onAddJobType, 
  onDeleteJobType, 
  onImportFullDatabase,
  onClearDatabase,
  cases,
  vessels,
  ports
}: SettingsViewProps) {
  
  const [newType, setNewType] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState<any | null>(null);
  const [confirmClearDatabase, setConfirmClearDatabase] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanType = newType.trim();
    if (!cleanType) return;
    
    if (jobTypes.some(t => t.toLowerCase() === cleanType.toLowerCase())) {
      triggerError('This job type already exists.');
      return;
    }

    onAddJobType(cleanType);
    setNewType('');
    triggerSuccess('Job type added successfully.');
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Excel Export (Cases and Job Categories)
  const handleExportExcel = () => {
    const getVesselName = (id: string) => vessels.find(v => v.id === id)?.name || 'Unknown Vessel';
    const getPortName = (id: string) => ports.find(p => p.id === id)?.name || 'Unknown Port';

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
      const criticalCount = associatedCases.filter(c => c.priority === 'Critical' || c.status === 'Urgent').length;
      const completedCount = associatedCases.filter(c => c.status === 'Finished').length;
      const activeCount = associatedCases.length - completedCount;

      return {
        'Job Category Name': type,
        'Total Logged Cases': associatedCases.length,
        'Active Cases': activeCount,
        'Critical Priority Cases': criticalCount,
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
      { wch: 22 }, // Critical Priority Cases
      { wch: 22 }  // Completed/Closed Cases
    ];
    wsJobs['!cols'] = maxW_jobs;

    XLSX.utils.book_append_sheet(wb, wsCases, 'Technical Cases');
    XLSX.utils.book_append_sheet(wb, wsJobs, 'Job Categories Summary');

    // Write file and trigger browser download
    XLSX.writeFile(wb, `Maritime_TechOps_Database_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    triggerSuccess('Full database exported to Excel successfully!');
  };

  // Full Database JSON Backup Export
  const handleFullBackupExport = () => {
    const fullState = {
      cases,
      vessels,
      ports,
      jobTypes,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const jsonString = JSON.stringify(fullState, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Maritime_TechOps_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerSuccess('Full system state backup downloaded.');
  };

  // Full Database JSON Restore Import
  const handleFullBackupRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const parsed = JSON.parse(result);
          
          if (parsed.cases && parsed.vessels && parsed.ports && parsed.jobTypes) {
            setShowImportConfirm({
              cases: parsed.cases,
              vessels: parsed.vessels,
              ports: parsed.ports,
              jobTypes: parsed.jobTypes
            });
          } else {
            triggerError('Error: This file is not a valid Maritime TechOps backup. Missing core components.');
          }
        }
      } catch (err) {
        triggerError('Failed to parse the backup JSON file.');
      }
    };
    fileReader.readAsText(files[0]);
    e.target.value = ''; // Reset
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 md:p-8" id="settings-view-container">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 mb-8" id="settings-header">
        <h2 className="text-base font-sans font-bold text-slate-900 tracking-tight">System Parameters & Database Administration</h2>
        <p className="text-xs text-slate-500 mt-1">Configure custom inspect job categories, manage database backups, and maintain local application state.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-lg flex items-center space-x-2 text-xs mb-6 animate-fadeIn" id="settings-toast">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-100 text-red-800 p-3.5 rounded-lg flex items-center space-x-2 text-xs mb-6 animate-fadeIn" id="settings-error-toast">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {showImportConfirm && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl mb-6 animate-fadeIn" id="import-confirm-box">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-sans font-bold text-amber-800 uppercase">Confirm Backup Overwrite</h4>
              <p className="text-xs text-amber-700 mt-1">
                Are you sure you want to completely OVERWRITE your current database with the loaded backup containing:{' '}
                <strong className="text-amber-900">{showImportConfirm.cases.length} cases</strong>,{' '}
                <strong className="text-amber-900">{showImportConfirm.vessels.length} vessels</strong>, and{' '}
                <strong className="text-amber-900">{showImportConfirm.ports.length} ports</strong>? Your current changes will be overwritten.
              </p>
              <div className="flex items-center space-x-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    onImportFullDatabase(showImportConfirm);
                    setShowImportConfirm(null);
                    triggerSuccess('Full database restored successfully!');
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-sans font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition-colors"
                >
                  Yes, Import & Overwrite
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportConfirm(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-sans font-bold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="settings-content-grid">
        
        {/* PANEL 1: Job Types Configuration (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-sans font-bold text-slate-800 mb-2">Predefined Job Category Types</h3>
            <p className="text-xs text-slate-500 mb-4">These categories dictate options inside the 'New Case' entry wizard. Keep them specific to marine engineering and safety compliance.</p>

            {/* Quick Add category form */}
            <form onSubmit={handleAddType} className="flex space-x-2 mb-6" id="add-jobtype-form">
              <input
                type="text"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="e.g. Ballast Water Treatment Overhaul"
                className="flex-1 bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-sans text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
              <button
                type="submit"
                id="btn-submit-jobtype"
                className="px-4 py-1.5 bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-semibold font-sans rounded-lg flex items-center space-x-1 shrink-0 cursor-pointer shadow-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add Type</span>
              </button>
            </form>

            {/* Grid of existing job types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1" id="job-types-editor-list">
              {jobTypes.map((t) => (
                <div 
                  key={t} 
                  className="flex items-center justify-between p-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-lg text-xs"
                >
                  <span className="font-sans text-slate-800 truncate mr-3">{t}</span>
                  {confirmingDelete === t ? (
                    <div className="flex items-center space-x-1 bg-red-50 px-2 py-0.5 rounded border border-red-100 animate-fadeIn">
                      <span className="text-[10px] font-sans font-bold text-red-700 uppercase">Delete?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteJobType(t);
                          setConfirmingDelete(null);
                          triggerSuccess(`Removed category "${t}".`);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDelete(null)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(t)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                      title={`Delete category: ${t}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL 2: Database backup & restore utilities (1/3 width) */}
        <div className="space-y-6">
          
          {/* Backup utility card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-sans font-bold text-slate-800">Database Portability</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your application data is saved online in Firebase Firestore and backed up locally in this browser. Export backups regularly before major changes.
            </p>

            <div className="space-y-3 pt-2">
              {/* Primary Excel export button */}
              <button
                type="button"
                id="btn-excel-backup-export"
                onClick={handleExportExcel}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-sm transition-colors border border-emerald-700"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Export Database to Excel (.xlsx)</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-sans uppercase tracking-wider">System Backup (JSON)</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              {/* Backup export button */}
              <button
                type="button"
                id="btn-full-backup-export"
                onClick={handleFullBackupExport}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-1.5 px-4 rounded-lg text-xs flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Download Backup (.json)</span>
              </button>

              {/* Backup restore file button */}
              <button
                type="button"
                id="btn-full-backup-import-trigger"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-1.5 px-4 rounded-lg text-xs flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                <Upload className="h-3.5 w-3.5 text-slate-500" />
                <span>Restore Backup (.json)</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFullBackupRestore} 
                accept=".json" 
                className="hidden" 
              />
            </div>

            <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 text-[10px] font-mono text-slate-400 space-y-1">
              <p>Current Database Stats:</p>
              <p>• Cases Logged: {cases.length}</p>
              <p>• Vessels Listed: {vessels.length}</p>
              <p>• Port Profiles: {ports.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-sans font-bold text-slate-800">Clean Start / Remove Demo Data</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use this only if you want to remove all current cases, vessels and ports from the online workspace and start with an empty database. Job categories will remain.
            </p>
            {confirmClearDatabase ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 space-y-3">
                <p className="font-bold">This will clear the online Firestore workspace. Continue?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClearDatabase();
                      setConfirmClearDatabase(false);
                      triggerSuccess('Workspace cleared. You can now enter real vessels, ports and cases.');
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg"
                  >
                    Yes, clear workspace
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearDatabase(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClearDatabase(true)}
                className="w-full bg-white hover:bg-red-50 border border-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg text-xs flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear Cases, Vessels & Ports</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
