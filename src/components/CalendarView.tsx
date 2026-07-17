/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ListChecks,
  Grid3X3,
  Ship,
  MapPin
} from 'lucide-react';
import { Case, Vessel, Port } from '../types';

interface CalendarViewProps {
  cases: Case[];
  vessels: Vessel[];
  ports: Port[];
  onSelectCase: (caseId: string) => void;
}

type CalendarMode = 'list' | 'month';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toDateOnly(value?: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatReadableDate(value?: string): string {
  const date = toDateOnly(value);
  if (!date) return '-';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function getMondayFirstBlankCount(firstDayOfMonth: Date): number {
  // JS Sunday=0, Monday=1. We want Monday=0 ... Sunday=6
  return (firstDayOfMonth.getDay() + 6) % 7;
}

export default function CalendarView({ cases, vessels, ports, onSelectCase }: CalendarViewProps) {
  const [filterVessel, setFilterVessel] = useState('');
  const [mode, setMode] = useState<CalendarMode>('list');

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const firstDeadlineDate = useMemo(() => {
    const nextCase = cases
      .filter(c => c.deadline)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())[0];

    return toDateOnly(nextCase?.deadline) || today;
  }, [cases, today]);

  const [visibleMonth, setVisibleMonth] = useState<Date>(() => new Date(firstDeadlineDate.getFullYear(), firstDeadlineDate.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>(() => toISODate(today));

  const getVesselName = (id: string) => vessels.find(v => v.id === id)?.name || 'Unknown Vessel';
  const getPortName = (id: string) => ports.find(p => p.id === id)?.name || 'Unknown Port';

  const casesWithDeadlines = useMemo(() => {
    return cases.filter(c => {
      const matchesVessel = !filterVessel || c.vesselId === filterVessel;
      return !!c.deadline && matchesVessel;
    });
  }, [cases, filterVessel]);

  const sortedDeadlines = useMemo(() => {
    return [...casesWithDeadlines].sort((a, b) => {
      return new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime();
    });
  }, [casesWithDeadlines]);

  const oneWeekLater = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() + 7);
    return d;
  }, [today]);

  const overdue: Case[] = [];
  const dueThisWeek: Case[] = [];
  const dueLater: Case[] = [];
  const completedWithDeadlines: Case[] = [];

  sortedDeadlines.forEach((c) => {
    if (c.status === 'Finished') {
      completedWithDeadlines.push(c);
      return;
    }

    const deadlineDate = toDateOnly(c.deadline);
    if (!deadlineDate) return;

    if (deadlineDate.getTime() < today.getTime()) {
      overdue.push(c);
    } else if (deadlineDate.getTime() <= oneWeekLater.getTime()) {
      dueThisWeek.push(c);
    } else {
      dueLater.push(c);
    }
  });

  const casesByDate = useMemo(() => {
    const map = new Map<string, Case[]>();
    sortedDeadlines.forEach((c) => {
      if (!c.deadline) return;
      if (!map.has(c.deadline)) map.set(c.deadline, []);
      map.get(c.deadline)!.push(c);
    });
    return map;
  }, [sortedDeadlines]);

  const selectedDateCases = casesByDate.get(selectedDate) || [];

  const monthDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const blanks = getMondayFirstBlankCount(firstDay);
    const cells: Array<Date | null> = [];

    for (let i = 0; i < blanks; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [visibleMonth]);

  const monthTitle = visibleMonth.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
  });

  const goToPreviousMonth = () => {
    setVisibleMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setVisibleMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(toISODate(today));
  };

  const renderCaseMini = (c: Case, index?: number) => (
    <button
      key={c.id}
      onClick={(e) => {
        e.stopPropagation();
        onSelectCase(c.id);
      }}
      className="w-full text-left rounded-md border border-slate-100 bg-white hover:bg-sky-50 hover:border-sky-200 px-2 py-1.5 transition-colors"
      title={`${getVesselName(c.vesselId)} - ${c.subject}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-sans font-bold text-slate-900 truncate">
          {index !== undefined ? `${index + 1}. ` : ''}{getVesselName(c.vesselId)}
        </span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 ${
          c.priority === 'Critical'
            ? 'bg-red-50 text-red-700 border-red-100'
            : c.priority === 'High'
              ? 'bg-orange-50 text-orange-700 border-orange-100'
              : 'bg-slate-50 text-slate-500 border-slate-100'
        }`}>
          {c.priority}
        </span>
      </div>
      <div className="text-[10px] text-slate-500 mt-0.5 truncate">{c.jobType}</div>
      <div className="text-[9px] text-slate-400 truncate">{getPortName(c.portId)}</div>
    </button>
  );

  const renderDeadlineCard = (c: Case, tone: 'red' | 'sky' | 'slate' | 'emerald') => {
    const toneClasses = {
      red: {
        border: 'border-red-500',
        hover: 'hover:bg-red-50/40',
        date: 'text-red-600',
        badge: 'bg-red-50 text-red-700 border-red-100'
      },
      sky: {
        border: 'border-sky-500',
        hover: 'hover:bg-sky-50/40',
        date: 'text-sky-600',
        badge: 'bg-sky-50 text-sky-700 border-sky-100'
      },
      slate: {
        border: 'border-slate-300',
        hover: 'hover:bg-slate-50',
        date: 'text-slate-700',
        badge: 'bg-slate-100 text-slate-600 border-slate-200'
      },
      emerald: {
        border: 'border-emerald-500',
        hover: 'hover:bg-emerald-50/30',
        date: 'text-emerald-700',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-100'
      }
    }[tone];

    return (
      <div
        key={c.id}
        onClick={() => onSelectCase(c.id)}
        className={`bg-white ${toneClasses.hover} border-l-4 ${toneClasses.border} border-y border-r border-slate-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer transition-all shadow-sm`}
      >
        <div className="min-w-0 flex-1 pr-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-mono text-slate-400">
            <span className={`font-bold uppercase tracking-wider ${toneClasses.date}`}>{formatReadableDate(c.deadline)}</span>
            <span>•</span>
            <span>{getVesselName(c.vesselId)}</span>
            <span>•</span>
            <span>{getPortName(c.portId)}</span>
            {c.poNumber && (
              <>
                <span>•</span>
                <span className="text-emerald-700 font-bold">PO: {c.poNumber}</span>
              </>
            )}
          </div>
          <h4 className="text-xs font-sans font-bold text-slate-900 mt-1">{c.subject}</h4>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            <strong>Next Action:</strong> {c.nextAction || 'None registered'}
          </p>
        </div>

        <div className="mt-3 md:mt-0 flex items-center space-x-3 shrink-0">
          <span className={`${toneClasses.badge} px-2 py-0.5 rounded text-[10px] font-sans font-bold border`}>
            {c.status}
          </span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 md:p-8" id="calendar-view-container">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between mb-8 gap-4 border-b border-slate-100 pb-5" id="calendar-header">
        <div>
          <h2 className="text-base font-sans font-bold text-slate-900 tracking-tight">Survey & Service Calendar</h2>
          <p className="text-xs text-slate-500 mt-1">Track target dates, vessel jobs, port attendance, and operational deadlines.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-sans font-semibold text-slate-500 whitespace-nowrap">Filter Vessel:</span>
          <select
            id="calendar-vessel-filter"
            value={filterVessel}
            onChange={(e) => setFilterVessel(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">All Vessels</option>
            {vessels.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>

          <span className="hidden sm:inline-block h-5 w-px bg-slate-200 mx-1" />

          <span className="text-xs font-sans font-semibold text-slate-500 whitespace-nowrap">Calendar View:</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as CalendarMode)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="list">Deadline List</option>
            <option value="month">Real Calendar</option>
          </select>
        </div>
      </div>

      {mode === 'month' ? (
        <div className="space-y-5">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                <Grid3X3 className="h-4 w-4 text-sky-600" />
                <div>
                  <h3 className="text-sm font-sans font-bold text-slate-900">Real Calendar</h3>
                  <p className="text-[11px] text-slate-500">Each target date shows vessel names and jobs directly inside the day cell.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center"
                  title="Previous month"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-600" />
                </button>
                <button
                  onClick={goToCurrentMonth}
                  className="px-3 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700"
                >
                  Today
                </button>
                <div className="min-w-[150px] text-center text-sm font-bold text-slate-900">{monthTitle}</div>
                <button
                  onClick={goToNextMonth}
                  className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center"
                  title="Next month"
                >
                  <ChevronRightIcon className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
              {DAY_NAMES.map(day => (
                <div key={day} className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-r border-slate-100 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {monthDays.map((date, idx) => {
                if (!date) {
                  return <div key={`blank-${idx}`} className="min-h-[132px] border-r border-b border-slate-100 bg-slate-50/40" />;
                }

                const iso = toISODate(date);
                const jobs = casesByDate.get(iso) || [];
                const isToday = iso === toISODate(today);
                const isSelected = iso === selectedDate;
                const isPast = date.getTime() < today.getTime();

                return (
                  <button
                    key={iso}
                    onClick={() => setSelectedDate(iso)}
                    className={`min-h-[132px] border-r border-b border-slate-100 p-2 text-left align-top transition-colors ${
                      isSelected
                        ? 'bg-sky-50 ring-2 ring-inset ring-sky-400'
                        : jobs.length
                          ? 'bg-white hover:bg-sky-50/40'
                          : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`h-6 w-6 flex items-center justify-center rounded-full text-xs font-bold ${
                        isToday
                          ? 'bg-sky-600 text-white'
                          : isPast
                            ? 'text-slate-400'
                            : 'text-slate-800'
                      }`}>
                        {date.getDate()}
                      </span>
                      {jobs.length > 0 && (
                        <span className="text-[9px] font-bold text-sky-700 bg-sky-50 border border-sky-100 rounded-full px-1.5 py-0.5">
                          {jobs.length} job{jobs.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {jobs.slice(0, 3).map((c, jobIndex) => (
                        <div
                          key={c.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c.id);
                          }}
                          className={`rounded-md px-2 py-1 border cursor-pointer ${
                            c.priority === 'Critical'
                              ? 'bg-red-50 border-red-100 text-red-800'
                              : c.priority === 'High'
                                ? 'bg-orange-50 border-orange-100 text-orange-800'
                                : 'bg-slate-50 border-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="text-[10px] font-extrabold truncate">{getVesselName(c.vesselId)}</div>
                          <div className="text-[9px] opacity-80 truncate">{c.jobType}</div>
                        </div>
                      ))}
                      {jobs.length > 3 && (
                        <div className="text-[10px] font-bold text-slate-500 px-1">+{jobs.length - 3} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Jobs on {formatReadableDate(selectedDate)}</h3>
                <p className="text-[11px] text-slate-500">Click any job below to open the full case file.</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-3 py-1">
                {selectedDateCases.length} job{selectedDateCases.length !== 1 ? 's' : ''}
              </span>
            </div>

            {selectedDateCases.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {selectedDateCases.map((c, index) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectCase(c.id)}
                    className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400">
                          <span className="font-bold text-slate-900">{index + 1}. {getVesselName(c.vesselId)}</span>
                          <span>•</span>
                          <span>{getPortName(c.portId)}</span>
                          {c.poNumber && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-bold">PO: {c.poNumber}</span>
                            </>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-1 truncate">{c.subject}</h4>
                        <p className="text-xs text-slate-500 mt-1">{c.jobType}</p>
                        <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                          <strong>Next action:</strong> {c.nextAction || 'None registered'}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-bold shrink-0 ${
                        c.priority === 'Critical'
                          ? 'bg-red-50 text-red-700 border-red-100'
                          : c.priority === 'High'
                            ? 'bg-orange-50 text-orange-700 border-orange-100'
                            : 'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {c.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-3">No jobs registered for this date.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8" id="calendar-content">
          <div id="calendar-overdue-section">
            <div className="flex items-center space-x-2 border-b border-red-100 pb-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <h3 className="text-xs font-sans font-bold text-red-700 uppercase tracking-wider">Overdue Deadlines ({overdue.length})</h3>
            </div>

            <div className="space-y-3">
              {overdue.map((c) => renderDeadlineCard(c, 'red'))}
              {overdue.length === 0 && (
                <p className="text-xs text-slate-400 italic py-2 pl-1">Great! No active overdue survey target dates.</p>
              )}
            </div>
          </div>

          <div id="calendar-week-section">
            <div className="flex items-center space-x-2 border-b border-sky-100 pb-2 mb-4">
              <Clock className="h-4 w-4 text-sky-600" />
              <h3 className="text-xs font-sans font-bold text-sky-800 uppercase tracking-wider">Due This Week ({dueThisWeek.length})</h3>
            </div>

            <div className="space-y-3">
              {dueThisWeek.map((c) => renderDeadlineCard(c, 'sky'))}
              {dueThisWeek.length === 0 && (
                <p className="text-xs text-slate-400 italic py-2 pl-1">No major survey deadlines scheduled for the next 7 days.</p>
              )}
            </div>
          </div>

          <div id="calendar-later-section">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 mb-4">
              <Calendar className="h-4 w-4 text-slate-600" />
              <h3 className="text-xs font-sans font-bold text-slate-600 uppercase tracking-wider">Upcoming Later ({dueLater.length})</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dueLater.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className="bg-white hover:bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col justify-between cursor-pointer transition-all shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-slate-400">
                      <span className="font-bold text-slate-700">{formatReadableDate(c.deadline)}</span>
                      <span className="truncate">{getVesselName(c.vesselId)}</span>
                    </div>
                    <h4 className="text-xs font-sans font-bold text-slate-900 mt-1.5 line-clamp-1">{c.subject}</h4>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                      <span><MapPin className="h-3 w-3 inline mr-1" />{getPortName(c.portId)}</span>
                      {c.poNumber && <span className="text-emerald-700 font-bold">PO: {c.poNumber}</span>}
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-semibold border border-slate-200">
                      {c.status}
                    </span>
                    <span className="text-[10px] text-sky-600 font-semibold flex items-center">
                      <span>Inspect</span>
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}

              {dueLater.length === 0 && (
                <p className="text-xs text-slate-400 italic py-2 col-span-2">No future target dates recorded.</p>
              )}
            </div>
          </div>

          <div id="calendar-finished-section">
            <div className="flex items-center space-x-2 border-b border-emerald-100 pb-2 mb-4">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <h3 className="text-xs font-sans font-bold text-emerald-700 uppercase tracking-wider">Completed / Closed Survey Deadlines ({completedWithDeadlines.length})</h3>
            </div>

            <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              {completedWithDeadlines.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 text-xs transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-[10px] font-mono text-slate-400">
                      Target Date: {formatReadableDate(c.deadline)} • Vessel: {getVesselName(c.vesselId)} • Port: {getPortName(c.portId)}
                    </p>
                    <h4 className="font-sans font-semibold text-slate-700 mt-1 truncate">{c.subject}</h4>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded text-[10px] font-sans font-bold border border-emerald-100">
                      Finished
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              ))}

              {completedWithDeadlines.length === 0 && (
                <p className="text-xs text-slate-400 italic py-4 text-center">No closed survey deadlines in history logs.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
