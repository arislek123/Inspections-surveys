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
      <div className="flex items-center gap-3 mb-8 px-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-slate-900 flex items-center justify-center shadow-lg shadow-sky-950/40 ring-1 ring-white/10">
          <svg className="w-7 h-7 text-white" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Survinspec logo">
            <path d="M9 31.5H39L35.8 38H12.2L9 31.5Z" fill="currentColor" opacity="0.96"/>
            <path d="M15.5 25.5H32.5L35.5 31.5H12.5L15.5 25.5Z" fill="currentColor" opacity="0.74"/>
            <path d="M23.8 10V25.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"/>
            <path d="M24 12.5L34 18.5L24 23V12.5Z" fill="currentColor" opacity="0.9"/>
            <path d="M8 39C11.2 41 14.4 41 17.6 39C20.8 37 24 37 27.2 39C30.4 41 33.6 41 37 39" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" opacity="0.75"/>
            <path d="M10 16C12.4 10.8 17.6 7.5 23.7 7.5C30.4 7.5 36.1 11.7 38.2 17.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.32"/>
          </svg>
        </div>
        <div className="leading-tight">
          <div className="text-white font-bold tracking-tight text-xl">SURVINSPEC</div>
          <div className="text-[10px] text-sky-300 font-bold tracking-[0.18em] uppercase">Inspections & Surveys</div>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="mb-6">
        <button
          id="btn-sidebar-quick-add"
          onClick={onQuickAdd}
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-sans text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Case (30s)</span>
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
