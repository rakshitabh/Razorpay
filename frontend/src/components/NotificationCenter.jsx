import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, CheckCircle, Flame, FileText, X } from 'lucide-react';

let notificationListeners = [];

export const triggerNotification = (title, type = 'info', details = '') => {
  const newNotification = {
    id: Date.now() + Math.random().toString(),
    title,
    type,
    details,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    unread: true
  };
  notificationListeners.forEach(listener => listener(newNotification));
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Platform Handshake Completed',
      type: 'info',
      details: 'Risk engine connected to MongoDB and Gemini successfully.',
      timestamp: 'Just now',
      unread: false
    }
  ]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNewNotification = (noti) => {
      setNotifications(prev => [noti, ...prev]);
      setToasts(prev => [...prev, noti]);
      
      // Auto dismiss toast after 5s
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== noti.id));
      }, 5000);
    };

    notificationListeners.push(handleNewNotification);
    return () => {
      notificationListeners = notificationListeners.filter(l => l !== handleNewNotification);
    };
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'critical':
        return <Flame className="w-4 h-4 text-[#DC2626]" />;
      case 'fraud':
        return <ShieldAlert className="w-4 h-4 text-[#F97316]" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-[#10B981]" />;
      case 'report':
        return <FileText className="w-4 h-4 text-[#06B6D4]" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="relative font-mono text-xs select-none">
      {/* Bell Trigger */}
      <button 
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 relative cursor-pointer transition"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-[9px] text-white rounded-full flex items-center justify-center font-bold border-2 border-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2.5 w-80 bg-[#131C2E] border border-[#2A3A52] rounded-lg shadow-2xl overflow-hidden z-50">
          <div className="p-3 border-b border-[#2A3A52] flex items-center justify-between bg-[#0B1220]/60">
            <span className="font-bold text-white uppercase text-[10px] tracking-wider">Alert Ledger</span>
            <div className="space-x-2">
              <button 
                onClick={markAllRead} 
                className="text-[9px] text-[#38BDF8] hover:text-[#38BDF8]/80 transition cursor-pointer"
              >
                Mark Read
              </button>
              <span className="text-slate-700">|</span>
              <button 
                onClick={clearAll} 
                className="text-[9px] text-slate-500 hover:text-white transition cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-[#2A3A52]/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-505 text-[10px]">
                No alerts logged.
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-3 space-y-1 hover:bg-[#0B1220]/40 transition ${n.unread ? 'bg-[#0B1220]/25' : ''}`}
                >
                  <div className="flex items-start space-x-2">
                    <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate leading-tight ${n.unread ? 'text-white' : 'text-slate-300'}`}>
                        {n.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{n.details}</p>
                    </div>
                  </div>
                  <div className="text-[8px] text-slate-500 text-right">{n.timestamp}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Floating Toast Notification Box Drawer */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className="p-4 bg-[#131C2E] border border-[#2A3A52] rounded-lg shadow-2xl pointer-events-auto flex items-start space-x-3.5 animate-slide-in relative border-l-4 border-l-[#38BDF8]"
            style={{ borderLeftColor: t.type === 'critical' ? '#DC2626' : t.type === 'fraud' ? '#F97316' : t.type === 'success' ? '#10B981' : '#38BDF8' }}
          >
            <div className="mt-0.5 shrink-0">{getIcon(t.type)}</div>
            <div className="flex-grow min-w-0">
              <h5 className="font-bold text-white text-xs leading-tight">{t.title}</h5>
              <p className="text-[10px] text-slate-450 mt-1 leading-relaxed">{t.details}</p>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="text-slate-500 hover:text-white cursor-pointer shrink-0 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
