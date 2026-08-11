/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { ShieldCheck, LogOut, Loader2, AlarmClock, X, Eye } from 'lucide-react';

import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import CasesListView from './components/CasesListView';
import PrepareView from './components/PrepareView';
import AlarmView, { getPreparationAlarms } from './components/AlarmView';
import CaseDetailView from './components/CaseDetailView';
import AddCaseModal from './components/AddCaseModal';
import VesselsView from './components/VesselsView';
import PortsView from './components/PortsView';
import CalendarView from './components/CalendarView';
import SettingsView from './components/SettingsView';
import JobsView from './components/JobsView';

import { auth, db, googleProvider } from './firebase';
import { Case, Vessel, Port, PortCall } from './types';
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
  PORT_CALLS: 'maritime_techops_port_calls',
};

const APP_STATE_DOC = doc(db, 'workspaces', 'default');

type AppDatabase = {
  cases: Case[];
  vessels: Vessel[];
  ports: Port[];
  portCalls: PortCall[];
  jobTypes: string[];
};

const seedDatabase: AppDatabase = {
  cases: INITIAL_CASES,
  vessels: INITIAL_VESSELS,
  ports: INITIAL_PORTS,
  portCalls: [],
  jobTypes: INITIAL_JOB_TYPES,
};

const readLocalBackup = (): AppDatabase | null => {
  try {
    const storedCases = localStorage.getItem(STORAGE_KEYS.CASES);
    const storedVessels = localStorage.getItem(STORAGE_KEYS.VESSELS);
    const storedPorts = localStorage.getItem(STORAGE_KEYS.PORTS);
    const storedJobTypes = localStorage.getItem(STORAGE_KEYS.JOB_TYPES);
    const storedPortCalls = localStorage.getItem(STORAGE_KEYS.PORT_CALLS);

    if (storedCases && storedVessels && storedPorts && storedJobTypes) {
      return {
        cases: JSON.parse(storedCases),
        vessels: JSON.parse(storedVessels),
        ports: JSON.parse(storedPorts),
        portCalls: storedPortCalls ? JSON.parse(storedPortCalls) : [],
        jobTypes: JSON.parse(storedJobTypes),
      };
    }
  } catch (err) {
    console.error('Could not read local backup', err);
  }
  return null;
};

const writeLocalBackup = (data: AppDatabase) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(data.cases));
    localStorage.setItem(STORAGE_KEYS.VESSELS, JSON.stringify(data.vessels));
    localStorage.setItem(STORAGE_KEYS.PORTS, JSON.stringify(data.ports));
    localStorage.setItem(STORAGE_KEYS.JOB_TYPES, JSON.stringify(data.jobTypes));
    localStorage.setItem(STORAGE_KEYS.PORT_CALLS, JSON.stringify(data.portCalls || []));
  } catch (err) {
    console.error('Could not write local backup', err);
  }
};


const sanitizeForFirestore = <T,>(data: T): T => {
  // Firestore does not accept undefined values inside objects/arrays.
  // JSON serialization removes undefined object fields and keeps the payload clean.
  return JSON.parse(JSON.stringify(data)) as T;
};

export default function App() {
  // Navigation states
  const [activeTab, setActiveTab] = useState<string>('calendar');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isAddCaseOpen, setIsAddCaseOpen] = useState<boolean>(false);
  const [preselectedJobType, setPreselectedJobType] = useState<string | undefined>(undefined);
  const [alarmPopupDismissed, setAlarmPopupDismissed] = useState(false);

  // Firebase/Auth states
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);

  // Database core states
  const [cases, setCases] = useState<Case[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [portCalls, setPortCalls] = useState<PortCall[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);

  const applyDatabaseToState = (data: AppDatabase) => {
    setCases(data.cases || []);
    setVessels(data.vessels || []);
    setPorts(data.ports || []);
    setPortCalls(data.portCalls || []);
    setJobTypes(data.jobTypes || []);
    writeLocalBackup(data);
  };

  const currentDatabase = (): AppDatabase => ({
    cases,
    vessels,
    ports,
    portCalls,
    jobTypes,
  });

  const persistDatabase = async (data: AppDatabase) => {
    applyDatabaseToState(data);
    setSyncing(true);
    setSyncError(null);

    try {
      const cleanData = sanitizeForFirestore(data);
      await setDoc(APP_STATE_DOC, {
        ...cleanData,
        lastSavedAt: serverTimestamp(),
        lastSavedBy: user?.email || 'unknown',
      }, { merge: true });
    } catch (err) {
      console.error('Firebase save failed', err);
      setSyncError('Online save failed. Check Firebase Authentication / Firestore rules. A local backup was still saved in this browser.');
    } finally {
      setSyncing(false);
    }
  };

  // 1. Authentication listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return unsub;
  }, []);

  // 2. Firestore live sync. All logged-in devices read/write the same workspace document.
  useEffect(() => {
    if (!user) {
      setDbLoading(false);
      return;
    }

    setDbLoading(true);
    setSyncError(null);

    const unsub = onSnapshot(
      APP_STATE_DOC,
      async (snapshot) => {
        if (snapshot.exists()) {
          const remote = snapshot.data() as Partial<AppDatabase>;
          const nextData: AppDatabase = {
            cases: remote.cases || [],
            vessels: remote.vessels || [],
            ports: remote.ports || [],
            portCalls: remote.portCalls || [],
            jobTypes: remote.jobTypes || [],
          };
          applyDatabaseToState(nextData);
        } else {
          // First online run: use local backup if available, otherwise seed data.
          const initialData = readLocalBackup() || seedDatabase;
          applyDatabaseToState(initialData);
          const cleanInitialData = sanitizeForFirestore(initialData);
          await setDoc(APP_STATE_DOC, {
            ...cleanInitialData,
            createdAt: serverTimestamp(),
            lastSavedAt: serverTimestamp(),
            lastSavedBy: user.email || 'unknown',
          });
        }
        setDbLoading(false);
      },
      (err) => {
        console.error('Firebase load failed', err);
        setSyncError('Could not load online database. Check Firestore rules and that Firestore is enabled.');
        applyDatabaseToState(readLocalBackup() || seedDatabase);
        setDbLoading(false);
      }
    );

    return unsub;
  }, [user]);

  const handleLogin = async () => {
    setSyncError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Login failed', err);
      setSyncError('Login failed. Make sure Google sign-in is enabled in Firebase Authentication.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // 3. Helpers to Sync to Firestore on Change
  const saveCases = (newCases: Case[]) => {
    persistDatabase({ ...currentDatabase(), cases: newCases });
  };

  const saveVessels = (newVessels: Vessel[]) => {
    persistDatabase({ ...currentDatabase(), vessels: newVessels });
  };

  const savePorts = (newPorts: Port[]) => {
    persistDatabase({ ...currentDatabase(), ports: newPorts });
  };

  const savePortCalls = (newPortCalls: PortCall[]) => {
    persistDatabase({ ...currentDatabase(), portCalls: newPortCalls });
  };

  const saveJobTypes = (newJobTypes: string[]) => {
    persistDatabase({ ...currentDatabase(), jobTypes: newJobTypes });
  };

  // 4. Operational State Handlers (CRUD Core)

  // Navigate to specific Case Detail View
  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('cases');
  };

  // Create a New Case (Quick Add Case)
  const handleAddCase = (
    newCaseData: Omit<Case, 'id' | 'createdDate' | 'lastUpdatedDate' | 'emails' | 'comments'>
  ) => {
    const currentYear = new Date().getFullYear();
    const prefix = `CASE-${currentYear}-`;
    const randSuffix = Math.floor(100 + Math.random() * 900);
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
    const updatedJobTypes = jobTypes.some(t => t.toLowerCase() === newCase.jobType.toLowerCase())
      ? jobTypes
      : [...jobTypes, newCase.jobType];
    persistDatabase({ ...currentDatabase(), cases: updatedCases, jobTypes: updatedJobTypes });
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

  // Create / update / archive vessel profiles
  const handleAddVessel = (name: string, imo?: string, fleet?: string) => {
    const newVessel: Vessel = {
      id: `v-${Date.now()}`,
      name,
      imo: imo || '',
      fleet: fleet || '',
      archived: false,
    };
    const updatedVessels = [...vessels, newVessel];
    saveVessels(updatedVessels);
  };

  const handleUpdateVessel = (updatedVessel: Vessel) => {
    const updatedVessels = vessels.map(v => v.id === updatedVessel.id ? updatedVessel : v);
    saveVessels(updatedVessels);
  };

  const handleArchiveVessel = (vesselId: string, archived: boolean) => {
    const updatedVessels = vessels.map(v => v.id === vesselId ? { ...v, archived } : v);
    saveVessels(updatedVessels);
  };

  // Delete vessel and keep any linked cases as unassigned
  const handleDeleteVessel = (vesselId: string) => {
    const updatedVessels = vessels.filter(v => v.id !== vesselId);
    const removedPortCallIds = portCalls.filter(pc => pc.vesselId === vesselId).map(pc => pc.id);
    const updatedPortCalls = portCalls.filter(pc => pc.vesselId !== vesselId);
    const updatedCases = cases.map(c =>
      c.vesselId === vesselId || (c.portCallId && removedPortCallIds.includes(c.portCallId))
        ? { ...c, vesselId: '', portCallId: undefined, lastUpdatedDate: new Date().toISOString() }
        : c
    );
    persistDatabase({ ...currentDatabase(), vessels: updatedVessels, portCalls: updatedPortCalls, cases: updatedCases });
  };

  // Create / update / archive port profiles
  const handleAddPort = (name: string, country: string) => {
    const newPort: Port = {
      id: `p-${Date.now()}`,
      name,
      country,
      archived: false,
    };
    const updatedPorts = [...ports, newPort];
    savePorts(updatedPorts);
  };

  const handleUpdatePort = (updatedPort: Port) => {
    const updatedPorts = ports.map(p => p.id === updatedPort.id ? updatedPort : p);
    savePorts(updatedPorts);
  };

  const handleArchivePort = (portId: string, archived: boolean) => {
    const updatedPorts = ports.map(p => p.id === portId ? { ...p, archived } : p);
    savePorts(updatedPorts);
  };

  // Delete port and keep any linked cases as unassigned
  const handleDeletePort = (portId: string) => {
    const updatedPorts = ports.filter(p => p.id !== portId);
    const removedPortCallIds = portCalls.filter(pc => pc.portId === portId).map(pc => pc.id);
    const updatedPortCalls = portCalls.filter(pc => pc.portId !== portId);
    const updatedCases = cases.map(c =>
      c.portId === portId || (c.portCallId && removedPortCallIds.includes(c.portCallId))
        ? { ...c, portId: '', portCallId: undefined, lastUpdatedDate: new Date().toISOString() }
        : c
    );
    persistDatabase({ ...currentDatabase(), ports: updatedPorts, portCalls: updatedPortCalls, cases: updatedCases });
  };

  // Create / update / delete planned vessel calls per port.
  // Linked jobs automatically follow the ETB date of their related port call.
  const handleAddPortCall = (newPortCallData: Omit<PortCall, 'id'>) => {
    const newPortCall: PortCall = {
      ...newPortCallData,
      id: `pc-${Date.now()}`,
      archived: false,
    };
    const updatedPortCalls = [...portCalls, newPortCall];
    savePortCalls(updatedPortCalls);
  };

  const handleUpdatePortCall = (updatedPortCall: PortCall) => {
    const updatedPortCalls = portCalls.map(pc => pc.id === updatedPortCall.id ? updatedPortCall : pc);

    const updatedCases = cases.map(c => {
      if (c.portCallId !== updatedPortCall.id) return c;
      return {
        ...c,
        vesselId: updatedPortCall.vesselId,
        portId: updatedPortCall.portId,
        deadline: updatedPortCall.etb || updatedPortCall.eta || c.deadline,
        eta: updatedPortCall.eta || c.eta,
        etb: updatedPortCall.etb || c.etb,
        ets: updatedPortCall.ets || c.ets,
        agent: updatedPortCall.agent || c.agent,
        lastUpdatedDate: new Date().toISOString(),
      };
    });

    persistDatabase({ ...currentDatabase(), portCalls: updatedPortCalls, cases: updatedCases });
  };

  const handleDeletePortCall = (portCallId: string) => {
    const updatedPortCalls = portCalls.filter(pc => pc.id !== portCallId);
    const updatedCases = cases.map(c =>
      c.portCallId === portCallId
        ? { ...c, portCallId: undefined, lastUpdatedDate: new Date().toISOString() }
        : c
    );
    persistDatabase({ ...currentDatabase(), portCalls: updatedPortCalls, cases: updatedCases });
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

    persistDatabase({ ...currentDatabase(), jobTypes: updatedTypes, cases: updatedCases });
  };

  // Reset database back to a clean empty workspace.
  const handleClearDatabase = () => {
    persistDatabase({
      cases: [],
      vessels: [],
      ports: [],
      portCalls: [],
      jobTypes: INITIAL_JOB_TYPES,
    });
    setSelectedCaseId(null);
    setActiveTab('dashboard');
  };

  // Restore complete state from a JSON Backup File
  const handleImportFullDatabase = (data: { cases: Case[]; vessels: Vessel[]; ports: Port[]; portCalls?: PortCall[]; jobTypes: string[] }) => {
    persistDatabase({ ...data, portCalls: data.portCalls || [] });
    setSelectedCaseId(null);
    setActiveTab('dashboard');
  };

  // Merge uploaded Cases array
  const handleImportCasesOnly = (importedCases: Case[]) => {
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

  const preparationAlarms = getPreparationAlarms(cases);
  const showAlarmPopup = preparationAlarms.length > 0 && !alarmPopupDismissed;

  // 5. View Switcher Logic
  const renderActiveView = () => {
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
          setSelectedCaseId(null);
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
      case 'prepare':
        return (
          <PrepareView
            cases={cases}
            vessels={vessels}
            ports={ports}
            onUpdateCase={handleUpdateCase}
            onSelectCase={handleSelectCase}
          />
        );
      case 'vessels':
        return (
          <VesselsView
            vessels={vessels}
            cases={cases}
            ports={ports}
            onAddVessel={handleAddVessel}
            onUpdateVessel={handleUpdateVessel}
            onArchiveVessel={handleArchiveVessel}
            onDeleteVessel={handleDeleteVessel}
            onSelectCase={handleSelectCase}
          />
        );
      case 'ports':
        return (
          <PortsView
            ports={ports}
            vessels={vessels}
            cases={cases}
            portCalls={portCalls}
            onAddPort={handleAddPort}
            onUpdatePort={handleUpdatePort}
            onArchivePort={handleArchivePort}
            onDeletePort={handleDeletePort}
            onAddPortCall={handleAddPortCall}
            onUpdatePortCall={handleUpdatePortCall}
            onDeletePortCall={handleDeletePortCall}
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
      case 'alarms':
        return (
          <AlarmView
            cases={cases}
            vessels={vessels}
            ports={ports}
            onSelectCase={handleSelectCase}
          />
        );
      case 'settings':
        return (
          <SettingsView
            jobTypes={jobTypes}
            onAddJobType={handleAddJobType}
            onDeleteJobType={handleDeleteJobType}
            onImportFullDatabase={handleImportFullDatabase}
            onClearDatabase={handleClearDatabase}
            cases={cases}
            vessels={vessels}
            ports={ports}
            portCalls={portCalls}
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

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100 text-slate-700">
        <Loader2 className="h-6 w-6 animate-spin mr-3" /> Loading secure workspace...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-200 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Inspections & Surveys</h1>
          <p className="text-slate-600 mb-6">
            Sign in to save jobs, vessels, ports and comments online in Firebase and access them from any device.
          </p>
          <button
            onClick={handleLogin}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign in with Google
          </button>
          {syncError && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100">{syncError}</p>
          )}
        </div>
      </div>
    );
  }

  if (dbLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100 text-slate-700">
        <Loader2 className="h-6 w-6 animate-spin mr-3" /> Loading online database...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100" id="app-viewport">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedCaseId(null);
        }}
        cases={cases}
        onQuickAdd={() => setIsAddCaseOpen(true)}
        userEmail={user.email || undefined}
        alarmCount={preparationAlarms.length}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative" id="viewport-main-content">
        <div className="absolute right-4 top-3 z-50 flex items-center gap-2">
          {syncError && (
            <div className="max-w-xl rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 shadow-sm">
              {syncError}
            </div>
          )}
          <div className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs text-slate-600 shadow-sm">
            {syncing ? 'Saving online...' : 'Online sync ready'} · {user.email}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-200 bg-white/90 p-2 text-slate-500 shadow-sm hover:text-red-600"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        {renderActiveView()}
      </main>


      {showAlarmPopup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-red-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-red-100 bg-red-50 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center"><AlarmClock className="h-5 w-5" /></div>
                <div>
                  <h3 className="text-base font-bold text-red-900">Preparation alarm</h3>
                  <p className="text-sm text-red-700">Unchecked preparation / agent / vessel e-mails due within 7 days.</p>
                </div>
              </div>
              <button onClick={() => setAlarmPopupDismissed(true)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
              {preparationAlarms.slice(0, 10).map((alarm, idx) => {
                const vessel = vessels.find(v => v.id === alarm.caseItem.vesselId)?.name || 'Unknown Vessel';
                const port = ports.find(p => p.id === alarm.caseItem.portId)?.name || 'Unknown Port';
                return (
                  <div key={`${alarm.caseItem.id}-${alarm.type}-${idx}`} className="px-5 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate" title={alarm.caseItem.subject}>{vessel} · {alarm.caseItem.subject}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{port} · {alarm.type} · Target: {alarm.caseItem.deadline || '-'}</p>
                    </div>
                    <button
                      onClick={() => { setAlarmPopupDismissed(true); handleSelectCase(alarm.caseItem.id); }}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 text-xs font-bold"
                    >
                      <Eye className="h-4 w-4" /> Open
                    </button>
                  </div>
                );
              })}
              {preparationAlarms.length > 10 && <div className="px-5 py-3 text-xs text-slate-500">+{preparationAlarms.length - 10} more alarms in Alarms page.</div>}
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setAlarmPopupDismissed(true)} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">Dismiss</button>
              <button onClick={() => { setAlarmPopupDismissed(true); setActiveTab('alarms'); setSelectedCaseId(null); }} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700">Open alarms</button>
            </div>
          </div>
        </div>
      )}

      <AddCaseModal
        isOpen={isAddCaseOpen}
        onClose={() => {
          setIsAddCaseOpen(false);
          setPreselectedJobType(undefined);
        }}
        onAddCase={handleAddCase}
        vessels={vessels}
        ports={ports}
        portCalls={portCalls}
        jobTypes={jobTypes}
        preselectedJobType={preselectedJobType}
      />
    </div>
  );
}
