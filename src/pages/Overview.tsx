import React, { useEffect, useState } from "react";
import api from "@/api";
import { Loader, Calendar, Users, FileText, Folder, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { TextScramble } from "@/components/ui/text-scramble";
import { Link } from "react-router-dom";

export const Overview = () => {
  const [stats, setStats] = useState({ events: "--", team: "--", blogs: "--", projects: "--" });
  const [previews, setPreviews] = useState<any>({ events: [], team: [], blogs: [], projects: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [events, team, blogs, projects] = await Promise.all([
          api.get("/api/events").catch(() => ({ data: { data: [] } })),
          api.get("/api/team").catch(() => ({ data: { data: [] } })),
          api.get("/api/blogs").catch(() => ({ data: { data: [] } })),
          api.get("/api/projects").catch(() => ({ data: { data: [] } }))
        ]);

        const ev = events.data.data || events.data || [];
        const tm = team.data.data || team.data || [];
        const bl = blogs.data.data || blogs.data || [];
        const pj = projects.data.data || projects.data || [];

        setStats({
          events: ev.length.toString(),
          team: tm.length.toString(),
          blogs: bl.length.toString(),
          projects: pj.length.toString(),
        });

        setPreviews({
          events: ev.slice(0, 3),
          team: tm.slice(0, 3),
          blogs: bl.slice(0, 3),
          projects: pj.slice(0, 3),
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const PreviewCard = ({ title, icon: Icon, items, path, type }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-glass border border-glass-border p-6 rounded-2xl flex flex-col backdrop-blur-xl group hover:border-primary/20 transition-colors"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center text-foreground">
          <Icon className="w-5 h-5 mr-3 text-primary" /> 
          {title}
        </h3>
        <Link to={path} className="text-xs font-semibold text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          View All <ArrowRight className="w-3 h-3 ml-1" />
        </Link>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="flex justify-center py-4"><Loader className="w-6 h-6 animate-spin text-primary" /></div>
        ) : items.length > 0 ? (
          items.map((item: any, i: number) => (
            <div key={i} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors flex justify-between items-center group/item">
              <div className="pr-4 truncate">
                <p className="font-semibold text-sm truncate text-foreground group-hover/item:text-primary transition-colors">
                  {type === 'team' ? item.name : item.title}
                </p>
                <p className="text-xs text-foreground/50 mt-1 truncate">
                  {type === 'team' ? `${item.domainName} • Yr ${item.year}` : 
                   type === 'events' ? new Date(item.date).toLocaleDateString() : 
                   type === 'projects' ? item.techStack?.join(", ") || "Active Project" :
                   item.author || "Published Blog"}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 text-xs font-bold">
                {(type === 'team' ? item.name : item.title || '?').charAt(0).toUpperCase()}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-foreground/40 text-sm italic bg-black/10 rounded-xl border border-dashed border-white/10">
            No active entries remaining.
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="pb-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <TextScramble as="h1" className="text-3xl font-bold tracking-tight">Dashboard Overview</TextScramble>
          <p className="text-foreground/70 mt-2 font-medium">Welcome back. Complete overview of global parameters.</p>
        </div>
      </div>

      {/* Top Stat Meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Events", value: stats.events, icon: <Calendar className="w-6 h-6 text-primary" /> },
          { label: "Team Members", value: stats.team, icon: <Users className="w-6 h-6 text-primary" /> },
          { label: "Published Blogs", value: stats.blogs, icon: <FileText className="w-6 h-6 text-primary" /> },
          { label: "Active Projects", value: stats.projects, icon: <Folder className="w-6 h-6 text-primary" /> }
        ].map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            key={idx}
            className="bg-glass border border-glass-border p-6 rounded-2xl relative overflow-hidden backdrop-blur-xl group hover:-translate-y-1 transition-transform"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest">{stat.label}</p>
                <div className="text-4xl font-bold mt-4">
                  {loading ? <Loader className="w-6 h-6 animate-spin text-primary" /> : <span className="text-foreground">{stat.value}</span>}
                </div>
              </div>
              <span className="text-2xl opacity-80">{stat.icon}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Extracted Information Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PreviewCard title="Latest Team Additions" icon={Users} items={previews.team} path="/team" type="team" />
        <PreviewCard title="Upcoming Events" icon={Calendar} items={previews.events} path="/events" type="events" />
        <PreviewCard title="Recent Projects" icon={Folder} items={previews.projects} path="/projects" type="projects" />
        <PreviewCard title="Community Blogs" icon={FileText} items={previews.blogs} path="/blogs" type="blogs" />
      </div>
    </div>
  );
};
