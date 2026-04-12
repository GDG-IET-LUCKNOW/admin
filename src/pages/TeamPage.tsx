import React, { useState, useEffect } from "react";
import api from "@/api";
import { Plus, Pencil, Trash, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TextScramble } from "@/components/ui/text-scramble";

export const TeamPage = () => {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    domainName: "",
    branch: "",
    year: "",
    github: "",
    linkedin: "",
    status: "active",
    priority: 1
  });

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/team");
      setTeam(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", domainName: "", branch: "", year: "", github: "", linkedin: "", status: "active", priority: 1 });
    setIsModalOpen(true);
  };

  const openEditModal = (member: any) => {
    setEditingId(member._id);
    setFormData({
      name: member.name,
      domainName: member.domainName || "",
      branch: member.branch || "",
      year: member.year || "",
      github: member.github || "",
      linkedin: member.linkedin || "",
      status: member.status || "active",
      priority: member.priority || 1
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this team member?")) return;
    try {
      await api.delete(`/api/team/${id}`);
      fetchTeam();
    } catch (err) {
      console.error(err);
      alert("Failed to delete.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (editingId) {
        await api.put(`/api/team/${editingId}`, formData);
      } else {
        await api.post("/api/team", formData);
      }
      setIsModalOpen(false);
      fetchTeam();
    } catch (err) {
      console.error(err);
      alert("Failed to save Member.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <TextScramble as="h1" className="text-3xl font-bold tracking-tight">Team Members</TextScramble>
          <p className="text-foreground/70 mt-1">Manage the core team members dynamically.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl flex items-center space-x-2 shadow-lg shadow-primary/20 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add Member</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-glass border border-glass-border rounded-2xl overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-glass-border bg-white/5">
                <th className="p-4 font-medium text-foreground/70">Name</th>
                <th className="p-4 font-medium text-foreground/70">Domain</th>
                <th className="p-4 font-medium text-foreground/70">Branch and Year</th>
                <th className="p-4 font-medium text-foreground/70">Status</th>
                <th className="p-4 font-medium text-foreground/70 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {team.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-foreground/50">No team members found. Start by adding one.</td>
                </tr>
              ) : (
                <AnimatePresence>
                  {team.map((member, idx) => (
                    <motion.tr 
                      key={member._id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="p-4 font-medium flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <span className="truncate">{member.name}</span>
                      </td>
                      <td className="p-4 text-foreground/70 font-semibold">{member.domainName}</td>
                      <td className="p-4 text-foreground/70">{member.branch} • Yr {member.year}</td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-medium uppercase tracking-wider ${member.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-foreground/10 text-foreground/50 border border-white/10'}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(member)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(member._id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors">
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-background border border-glass-border rounded-2xl w-full max-w-lg shadow-2xl shrink-0 my-auto">
            <div className="p-6 border-b border-glass-border flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingId ? "Edit Member" : "Add Member"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-foreground/50 hover:text-foreground">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="e.g. Adarsh" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">Domain Name</label>
                  <input required value={formData.domainName} onChange={e => setFormData({...formData, domainName: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="e.g. Web Development" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">Branch</label>
                  <input required value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="e.g. Information Technology" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">Year</label>
                  <input required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="e.g. 3rd" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">Github URL</label>
                  <input value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="https://github.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">LinkedIn URL</label>
                  <input value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="https://linkedin.com/..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm appearance-none">
                    <option value="active">Active</option>
                    <option value="past">Past</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">Priority (Sort Order)</label>
                  <input type="number" min="1" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg font-medium hover:bg-foreground/5 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors flex items-center shadow-lg shadow-primary/20">
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <span>{editingId ? "Update" : "Add Member"}</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
