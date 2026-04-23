import React, { useState, useEffect } from "react";
import api from "@/api";
import { Plus, Pencil, Trash, Loader, Link as LinkIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TextScramble } from "@/components/ui/text-scramble";

export const EventsPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Helper to handle Google Drive and other direct links
  const getDirectImageUrl = (url: string) => {
    if (!url) return "";
    // If it's already a direct lh3 link, return as is (but ensure it has size)
    if (url.includes('googleusercontent.com/d/')) {
      return url.includes('=w') ? url : `${url}=w1000`;
    }
    if (url.includes('drive.google.com') || url.includes('googleusercontent.com')) {
      const idMatch = url.match(/id=([^&]+)/) || url.match(/\/d\/([^/&?]+)/) || url.match(/\/d\/([^=]+)/);
      if (idMatch) {
        return `https://lh3.googleusercontent.com/d/${idMatch[1]}=w1000`;
      }
    }
    return url;
  };
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
    registrationLink: "",
    isTBA: false,
    mediaUrls: [] as string[]
  });
  const [linkInput, setLinkInput] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/events");
      setEvents(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: "", description: "", date: "", time: "", location: "", capacity: "", registrationLink: "", isTBA: false, mediaUrls: [] });
    setLinkInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (event: any) => {
    setEditingId(event._id);
    setFormData({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().split('T')[0],
      time: event.time || "",
      location: event.location || "",
      capacity: event.capacity?.toString() || "",
      registrationLink: event.registrationLink || "",
      isTBA: event.isTBA || false,
      mediaUrls: event.media?.map((m: any) => m.url) || []
    });
    setLinkInput("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    try {
      await api.delete(`/api/events/${id}`);
      fetchEvents();
    } catch (err) {
      console.error(err);
      alert("Failed to delete.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Format payload
    const payload = {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.isTBA ? undefined : formData.time,
      location: formData.isTBA ? undefined : formData.location,
      capacity: formData.isTBA ? undefined : (formData.capacity ? parseInt(formData.capacity) : undefined),
      registrationLink: formData.isTBA ? undefined : formData.registrationLink,
      isTBA: formData.isTBA,
      media: formData.mediaUrls.map(url => ({ type: "image", url }))
    };

    try {
      if (editingId) {
        await api.put(`/api/events/${editingId}`, payload);
      } else {
        await api.post("/api/events", payload);
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      console.error(err);
      alert("Failed to save Event.");
    } finally {
      setSaving(false);
    }
  };



  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <TextScramble as="h1" className="text-3xl font-bold tracking-tight">Events Management</TextScramble>
          <p className="text-foreground/70 mt-1">Create, update, and manage community events.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl flex items-center space-x-2 shadow-lg shadow-primary/20 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>New Event</span>
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
                <th className="p-4 font-medium text-foreground/70">Event Name</th>
                <th className="p-4 font-medium text-foreground/70">Date</th>
                <th className="p-4 font-medium text-foreground/70">Time</th>
                <th className="p-4 font-medium text-foreground/70">Location</th>
                <th className="p-4 font-medium text-foreground/70 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-foreground/50">No events found. Start by adding one.</td>
                </tr>
              ) : (
                <AnimatePresence>
                  {events.map((event, idx) => (
                    <motion.tr 
                      key={event._id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="p-4 font-medium">{event.title}</td>
                      <td className="p-4 text-foreground/80">{event.isTBA ? "TBA" : new Date(event.date).toLocaleDateString()}</td>
                      <td className="p-4 text-foreground/80">{event.isTBA ? "TBA" : (event.time || "—")}</td>
                      <td className="p-4 text-foreground/80">{event.isTBA ? "TBA" : (event.location || "—")}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(event)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(event._id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-glass-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-glass-border flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold">{editingId ? "Edit Event" : "Create New Event"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-foreground/50 hover:text-foreground">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 flex-1 overflow-y-auto space-y-5">
              <div className="flex items-center space-x-3 bg-primary/10 p-4 rounded-xl border border-primary/20">
                <input 
                  type="checkbox" 
                  id="tba-check"
                  checked={formData.isTBA} 
                  onChange={e => setFormData({...formData, isTBA: e.target.checked})} 
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
                <label htmlFor="tba-check" className="text-sm font-bold text-primary uppercase tracking-widest cursor-pointer select-none">To Be Announced (TBA)</label>
                <span className="text-xs text-foreground/50 ml-2">Hide date, time, and location until ready.</span>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-foreground/80 uppercase tracking-widest">Event Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="e.g. Core Team Meet" />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-foreground/80 uppercase tracking-widest">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm resize-none" placeholder="Provide event details..." />
              </div>

              {!formData.isTBA && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-foreground/80 uppercase tracking-widest">Date</label>
                      <input type="date" required={!formData.isTBA} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-foreground/80 uppercase tracking-widest">Registration Link <span className="text-foreground/40 text-[10px]">(Optional)</span></label>
                      <input type="url" value={formData.registrationLink} onChange={e => setFormData({...formData, registrationLink: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="https://..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-foreground/80 uppercase tracking-widest">Time <span className="text-foreground/40 text-[10px]">(Optional)</span></label>
                      <input type="text" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="e.g. 10:00 AM - 2:00 PM PST" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-foreground/80 uppercase tracking-widest">Location <span className="text-foreground/40 text-[10px]">(Optional)</span></label>
                      <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="e.g. Main Auditorium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-foreground/80 uppercase tracking-widest">Capacity <span className="text-foreground/40 text-[10px]">(Optional)</span></label>
                      <input type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="e.g. 150" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-foreground/80 uppercase tracking-widest">Media</label>
                  {formData.mediaUrls.length > 0 && <button type="button" onClick={() => setFormData({...formData, mediaUrls: []})} className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-wider">Clear All</button>}
                </div>

                {/* Image previews grid */}
                {formData.mediaUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {formData.mediaUrls.map((url, i) => (
                      <div key={i} className="w-full aspect-video rounded-xl overflow-hidden border border-glass-border bg-black/40 relative group flex items-center justify-center">
                        <img 
                          src={getDirectImageUrl(url)} 
                          alt={`Preview ${i}`} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            // Only show error if it's not a drive link (which sometimes takes time to load)
                            if (!url.includes('drive.google.com')) {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.classList.add('bg-red-500/10');
                              if (!e.currentTarget.parentElement!.querySelector('.err-msg')) {
                                const msg = document.createElement('span');
                                msg.className = 'err-msg text-[10px] text-red-500 font-bold uppercase text-center px-2';
                                msg.innerText = 'Invalid Image Link';
                                e.currentTarget.parentElement!.appendChild(msg);
                              }
                            }
                          }}
                        />
                        <button type="button" onClick={() => setFormData(p => ({...p, mediaUrls: p.mediaUrls.filter((_, idx) => idx !== i)}))} className="absolute top-1 right-1 bg-black/60 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500 transition-colors">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Always-visible add options */}
                <div className="flex items-center space-x-3">
                  <input
                    type="url"
                    value={linkInput}
                    onChange={e => {
                      const val = e.target.value;
                      if (val.includes('drive.google.com')) {
                        const idMatch = val.match(/id=([^&]+)/) || val.match(/\/d\/([^/&?]+)/);
                        if (idMatch) {
                          setLinkInput(`https://lh3.googleusercontent.com/d/${idMatch[1]}=w1000`);
                          return;
                        }
                      }
                      setLinkInput(val);
                    }}
                    placeholder="Paste image link and press Enter"
                    className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (linkInput.trim()) {
                          setFormData(p => ({ ...p, mediaUrls: [...p.mediaUrls, linkInput.trim()] }));
                          setLinkInput("");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (linkInput.trim()) {
                        setFormData(p => ({ ...p, mediaUrls: [...p.mediaUrls, linkInput.trim()] }));
                        setLinkInput("");
                      }
                    }}
                    className="shrink-0 bg-primary/20 hover:bg-primary/30 border border-primary/30 px-4 py-3 rounded-xl font-bold text-primary text-sm transition-all"
                  >
                    Add
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-foreground/40 font-medium uppercase tracking-wider italic">* Use direct image URLs (e.g., https://site.com/image.png)</p>
              </div>

              <div className="pt-6 flex justify-end space-x-3 border-t border-glass-border shrink-0 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold hover:bg-foreground/5 transition-colors text-foreground/70">Cancel</button>
                <button type="submit" disabled={saving} className="px-7 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all flex items-center shadow-lg shadow-primary/20">
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <span>{editingId ? "Update" : "Publish Event"}</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
