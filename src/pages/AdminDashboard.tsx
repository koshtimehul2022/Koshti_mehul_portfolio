import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  Settings, Image, Briefcase, FileText, Wrench, LogOut, Home,
  Users, Plus, Trash2, Edit2, Save, X, Upload, Download, Star,
  Loader2, AlertCircle, Copy
} from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'settings' | 'portfolio' | 'projects' | 'resume' | 'skills' | 'services' | 'admins';

const AdminDashboard = () => {
  const { user, loading, isAdmin, isMainAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('settings');

  // Server-side verified: useAuth calls supabase.rpc('is_admin') which is SECURITY DEFINER
  // Don't render anything until server verification is complete
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      <p className="text-muted-foreground">Verifying access...</p>
    </div>
  );
  if (!user || !isAdmin) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; mainOnly?: boolean }[] = [
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'portfolio', label: 'Portfolio', icon: <Image className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'resume', label: 'Resume', icon: <FileText className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills', icon: <Wrench className="w-4 h-4" /> },
    { id: 'services', label: 'Services', icon: <Star className="w-4 h-4" /> },
    ...(isMainAdmin ? [{ id: 'admins' as Tab, label: 'Admins', icon: <Users className="w-4 h-4" />, mainOnly: true }] : []),
  ];

  return (
    <div className="min-h-screen bg-background pointer-events-auto isolate">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold">Admin Panel</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Home className="w-4 h-4" /> Site
            </Link>
            <button onClick={() => signOut().then(() => navigate('/admin/login'))} className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6 relative z-0">
        <nav className="md:w-56 flex-shrink-0 relative z-10">
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <main className="flex-1 min-w-0 relative z-10 pointer-events-auto">
          {activeTab === 'settings' && <SettingsPanel />}
          {activeTab === 'portfolio' && <PortfolioPanel />}
          {activeTab === 'projects' && <ProjectsPanel />}
          {activeTab === 'resume' && <ResumePanel />}
          {activeTab === 'skills' && <SkillsPanel />}
          {activeTab === 'services' && <ServicesPanel />}
          {activeTab === 'admins' && isMainAdmin && <AdminsPanel />}
        </main>
      </div>
    </div>
  );
};

// ========== LOADING / EMPTY STATES ==========
const LoadingState = () => (
  <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
    <Loader2 className="w-4 h-4 animate-spin" /> Loading...
  </div>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
    <AlertCircle className="w-6 h-6 opacity-40" />
    <p className="text-sm">No {label} found. Add one above.</p>
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-3">
    <AlertCircle className="w-6 h-6 text-destructive" />
    <p className="text-sm text-destructive">{message}</p>
    <button onClick={onRetry} className="text-xs text-primary hover:underline">Retry</button>
  </div>
);

// ========== GENERIC CRUD HOOK ==========
function useCrud(table: string, orderBy: string = 'sort_order') {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let query: any = supabase.from(table as any).select('*');
      if (orderBy) query = query.order(orderBy, { ascending: true });
      const { data, error: err } = await query;
      if (err) throw err;
      if (mountedRef.current) setItems((data as any[]) || []);
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || 'Failed to load data');
        setItems([]);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [table]);

  const add = async (item: any) => {
    try {
      const { error } = await (supabase.from(table as any) as any).insert(item);
      if (error) throw error;
      toast.success('Added successfully');
      await fetchData();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to add');
      return false;
    }
  };

  const update = async (id: string, item: any) => {
    try {
      const { error } = await (supabase.from(table as any) as any).update(item).eq('id', id);
      if (error) throw error;
      toast.success('Updated successfully');
      await fetchData();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
      return false;
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      const { error } = await (supabase.from(table as any) as any).delete().eq('id', id);
      if (error) throw error;
      toast.success('Deleted');
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const duplicate = async (item: any) => {
    const payload = { ...item };
    delete payload.id;
    delete payload.created_at;
    if (payload && Object.prototype.hasOwnProperty.call(payload, 'sort_order')) {
      payload.sort_order = items.length;
    }
    return await add(payload);
  };

  return { items, loading, error, add, update, remove, duplicate, refetch: fetchData };
}

// ========== SETTINGS ==========
const SettingsPanel = () => {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoadError(null);
    setLoaded(false);
    try {
      const { data, error } = await supabase.from('site_settings' as any).select('*').limit(1).maybeSingle();
      if (error) throw error;
      setSettings(data ?? {});
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load settings');
      setSettings({});
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      if (settings.id) {
        const { id, ...rest } = settings;
        const { error } = await (supabase.from('site_settings' as any) as any)
          .update({ ...rest, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from('site_settings' as any) as any)
          .insert({ ...settings, updated_at: new Date().toISOString() });
        if (error) throw error;
      }
      toast.success('Settings saved');
      await fetchSettings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loadError) return <ErrorState message={loadError} onRetry={fetchSettings} />;
  if (!loaded) return <LoadingState />;

  const fieldGroups = [
    { title: 'General', fields: [
      { key: 'site_name', label: 'Site Name', type: 'text' },
      { key: 'owner_name', label: 'Owner Name', type: 'text' },
    ]},
    { title: 'Contact Information', fields: [
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone Number', type: 'tel' },
      { key: 'location', label: 'Address', type: 'text' },
      { key: 'whatsapp', label: 'WhatsApp Number', type: 'tel' },
    ]},
    { title: 'Social Media Links', fields: [
      { key: 'facebook', label: 'Facebook', type: 'url' },
      { key: 'instagram', label: 'Instagram', type: 'url' },
      { key: 'youtube', label: 'YouTube', type: 'url' },
      { key: 'linkedin', label: 'LinkedIn', type: 'url' },
      { key: 'github', label: 'GitHub', type: 'url' },
    ]},
    { title: 'Dynamic Stats', fields: [
      { key: 'years_accounting', label: 'Years in Accounting', type: 'number' },
      { key: 'projects_delivered', label: 'Projects Delivered', type: 'number' },
      { key: 'happy_clients', label: 'Happy Clients', type: 'number' },
      { key: 'years_development', label: 'Years in Development', type: 'number' },
    ]},
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Site Settings</h2>
      {fieldGroups.map(group => (
        <div key={group.title} className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{group.title}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {group.fields.map(f => (
              <div key={f.key}>
                <label className="text-sm font-medium block mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  value={settings[f.key] ?? ''}
                  onChange={e => setSettings({ ...settings, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={save} disabled={saving} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};

// ========== PORTFOLIO ==========
const PortfolioPanel = () => {
  const { items, loading, error, add, update, remove, duplicate, refetch } = useCrud('portfolio_items');
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', description: '', category: '', media_url: '', media_type: 'image' });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    const ok = editing?.id ? await update(editing.id, form) : await add({ ...form, sort_order: items.length });
    if (ok) {
      setEditing(null);
      setForm({ title: '', description: '', category: '', media_url: '', media_type: 'image' });
    }
    setSaving(false);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('portfolio').upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(path);
    setForm(f => ({ ...f, media_url: urlData.publicUrl, media_type: file.type.startsWith('video') ? 'video' : 'image' }));
    setUploading(false);
  };

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Portfolio ({items.length})</h2>
        <button onClick={() => { setEditing({}); setForm({ title: '', description: '', category: '', media_url: '', media_type: 'image' }); }} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {editing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title *" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Category" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <div className="flex items-center gap-2">
            <input value={form.media_url} onChange={e => setForm({ ...form, media_url: e.target.value })} placeholder="Media URL" className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
            <label className="px-3 py-2 bg-secondary rounded-lg text-sm cursor-pointer flex items-center gap-1 hover:bg-secondary/80 transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload
              <input type="file" accept="image/*,video/*" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])} />
            </label>
          </div>
          {form.media_url && <img src={form.media_url} alt="Preview" className="w-32 h-20 object-cover rounded-lg" />}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm flex items-center gap-1 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 bg-secondary rounded-lg text-sm flex items-center gap-1"><X className="w-4 h-4" /> Cancel</button>
          </div>
        </motion.div>
      )}

      {loading ? <LoadingState /> : items.length === 0 ? <EmptyState label="portfolio items" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden group hover:border-primary/30 transition-colors">
              {item.media_url && <img src={item.media_url} alt={item.title} className="w-full h-40 object-cover" />}
              <div className="p-3">
                <h3 className="font-medium text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.category}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => { setEditing(item); setForm(item); }} className="text-xs text-primary hover:underline flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                  <button onClick={() => duplicate(item)} className="text-xs text-muted-foreground hover:underline flex items-center gap-1"><Copy className="w-3 h-3" /> Duplicate</button>
                  <button onClick={() => remove(item.id)} className="text-xs text-destructive hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ========== PROJECTS ==========
const ProjectsPanel = () => {
  const { items, loading, error, add, update, remove, duplicate, refetch } = useCrud('projects');
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', description: '', poster_url: '', project_url: '', project_type: 'live' });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    const payload = { ...form };
    const ok = editing?.id ? await update(editing.id, payload) : await add({ ...payload, sort_order: items.length });
    if (ok) {
      setEditing(null);
      setForm({ title: '', description: '', poster_url: '', project_url: '', project_type: 'live' });
    }
    setSaving(false);
  };

  const uploadPoster = async (file: File) => {
    setUploading(true);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('projects').upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from('projects').getPublicUrl(path);
    setForm(f => ({ ...f, poster_url: data.publicUrl }));
    toast.success('Poster uploaded');
    setUploading(false);
  };

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const liveProjects = items.filter(i => i.project_type === 'live');
  const funProjects = items.filter(i => i.project_type === 'fun');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Projects ({items.length})</h2>
        <button onClick={() => { setEditing({}); setForm({ title: '', description: '', poster_url: '', project_url: '', project_type: 'live' }); }} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {editing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title *" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <div className="flex gap-2">
            <input value={form.poster_url} onChange={e => setForm({ ...form, poster_url: e.target.value })} placeholder="Poster URL" className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
            <label className="px-3 py-2 bg-secondary rounded-lg text-sm cursor-pointer flex items-center gap-1 hover:bg-secondary/80">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadPoster(e.target.files[0])} />
            </label>
          </div>
          {form.poster_url && <img src={form.poster_url} alt="Preview" className="w-32 h-20 object-cover rounded-lg" />}
          <input value={form.project_url} onChange={e => setForm({ ...form, project_url: e.target.value })} placeholder="Project URL (https://...)" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <select value={form.project_type} onChange={e => setForm({ ...form, project_type: e.target.value })} className="px-3 py-2 rounded-lg bg-background border border-border text-sm">
            <option value="live">Live / Commercial</option>
            <option value="fun">Fun Project</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm flex items-center gap-1 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 bg-secondary rounded-lg text-sm flex items-center gap-1"><X className="w-4 h-4" /> Cancel</button>
          </div>
        </motion.div>
      )}

      {loading ? <LoadingState /> : items.length === 0 ? <EmptyState label="projects" /> : (
        <div className="space-y-6">
          {liveProjects.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Live Projects ({liveProjects.length})</h3>
              <div className="space-y-2">
                {liveProjects.map(item => (
                  <div key={item.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 hover:border-primary/30 transition-colors">
                    {item.poster_url && <img src={item.poster_url} alt="" className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.title}</h3>
                      {item.project_url && <p className="text-xs text-muted-foreground truncate">{item.project_url}</p>}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex-shrink-0">Live</span>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => { setEditing(item); setForm({ title: item.title, description: item.description || '', poster_url: item.poster_url || '', project_url: item.project_url || '', project_type: item.project_type }); }} className="text-primary"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => duplicate(item)} className="text-muted-foreground"><Copy className="w-4 h-4" /></button>
                      <button onClick={() => remove(item.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {funProjects.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Fun Projects ({funProjects.length})</h3>
              <div className="space-y-2">
                {funProjects.map(item => (
                  <div key={item.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 hover:border-primary/30 transition-colors">
                    {item.poster_url && <img src={item.poster_url} alt="" className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.title}</h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 flex-shrink-0">Fun</span>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => { setEditing(item); setForm({ title: item.title, description: item.description || '', poster_url: item.poster_url || '', project_url: item.project_url || '', project_type: item.project_type }); }} className="text-primary"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => duplicate(item)} className="text-muted-foreground"><Copy className="w-4 h-4" /></button>
                      <button onClick={() => remove(item.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ========== RESUME ==========
const ResumePanel = () => {
  const { items, loading, error, add, update, remove, duplicate, refetch } = useCrud('resume_entries', 'created_at');
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ entry_type: 'education', title: '', company: '', location: '', start_date: '', end_date: '', description: '' });
  const [pdfUrl, setPdfUrl] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('resume_pdf' as any).select('*').order('uploaded_at', { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
      if (data) setPdfUrl((data as any).file_url);
    });
  }, []);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    const payload = {
      ...form,
      company: form.company || null,
      location: form.location || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      description: form.description || null,
    };
    const ok = editing?.id ? await update(editing.id, payload) : await add({ ...payload, sort_order: items.length });
    if (ok) {
      setEditing(null);
      setForm({ entry_type: 'education', title: '', company: '', location: '', start_date: '', end_date: '', description: '' });
    }
    setSaving(false);
  };

  const uploadPdf = async (file: File) => {
    setUploadingPdf(true);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('resume').upload(path, file);
    if (error) { toast.error(error.message); setUploadingPdf(false); return; }
    const { data } = supabase.storage.from('resume').getPublicUrl(path);
    await (supabase.from('resume_pdf' as any) as any).insert({ file_url: data.publicUrl, file_name: file.name });
    setPdfUrl(data.publicUrl);
    toast.success('Resume PDF uploaded');
    setUploadingPdf(false);
  };

  const educationItems = items.filter(i => i.entry_type === 'education');
  const experienceItems = items.filter(i => i.entry_type === 'experience');

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold">Resume ({items.length})</h2>
        <div className="flex gap-2">
          <label className="px-3 py-1.5 bg-secondary rounded-lg text-sm cursor-pointer flex items-center gap-1 hover:bg-secondary/80 transition-colors">
            {uploadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload PDF
            <input type="file" accept=".pdf" className="hidden" onChange={e => e.target.files?.[0] && uploadPdf(e.target.files[0])} />
          </label>
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm flex items-center gap-1">
              <Download className="w-4 h-4" /> View PDF
            </a>
          )}
          <button onClick={() => { setEditing({}); setForm({ entry_type: 'education', title: '', company: '', location: '', start_date: '', end_date: '', description: '', institution: '', period: '' }); }} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {editing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <select value={form.entry_type} onChange={e => setForm({ ...form, entry_type: e.target.value })} className="px-3 py-2 rounded-lg bg-background border border-border text-sm">
            <option value="education">Education</option>
            <option value="experience">Experience</option>
          </select>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title / Position *" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company / Institution" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} placeholder="Start Date" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
            <input value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} placeholder="End Date" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          </div>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm flex items-center gap-1 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 bg-secondary rounded-lg text-sm flex items-center gap-1"><X className="w-4 h-4" /> Cancel</button>
          </div>
        </motion.div>
      )}

      {loading ? <LoadingState /> : (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Education ({educationItems.length})</h3>
            {educationItems.length === 0 ? <p className="text-xs text-muted-foreground">No education entries</p> : educationItems.map(item => (
              <div key={item.id} className="bg-card border border-border rounded-lg p-3 mb-2 hover:border-primary/30 transition-colors">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.company || item.institution} • {item.location || 'No location'} • {item.start_date || item.period}{item.end_date ? ` - ${item.end_date}` : ''}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(item); setForm({ entry_type: item.entry_type, title: item.title, company: item.company || item.institution || '', location: item.location || '', start_date: item.start_date || item.period || '', end_date: item.end_date || '', description: item.description || '' }); }} className="text-primary"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => duplicate(item)} className="text-muted-foreground"><Copy className="w-3 h-3" /></button>
                    <button onClick={() => remove(item.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-semibold mb-3">Experience ({experienceItems.length})</h3>
            {experienceItems.length === 0 ? <p className="text-xs text-muted-foreground">No experience entries</p> : experienceItems.map(item => (
              <div key={item.id} className="bg-card border border-border rounded-lg p-3 mb-2 hover:border-primary/30 transition-colors">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.company || item.institution} • {item.location || 'No location'} • {item.start_date || item.period}{item.end_date ? ` - ${item.end_date}` : ''}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(item); setForm({ entry_type: item.entry_type, title: item.title, company: item.company || item.institution || '', location: item.location || '', start_date: item.start_date || item.period || '', end_date: item.end_date || '', description: item.description || '' }); }} className="text-primary"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => duplicate(item)} className="text-muted-foreground"><Copy className="w-3 h-3" /></button>
                    <button onClick={() => remove(item.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ========== SKILLS ==========
const SkillsPanel = () => {
  const { items, loading, error, add, update, remove, duplicate, refetch } = useCrud('skills', 'created_at');
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', description: '', icon: '', tags: [] as string[] });
  const [tagInput, setTagInput] = useState('');
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [saving, setSaving] = useState(false);

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    if (form.tags.includes(tag)) {
      setTagInput('');
      return;
    }
    setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const uploadIcon = async (file: File) => {
    setUploadingIcon(true);
    try {
      const path = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('skills').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('skills').getPublicUrl(path);
      setForm(prev => ({ ...prev, icon: data.publicUrl }));
      toast.success('Icon uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Icon upload failed');
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    const payload: any = {
      name: form.title.trim(),
    };
    if (form.description.trim()) payload.description = form.description.trim();
    if (form.icon.trim()) payload.icon = form.icon.trim();
    if (form.tags.length > 0) payload.tags = form.tags;

    const ok = editing?.id ? await update(editing.id, payload) : await add(payload);
    if (ok) {
      setEditing(null);
      setForm({ title: '', description: '', icon: '', tags: [] });
      setTagInput('');
    }
    setSaving(false);
  };

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Skills ({items.length})</h2>
        <button onClick={() => { setEditing({}); setForm({ title: '', description: '', icon: '', tags: [] }); setTagInput(''); }} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {editing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title *" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="Icon URL or name" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <label className="px-3 py-2 bg-secondary rounded-lg text-sm cursor-pointer flex items-center gap-1 hover:bg-secondary/80 transition-colors">
            {uploadingIcon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload icon
            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadIcon(e.target.files[0])} />
          </label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" rows={3} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2 flex-wrap">
              {form.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-destructive">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' ? (e.preventDefault(), addTag()) : null} placeholder="Add tag and press Enter" className="flex-1 min-w-[180px] px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Add</button>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm flex items-center gap-1 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 bg-secondary rounded-lg text-sm flex items-center gap-1"><X className="w-4 h-4" /> Cancel</button>
          </div>
        </motion.div>
      )}

      {loading ? <LoadingState /> : items.length === 0 ? <EmptyState label="skills" /> : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
                    {item.icon?.startsWith('http') ? (
                      <img src={item.icon} alt={item.title || item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-muted-foreground">{item.icon ? item.icon.charAt(0).toUpperCase() : (item.title || item.name || '').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{item.title || item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.description || item.category || ''}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => { setEditing(item); setForm({ title: item.title || item.name || '', description: item.description || '', icon: item.icon || '', tags: item.tags || [] }); setTagInput(''); }} className="text-primary"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => duplicate(item)} className="text-muted-foreground"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => remove(item.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {item.tags && item.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag: string) => (
                    <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ========== SERVICES ==========
const ServicesPanel = () => {
  const { items, loading, error, add, update, remove, duplicate, refetch } = useCrud('services');
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    const ok = editing?.id ? await update(editing.id, form) : await add({ ...form, sort_order: items.length });
    if (ok) {
      setEditing(null);
      setForm({ name: '', description: '', icon: '' });
    }
    setSaving(false);
  };

  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Services ({items.length})</h2>
        <button onClick={() => { setEditing({}); setForm({ name: '', description: '', icon: '' }); }} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {editing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Service name *" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="Icon name (e.g. Code2)" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm flex items-center gap-1 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 bg-secondary rounded-lg text-sm flex items-center gap-1"><X className="w-4 h-4" /> Cancel</button>
          </div>
        </motion.div>
      )}

      {loading ? <LoadingState /> : items.length === 0 ? <EmptyState label="services" /> : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3 hover:border-primary/30 transition-colors">
              <div className="flex-1">
                <h3 className="font-medium text-sm">{item.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(item); setForm(item); }} className="text-primary"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => duplicate(item)} className="text-muted-foreground"><Copy className="w-4 h-4" /></button>
                <button onClick={() => remove(item.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ========== ADMINS ==========
const AdminsPanel = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data } = await supabase.from('user_roles' as any).select('*');
    setAdmins((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const addSubAdmin = async () => {
    if (!newEmail || !newPassword) { toast.error('Email and password are required'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setAdding(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-sub-admin', {
        body: { email: newEmail, password: newPassword },
      });
      if (error) { toast.error(error.message || 'Failed to create sub-admin'); setAdding(false); return; }
      if (data?.error) { toast.error(data.error); setAdding(false); return; }
      toast.success('Sub-admin created successfully');
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create sub-admin');
    }
    setNewEmail('');
    setNewPassword('');
    setAdding(false);
  };

  const removeAdmin = async (id: string) => {
    if (!confirm('Remove this admin?')) return;
    await (supabase.from('user_roles' as any) as any).delete().eq('id', id);
    toast.success('Admin removed');
    fetchAdmins();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Admin Management</h2>
      <p className="text-sm text-muted-foreground">Maximum 2 admins. You are the main admin.</p>

      {admins.length < 2 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-medium text-sm">Add Sub-Admin</h3>
          <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email" type="email" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" placeholder="Password (min 6 chars)" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          <button onClick={addSubAdmin} disabled={adding} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm flex items-center gap-2 disabled:opacity-50">
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {adding ? 'Creating...' : 'Create Sub-Admin'}
          </button>
        </motion.div>
      )}

      {loading ? <LoadingState /> : admins.length === 0 ? <EmptyState label="admins" /> : (
        <div className="space-y-2">
          {admins.map(admin => (
            <div key={admin.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between hover:border-primary/30 transition-colors">
              <div>
                <p className="text-sm font-medium">{admin.user_id === user?.id ? 'You' : 'Sub Admin User'}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${admin.role === 'main_admin' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                  {admin.role === 'main_admin' ? 'Main Admin' : 'Sub Admin'}
                </span>
              </div>
              {admin.role !== 'main_admin' && (
                <button onClick={() => removeAdmin(admin.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
