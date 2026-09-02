import React, { useState, useEffect } from 'react';
import { Send, Users, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { triggerNotification } from './NotificationCenter';

export default function AnalystNotes({ incidentId, token, currentAssigned, onUpdateIncident }) {
  const [notes, setNotes] = useState([]);
  const [comment, setComment] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [escalating, setEscalating] = useState(false);

  const analysts = ['Unassigned', 'Rakshita Bhat', 'Risk Lead', 'Compliance Lead', 'Security Admin'];

  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/notes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [incidentId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setAddingNote(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment })
      });

      if (res.ok) {
        setComment('');
        await fetchNotes();
        triggerNotification('Note Added', 'info', 'Comment logged in case timeline.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleAssignChange = async (e) => {
    const assigned = e.target.value;
    try {
      const res = await fetch(`/api/threats/${incidentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Investigating' }) // Shift status to investigating on assignment
      });

      if (res.ok) {
        const updated = await res.json();
        
        // Mock assigned update in fallback database since status is the main update API
        updated.assignedTo = assigned;
        onUpdateIncident(updated);
        
        triggerNotification(
          'Analyst Assigned',
          'success',
          `Case assigned to ${assigned}. Status updated to Investigating.`
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEscalate = async () => {
    setEscalating(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      triggerNotification(
        'Ticket Escalated',
        'critical',
        `Incident ${incidentId} escalated to Priority-1 Crisis Team.`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setEscalating(false);
    }
  };

  return (
    <div className="bg-[#111827] border border-slate-800 p-5 rounded-lg space-y-4 font-mono text-xs text-left">
      
      {/* Assign & Escalate Actions Row */}
      <div className="grid grid-cols-2 gap-3 border-b border-slate-850 pb-4 select-none">
        <div className="space-y-1">
          <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-bold">Assign Analyst</label>
          <div className="relative">
            <select
              value={currentAssigned || 'Unassigned'}
              onChange={handleAssignChange}
              className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-none focus:border-[#06B6D4] cursor-pointer"
            >
              {analysts.map((a, idx) => (
                <option key={idx} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1 flex flex-col justify-end">
          <button
            onClick={handleEscalate}
            disabled={escalating}
            className="w-full bg-[#DC2626]/10 hover:bg-[#DC2626]/20 border border-[#DC2626]/40 text-[#DC2626] py-2 rounded font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            {escalating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>ESCALATE TO L3</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notes Stream Panel */}
      <div className="space-y-3">
        <h4 className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Analyst Comment Log</h4>
        
        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
          {loadingNotes ? (
            <div className="text-slate-500 py-6 text-center text-[10px] animate-pulse">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="text-slate-600 text-[10px] py-4 italic text-center">[-] No analyst notes logged.</div>
          ) : (
            notes.map((note) => (
              <div key={note._id} className="bg-slate-900/50 border border-slate-850 p-3 rounded space-y-1">
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                  <span className="text-[#06B6D4]">{note.author}</span>
                  <span>{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">{note.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add note comment Form */}
      <form onSubmit={handleAddComment} className="flex gap-2 border-t border-slate-850 pt-3">
        <input
          type="text"
          placeholder="Log observation comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={addingNote}
          className="flex-grow bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white focus:outline-none focus:border-[#06B6D4] placeholder-slate-600"
        />
        <button
          type="submit"
          disabled={addingNote || !comment.trim()}
          className="bg-[#06B6D4] hover:bg-[#06B6D4]/80 text-[#0F172A] px-3.5 py-2 rounded font-bold transition flex items-center justify-center disabled:opacity-40 cursor-pointer"
        >
          {addingNote ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </form>

    </div>
  );
}
