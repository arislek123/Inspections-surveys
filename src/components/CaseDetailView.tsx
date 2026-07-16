/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Clock, 
  User, 
  Anchor, 
  MapPin, 
  FileText, 
  Mail, 
  MessageSquare, 
  Check, 
  Plus, 
  Trash2, 
  Send, 
  CornerDownRight, 
  CornerDownLeft, 
  Paperclip,
  Calendar,
  AlertTriangle,
  FileCheck,
  Edit2
} from 'lucide-react';
import { Case, Vessel, Port, Comment, Email, CaseStatus, CasePriority } from '../types';

interface CaseDetailViewProps {
  caseItem: Case;
  vessels: Vessel[];
  ports: Port[];
  onBack: () => void;
  onUpdateCase: (updatedCase: Case) => void;
  onDeleteCase: (caseId: string) => void;
}

export default function CaseDetailView({ 
  caseItem, 
  vessels, 
  ports, 
  onBack, 
  onUpdateCase, 
  onDeleteCase 
}: CaseDetailViewProps) {
  
  // Tab within Detail (Background details, Correspondence, Comments)
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'emails' | 'comments'>('all');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const toDateTimeLocal = (iso?: string) => {
    if (!iso) return new Date().toISOString().slice(0, 16);
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 16);
    const offsetMs = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
  };

  // New / edit comment state
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('Technical Department');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentAuthor, setEditingCommentAuthor] = useState('');
  const [editingCommentContent, setEditingCommentContent] = useState('');

  // New Email Form State
  const [showMailForm, setShowMailForm] = useState(false);
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [mailDate, setMailDate] = useState(() => toDateTimeLocal());
  const [mailRef, setMailRef] = useState(() => {
    // Attempt to guess next ref
    const count = caseItem.emails.length;
    const groupNum = Math.floor(count / 2) + 1;
    const isReply = count % 2 === 1;
    return `${groupNum}${isReply ? 'b' : 'a'}`;
  });
  const [mailDirection, setMailDirection] = useState<'Incoming' | 'Outgoing'>('Outgoing');
  const [mailSender, setMailSender] = useState('technical@trustbulkers.gr');
  const [mailRecipient, setMailRecipient] = useState('');
  const [mailSubject, setMailSubject] = useState(`Re: ${caseItem.subject}`);
  const [mailSummary, setMailSummary] = useState('');
  const [mailContent, setMailContent] = useState('');
  const [mailAttachments, setMailAttachments] = useState('');
  const [mailFollowUp, setMailFollowUp] = useState(false);
  const [mailImportant, setMailImportant] = useState(false);

  // Edit core descriptions state
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  const [backgroundDetails, setBackgroundDetails] = useState(caseItem.details);
  
  // Edit Next Actions state
  const [isEditingNextAction, setIsEditingNextAction] = useState(false);
  const [nextActionText, setNextActionText] = useState(caseItem.nextAction || '');
  const [nextActionResp, setNextActionResp] = useState(caseItem.nextActionResponsible || '');
  const [nextActionDue, setNextActionDue] = useState(caseItem.nextActionDueDate || '');
  const [nextActionRem, setNextActionRem] = useState(caseItem.nextActionReminder || '');

  // Edit Case Summary states
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summarySubject, setSummarySubject] = useState(caseItem.subject);
  const [summaryVesselId, setSummaryVesselId] = useState(caseItem.vesselId);
  const [summaryPortId, setSummaryPortId] = useState(caseItem.portId);
  const [summaryJobType, setSummaryJobType] = useState(caseItem.jobType);
  const [summaryResponsiblePerson, setSummaryResponsiblePerson] = useState(caseItem.responsiblePerson);
  const [summaryCreatedDate, setSummaryCreatedDate] = useState(caseItem.createdDate);
  const [summaryDeadline, setSummaryDeadline] = useState(caseItem.deadline || '');
  const [summaryAgent, setSummaryAgent] = useState(caseItem.agent || '');
  const [summaryVendor, setSummaryVendor] = useState(caseItem.vendor || '');
  const [summaryAuthority, setSummaryAuthority] = useState(caseItem.authority || '');
  const [summarySurveyor, setSummarySurveyor] = useState(caseItem.surveyor || '');
  const [summaryAttachments, setSummaryAttachments] = useState(caseItem.attachments || '');

  useEffect(() => {
    setSummarySubject(caseItem.subject);
    setSummaryVesselId(caseItem.vesselId);
    setSummaryPortId(caseItem.portId);
    setSummaryJobType(caseItem.jobType);
    setSummaryResponsiblePerson(caseItem.responsiblePerson);
    setSummaryCreatedDate(caseItem.createdDate);
    setSummaryDeadline(caseItem.deadline || '');
    setSummaryAgent(caseItem.agent || '');
    setSummaryVendor(caseItem.vendor || '');
    setSummaryAuthority(caseItem.authority || '');
    setSummarySurveyor(caseItem.surveyor || '');
    setSummaryAttachments(caseItem.attachments || '');
    setBackgroundDetails(caseItem.details);
    setNextActionText(caseItem.nextAction || '');
    setNextActionResp(caseItem.nextActionResponsible || '');
    setNextActionDue(caseItem.nextActionDueDate || '');
    setNextActionRem(caseItem.nextActionReminder || '');
  }, [caseItem]);

  // Helper resolvers
  const vessel = vessels.find(v => v.id === caseItem.vesselId);
  const port = ports.find(p => p.id === caseItem.portId);

  // Quick state change trigger
  const handleStatusChange = (newStatus: CaseStatus) => {
    const updated: Case = {
      ...caseItem,
      status: newStatus,
      lastUpdatedDate: new Date().toISOString()
    };
    onUpdateCase(updated);
    
    // Automatically return to the list when status has left its filter context (finished / active toggle)
    if (newStatus === 'Finished' || caseItem.status === 'Finished') {
      onBack();
    }
  };

  const handlePriorityChange = (newPriority: CasePriority) => {
    const updated: Case = {
      ...caseItem,
      priority: newPriority,
      lastUpdatedDate: new Date().toISOString()
    };
    onUpdateCase(updated);
  };

  // Submit internal comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !commentAuthor.trim()) return;

    const newComment: Comment = {
      id: `co-${Date.now()}`,
      author: commentAuthor.trim(),
      date: new Date().toISOString(),
      content: commentText.trim()
    };

    const updated: Case = {
      ...caseItem,
      comments: [...caseItem.comments, newComment],
      lastUpdatedDate: new Date().toISOString()
    };

    onUpdateCase(updated);
    setCommentText('');
  };

  const handleStartEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentAuthor(comment.author || 'Technical Department');
    setEditingCommentContent(comment.content || '');
  };

  const handleSaveComment = () => {
    if (!editingCommentId || !editingCommentContent.trim() || !editingCommentAuthor.trim()) return;
    const updated: Case = {
      ...caseItem,
      comments: caseItem.comments.map(comment => comment.id === editingCommentId
        ? {
            ...comment,
            author: editingCommentAuthor.trim(),
            content: editingCommentContent.trim(),
            date: new Date().toISOString()
          }
        : comment
      ),
      lastUpdatedDate: new Date().toISOString()
    };
    onUpdateCase(updated);
    setEditingCommentId(null);
    setEditingCommentAuthor('');
    setEditingCommentContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    const target = caseItem.comments.find(comment => comment.id === commentId);
    if (!target) return;
    if (!confirm('Delete this internal note?')) return;
    const updated: Case = {
      ...caseItem,
      comments: caseItem.comments.filter(comment => comment.id !== commentId),
      lastUpdatedDate: new Date().toISOString()
    };
    onUpdateCase(updated);
    if (editingCommentId === commentId) {
      setEditingCommentId(null);
      setEditingCommentAuthor('');
      setEditingCommentContent('');
    }
  };

  const resetMailFormForNew = (emailCount = caseItem.emails.length) => {
    const groupNum = Math.floor(emailCount / 2) + 1;
    const isReply = emailCount % 2 === 1;
    setEditingEmailId(null);
    setMailRef(`${groupNum}${isReply ? 'b' : 'a'}`);
    setMailDate(toDateTimeLocal());
    setMailDirection('Outgoing');
    setMailSender('technical@trustbulkers.gr');
    setMailRecipient('');
    setMailSubject(`Re: ${caseItem.subject}`);
    setMailSummary('');
    setMailContent('');
    setMailAttachments('');
    setMailFollowUp(false);
    setMailImportant(false);
  };

  const handleStartEditEmail = (email: Email) => {
    setEditingEmailId(email.id);
    setMailRef(email.ref || '');
    setMailDate(toDateTimeLocal(email.date));
    setMailDirection(email.direction);
    setMailSender(email.sender || '');
    setMailRecipient(email.recipient || '');
    setMailSubject(email.subject || '');
    setMailSummary(email.summary || '');
    setMailContent(email.content || '');
    setMailAttachments(email.attachments || '');
    setMailFollowUp(!!email.followUpRequired);
    setMailImportant(!!email.isImportant);
    setShowMailForm(true);
    setExpandedEmails(prev => ({ ...prev, [email.id]: true }));
  };

  const handleDeleteEmail = (emailId: string) => {
    const target = caseItem.emails.find(e => e.id === emailId);
    if (!target) return;
    if (!confirm(`Delete mail entry ${target.ref} - ${target.subject}?`)) return;

    const updated: Case = {
      ...caseItem,
      emails: caseItem.emails.filter(e => e.id !== emailId),
      lastUpdatedDate: new Date().toISOString()
    };
    onUpdateCase(updated);
    if (editingEmailId === emailId) {
      setShowMailForm(false);
      resetMailFormForNew(updated.emails.length);
    }
  };

  // Submit or update email entry
  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailSender.trim() || !mailRecipient.trim() || !mailSubject.trim() || !mailSummary.trim()) {
      alert('Please fill out the sender, recipient, subject and summary.');
      return;
    }

    const cleanEmail: Email = {
      id: editingEmailId || `em-${Date.now()}`,
      ref: mailRef.trim(),
      direction: mailDirection,
      sender: mailSender.trim(),
      recipient: mailRecipient.trim(),
      subject: mailSubject.trim(),
      date: mailDate ? new Date(mailDate).toISOString() : new Date().toISOString(),
      summary: mailSummary.trim(),
      content: mailContent.trim(),
      attachments: mailAttachments.trim() || undefined,
      followUpRequired: mailFollowUp,
      isImportant: mailImportant
    };

    const updatedEmails = editingEmailId
      ? caseItem.emails.map(email => email.id === editingEmailId ? cleanEmail : email)
      : [...caseItem.emails, cleanEmail];

    const updated: Case = {
      ...caseItem,
      emails: updatedEmails,
      lastUpdatedDate: new Date().toISOString()
    };

    onUpdateCase(updated);
    setShowMailForm(false);
    resetMailFormForNew(updatedEmails.length);
  };

  // Save modified background description
  const handleSaveBackground = () => {
    const updated: Case = {
      ...caseItem,
      details: backgroundDetails.trim(),
      lastUpdatedDate: new Date().toISOString()
    };
    onUpdateCase(updated);
    setIsEditingBackground(false);
  };

  // Save modified next action
  const handleSaveNextAction = () => {
    const updated: Case = {
      ...caseItem,
      nextAction: nextActionText.trim(),
      nextActionResponsible: nextActionResp.trim() || undefined,
      nextActionDueDate: nextActionDue || undefined,
      nextActionReminder: nextActionRem.trim() || undefined,
      lastUpdatedDate: new Date().toISOString()
    };
    onUpdateCase(updated);
    setIsEditingNextAction(false);
  };

  // Save modified Case Summary
  const handleSaveSummary = () => {
    if (!summarySubject.trim()) {
      alert('Case Subject cannot be empty.');
      return;
    }
    const updated: Case = {
      ...caseItem,
      subject: summarySubject.trim(),
      vesselId: summaryVesselId,
      portId: summaryPortId,
      jobType: summaryJobType.trim(),
      responsiblePerson: summaryResponsiblePerson.trim(),
      createdDate: summaryCreatedDate,
      deadline: summaryDeadline ? summaryDeadline : undefined,
      agent: summaryAgent.trim() || undefined,
      vendor: summaryVendor.trim() || undefined,
      authority: summaryAuthority.trim() || undefined,
      surveyor: summarySurveyor.trim() || undefined,
      attachments: summaryAttachments.trim() || undefined,
      lastUpdatedDate: new Date().toISOString()
    };
    onUpdateCase(updated);
    setIsEditingSummary(false);
  };

  // Email Expandable states
  const [expandedEmails, setExpandedEmails] = useState<{ [key: string]: boolean }>({});
  const toggleEmailExpand = (emailId: string) => {
    setExpandedEmails(prev => ({ ...prev, [emailId]: !prev[emailId] }));
  };

  // Confirm and Delete Case
  const handleDeleteCheck = () => {
    if (confirm(`Are you absolutely sure you want to delete technical case ${caseItem.id}? This action cannot be undone.`)) {
      onDeleteCase(caseItem.id);
    }
  };

  // Status Styling Colors
  let statusBadgeStyle = 'bg-slate-100 text-slate-700 border-slate-300';
  let statusCardBorder = 'border-slate-300 bg-slate-50';
  if (caseItem.status === 'In Progress') {
    statusBadgeStyle = 'bg-sky-100 text-sky-800 border-sky-300';
    statusCardBorder = 'border-sky-200 bg-sky-50/20';
  } else if (caseItem.status === 'Awaiting Reply') {
    statusBadgeStyle = 'bg-amber-100 text-amber-800 border-amber-300';
    statusCardBorder = 'border-amber-200 bg-amber-50/20';
  } else if (caseItem.status === 'Finished') {
    statusBadgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    statusCardBorder = 'border-emerald-200 bg-emerald-50/20';
  } else if (caseItem.status === 'Postponed') {
    statusBadgeStyle = 'bg-slate-100 text-slate-500 border-slate-300';
    statusCardBorder = 'border-slate-200 bg-slate-50/80';
  } else if (caseItem.status === 'Urgent') {
    statusBadgeStyle = 'bg-red-100 text-red-800 border-red-300';
    statusCardBorder = 'border-red-200 bg-red-50/20';
  } else if (caseItem.status === 'Postponed but Reopened') {
    statusBadgeStyle = 'bg-indigo-100 text-indigo-800 border-indigo-300';
    statusCardBorder = 'border-indigo-200 bg-indigo-50/20';
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]" id="case-detail-layout">
      {/* Detail Header breadcrumb bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0" id="case-detail-header">
        <div className="flex items-center space-x-4">
          <button 
            id="btn-back-to-cases"
            onClick={onBack} 
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            title="Back to Cases"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-mono font-bold text-slate-400">{caseItem.id}</span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-sm font-sans font-bold text-slate-900 uppercase tracking-wide">
                {vessel?.name || 'Unknown Vessel'}
              </span>
            </div>
            <h2 className="text-lg font-sans font-bold text-slate-800 mt-0.5 truncate max-w-lg md:max-w-2xl">
              {caseItem.subject}
            </h2>
          </div>
        </div>
 
        {/* Delete case utility */}
        {isConfirmingDelete ? (
          <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg p-1 px-2.5 animate-fadeIn">
            <span className="text-xs font-bold text-red-700 uppercase">Confirm Delete?</span>
            <button
              id="btn-delete-case-yes"
              type="button"
              onClick={() => {
                onDeleteCase(caseItem.id);
                setIsConfirmingDelete(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-2.5 py-1 rounded cursor-pointer transition-colors"
            >
              Yes, Delete
            </button>
            <button
              id="btn-delete-case-no"
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-2.5 py-1 rounded cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            id="btn-delete-case-master"
            onClick={() => setIsConfirmingDelete(true)}
            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Permanently Delete Case"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Case</span>
          </button>
        )}
      </div>
 
      {/* Main Split Workspace */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6" id="case-detail-split-workspace">
        
        {/* LEFT COLUMN: Operations & Status Panel (1/3 width) */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          
          {/* Summary Meta Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-sans font-bold text-slate-400 uppercase tracking-wider">Case Summary</h3>
              <button
                type="button"
                id="btn-toggle-edit-summary"
                onClick={() => {
                  if (isEditingSummary) {
                    setSummarySubject(caseItem.subject);
                    setSummaryVesselId(caseItem.vesselId);
                    setSummaryPortId(caseItem.portId);
                    setSummaryJobType(caseItem.jobType);
                    setSummaryResponsiblePerson(caseItem.responsiblePerson);
                    setSummaryCreatedDate(caseItem.createdDate);
                    setSummaryDeadline(caseItem.deadline || '');
                    setSummaryAgent(caseItem.agent || '');
                    setSummaryVendor(caseItem.vendor || '');
                    setSummaryAuthority(caseItem.authority || '');
                    setSummarySurveyor(caseItem.surveyor || '');
                    setSummaryAttachments(caseItem.attachments || '');
                  }
                  setIsEditingSummary(!isEditingSummary);
                }}
                className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center space-x-1 cursor-pointer bg-sky-50 px-2 py-1 rounded"
              >
                <Edit2 className="h-3 w-3" />
                <span>{isEditingSummary ? 'Cancel' : 'Edit Summary'}</span>
              </button>
            </div>
            
            {isEditingSummary ? (
              <div className="space-y-4 text-sm" id="edit-summary-form">
                <div>
                  <label className="block text-xs font-bold text-slate-400 font-sans uppercase">Case Subject / Title</label>
                  <input
                    type="text"
                    value={summarySubject}
                    onChange={(e) => setSummarySubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-sans font-bold text-slate-800 mt-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="e.g. M/V DANAE - Intermediate Class Survey & Boiler Examination"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 font-sans uppercase">Vessel</label>
                    <select
                      value={summaryVesselId}
                      onChange={(e) => setSummaryVesselId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                    >
                      {vessels.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 font-sans uppercase">Port Stay</label>
                    <select
                      value={summaryPortId}
                      onChange={(e) => setSummaryPortId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                    >
                      {ports.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.country})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 font-sans uppercase">Job Category</label>
                    <input
                      type="text"
                      value={summaryJobType}
                      onChange={(e) => setSummaryJobType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 font-sans uppercase">Superintendent</label>
                    <input
                      type="text"
                      value={summaryResponsiblePerson}
                      onChange={(e) => setSummaryResponsiblePerson(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 font-sans uppercase">Created Date</label>
                    <input
                      type="date"
                      value={summaryCreatedDate ? summaryCreatedDate.split('T')[0] : ''}
                      onChange={(e) => setSummaryCreatedDate(e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-mono mt-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 font-sans uppercase">Deadline</label>
                    <input
                      type="date"
                      value={summaryDeadline}
                      onChange={(e) => setSummaryDeadline(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-mono mt-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 font-sans uppercase">Port Agent</label>
                    <input
                      type="text"
                      value={summaryAgent}
                      onChange={(e) => setSummaryAgent(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="e.g. Santos Oceanica Agency"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 font-sans uppercase">Service Maker</label>
                    <input
                      type="text"
                      value={summaryVendor}
                      onChange={(e) => setSummaryVendor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="e.g. N/A"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 font-sans uppercase">Authority Involved</label>
                    <input
                      type="text"
                      value={summaryAuthority}
                      onChange={(e) => setSummaryAuthority(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="e.g. Bureau Veritas (BV)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 font-sans uppercase">Surveyor</label>
                    <input
                      type="text"
                      value={summarySurveyor}
                      onChange={(e) => setSummarySurveyor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="e.g. BV Santos Surveyor"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 font-sans uppercase">File Attachments (Ref)</label>
                    <input
                      type="text"
                      value={summaryAttachments}
                      onChange={(e) => setSummaryAttachments(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-mono mt-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="e.g. quote_89.pdf"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    id="btn-save-summary"
                    onClick={handleSaveSummary}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-lg text-sm font-bold font-sans cursor-pointer transition-all shadow-sm text-center"
                  >
                    Save Case Summary
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-sm">
              <div>
                <p className="text-xs text-slate-400 font-sans uppercase">Vessel</p>
                <div className="flex items-center space-x-1 mt-0.5 font-sans font-bold text-slate-900">
                  <Anchor className="h-3.5 w-3.5 text-slate-500" />
                  <span>{vessel?.name || 'N/A'}</span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">IMO: {vessel?.imo || 'N/A'}</p>
              </div>
 
              <div>
                <p className="text-xs text-slate-400 font-sans uppercase">Port Stay</p>
                <div className="flex items-center space-x-1 mt-0.5 font-sans font-bold text-slate-900">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>{port?.name || 'N/A'}</span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{port?.country || 'N/A'}</p>
              </div>
 
              <div>
                <p className="text-xs text-slate-400 font-sans uppercase">Job Category</p>
                <p className="font-sans font-semibold text-slate-800 mt-0.5">{caseItem.jobType}</p>
              </div>
 
              <div>
                <p className="text-xs text-slate-400 font-sans uppercase">Superintendent</p>
                <div className="flex items-center space-x-1 mt-0.5 font-sans text-slate-700">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{caseItem.responsiblePerson}</span>
                </div>
              </div>
 
              <div>
                <p className="text-xs text-slate-400 font-sans uppercase">Created</p>
                <p className="font-mono text-slate-600 mt-0.5">{new Date(caseItem.createdDate).toLocaleDateString()}</p>
              </div>
 
              <div>
                <p className="text-xs text-slate-400 font-sans uppercase">Deadline</p>
                <p className={`font-mono mt-0.5 ${caseItem.deadline ? 'text-red-600 font-semibold' : 'text-slate-400'}`}>
                  {caseItem.deadline || 'No target date'}
                </p>
              </div>
            </div>
 
            {/* Extra shipping logistics data if available */}
            {(caseItem.agent || caseItem.vendor || caseItem.authority || caseItem.eta) && (
              <div className="pt-3 border-t border-slate-100 space-y-2 text-sm">
                {caseItem.agent && (
                  <p className="text-sm text-slate-600 font-sans">
                    <strong>Port Agent:</strong> <span className="text-slate-800">{caseItem.agent}</span>
                  </p>
                )}
                {caseItem.vendor && (
                  <p className="text-sm text-slate-600 font-sans">
                    <strong>Service Maker:</strong> <span className="text-slate-800">{caseItem.vendor}</span>
                  </p>
                )}
                {caseItem.authority && (
                  <p className="text-sm text-slate-600 font-sans">
                    <strong>Authority Involved:</strong> <span className="text-slate-800">{caseItem.authority}</span>
                  </p>
                )}
                {caseItem.surveyor && (
                  <p className="text-sm text-slate-600 font-sans">
                    <strong>Surveyor:</strong> <span className="text-slate-800">{caseItem.surveyor}</span>
                  </p>
                )}
                {caseItem.attachments && (
                  <p className="text-sm text-slate-600 font-sans flex items-start space-x-1">
                    <Paperclip className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="break-all font-mono text-xs text-slate-500">{caseItem.attachments}</span>
                  </p>
                )}
              </div>
            )}
              </>
            )}
          </div>

          {/* Status & Priority Phase Selector */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-sans font-bold text-slate-400 uppercase tracking-wider">Operational Phase</h3>
              <span className={`px-2 py-0.5 rounded text-xs font-sans font-bold border ${statusBadgeStyle}`}>
                {caseItem.status}
              </span>
            </div>

            {/* Status change grid */}
            <div className="space-y-1.5">
              <p className="text-xs text-slate-400 font-sans uppercase">Quick Change Status:</p>
              <div className="grid grid-cols-2 gap-1.5" id="status-selection-grid">
                {[
                  { statusName: 'In Progress', color: 'hover:bg-sky-50 hover:text-sky-800 hover:border-sky-300' },
                  { statusName: 'Awaiting Reply', color: 'hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300' },
                  { statusName: 'Finished', color: 'hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300' },
                  { statusName: 'Postponed', color: 'hover:bg-slate-100 hover:text-slate-600 hover:border-slate-300' },
                  { statusName: 'Urgent', color: 'hover:bg-red-50 hover:text-red-800 hover:border-red-300' },
                  { statusName: 'Postponed but Reopened', color: 'hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-300' }
                ].map(({ statusName, color }) => (
                  <button
                    key={statusName}
                    type="button"
                    id={`btn-set-status-${statusName.replace(/\s+/g, '-')}`}
                    onClick={() => handleStatusChange(statusName as CaseStatus)}
                    className={`px-2 py-1 text-xs font-sans font-semibold rounded border text-left cursor-pointer transition-colors truncate ${
                      caseItem.status === statusName
                        ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-sm font-bold'
                        : `bg-white text-slate-600 border-slate-200 ${color}`
                    }`}
                  >
                    {statusName}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority quick toggle */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <p className="text-xs text-slate-400 font-sans uppercase">Urgency Priority:</p>
              <div className="flex items-center space-x-1" id="priority-selector-bar">
                {(['Low', 'Medium', 'High', 'Critical'] as CasePriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    id={`btn-set-prio-${p}`}
                    onClick={() => handlePriorityChange(p)}
                    className={`flex-1 text-center py-1 text-xs font-sans font-bold rounded border transition-colors cursor-pointer ${
                      caseItem.priority === p
                        ? p === 'Critical' ? 'bg-red-600 text-white border-red-600 shadow-sm' :
                          p === 'High' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' :
                          p === 'Medium' ? 'bg-slate-700 text-white border-slate-700 shadow-sm' :
                          'bg-slate-400 text-white border-slate-400 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Next Action Box */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-sans font-bold text-slate-400 uppercase tracking-wider">Next Action Tracker</h3>
              <button
                type="button"
                id="btn-toggle-edit-next-action"
                onClick={() => setIsEditingNextAction(!isEditingNextAction)}
                className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Edit2 className="h-3 w-3" />
                <span>{isEditingNextAction ? 'Cancel' : 'Update'}</span>
              </button>
            </div>

            {isEditingNextAction ? (
              <div className="space-y-3" id="edit-next-action-form">
                <div>
                  <label htmlFor="edit-na-text" className="block text-xs font-sans font-bold text-slate-500 uppercase">Immediate Next Action</label>
                  <input
                    type="text"
                    id="edit-na-text"
                    value={nextActionText}
                    onChange={(e) => setNextActionText(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="edit-na-resp" className="block text-xs font-sans font-bold text-slate-500 uppercase">Responsible Person</label>
                  <input
                    type="text"
                    id="edit-na-resp"
                    value={nextActionResp}
                    onChange={(e) => setNextActionResp(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="edit-na-due" className="block text-xs font-sans font-bold text-slate-500 uppercase">Action Due Date</label>
                  <input
                    type="date"
                    id="edit-na-due"
                    value={nextActionDue}
                    onChange={(e) => setNextActionDue(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="edit-na-rem" className="block text-xs font-sans font-bold text-slate-500 uppercase">Action Reminder Note</label>
                  <input
                    type="text"
                    id="edit-na-rem"
                    value={nextActionRem}
                    onChange={(e) => setNextActionRem(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="e.g. Call agent Monday morning"
                  />
                </div>
                <button
                  type="button"
                  id="btn-save-next-action"
                  onClick={handleSaveNextAction}
                  className="w-full bg-[#0f172a] hover:bg-slate-800 text-white py-1.5 rounded-lg text-sm font-semibold font-sans cursor-pointer transition-all shadow-sm"
                >
                  Save Next Action
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 text-sm text-slate-700" id="display-next-action-card">
                <div className="bg-sky-50/40 border border-sky-100 p-3 rounded-lg">
                  <p className="text-xs text-sky-700 font-sans font-bold uppercase tracking-wider">Action Required</p>
                  <p className="font-sans font-bold text-slate-800 mt-1">{caseItem.nextAction || 'No next action described yet.'}</p>
                </div>
                {caseItem.nextActionResponsible && (
                  <p className="text-sm">
                    <strong>Assigned:</strong> <span className="text-slate-900">{caseItem.nextActionResponsible}</span>
                  </p>
                )}
                {caseItem.nextActionDueDate && (
                  <p className="text-sm flex items-center space-x-1 text-red-600 font-semibold">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Due Date: {caseItem.nextActionDueDate}</span>
                  </p>
                )}
                {caseItem.nextActionReminder && (
                  <p className="text-sm text-slate-500 bg-slate-100/60 p-2 rounded italic">
                    <strong>Memo:</strong> {caseItem.nextActionReminder}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Comments internal log section */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 flex-1 flex flex-col">
            <div className="flex items-center space-x-1.5">
              <MessageSquare className="h-4 w-4 text-slate-700" />
              <h3 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider">Internal Log Notes ({caseItem.comments.length})</h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-56" id="internal-comments-timeline">
              {caseItem.comments.map((comment) => (
                <div key={comment.id} className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 text-sm">
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingCommentAuthor}
                        onChange={(e) => setEditingCommentAuthor(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-sky-500"
                        placeholder="Author"
                      />
                      <textarea
                        rows={3}
                        value={editingCommentContent}
                        onChange={(e) => setEditingCommentContent(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                        placeholder="Internal note"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCommentId(null)}
                          className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveComment}
                          className="px-2 py-1 text-xs rounded bg-sky-600 hover:bg-sky-700 text-white font-bold"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between font-medium text-xs text-slate-400">
                        <span className="font-sans font-bold text-slate-600">{comment.author || 'Technical Department'}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{new Date(comment.date).toLocaleDateString()}</span>
                          <button
                            type="button"
                            onClick={() => handleStartEditComment(comment)}
                            className="text-sky-600 hover:text-sky-800 font-bold"
                            title="Edit note"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500 hover:text-red-700 font-bold"
                            title="Delete note"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-700 font-sans mt-1 whitespace-pre-wrap">{comment.content}</p>
                    </>
                  )}
                </div>
              ))}
              {caseItem.comments.length === 0 && (
                <p className="text-sm text-slate-400 italic text-center py-6">No internal remarks posted yet.</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-100 space-y-2 shrink-0" id="comment-form-master">
              <input
                type="text"
                id="comment-author"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2.5 py-1 text-sm font-sans focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
              <div className="relative">
                <textarea
                  id="comment-text"
                  rows={2}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Type an internal superintendent comment..."
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-sm font-sans focus:bg-white resize-none pr-10 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
                <button
                  type="submit"
                  id="btn-comment-submit"
                  className="absolute right-2 bottom-3 text-sky-600 hover:text-sky-800 p-1 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Full Case Details & Correspondence Timeline (2/3 width) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {/* Detailed Background Description Area */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1.5">
                <FileText className="h-4 w-4 text-slate-700" />
                <h3 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider">Detailed Scope & Background</h3>
              </div>
              <button
                type="button"
                id="btn-toggle-edit-background"
                onClick={() => setIsEditingBackground(!isEditingBackground)}
                className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Edit2 className="h-3 w-3" />
                <span>{isEditingBackground ? 'Cancel' : 'Edit Background'}</span>
              </button>
            </div>

            {isEditingBackground ? (
              <div className="space-y-3" id="edit-background-form">
                <textarea
                  id="edit-background-details"
                  rows={6}
                  value={backgroundDetails}
                  onChange={(e) => setBackgroundDetails(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg p-3 text-sm font-sans focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => { setBackgroundDetails(caseItem.details); setIsEditingBackground(false); }}
                    className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    id="btn-save-background"
                    onClick={handleSaveBackground}
                    className="px-4 py-1.5 text-sm bg-[#0f172a] hover:bg-slate-800 text-white font-semibold rounded-lg cursor-pointer shadow-sm transition-all"
                  >
                    Save Background
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-wrap" id="display-background-text">
                {caseItem.details || 'No details specified yet.'}
              </div>
            )}
          </div>

          {/* Mail Correspondence Timeline Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-4 space-y-3 sm:space-y-0 shrink-0">
              <div className="flex items-center space-x-1.5">
                <Mail className="h-4.5 w-4.5 text-slate-700" />
                <div>
                  <h3 className="text-sm font-sans font-bold text-[#0f172a] uppercase tracking-wider">Mail Correspondence Timeline</h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Track incoming/outgoing messages chronologically.</p>
                </div>
              </div>

              {/* Add New Mail Button */}
              <button
                type="button"
                id="btn-trigger-add-email"
                onClick={() => {
                  if (!showMailForm) resetMailFormForNew(caseItem.emails.length);
                  setShowMailForm(!showMailForm);
                }}
                className="px-3.5 py-1.5 text-sm bg-[#0f172a] hover:bg-slate-800 text-slate-100 font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 text-white" />
                <span>{showMailForm ? 'Hide Form' : 'Add Mail Entry'}</span>
              </button>
            </div>

            {/* Quick Add Email Form Panel (Inline Collapsible) */}
            {showMailForm && (
              <form onSubmit={handleSubmitEmail} className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl mb-6 space-y-4 animate-fadeIn shrink-0" id="add-email-timeline-form">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-sans font-bold text-slate-700">{editingEmailId ? 'Edit Correspondence Log' : 'New Correspondence Log'}</h4>
                  <span className="text-xs font-mono font-bold text-slate-400">Ref: {mailRef}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Direction */}
                  <div>
                    <label htmlFor="mail-direction" className="block text-xs font-sans font-bold text-slate-500 uppercase mb-1">Direction</label>
                    <select
                      id="mail-direction"
                      value={mailDirection}
                      onChange={(e) => setMailDirection(e.target.value as 'Incoming' | 'Outgoing')}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="Outgoing">Outgoing (We Sent)</option>
                      <option value="Incoming">Incoming (We Received)</option>
                    </select>
                  </div>

                  {/* Mail reference number */}
                  <div>
                    <label htmlFor="mail-ref-input" className="block text-xs font-sans font-bold text-slate-500 uppercase mb-1">Mail Ref Code (e.g. 1a, 1b)</label>
                    <input
                      type="text"
                      id="mail-ref-input"
                      value={mailRef}
                      onChange={(e) => setMailRef(e.target.value)}
                      placeholder="e.g. 3a"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label htmlFor="mail-date" className="block text-xs font-sans font-bold text-slate-500 uppercase mb-1">Date Logged</label>
                    <input
                      id="mail-date"
                      type="datetime-local"
                      value={mailDate}
                      onChange={(e) => setMailDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Sender */}
                  <div className="md:col-span-1">
                    <label htmlFor="mail-sender" className="block text-xs font-sans font-bold text-slate-500 uppercase mb-1">Sender Email</label>
                    <input
                      type="email"
                      id="mail-sender"
                      value={mailSender}
                      onChange={(e) => setMailSender(e.target.value)}
                      placeholder="from@domain.com"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    />
                  </div>

                  {/* Recipient */}
                  <div className="md:col-span-1">
                    <label htmlFor="mail-recipient" className="block text-xs font-sans font-bold text-slate-500 uppercase mb-1">Recipient Email</label>
                    <input
                      type="text"
                      id="mail-recipient"
                      value={mailRecipient}
                      onChange={(e) => setMailRecipient(e.target.value)}
                      placeholder="to@domain.com"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    />
                  </div>

                  {/* Attachments */}
                  <div className="md:col-span-1">
                    <label htmlFor="mail-attachments" className="block text-xs font-sans font-bold text-slate-500 uppercase mb-1">File Attachments (Ref)</label>
                    <input
                      type="text"
                      id="mail-attachments"
                      value={mailAttachments}
                      onChange={(e) => setMailAttachments(e.target.value)}
                      placeholder="e.g. quote_89.pdf"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  {/* Subject */}
                  <div className="md:col-span-3">
                    <label htmlFor="mail-subject" className="block text-xs font-sans font-bold text-slate-500 uppercase mb-1">Subject of Mail</label>
                    <input
                      type="text"
                      id="mail-subject"
                      value={mailSubject}
                      onChange={(e) => setMailSubject(e.target.value)}
                      placeholder="Re: Vessel BWTS Check"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    />
                  </div>

                  {/* Short Summary */}
                  <div className="md:col-span-3">
                    <label htmlFor="mail-summary" className="block text-xs font-sans font-bold text-slate-500 uppercase mb-1">Short Operational Summary (One Line) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="mail-summary"
                      value={mailSummary}
                      onChange={(e) => setMailSummary(e.target.value)}
                      placeholder="e.g. Agent confirmed boarding pass clearance issued for surveyor."
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    />
                  </div>

                  {/* Full Text Notes */}
                  <div className="md:col-span-3">
                    <label htmlFor="mail-content" className="block text-xs font-sans font-bold text-slate-500 uppercase mb-1">Full Email Body / Private Remarks</label>
                    <textarea
                      id="mail-content"
                      rows={3}
                      value={mailContent}
                      onChange={(e) => setMailContent(e.target.value)}
                      placeholder="Paste the full email contents here for complete audit trails..."
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Flags */}
                <div className="flex items-center space-x-6 pt-1 text-sm font-medium">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mailFollowUp}
                      onChange={(e) => setMailFollowUp(e.target.checked)}
                      className="h-4 w-4 border-slate-200 rounded focus:ring-1 focus:ring-sky-500"
                    />
                    <span className="text-amber-700">Follow-up Required (Awaiting Reply)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mailImportant}
                      onChange={(e) => setMailImportant(e.target.checked)}
                      className="h-4 w-4 border-slate-200 rounded focus:ring-1 focus:ring-sky-500"
                    />
                    <span className="text-red-700">Flag as Important</span>
                  </label>
                </div>

                {/* Form buttons */}
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowMailForm(false); resetMailFormForNew(caseItem.emails.length); }}
                    className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-add-email-submit"
                    className="px-4 py-1.5 text-sm bg-[#0f172a] hover:bg-slate-800 text-white font-semibold rounded-lg cursor-pointer shadow-sm transition-all"
                  >
                    {editingEmailId ? 'Save Mail Entry' : 'Log Message'}
                  </button>
                </div>
              </form>
            )}

            {/* Email timeline stream */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[450px]" id="email-timeline-stream">
              {caseItem.emails.map((email) => {
                const isExpanded = !!expandedEmails[email.id];
                const isOutgoing = email.direction === 'Outgoing';

                return (
                  <div 
                    key={email.id} 
                    id={`timeline-email-${email.id}`}
                    className={`border rounded-xl transition-all ${
                      isOutgoing 
                        ? 'border-slate-200 bg-white shadow-sm' 
                        : 'border-slate-100 bg-slate-50/50'
                    }`}
                  >
                    {/* Collapsed Header click area */}
                    <div 
                      onClick={() => toggleEmailExpand(email.id)}
                      className="p-4 flex items-start justify-between cursor-pointer hover:bg-slate-50/40 select-none"
                    >
                      <div className="flex items-start space-x-3 min-w-0">
                        {/* Direction Arrow Icon Badge */}
                        <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                          isOutgoing ? 'bg-slate-100 text-slate-600' : 'bg-sky-50 text-sky-600'
                        }`}>
                          {isOutgoing ? (
                            <CornerDownRight className="h-4 w-4" />
                          ) : (
                            <CornerDownLeft className="h-4 w-4" />
                          )}
                        </div>

                        {/* Summary Block */}
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-xs bg-slate-800 text-slate-100 px-1.5 py-0.2 rounded">
                              {email.ref}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              {new Date(email.date).toLocaleDateString()} {new Date(email.date).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})}
                            </span>
                            {email.isImportant && (
                              <span className="bg-red-100 text-red-700 font-bold font-sans text-xs px-1 rounded uppercase tracking-wider">
                                Important
                              </span>
                            )}
                            {email.followUpRequired && (
                              <span className="bg-amber-100 text-amber-700 font-bold font-sans text-xs px-1 rounded uppercase tracking-wider">
                                Awaiting Reply
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-sans font-bold text-slate-900 mt-1 truncate">
                            {email.subject}
                          </p>
                          <p className="text-xs text-slate-500 font-sans mt-0.5 italic">
                            {email.summary}
                          </p>
                        </div>
                      </div>

                      {/* Direction label + edit/delete actions */}
                      <div className="text-right shrink-0 pl-3 flex flex-col items-end gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-sans font-bold ${
                          isOutgoing ? 'bg-slate-100 text-slate-600' : 'bg-sky-100 text-sky-700'
                        }`}>
                          {email.direction}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleStartEditEmail(email);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors text-[11px] font-bold"
                            title="Edit mail entry"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteEmail(email.id);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-[11px] font-bold"
                            title="Delete mail entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Email Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100 animate-slideDown text-sm space-y-3.5">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/50 space-y-1">
                          <p className="font-sans text-xs">
                            <strong className="text-slate-500">From:</strong> {email.sender}
                          </p>
                          <p className="font-sans text-xs">
                            <strong className="text-slate-500">To:</strong> {email.recipient}
                          </p>
                          {email.attachments && (
                            <p className="font-mono text-xs text-slate-600 flex items-center space-x-1.5 mt-2">
                              <Paperclip className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span>Attachments: <strong>{email.attachments}</strong></span>
                            </p>
                          )}
                        </div>

                        {email.content ? (
                          <div className="whitespace-pre-wrap font-sans text-sm text-slate-800 leading-relaxed bg-white border border-slate-200/40 p-4 rounded-lg shadow-inner max-h-72 overflow-y-auto">
                            {email.content}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No full email body recorded.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {caseItem.emails.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                  <Mail className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-500">No email correspondences logged.</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Click 'Add Mail Entry' to keep a perfect chronological log of outgoing orders and incoming technician confirmations.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
