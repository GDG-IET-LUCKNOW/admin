import React, { useState, useEffect } from "react";
import api from "@/api";
import { Plus, Pencil, Trash, Loader, Globe, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TextScramble } from "@/components/ui/text-scramble";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export const ProjectsPage = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getDirectImageUrl = (url: string) => {
    if (!url) return "";
    // If it's already a direct lh3 link, return as is (but ensure it has size)
    if (url.includes('googleusercontent.com/d/')) {
      return url.includes('=w') ? url : `${url}=w1000`;
    }
    if (url.includes('drive.google.com') || url.includes('googleusercontent.com')) {
      const idMatch = url.match(/id=([^&]+)/) || url.match(/\/d\/([^/&?]+)/) || url.match(/\/d\/([^=]+)/);
      if (idMatch) return `https://lh3.googleusercontent.com/d/${idMatch[1]}=w1000`;
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
    githubLink: "",
    liveLink: "",
    techStack: "",
    mediaUrls: [] as string[]
  });
  const [linkInput, setLinkInput] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/projects");
      setProjects(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: "", description: "", githubLink: "", liveLink: "", techStack: "", mediaUrls: [] });
    setLinkInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (project: any) => {
    setEditingId(project._id);
    setFormData({
      title: project.title,
      description: project.description,
      githubLink: project.githubLink || "",
      liveLink: project.liveLink || "",
      techStack: Array.isArray(project.techStack) ? project.techStack.join(", ") : project.techStack || "",
      mediaUrls: project.media?.map((m: any) => m.url) || []
    });
    setLinkInput("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/api/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert("Failed to delete.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const payload = {
      title: formData.title,
      description: formData.description,
      githubLink: formData.githubLink,
      liveLink: formData.liveLink,
      techStack: formData.techStack.split(",").map(t => t.trim()).filter(Boolean),
      media: formData.mediaUrls.map(url => ({ type: "image", url }))
    };

    try {
      if (editingId) {
        await api.put(`/api/projects/${editingId}`, payload);
      } else {
        await api.post("/api/projects", payload);
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert("Failed to save Project.");
    } finally {
      setSaving(false);
    }
  };



  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <TextScramble as="h1" className="text-3xl font-bold tracking-tight">Open Source Projects</TextScramble>
          <p className="text-foreground/70 mt-1">Manage the core projects incubated by the community.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl flex items-center space-x-2 shadow-lg shadow-primary/20 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
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
                <th className="p-4 font-medium text-foreground/70 w-2/5">Project</th>
                <th className="p-4 font-medium text-foreground/70">Tech Stack</th>
                <th className="p-4 font-medium text-foreground/70">Links</th>
                <th className="p-4 font-medium text-foreground/70 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-foreground/50">No projects found. Add one above.</td>
                </tr>
              ) : (
                <AnimatePresence>
                  {projects.map((project, idx) => (
                    <motion.tr 
                      key={project._id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="p-4">
                        <p className="font-bold text-base text-foreground">{project.title}</p>
                        <p className="text-xs text-foreground/50 line-clamp-1 mt-0.5 max-w-sm">{project.description}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(project.techStack) && project.techStack.slice(0, 3).map((tech: string, i: number) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-md border border-white/10 bg-white/5 whitespace-nowrap text-foreground/80">{tech}</span>
                          ))}
                          {(project.techStack?.length || 0) > 3 && <span className="text-[10px] px-1.5 py-0.5 rounded-md border border-white/10 bg-white/5 text-foreground/80">+{project.techStack.length - 3}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col space-y-1">
                          {project.githubLink && (
                            <a href={project.githubLink} target="_blank" rel="noreferrer" className="text-foreground/70 hover:text-primary text-xs flex items-center font-semibold transition-colors">
                              <GithubIcon className="w-3 h-3 mr-1.5" /> Source
                            </a>
                          )}
                          {project.liveLink && (
                            <a href={project.liveLink} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs flex items-center font-semibold">
                              <Globe className="w-3 h-3 mr-1.5" /> Live
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(project)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(project._id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors">
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
              <h2 className="text-xl font-bold">{editingId ? "Edit Project" : "Add Project"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-foreground/50 hover:text-foreground">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2 text-foreground/80 uppercase tracking-widest">Project Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="e.g., Campus Utility App" />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-foreground/80 uppercase tracking-widest">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm resize-none" placeholder="Explain what the project does..." />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-foreground/80 uppercase tracking-widest">Tech Stack</label>
                <input value={formData.techStack} onChange={e => setFormData({...formData, techStack: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="E.g. NextJS, Tailwind, Supabase" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-foreground/80 uppercase tracking-widest">GitHub Repository (Optional)</label>
                <input type="url" value={formData.githubLink} onChange={e => setFormData({...formData, githubLink: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="https://github.com/..." />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-foreground/80 uppercase tracking-widest">Live Preview Link (Optional)</label>
                <input type="url" value={formData.liveLink} onChange={e => setFormData({...formData, liveLink: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="https://project-demo.com" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-foreground/80 uppercase tracking-widest">Media</label>
                  {formData.mediaUrls.length > 0 && <button type="button" onClick={() => { setFormData({...formData, mediaUrls: []}); setLinkInput(""); }} className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-wider">Clear All</button>}
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

              <div className="pt-6 flex justify-end space-x-3 border-t border-glass-border mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold hover:bg-foreground/5 transition-colors text-foreground/70">Cancel</button>
                <button type="submit" disabled={saving} className="px-7 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all flex items-center shadow-lg shadow-primary/20">
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <span>{editingId ? "Update" : "Add Project"}</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
