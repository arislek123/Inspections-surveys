/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import CasesListView from './components/CasesListView';
import CaseDetailView from './components/CaseDetailView';
import AddCaseModal from './components/AddCaseModal';
import VesselsView from './components/VesselsView';
import PortsView from './components/PortsView';
import CalendarView from './components/CalendarView';
import SettingsView from './components/SettingsView';
import JobsView from './components/JobsView';

import { Case, Vessel, Port } from './types';
import { 
  INITIAL_CASES, 
  INITIAL_VESSELS, 
  INITIAL_PORTS, 
  INITIAL_JOB_TYPES 
} from './sampleData';

const STORAGE_KEYS = {
  CASES: 'maritime_techops_cases',
  VESSELS: 'maritime_techops_vessels',
  PORTS: 'maritime_techops_ports',
  JOB_TYPES: 'maritime_techops_job_types',
};

export default function App() {
  // Navigation states
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isAddCaseOpen, setIsAddCaseOpen] = useState<boolean>(false);
  const [preselectedJobType, setPreselectedJobType] = useState<string | undefined>(undefined);

  // Database core states
  const [cases, setCases] = useState<Case[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);

  // 1. Initial State Loading on Mount
  useEffect(() => {
    try {
      const storedCases = localStorage.getItem(STORAGE_KEYS.CASES);
      const storedVessels = localStorage.getItem(STORAGE_KEYS.VESSELS);
      const storedPorts = localStorage.getItem(STORAGE_KEYS.PORTS);
      const storedJobTypes = localStorage.getItem(STORAGE_KEYS.JOB_TYPES);

      if (storedCases && storedVessels && storedPorts && storedJobTypes) {
        setCases(JSON.parse(storedCases));
        setVessels(JSON.parse(storedVessels));
        setPorts(JSON.parse(storedPorts));
        setJobTypes(JSON.parse(storedJobTypes));
      } else {
        // First-run seed
        setCases(INITIAL_CASES);
        setVessels(INITIAL_VESSELS);
        setPorts(INITIAL_PORTS);
        setJobTypes(INITIAL_JOB_TYPES);

        localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
        localStorage.setItem(STORAGE_KEYS.VESSELS, JSON.stringify(INITIAL_VESSELS));
        localStorage.setItem(STORAGE_KEYS.PORTS, JSON.stringify(INITIAL_PORTS));
        localStorage.setItem(STORAGE_KEYS.JOB_TYPES, JSON.stringify(INITIAL_JOB_TYPES));
      }
    } catch (err) {
      console.error('Failed to load database from LocalStorage, fallback to seeds', err);
      setCases(INITIAL_CASES);
      setVessels(INITIAL_VESSELS);
      setPorts(INITIAL_PORTS);
      setJobTypes(INITIAL_JOB_TYPES);
    }
  }, []);

  // 2. Helpers to Sync to LocalStorage on Change
  const saveCases = (newCases: Case[]) => {
    setCases(newCases);
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(newCases));
  };

  const saveVessels = (newVessels: Vessel[]) => {
    setVessels(newVessels);
    localStorage.setItem(STORAGE_KEYS.VESSELS, JSON.stringify(newVessels));
  };

  const savePorts = (newPorts: Port[]) => {
    setPorts(newPorts);
    localStorage.setItem(STORAGE_KEYS.PORTS, JSON.stringify(newPorts));
  };

  const saveJobTypes = (newJobTypes: string[]) => {
    setJobTypes(newJobTypes);
    localStorage.setItem(STORAGE_KEYS.JOB_TYPES, JSON.stringify(newJobTypes));
  };

  // 3. Operational State Handlers (CRUD Core)

  // Navigate to specific Case Detail View
  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('cases');
  };

  // Create a New Case (Quick Add Case)
  const handleAddCase = (
    newCaseData: Omit<Case, 'id' | 'createdDate' | 'lastUpdatedDate' | 'emails' | 'comments'>
  ) => {
    // Generate simple custom ID based on year + count + randomized suffix
    const currentYear = new Date().getFullYear();
    const prefix = `CASE-${currentYear}-`;
    const randSuffix = Math.floor(100 + Math.random() * 900); // 3 digits
    const newId = `${prefix}${randSuffix}`;

    const newCase: Case = {
      ...newCaseData,
      id: newId,
      createdDate: new Date().toISOString(),
      lastUpdatedDate: new Date().toISOString(),
      emails: [],
      comments: [],
    };

    const updatedCases = [newCase, ...cases];
    saveCases(updatedCases);
    
    // Automatically focus the newly created case
    handleSelectCase(newId);
  };

  // Update Case Details, Statuses, Comments, Emails
  const handleUpdateCase = (updatedCase: Case) => {
    const updatedCases = cases.map(c => c.id === updatedCase.id ? updatedCase : c);
    saveCases(updatedCases);
  };

  // Delete Case
  const handleDeleteCase = (caseId: string) => {
    const updatedCases = cases.filter(c => c.id !== caseId);
    saveCases(updatedCases);
    setSelectedCaseId(null);
  };

  // Create a New Vessel Profile
  const handleAddVessel = (name: string, imo?: string, fleet?: string) => {
    const newVessel: Vessel = {
      id: `v-${Date.now()}`,
      name,
      imo,
      fleet,
    };
    const updatedVessels = [...vessels, newVessel];
    saveVessels(updatedVessels);
  };

  // Create a New Port Profile
  const handleAddPort = (name: string, country: string, eta?: string, etb?: string, ets?: string) => {
    const newPort: Port = {
      id: `p-${Date.now()}`,
      name,
      country,
      eta,
      etb,
      ets,
    };
    const updatedPorts = [...ports, newPort];
    savePorts(updatedPorts);
  };

  // Add Custom Job Type dropdown category
  const handleAddJobType = (newType: string) => {
    const updatedTypes = [...jobTypes, newType];
    saveJobTypes(updatedTypes);
  };

  // Delete Custom Job Type category
  const handleDeleteJobType = (typeToDelete: string) => {
    const updatedTypes = jobTypes.filter(t => t !== typeToDelete);
    saveJobTypes(updatedTypes);
  };

  // Update existing Job Type category name
  const handleUpdateJobType = (oldType: string, newType: string) => {
    const updatedTypes = jobTypes.map(t => t === oldType ? newType : t);
    saveJobTypes(updatedTypes);

    const updatedCases = cases.map(c => {
      if (c.jobType === oldType) {
        return {
          ...c,
          jobType: newType,
          lastUpdatedDate: new Date().toISOString()
        };
      }
      return c;
    });
    saveCases(updatedCases);
  };

  // Reset local database back to default seed data
  const handleResetDatabase = () => {
    saveCases(INITIAL_CASES);
    saveVessels(INITIAL_VESSELS);
    savePorts(INITIAL_PORTS);
    saveJobTypes(INITIAL_JOB_TYPES);
    setSelectedCaseId(null);
    setActiveTab('dashboard');
  };

  // Restore complete state from a JSON Backup File
  const handleImportFullDatabase = (data: { cases: Case[]; vessels: Vessel[]; ports: Port[]; jobTypes: string[] }) => {
    saveCases(data.cases);
    saveVessels(data.vessels);
    savePorts(data.ports);
    saveJobTypes(data.jobTypes);
    setSelectedCaseId(null);
    setActiveTab('dashboard');
  };

  // Merge uploaded Cases array (list-view local import)
  const handleImportCasesOnly = (importedCases: Case[]) => {
    // Avoid double entries by checking if case ID already exists; replace or add
    let updatedCases = [...cases];
    importedCases.forEach((ic) => {
      const idx = updatedCases.findIndex(c => c.id === ic.id);
      if (idx > -1) {
        updatedCases[idx] = ic;
      } else {
        updatedCases.unshift(ic);
      }
    });
    saveCases(updatedCases);
  };

  // 4. View Switcher Logic
  const renderActiveView = () => {
    // If cases tab is active, check if we are in list view or single case detail view
    if (activeTab === 'cases') {
      if (selectedCaseId) {
        const activeCase = cases.find(c => c.id === selectedCaseId);
        if (activeCase) {
          return (
            <CaseDetailView
              caseItem={activeCase}
              vessels={vessels}
              ports={ports}
              onBack={() => setSelectedCaseId(null)}
              onUpdateCase={handleUpdateCase}
              onDeleteCase={handleDeleteCase}
            />
          );
        } else {
          setSelectedCaseId(null); // Reset invalid selection
        }
      }

      return (
        <CasesListView
          cases={cases}
          vessels={vessels}
          ports={ports}
          jobTypes={jobTypes}
          onSelectCase={handleSelectCase}
          onOpenQuickAdd={() => setIsAddCaseOpen(true)}
          onImportData={handleImportCasesOnly}
          onUpdateCase={handleUpdateCase}
          onDeleteCase={handleDeleteCase}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            cases={cases}
            vessels={vessels}
            ports={ports}
            onSelectCase={handleSelectCase}
            setActiveTab={setActiveTab}
          />
        );
      case 'vessels':
        return (
          <VesselsView
            vessels={vessels}
            cases={cases}
            onAddVessel={handleAddVessel}
            onSelectCase={handleSelectCase}
          />
        );
      case 'ports':
        return (
          <PortsView
            ports={ports}
            cases={cases}
            onAddPort={handleAddPort}
            onSelectCase={handleSelectCase}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            cases={cases}
            vessels={vessels}
            ports={ports}
            onSelectCase={handleSelectCase}
          />
        );
      case 'jobs':
        return (
          <JobsView
            jobTypes={jobTypes}
            cases={cases}
            vessels={vessels}
            ports={ports}
            onAddJobType={handleAddJobType}
            onDeleteJobType={handleDeleteJobType}
            onUpdateJobType={handleUpdateJobType}
            onSelectCase={handleSelectCase}
            onOpenQuickAdd={(preselectedType) => {
              setPreselectedJobType(preselectedType);
              setIsAddCaseOpen(true);
            }}
            onDeleteCase={handleDeleteCase}
          />
        );
      case 'settings':
        return (
          <SettingsView
            jobTypes={jobTypes}
            onAddJobType={handleAddJobType}
            onDeleteJobType={handleDeleteJobType}
            onImportFullDatabase={handleImportFullDatabase}
            cases={cases}
            vessels={vessels}
            ports={ports}
          />
        );
      default:
        return (
          <div className="flex-1 p-8 text-center text-slate-500 font-sans">
            Page Not Found.
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100" id="app-viewport">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // If moving away from cases, let's close individual case focus
          if (tab !== 'cases') {
            setSelectedCaseId(null);
          }
        }} 
        cases={cases}
        onQuickAdd={() => setIsAddCaseOpen(true)}
      />

      {/* Main screen renderer */}
      <main className="flex-1 flex flex-col overflow-hidden" id="viewport-main-content">
        {renderActiveView()}
      </main>

      {/* Quick Add Case Entry Modal */}
      <AddCaseModal
        isOpen={isAddCaseOpen}
        onClose={() => {
          setIsAddCaseOpen(false);
          setPreselectedJobType(undefined);
        }}
        onAddCase={handleAddCase}
        vessels={vessels}
        ports={ports}
        jobTypes={jobTypes}
        preselectedJobType={preselectedJobType}
      />

    </div>
  );
}
