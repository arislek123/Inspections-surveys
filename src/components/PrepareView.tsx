/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { CheckSquare, Mail, Ship, MapPin, Eye, ClipboardCheck } from 'lucide-react';
import { Case, Vessel, Port } from '../types';

interface PrepareViewProps {
  cases: Case[];
  vessels: Vessel[];
  ports: Port[];
  onUpdateCase: (updatedCase: Case) => void;
  onSelectCase: (caseId: string) => void;
}

export default function PrepareView({ cases, vessels, ports, onUpdateCase, onSelectCase }: PrepareViewProps) {
  const getVesselName = (id: string) => vessels.find(v => v.id === id)?.name || 'Unknown Vessel';
  const getPortName = (id: string) => ports.find(p => p.id === id)?.name || 'Unknown Port';

  const prepareCases = useMemo(() => {
    return cases
      .filter(c => c.poNumber?.trim() && c.status !== 'Finished' && c.status !== 'Postponed')
      .sort((a, b) => {
        const aDate = a.deadline || a.etb || a.eta || a.lastUpdatedDate;
        const bDate = b.deadline || b.etb || b.eta || b.lastUpdatedDate;
        return new Date(aDate).getTime() - new Date(bDate).getTime();
      });
  }, [cases]);

  const toggle = (caseItem: Case, field: 'prepEmailDone' | 'agentEmailDone' | 'vesselEmailDone') => {
    onUpdateCase({
      ...caseItem,
      [field]: !caseItem[field],
      lastUpdatedDate: new Date().toISOString(),
    });
  };

  const CheckCell = ({ caseItem, field, label }: { caseItem: Case; field: 'prepEmailDone' | 'agentEmailDone' | 'vesselEmailDone'; label: string }) => {
    const checked = !!caseItem[field];
    return (
      <button
        type="button"
        onClick={() => toggle(caseItem, field)}
        className={`w-full min-w-[130px] rounded-lg border px-3 py-2 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
          checked
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
        }`}
        title={label}
      >
        <span className={`h-4 w-4 rounded border flex items-center justify-center ${checked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'}`}>
          {checked ? '✓' : ''}
        </span>
        <span>{checked ? 'Done' : 'Pending'}</span>
      </button>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 md:p-8" id="prepare-view-container">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-3 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-sans font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-sky-600" />
            Preparation Board
          </h2>
          <p className="text-sm text-slate-500 mt-1">Open jobs with issued PO. Track preparation, agent email, and vessel email status.</p>
        </div>
        <div className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
          {prepareCases.length} job{prepareCases.length === 1 ? '' : 's'} ready for preparation
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1120px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-sans font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Vessel</th>
                <th className="px-4 py-3">Port</th>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">PO Number</th>
                <th className="px-4 py-3 text-center">E-mail for Preparation</th>
                <th className="px-4 py-3 text-center">E-mail to Agent</th>
                <th className="px-4 py-3 text-center">E-mail to Vessel</th>
                <th className="px-4 py-3 text-right">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {prepareCases.map((c) => {
                const allDone = c.prepEmailDone && c.agentEmailDone && c.vesselEmailDone;
                return (
                  <tr key={c.id} className={`${allDone ? 'bg-emerald-50/30' : 'hover:bg-slate-50/70'} transition-colors`}>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Ship className="h-4 w-4 text-slate-400" />
                        <span>{getVesselName(c.vesselId)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{getPortName(c.portId)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 truncate max-w-[320px]">{c.subject}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{c.jobType} · {c.id}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">{c.deadline || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 text-xs font-bold font-mono">
                        <CheckSquare className="h-3.5 w-3.5" />
                        {c.poNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3"><CheckCell caseItem={c} field="prepEmailDone" label="E-mail for Preparation" /></td>
                    <td className="px-4 py-3"><CheckCell caseItem={c} field="agentEmailDone" label="E-mail to Agent" /></td>
                    <td className="px-4 py-3"><CheckCell caseItem={c} field="vesselEmailDone" label="E-mail to Vessel" /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectCase(c.id)}
                        className="inline-flex items-center gap-1.5 text-sky-700 hover:text-sky-900 font-bold text-xs"
                      >
                        <Eye className="h-4 w-4" /> Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
              {prepareCases.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center">
                    <Mail className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500">No open jobs with issued PO.</p>
                    <p className="text-xs text-slate-400 mt-1">When an open case has a PO number, it will appear here for preparation tracking.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
