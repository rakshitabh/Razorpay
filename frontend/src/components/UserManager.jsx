import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, Clock } from 'lucide-react';

export default function UserManager({ token }) {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="bg-[#111827] border border-slate-800 p-6 rounded-lg">
      <div className="border-b border-slate-800 pb-3 mb-6 flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-white flex items-center">
          <Users className="w-4 h-4 mr-1.5 text-[#2563EB]" /> Analyst Accounts Control Board
        </h3>
        <span className="text-[9px] font-mono bg-[#2563EB]/15 text-[#2563EB] px-2.5 py-0.5 rounded border border-[#2563EB]/35">
          ADMIN SECURITY CONTROLS
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs font-mono animate-pulse">
          [QUERYING_USER_REGISTRY...] Fetching active security user profiles...
        </div>
      ) : usersList.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Access Role</th>
                <th className="py-2.5 px-3 text-center">Auth Status</th>
                <th className="py-2.5 px-3 text-right">Account Created</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((usr) => (
                <tr key={usr._id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition">
                  <td className="py-3.5 px-3 text-white font-semibold">{usr.name}</td>
                  <td className="py-3.5 px-3 text-slate-400">{usr.email}</td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      usr.role === 'admin' ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/35' :
                      usr.role === 'analyst' ? 'bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/35' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {usr.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {usr.isVerified ? (
                      <span className="inline-flex items-center text-[#10B981] text-[10px]">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> VERIFIED
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[#F59E0B] text-[10px] animate-pulse">
                        <Clock className="w-3.5 h-3.5 mr-1" /> PENDING
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-400">
                    {new Date(usr.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center text-slate-600 text-xs font-mono">
          No analysts registered in registry.
        </div>
      )}
    </div>
  );
}
