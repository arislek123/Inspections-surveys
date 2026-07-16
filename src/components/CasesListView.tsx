/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown, 
  Plus, 
  Eye, 
  FileSpreadsheet, 
  Calendar,
  AlertCircle,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { Case, Vessel, Port, CaseStatus, CasePriority } from '../types';

interface CasesListViewProps {
  cases: Case[];
  vessels: Vessel[];
  ports: Port[];
  jobTypes: string[];
  onSelectCase: (caseId: string) => void;
  onOpenQuickAdd: () => void;
  onImportData: (importedCases: Case[]) => void;
  onUpdateCase: (updatedCase: Case) => void;
  onDeleteCase: (caseId: string) => void;
}

type SortField = 'id' | 'vessel' | 'port' | 'jobType' | 'subject' | 'status' | 'priority' | 'lastUpdated' | 'deadline';
type SortOrder = 'asc' | 'desc';

export default function CasesListView({ 
  cases, 
  vessels, 
  ports, 
  jobTypes, 
  onSelectCase, 
  onOpenQuickAdd,
  onImportData,
  onUpdateCase,
  onDeleteCase
}: CasesListViewProps) {
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmingDeleteCase, setConfirmingDeleteCase] = useState<string | null>(null);
  const [selectedVessel, setSelectedVessel] = useState('');
  const [selectedPort, setSelectedPort] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | ''>('');
  const [selectedPriority, setSelectedPriority] = useState<CasePriority | ''>('');
  const [selectedResponsible, setSelectedResponsible] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedAuthority, setSelectedAuthority] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [showFinishedOnly, setShowFinishedOnly] = useState<'all' | 'open' | 'finished' | 'postponed'>('open');

  // Advanced panel toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('lastUpdated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Helper resolvers
  const getVesselName = (id: string) => vessels.find(v => v.id === id)?.name || 'Unknown Vessel';
  const getPortName = (id: string) => ports.find(p => p.id === id)?.name || 'Unknown Port';

  // Available unique superintendents list
  const uniqueSuperintendents = Array.from(new Set(cases.map(c => c.responsiblePerson).filter(Boolean)));
  const uniqueSuppliers = Array.from(new Set(cases.flatMap(c => [c.vendor, c.agent]).filter(Boolean) as string[])).sort();
  const uniqueAuthorities = Array.from(new Set(cases.map(c => c.authority).filter(Boolean) as string[])).sort();
  const quickSearchTerms = ['BWTS', 'LSA', 'FFE', 'CEMS', 'VDR', 'Singapore', 'DNV', 'ABS'];

  // Predefined Saved Views
  const [activePreset, setActivePreset] = useState<string>('all');

  const handleApplyPreset = (preset: string) => {
    setActivePreset(preset);
    // Reset individual filter values
    setSelectedVessel('');
    setSelectedPort('');
    setSelectedJobType('');
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedResponsible('');
    setSelectedSupplier('');
    setSelectedAuthority('');
    setDateFrom('');
    setDateTo('');
    setShowUrgentOnly(false);
    setShowFinishedOnly('open');

    switch (preset) {
      case 'all':
        break;
      case 'urgent':
        setShowUrgentOnly(true);
        setShowFinishedOnly('open');
        break;
      case 'deadlines':
        // Show things with deadline sorted soon
        setShowFinishedOnly('open');
        setSortField('deadline');
        setSortOrder('asc');
        break;
      case 'finished-month':
        setShowFinishedOnly('finished');
        break;
      case 'postponed':
        setShowFinishedOnly('postponed');
        break;
      default:
        break;
    }
  };

  // Filter Logic
  const filteredCases = cases.filter(c => {
    // Search Term match
    const vName = getVesselName(c.vesselId).toLowerCase();
    const pName = getPortName(c.portId).toLowerCase();
    const normalizedSearch = searchTerm.toLowerCase();
    const emailText = (c.emails || []).map(email => `${email.subject} ${email.sender} ${email.recipient} ${email.summary} ${email.content} ${email.attachments || ''}`).join(' ').toLowerCase();
    const matchesSearch = 
      c.id.toLowerCase().includes(normalizedSearch) ||
      vName.includes(normalizedSearch) ||
      pName.includes(normalizedSearch) ||
      c.jobType.toLowerCase().includes(normalizedSearch) ||
      c.subject.toLowerCase().includes(normalizedSearch) ||
      c.responsiblePerson.toLowerCase().includes(normalizedSearch) ||
      (c.details && c.details.toLowerCase().includes(normalizedSearch)) ||
      (c.nextAction && c.nextAction.toLowerCase().includes(normalizedSearch)) ||
      (c.vendor && c.vendor.toLowerCase().includes(normalizedSearch)) ||
      (c.agent && c.agent.toLowerCase().includes(normalizedSearch)) ||
      (c.authority && c.authority.toLowerCase().includes(normalizedSearch)) ||
      (c.surveyor && c.surveyor.toLowerCase().includes(normalizedSearch)) ||
      (c.attachments && c.attachments.toLowerCase().includes(normalizedSearch)) ||
      emailText.includes(normalizedSearch);

    // Filter matches
    const matchesVessel = !selectedVessel || c.vesselId === selectedVessel;
    const matchesPort = !selectedPort || c.portId === selectedPort;
    const matchesJobType = !selectedJobType || c.jobType === selectedJobType;
    const matchesStatus = !selectedStatus || c.status === selectedStatus;
    const matchesPriority = !selectedPriority || c.priority === selectedPriority;
    const matchesResponsible = !selectedResponsible || c.responsiblePerson === selectedResponsible;
    const matchesSupplier = !selectedSupplier || c.vendor === selectedSupplier || c.agent === selectedSupplier;
    const matchesAuthority = !selectedAuthority || c.authority === selectedAuthority;
    const caseDateText = c.deadline || c.eta || c.etb || c.createdDate || c.lastUpdatedDate;
    const caseDate = caseDateText ? new Date(caseDateText) : null;
    const matchesDateFrom = !dateFrom || (caseDate && caseDate >= new Date(dateFrom));
    const matchesDateTo = !dateTo || (caseDate && caseDate <= new Date(`${dateTo}T23:59:59`));

    // Finished / Unfinished / Postponed
    let matchesFinishedState = true;
    if (showFinishedOnly === 'open') {
      matchesFinishedState = c.status !== 'Finished' && c.status !== 'Postponed';
    } else if (showFinishedOnly === 'finished') {
      matchesFinishedState = c.status === 'Finished';
    } else if (showFinishedOnly === 'postponed') {
      matchesFinishedState = c.status === 'Postponed';
    }

    // Urgent Only
    const matchesUrgentState = !showUrgentOnly || (c.status === 'Urgent' || c.priority === 'Critical');

    return matchesSearch && matchesVessel && matchesPort && matchesJobType && matchesStatus && matchesPriority && matchesResponsible && matchesSupplier && matchesAuthority && !!matchesDateFrom && !!matchesDateTo && matchesFinishedState && matchesUrgentState;
  });

  // Sort Logic
  const sortedCases = [...filteredCases].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'id') {
      comparison = a.id.localeCompare(b.id);
    } else if (sortField === 'vessel') {
      comparison = getVesselName(a.vesselId).localeCompare(getVesselName(b.vesselId));
    } else if (sortField === 'port') {
      comparison = getPortName(a.portId).localeCompare(getPortName(b.portId));
    } else if (sortField === 'jobType') {
      comparison = a.jobType.localeCompare(b.jobType);
    } else if (sortField === 'subject') {
      comparison = a.subject.localeCompare(b.subject);
    } else if (sortField === 'status') {
      comparison = a.status.localeCompare(b.status);
    } else if (sortField === 'priority') {
      // Custom priority order weight
      const priorityWeights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      const weightA = priorityWeights[a.priority] || 0;
      const weightB = priorityWeights[b.priority] || 0;
      comparison = weightA - weightB;
    } else if (sortField === 'lastUpdated') {
      comparison = new Date(a.lastUpdatedDate).getTime() - new Date(b.lastUpdatedDate).getTime();
    } else if (sortField === 'deadline') {
      const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      comparison = dateA - dateB;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Trigger sorting column
  const handleRequestSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedVessel('');
    setSelectedPort('');
    setSelectedJobType('');
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedResponsible('');
    setSelectedSupplier('');
    setSelectedAuthority('');
    setDateFrom('');
    setDateTo('');
    setShowUrgentOnly(false);
    setShowFinishedOnly('all');
    setActivePreset('all');
  };

  // Excel Export (Cases and Job Categories)
  const handleExportExcel = () => {
    // 1. Prepare Cases Sheet Data
    const casesData = sortedCases.map(c => ({
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
        'Active Worklist Cases': activeCount,
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
      { wch: 22 }, // Active Worklist Cases
      { wch: 22 }, // Urgent / Critical Cases
      { wch: 22 }  // Completed/Closed Cases
    ];
    wsJobs['!cols'] = maxW_jobs;

    XLSX.utils.book_append_sheet(wb, wsCases, 'Technical Cases');
    XLSX.utils.book_append_sheet(wb, wsJobs, 'Job Categories Summary');

    // Write file and trigger browser download
    XLSX.writeFile(wb, `Maritime_TechOps_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]" id="cases-list-view">
      {/* Top action header bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0" id="cases-list-header">
        <div>
          <h2 className="text-lg font-sans font-bold text-slate-900 tracking-tight">Vessel Cases & Inspections Worklist</h2>
          <p className="text-sm text-slate-500 mt-0.5">Filter, search, or export current technical issues and Class survey tasks.</p>
        </div>
        
        {/* Actions Button Group */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            id="btn-export-excel"
            onClick={handleExportExcel}
            className="px-3 py-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
            title="Export all technical cases and job analytics to Excel"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export to Excel</span>
          </button>

          <button
            id="btn-cases-add-new"
            onClick={onOpenQuickAdd}
            className="px-4 py-1.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Survey / Service Case</span>
          </button>
        </div>
      </div>

      {/* Preset Saved Views Filter Tabs */}
      <div className="bg-white border-b border-slate-100 px-6 py-2 overflow-x-auto flex items-center space-x-1 shrink-0" id="saved-views-tabs">
        <span className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider mr-3 whitespace-nowrap">Views:</span>
        {[
          { id: 'all', label: 'Active Cases' },
          { id: 'urgent', label: 'Urgent Cases' },
          { id: 'deadlines', label: 'Deadlines Priority' },
          { id: 'postponed', label: 'Postponed Cases' },
          { id: 'finished-month', label: 'Finished Cases' },
        ].map((preset) => (
          <button
            key={preset.id}
            id={`preset-tab-${preset.id}`}
            onClick={() => handleApplyPreset(preset.id)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
              activePreset === preset.id
                ? 'bg-[#0f172a] text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Main Filter Console */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 space-y-3 shrink-0" id="filter-console">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Main Keyword search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              id="cases-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by vessel, port, job type, subject, superintendent, or action..."
              className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm font-sans text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick filter selectors */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              id="btn-toggle-advanced-filters"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg border flex items-center space-x-1.5 transition-all cursor-pointer ${
                showAdvancedFilters || selectedVessel || selectedPort || selectedJobType || selectedStatus || selectedPriority || selectedResponsible || selectedSupplier || selectedAuthority || dateFrom || dateTo || showUrgentOnly || showFinishedOnly !== 'all'
                  ? 'border-sky-200 bg-sky-50/50 text-sky-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {(selectedVessel || selectedPort || selectedJobType || selectedStatus || selectedPriority || selectedResponsible || selectedSupplier || selectedAuthority || dateFrom || dateTo || showUrgentOnly || showFinishedOnly !== 'all') && (
                <span className="bg-sky-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  !
                </span>
              )}
            </button>

            {(searchTerm || selectedVessel || selectedPort || selectedJobType || selectedStatus || selectedPriority || selectedResponsible || selectedSupplier || selectedAuthority || dateFrom || dateTo || showUrgentOnly || showFinishedOnly !== 'all') && (
              <button
                id="btn-clear-all-filters"
                onClick={handleClearFilters}
                className="text-sm text-slate-500 hover:text-red-600 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2" id="quick-search-chips">
          <span className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider mr-1">Quick search:</span>
          {quickSearchTerms.map(term => (
            <button
              key={term}
              type="button"
              onClick={() => setSearchTerm(term)}
              className={`px-2.5 py-1 rounded-full border text-xs font-bold transition-colors ${searchTerm === term ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              {term}
            </button>
          ))}
        </div>

        {/* Advanced Filters Panel (Collapsible) */}
        {(showAdvancedFilters) && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn" id="advanced-filters-panel">
            {/* Vessel Filter */}
            <div>
              <label htmlFor="filter-vessel" className="block text-[11px] font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Filter Vessel</label>
              <select
                id="filter-vessel"
                value={selectedVessel}
                onChange={(e) => setSelectedVessel(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-800"
              >
                <option value="">All Vessels</option>
                {vessels.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            {/* Port Filter */}
            <div>
              <label htmlFor="filter-port" className="block text-[11px] font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Filter Port</label>
              <select
                id="filter-port"
                value={selectedPort}
                onChange={(e) => setSelectedPort(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-800"
              >
                <option value="">All Ports</option>
                {ports.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Job Type Filter */}
            <div>
              <label htmlFor="filter-job-type" className="block text-[11px] font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Filter Job Type</label>
              <select
                id="filter-job-type"
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-800"
              >
                <option value="">All Job Types</option>
                {jobTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Superintendent Filter */}
            <div>
              <label htmlFor="filter-responsible" className="block text-[11px] font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Responsible Person</label>
              <select
                id="filter-responsible"
                value={selectedResponsible}
                onChange={(e) => setSelectedResponsible(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-800"
              >
                <option value="">All Superintendents</option>
                {uniqueSuperintendents.map(supt => (
                  <option key={supt} value={supt}>{supt}</option>
                ))}
              </select>
            </div>

            {/* Case Status Filter */}
            <div>
              <label htmlFor="filter-status" className="block text-[11px] font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Case Status</label>
              <select
                id="filter-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as CaseStatus | '')}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-800"
              >
                <option value="">All Statuses</option>
                <option value="In Progress">In Progress</option>
                <option value="Awaiting Reply">Awaiting Reply</option>
                <option value="Finished">Finished</option>
                <option value="Postponed">Postponed</option>
                <option value="Postponed but Reopened">Postponed but Reopened</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Case Priority Filter */}
            <div>
              <label htmlFor="filter-priority" className="block text-[11px] font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Case Priority</label>
              <select
                id="filter-priority"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as CasePriority | '')}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-800"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Finished / Unfinished */}
            <div>
              <label htmlFor="filter-finished" className="block text-[11px] font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Completion State</label>
              <select
                id="filter-finished"
                value={showFinishedOnly}
                onChange={(e) => setShowFinishedOnly(e.target.value as 'all' | 'open' | 'finished' | 'postponed')}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-800"
              >
                <option value="all">Show All Closed/Open</option>
                <option value="open">Show Open Only</option>
                <option value="finished">Show Closed / Finished Only</option>
              </select>
            </div>

            {/* Supplier / Agent Filter */}
            <div>
              <label htmlFor="filter-supplier" className="block text-[11px] font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Supplier / Agent</label>
              <select
                id="filter-supplier"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-800"
              >
                <option value="">All Suppliers / Agents</option>
                {uniqueSuppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>

            {/* Authority / Class / Flag Filter */}
            <div>
              <label htmlFor="filter-authority" className="block text-[11px] font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Authority / Class / Flag</label>
              <select
                id="filter-authority"
                value={selectedAuthority}
                onChange={(e) => setSelectedAuthority(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-800"
              >
                <option value="">All Authorities</option>
                {uniqueAuthorities.map(authority => (
                  <option key={authority} value={authority}>{authority}</option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label htmlFor="filter-date-from" className="block text-[11px] font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Date From</label>
              <input
                id="filter-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 font-mono"
              />
            </div>

            <div>
              <label htmlFor="filter-date-to" className="block text-[11px] font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">Date To</label>
              <input
                id="filter-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 font-mono"
              />
            </div>

            {/* Urgent Switch */}
            <div className="flex items-center space-x-2 pt-5">
              <input
                type="checkbox"
                id="filter-urgent"
                checked={showUrgentOnly}
                onChange={(e) => setShowUrgentOnly(e.target.checked)}
                className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer"
              />
              <label htmlFor="filter-urgent" className="text-sm font-sans font-bold text-red-600 uppercase tracking-wide cursor-pointer">
                Urgent & Critical Only
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Main Table / Grid Container */}
      <div className="flex-1 overflow-auto p-6" id="cases-table-panel">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-left" id="cases-master-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-sans font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5 cursor-pointer select-none hover:bg-slate-100/80 transition-colors" onClick={() => handleRequestSort('id')}>
                    <div className="flex items-center space-x-1">
                      <span>Case ID</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-5 py-3 cursor-pointer select-none hover:bg-slate-100/80 transition-colors" onClick={() => handleRequestSort('vessel')}>
                    <div className="flex items-center space-x-1">
                      <span>Vessel</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-5 py-3 cursor-pointer select-none hover:bg-slate-100/80 transition-colors" onClick={() => handleRequestSort('port')}>
                    <div className="flex items-center space-x-1">
                      <span>Port</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-5 py-3 cursor-pointer select-none hover:bg-slate-100/80 transition-colors" onClick={() => handleRequestSort('jobType')}>
                    <div className="flex items-center space-x-1">
                      <span>Job Type</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-5 py-3 cursor-pointer select-none hover:bg-slate-100/80 transition-colors" onClick={() => handleRequestSort('subject')}>
                    <div className="flex items-center space-x-1">
                      <span>Subject of Job</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-5 py-3">Superintendent</th>
                  <th className="px-5 py-3 cursor-pointer select-none hover:bg-slate-100/80 transition-colors" onClick={() => handleRequestSort('status')}>
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-5 py-3 cursor-pointer select-none hover:bg-slate-100/80 transition-colors" onClick={() => handleRequestSort('priority')}>
                    <div className="flex items-center space-x-1">
                      <span>Priority</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-5 py-3 cursor-pointer select-none hover:bg-slate-100/80 transition-colors" onClick={() => handleRequestSort('deadline')}>
                    <div className="flex items-center space-x-1">
                      <span>Target Date</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {sortedCases.map((c) => {
                  
                  // Status Colors - soft, corporate, maritime
                  let statusStyle = 'bg-slate-100 text-slate-600 border-slate-200';
                  if (c.status === 'In Worklist') statusStyle = 'bg-slate-100 text-slate-700 border-slate-300/80';
                  else if (c.status === 'In Progress') statusStyle = 'bg-sky-50 text-sky-700 border-sky-100';
                  else if (c.status === 'Awaiting Reply') statusStyle = 'bg-amber-50 text-amber-700 border-amber-200/50';
                  else if (c.status === 'Finished') statusStyle = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                  else if (c.status === 'Postponed') statusStyle = 'bg-slate-100 text-slate-500 border-slate-200';
                  else if (c.status === 'Urgent') statusStyle = 'bg-red-50 text-red-700 border-red-100';
                  else if (c.status === 'Postponed but Reopened') statusStyle = 'bg-indigo-50 text-indigo-700 border-indigo-100';

                  // Priority style
                  let prioStyle = 'text-slate-500';
                  if (c.priority === 'Critical') prioStyle = 'text-red-600 font-bold';
                  else if (c.priority === 'High') prioStyle = 'text-amber-600 font-semibold';
                  else if (c.priority === 'Medium') prioStyle = 'text-slate-700';

                  // Is overdue check?
                  const isOverdue = c.deadline && c.status !== 'Finished' && new Date(c.deadline).getTime() < new Date().getTime();

                  return (
                    <tr 
                      key={c.id} 
                      id={`case-row-${c.id}`}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectCase(c.id)}
                    >
                      {/* ID */}
                      <td className="px-5 py-3.5 font-mono font-bold text-xs text-slate-400 group-hover:text-slate-900 transition-colors">
                        {c.id}
                      </td>

                      {/* Vessel */}
                      <td className="px-5 py-3.5 font-sans font-bold text-slate-900 whitespace-nowrap text-sm">
                        {getVesselName(c.vesselId)}
                      </td>

                      {/* Port */}
                      <td className="px-5 py-3.5 font-sans font-medium text-slate-600 text-sm">
                        {getPortName(c.portId)}
                      </td>

                      {/* Job Type */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-sans border border-slate-200">
                          {c.jobType}
                        </span>
                      </td>

                      {/* Subject of Job */}
                      <td className="px-5 py-3.5 max-w-xs truncate font-sans font-medium text-slate-800 text-sm" title={c.subject}>
                        {c.subject}
                      </td>

                      {/* Superintendent */}
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                        {c.responsiblePerson}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-sans font-bold border ${statusStyle}`}>
                          {c.status}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-3.5 font-sans text-xs">
                        <span className={prioStyle}>{c.priority}</span>
                      </td>

                      {/* Deadline */}
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs">
                        {c.deadline ? (
                          <div className="flex items-center space-x-1.5">
                            <span className={isOverdue ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                              {c.deadline}
                            </span>
                            {isOverdue && (
                              <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" title="Overdue!" />
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          {c.status === 'Finished' && (
                            <button
                              id={`btn-reopen-case-${c.id}`}
                              type="button"
                              onClick={() => {
                                const updated: Case = {
                                  ...c,
                                  status: 'In Progress',
                                  lastUpdatedDate: new Date().toISOString()
                                };
                                onUpdateCase(updated);
                              }}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 border border-amber-200 hover:border-amber-300 font-sans font-bold text-xs rounded transition-colors cursor-pointer flex items-center space-x-1"
                              title="Reopen job and set back to In Progress"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Reopen</span>
                            </button>
                          )}
                          {c.status === 'Postponed' && (
                            <button
                              id={`btn-restore-case-${c.id}`}
                              type="button"
                              onClick={() => {
                                const updated: Case = {
                                  ...c,
                                  status: 'In Progress',
                                  lastUpdatedDate: new Date().toISOString()
                                };
                                onUpdateCase(updated);
                              }}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-300 font-sans font-bold text-xs rounded transition-colors cursor-pointer flex items-center space-x-1"
                              title="Restore job and set back to In Progress"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Restore</span>
                            </button>
                          )}
                          {confirmingDeleteCase === c.id ? (
                            <div className="flex items-center space-x-1.5 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 animate-fadeIn shrink-0" onClick={(e) => e.stopPropagation()}>
                              <span className="text-[10px] font-sans font-bold text-red-700 uppercase">Confirm?</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteCase(c.id);
                                  setConfirmingDeleteCase(null);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmingDeleteCase(null);
                                }}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                id={`btn-view-case-${c.id}`}
                                onClick={() => onSelectCase(c.id)}
                                className="text-sky-600 hover:text-sky-800 font-sans font-bold text-xs flex items-center justify-end space-x-1.5 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Inspect</span>
                              </button>
                              <button
                                id={`btn-delete-case-row-${c.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmingDeleteCase(c.id);
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                title="Delete Case"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {sortedCases.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <SlidersHorizontal className="h-8 w-8 text-slate-300" />
                        <p className="text-xs font-semibold">No maritime cases match your filter criteria.</p>
                        <button
                          id="btn-table-reset-filters"
                          onClick={handleClearFilters}
                          className="text-[11px] text-sky-600 hover:text-sky-700 font-bold underline cursor-pointer"
                        >
                          Reset all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer Stats */}
          <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-slate-500 text-xs">
            <span>Showing <strong>{sortedCases.length}</strong> of <strong>{cases.length}</strong> total logged cases</span>
            <span className="font-mono text-slate-400">Database: Firebase online sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}
