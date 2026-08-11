/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { AlarmClock, Eye, MailWarning, Ship, MapPin } from 'lucide-react';
import { Case, Vessel, Port } from '../types';

interface AlarmViewProps {
  cases: Case[];
  vessels: Vessel[];
  ports: Port[];
  onSelectCase: (caseId: string) => void;
}

type AlarmType = 'E-mail for Preparation' | 'E-mail to Agent' | 'E-mail to Vessel';

interface AlarmItem {
  caseItem: Case;
  type: AlarmType;
  daysLeft: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysUntil(dateValue?: string): number | null {
  if (!dateValue) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target.getTime() - today.getTime()) / MS_PER_DAY);
}

function dueLabel(days: number) {
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  if (days === 0) return 'Due today';
  return `Due in ${days} day${days === 1 ? '' : 's'}`;
}

export function getPreparationAlarms(cases: Case[]): AlarmItem[] {
  const items: AlarmItem[] = [];

  cases.forEach((c) => {
    if (!c.poNumber?.trim()) return;
    if (c.status === 'Finished' || c.status === 'Postponed') return;
    const days = daysUntil(c.deadline);
    if (days === null || days > 7) return;

    if (!c.prepEmailDone) items.push({ caseItem: c, type: 'E-mail for Preparation', daysLeft: days });
    if (!c.agentEmailDone) items.push({ caseItem: c, type: 'E-mail to Agent', daysLeft: days });
    if (!c.vesselEmailDone) items.push({ caseItem: c, type: 'E-mail to Vessel', daysLeft: days });
  });

  return items.sort((a, b) => a.daysLeft - b.daysLeft || a.caseItem.subject.localeCompare(b.caseItem.subject));
}

export default function AlarmView({ cases, vessels, ports, onSelectCase }: AlarmViewProps) {
  const alarms = useMemo(() => getPreparationAlarms(cases), [cases]);
  const getVesselName = (id: string) => vessels.find(v => v.id === id)?.name || 'Unknown Vessel';
  const getPortName = (id: string) => ports.find(p => p.id === id)?.name || 'Unknown Port';

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 md:p-8" id="alarms-view-container">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-3 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-sans font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlarmClock className="h-5 w-5 text-red-600" />
            Preparation Alarms
          </h2>
          <p className="text-sm text-slate-500 mt-1">Shows unchecked preparation / agent / vessel e-mails starting 7 days before target date.</p>
        </div>
        <div className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
          {alarms.length} active alarm{alarms.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[980px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-sans font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Alarm</th>
                <th className="px-4 py-3">Vessel</th>
                <th className="px-4 py-3">Port</th>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">PO</th>
                <th className="px-4 py-3 text-right">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {alarms.map((alarm, index) => (
                <tr key={`${alarm.caseItem.id}-${alarm.type}-${index}`} className={alarm.daysLeft <= 0 ? 'bg-red-50/40' : 'hover:bg-slate-50/70'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MailWarning className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="font-bold text-slate-900">{alarm.type}</p>
                        <p className={`text-xs font-mono ${alarm.daysLeft <= 0 ? 'text-red-700 font-bold' : 'text-amber-700'}`}>{dueLabel(alarm.daysLeft)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900"><Ship className="h-4 w-4 text-slate-400 inline mr-1" />{getVesselName(alarm.caseItem.vesselId)}</td>
                  <td className="px-4 py-3 text-slate-700"><MapPin className="h-4 w-4 text-slate-400 inline mr-1" />{getPortName(alarm.caseItem.portId)}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900 max-w-[360px] truncate" title={alarm.caseItem.subject}>{alarm.caseItem.subject}</p>
                    <p className="text-xs text-slate-400 font-mono">{alarm.caseItem.jobType} · {alarm.caseItem.id}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700">{alarm.caseItem.deadline || '-'}</td>
                  <td className="px-4 py-3 font-mono text-emerald-700 font-bold">{alarm.caseItem.poNumber}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onSelectCase(alarm.caseItem.id)} className="inline-flex items-center gap-1.5 text-sky-700 hover:text-sky-900 font-bold text-xs">
                      <Eye className="h-4 w-4" /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
              {alarms.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <AlarmClock className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500">No active preparation alarms.</p>
                    <p className="text-xs text-slate-400 mt-1">Alarms appear 7 days before target date for unchecked preparation, agent and vessel e-mails.</p>
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
