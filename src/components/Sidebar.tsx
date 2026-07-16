/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Anchor, 
  LayoutDashboard, 
  FileText, 
  Ship, 
  MapPin, 
  Calendar, 
  Settings, 
  PlusCircle,
  AlertTriangle,
  Wrench
} from 'lucide-react';
import { Case } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cases: Case[];
  onQuickAdd: () => void;
  userEmail?: string;
}

export default function Sidebar({ activeTab, setActiveTab, cases, onQuickAdd, userEmail }: SidebarProps) {
  const openCasesCount = cases.filter(c => c.status !== 'Finished').length;
  const urgentCasesCount = cases.filter(c => c.status === 'Urgent' || c.priority === 'Critical').length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases', label: 'Cases & Jobs', icon: FileText, badge: openCasesCount },
    { id: 'vessels', label: 'Vessels', icon: Ship },
    { id: 'ports', label: 'Ports', icon: MapPin },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'jobs', label: 'Jobs', icon: Wrench },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside id="sidebar-panel" className="w-64 bg-[#0f172a] h-full flex flex-col text-slate-400 p-6 shadow-xl shrink-0">
      {/* Header logo / branding */}
      <div className="mb-8 px-1 flex justify-center">
        <img
          src="./survinspec-logo-transparent.png"
          alt="SURVINSPEC logo"
          className="w-[190px] h-auto block drop-shadow-[0_10px_20px_rgba(15,23,42,0.35)]"
        />
      </div>

      {/* Quick Action Button */}
      <div className="mb-6">
        <button
          id="btn-sidebar-quick-add"
          onClick={onQuickAdd}
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-sans text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Survey / Service Case</span>
        </button>
      </div>

      {/* Nav Menu */}
      <nav id="sidebar-nav" className="flex-grow flex flex-col gap-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-base transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-sky-600/10 text-white font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                  item.id === 'cases' && urgentCasesCount > 0
                    ? 'bg-red-500/25 text-red-400 border border-red-500/30'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom status overview card */}
      {urgentCasesCount > 0 && (
        <div className="p-4 mb-4 bg-red-950/25 border border-red-900/30 rounded-xl">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-sans font-bold text-red-300">Action Required</p>
              <p className="text-[11px] font-mono text-red-400 mt-0.5">{urgentCasesCount} Urgent cases active.</p>
            </div>
          </div>
        </div>
      )}

      {/* User profile info */}
      <div className="mt-auto border-t border-slate-800 pt-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
            AL
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white font-medium truncate">{userEmail || 'Signed in'}</p>
            <p className="text-[11px] opacity-60 uppercase tracking-wider text-slate-400 font-medium">Secure Workspace</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
