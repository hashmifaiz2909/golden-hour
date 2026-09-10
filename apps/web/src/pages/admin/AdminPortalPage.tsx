import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Search, Activity, Heart, User, MapPin, 
  ExternalLink, Sparkles, Filter, CheckCircle2, Radio 
} from 'lucide-react';
import { useResponder } from '../../context/ResponderContext';

export const AdminPortalPage: React.FC = () => {
  const { alerts, stats } = useResponder();
  const [searchTerm, setSearchTerm] = useState('');

  const sampleRegistry = [
    {
      tagId: 'GH-7749',
      name: 'Vikram Sengupta',
      bloodGroup: 'O+',
      phone: '+919876543210',
      allergies: 'Penicillin, Sulfa drugs',
      contacts: 'Pooja Sharma (+919876543211)',
      status: 'Active Protected',
      registeredAt: '2026-08-10'
    },
    {
      tagId: 'GH-9102',
      name: 'Priya Patel',
      bloodGroup: 'B+',
      phone: '+919822233344',
      allergies: 'NSAIDs / Ibuprofen, Peanuts',
      contacts: 'Nikhil Patel (+919822233355)',
      status: 'Active Protected',
      registeredAt: '2026-08-22'
    },
    {
      tagId: 'GH-3341',
      name: 'Vikram Chauhan',
      bloodGroup: 'AB+',
      phone: '+919811144556',
      allergies: 'None reported',
      contacts: 'Sunita Chauhan (+919811144557)',
      status: 'Active Protected',
      registeredAt: '2026-09-01'
    }
  ];

  const filtered = sampleRegistry.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F1F4EE] text-[#1A2421] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DFD6] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11332D]/10 text-[#11332D] text-xs font-mono font-bold uppercase">
              <Shield className="w-3.5 h-3.5 text-[#FF5A4E]" />
              <span>Admin Registry Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#11332D] font-display">
              Patient Registry & Incident Audit
            </h1>
            <p className="text-xs text-[#5A6B66]">
              Database directory of registered profiles, scan logs, and active dispatch states for trauma networks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/responder/dashboard"
              className="px-5 py-2.5 rounded-full bg-[#11332D] hover:bg-[#1C5C53] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-[#FF5A4E]" />
              <span>Open GIS Responder Map</span>
            </Link>
          </div>
        </div>

        {/* Top KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#D9DFD6] shadow-sm">
            <div className="text-[10px] uppercase font-bold text-[#5A6B66] font-mono">Registered Profiles</div>
            <div className="text-2xl font-black text-[#11332D] font-display mt-1">1,248</div>
            <span className="text-[11px] text-[#10B981] font-semibold">100% Encrypted</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#D9DFD6] shadow-sm">
            <div className="text-[10px] uppercase font-bold text-[#5A6B66] font-mono">Active Incidents</div>
            <div className="text-2xl font-black text-[#FF5A4E] font-display mt-1">{stats.activeIncidents}</div>
            <span className="text-[11px] text-[#5A6B66]">Emergency queue</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#D9DFD6] shadow-sm">
            <div className="text-[10px] uppercase font-bold text-[#5A6B66] font-mono">AI Triage Syntheses</div>
            <div className="text-2xl font-black text-[#1C5C53] font-display mt-1">892</div>
            <span className="text-[11px] text-[#5A6B66]">Gemini 2.0 Flash Briefs</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#D9DFD6] shadow-sm">
            <div className="text-[10px] uppercase font-bold text-[#5A6B66] font-mono">Avg Scan Retrieval</div>
            <div className="text-2xl font-black text-[#11332D] font-display mt-1">0.4s</div>
            <span className="text-[11px] text-[#10B981] font-semibold">Fast Edge CDN</span>
          </div>
        </div>

        {/* Search & Registry Table */}
        <div className="bg-white rounded-3xl border border-[#D9DFD6] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#5A6B66] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, tag ID, or blood group..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53]"
              />
            </div>
            <span className="text-xs font-mono text-[#5A6B66]">
              Showing {filtered.length} of {sampleRegistry.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D9DFD6] text-[#5A6B66] font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Tag ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Allergies</th>
                  <th className="py-3 px-4">Primary Contact</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DFD6]/60">
                {filtered.map((item) => (
                  <tr key={item.tagId} className="hover:bg-[#F1F4EE]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#11332D]">
                      {item.tagId}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#11332D]">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-[#FF5A4E] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {item.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#5A6B66] max-w-xs truncate">
                      {item.allergies}
                    </td>
                    <td className="py-3.5 px-4 text-[#5A6B66]">
                      {item.contacts}
                    </td>
                    <td className="py-3.5 px-4">
                      <a
                        href={`/id/${item.tagId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#1C5C53] font-bold hover:underline"
                      >
                        <span>View Scan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
