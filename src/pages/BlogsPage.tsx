import React, { useState, useEffect } from "react";
import api from "@/api";
import { Plus, Pencil, Trash, Loader, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TextScramble } from "@/components/ui/text-scramble";

export const BlogsPage = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getDirectImageUrl = (url: string) => {
    if (!url) return "";
    if (url.includes('drive.google.com') || url.includes('googleusercontent.com')) {
      const idMatch = url.match(/id=([^&]+)/) || url.match(/\/d\/([^/&?]+)/) || url.match(/\/d\/([^=]+)/);
      if (idMatch) return `https://lh3.googleusercontent.com/d/${idMatch[1]}=w1000`;
    }
    return url;
  };
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    mediaUrls: [] as string[]
  });
  const [linkInput, setLinkInput] = useState("");

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/blogs");
      setBlogs(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: "", content: "", author: "", mediaUrls: [] });
    setLinkInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (blog: any) => {
    setEditingId(blog._id);
    setFormData({
      title: blog.title,
      content: blog.content,
      author: blog.author || "Admin",
      mediaUrls: blog.media?.map((m: any) => m.url) || []
    });
    setLinkInput("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this blog post?")) return;
    try {
      await api.delete(`/api/blogs/${id}`);
      fetchBlogs();
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
      content: formData.content,
      author: formData.author,
      media: formData.mediaUrls.map(url => ({ type: "image", url }))
    };

    try {
      if (editingId) {
        await api.put(`/api/blogs/${editingId}`, payload);
      } else {
        await api.post("/api/blogs", payload);
      }
      setIsModalOpen(false);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert("Failed to save Blog.");
    } finally {
      setSaving(false);
    }
  };



  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <TextScramble as="h1" className="text-3xl font-bold tracking-tight">Blogs Management</TextScramble>
          <p className="text-foreground/70 mt-1">Publish and manage official community articles.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl flex items-center space-x-2 shadow-lg shadow-primary/20 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>New Article</span>
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
                <th className="p-4 font-medium text-foreground/70 w-1/3">Title</th>
                <th className="p-4 font-medium text-foreground/70">Author</th>
                <th className="p-4 font-medium text-foreground/70">Publish Date</th>
                <th className="p-4 font-medium text-foreground/70 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {blogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-foreground/50">No blogs found. Start writing.</td>
                </tr>
              ) : (
                <AnimatePresence>
                  {blogs.map((blog, idx) => (
                    <motion.tr 
                      key={blog._id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="p-4 font-medium">{blog.title}</td>
                      <td className="p-4 text-foreground/70">{blog.author || "Unknown"}</td>
                      <td className="p-4 text-foreground/80">{new Date(blog.createdAt || Date.now()).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(blog)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(blog._id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors">
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
          <div className="bg-background border border-glass-border rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-glass-border flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold">{editingId ? "Edit Blog" : "Write Blog"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-foreground/50 hover:text-foreground">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 flex-1 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2 text-foreground/80 uppercase tracking-widest">Blog Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="E.g., The Future of AI in 2026" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-foreground/80 uppercase tracking-widest">Author</label>
                <input required value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm" placeholder="Author Name" />
              </div>

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
                    onChange={e => setLinkInput(e.target.value)}
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
              
              <div className="flex-1 flex flex-col h-40 mt-4">
                <label className="block text-sm font-bold mb-2 text-foreground/80 uppercase tracking-widest">Content (Markdown)</label>
                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full flex-1 px-4 py-4 bg-foreground/5 border border-glass-border text-foreground rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/40 placeholder:font-normal font-medium text-sm resize-none" placeholder="Write your content here... Use bold, asterisks, etc." />
              </div>

              <div className="pt-6 flex justify-end space-x-3 border-t border-glass-border shrink-0 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold hover:bg-foreground/5 transition-colors text-foreground/70">Cancel</button>
                <button type="submit" disabled={saving} className="px-7 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all flex items-center shadow-lg shadow-primary/20">
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <span>{editingId ? "Update" : "Publish"}</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
