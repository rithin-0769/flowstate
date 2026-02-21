import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Layout, 
  Inbox, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  MoreHorizontal,
  Hash, 
  Filter, 
  ArrowUpRight, 
  User, 
  Command, 
  ChevronRight, 
  Calendar, 
  Zap, 
  X, 
  Trash2, 
  Tag, 
  ChevronDown,
  Github,
  Mail,
  Lock,
  LogOut,
  ArrowRight
} from 'lucide-react';

// --- Mock Data ---
const INITIAL_TASKS = [
  { id: 'FLW-101', title: 'Implement Supabase Realtime sync', status: 'in-progress', priority: 'high', label: 'Backend', description: 'Need to set up the broadcast channels for cursor positions.' },
  { id: 'FLW-102', title: 'Refactor canvas rendering logic', status: 'todo', priority: 'medium', label: 'Performance', description: 'Current loop is hitting 40fps, needs to be 60fps.' },
  { id: 'FLW-103', title: 'Design system audit', status: 'backlog', priority: 'low', label: 'Design', description: 'Check contrast ratios on all primary buttons.' },
  { id: 'FLW-104', title: 'Fix mobile navigation overflow', status: 'done', priority: 'high', label: 'Bug', description: 'The hamburger menu clips on iPhone SE.' },
  { id: 'FLW-105', title: 'Update documentation for API v2', status: 'todo', priority: 'medium', label: 'Docs', description: 'Explain the new authentication handshake.' },
];

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', icon: <Hash size={14} /> },
  { id: 'todo', title: 'Todo', icon: <Circle size={14} /> },
  { id: 'in-progress', title: 'In Progress', icon: <Clock size={14} className="text-amber-500" /> },
  { id: 'done', title: 'Done', icon: <CheckCircle2 size={14} className="text-blue-500" /> },
];

const COMMANDS = [
  { id: 'create', icon: <Plus size={16} />, label: "Create new issue", shortcut: "C" },
  { id: 'assign', icon: <User size={16} />, label: "Assign to me", shortcut: "I" },
  { id: 'filter', icon: <Filter size={16} />, label: "Filter by label..." },
  { id: 'date', icon: <Calendar size={16} />, label: "Set due date..." },
  { id: 'delete', icon: <Trash2 size={16} />, label: "Delete selected issue", shortcut: "Del" },
];

// --- Main App Component ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('My Issues');
  const [selectedTask, setSelectedTask] = useState(null);

  // --- Auth Handlers ---
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 1200);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedTask(null);
  };

  // --- Filtering Logic ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  const progress = useMemo(() => {
    const done = tasks.filter(t => t.status === 'done').length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  const filteredCommands = useMemo(() => {
    return COMMANDS.filter(c => c.label.toLowerCase().includes(commandSearch.toLowerCase()));
  }, [commandSearch]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen(prev => !prev);
        setCommandSearch('');
      }
      if (e.key === 'Escape') {
        setIsCommandMenuOpen(false);
        setSelectedTask(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated]);

  // --- Task Actions ---
  const moveTask = (id, newStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    if (selectedTask?.id === id) setSelectedTask(prev => ({ ...prev, status: newStatus }));
  };

  const addTask = (columnId) => {
    const newId = `FLW-${Math.floor(Math.random() * 900) + 200}`;
    const newTask = {
      id: newId,
      title: 'Untitled Issue',
      status: columnId || 'todo',
      priority: 'medium',
      label: 'Feature',
      description: ''
    };
    setTasks([newTask, ...tasks]);
    setSelectedTask(newTask);
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setSelectedTask(null);
  };

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    if (selectedTask?.id === id) setSelectedTask(prev => ({ ...prev, ...updates }));
  };

  // --- Render Login View ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 font-sans">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 mb-4">
              <Zap size={24} fill="white" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Welcome back</h1>
            <p className="text-zinc-500 text-sm mt-1">Enter your details to access your workspace</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Password</label>
                <button type="button" className="text-[10px] font-bold uppercase text-blue-500 hover:text-blue-400 tracking-widest transition-colors">Forgot?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              className="w-full bg-zinc-100 hover:bg-white text-zinc-900 font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-zinc-900/20 border-t-zinc-900 rounded-full animate-spin" />
              ) : (
                <>
                  Sign in to FlowState
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest"><span className="bg-[#09090b] px-4 text-zinc-600">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl py-2 text-xs font-bold text-zinc-300 transition-all">
              <Github size={16} />
              GitHub
            </button>
            <button className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl py-2 text-xs font-bold text-zinc-300 transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
          </div>
          
          <p className="text-center mt-8 text-xs text-zinc-600">
            Don't have an account? <button className="text-zinc-400 font-bold hover:text-zinc-100 transition-colors">Sign up</button>
          </p>
        </div>
      </div>
    );
  }

  // --- Render Dashboard View ---
  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-400 font-sans selection:bg-blue-500/30 overflow-hidden animate-in fade-in duration-700">
      
      {/* --- Sidebar --- */}
      <aside className="w-64 border-r border-zinc-800 flex flex-col p-4 bg-[#09090b] z-20">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center text-white">
            <Zap size={14} fill="white" />
          </div>
          <span className="text-zinc-100 font-bold tracking-tight text-sm uppercase">FlowState</span>
        </div>

        <nav className="space-y-1">
          <NavItem icon={<Inbox size={18} />} label="Inbox" count={2} onClick={() => setActiveCategory('Inbox')} active={activeCategory === 'Inbox'} />
          <NavItem icon={<Layout size={18} />} label="My Issues" onClick={() => setActiveCategory('My Issues')} active={activeCategory === 'My Issues'} />
          <NavItem icon={<CheckCircle2 size={18} />} label="Completed" onClick={() => setActiveCategory('Completed')} active={activeCategory === 'Completed'} />
        </nav>

        <div className="mt-8">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Projects</h3>
            <Plus size={12} className="text-zinc-600 hover:text-zinc-100 cursor-pointer" />
          </div>
          <nav className="space-y-1">
            <NavItem icon={<div className="w-2 h-2 rounded-full bg-amber-500" />} label="Vivid Board" />
            <NavItem icon={<div className="w-2 h-2 rounded-full bg-blue-500" />} label="Mobile App" />
            <NavItem icon={<div className="w-2 h-2 rounded-full bg-purple-500" />} label="Marketing Site" />
          </nav>
        </div>

        <div className="mt-auto px-2 pb-4">
          <div className="flex items-center justify-between text-[10px] font-bold mb-2">
            <span className="text-zinc-500 uppercase tracking-tighter">Cycle Progress</span>
            <span className="text-zinc-300">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* User Profile / Logout Toggle */}
        <div className="relative group">
          <div className="p-2 bg-zinc-900/50 rounded-xl border border-zinc-800/50 flex items-center gap-3 cursor-pointer group-hover:bg-zinc-900 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 border border-zinc-600 flex items-center justify-center text-zinc-100 text-xs font-bold">JD</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-zinc-200 truncate">Jane Doe</p>
              <p className="text-[10px] text-zinc-500 truncate uppercase tracking-tighter">Personal Plan</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="absolute bottom-full left-0 w-full mb-2 bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs font-bold text-red-500 flex items-center gap-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-zinc-500">Workspace</span>
            <ChevronRight size={14} className="text-zinc-700" />
            <span className="text-zinc-100">{activeCategory}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-xs rounded-lg pl-9 pr-4 py-1.5 w-64 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
              />
            </div>
            
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase rounded-lg px-3 py-1.5 outline-none hover:border-zinc-700 transition-colors"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <button onClick={() => addTask('todo')} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20">
              <Plus size={16} />
              New Issue
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-x-auto p-6 flex gap-6">
          {COLUMNS.map(col => (
            <div key={col.id} className="w-80 flex-shrink-0 flex flex-col group/column">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">{col.icon}</span>
                  <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{col.title}</h2>
                  <span className="text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-500">
                    {filteredTasks.filter(t => t.status === col.id).length}
                  </span>
                </div>
                <button onClick={() => addTask(col.id)} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 opacity-0 group-hover/column:opacity-100 transition-all">
                  <Plus size={14} />
                </button>
              </div>

              <div className="space-y-3 flex-1">
                {filteredTasks
                  .filter(t => t.status === col.id)
                  .map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      active={selectedTask?.id === task.id}
                      onClick={() => setSelectedTask(task)}
                      onMove={(newStatus) => moveTask(task.id, newStatus)} 
                    />
                  ))}
                
                {filteredTasks.filter(t => t.status === col.id).length === 0 && (
                  <div className="h-24 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-[10px] font-bold text-zinc-700 uppercase tracking-widest">No Issues</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Slide-over Detail View */}
        {selectedTask && (
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-[#09090b] border-l border-zinc-800 shadow-2xl z-40 animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">{selectedTask.id}</span>
                  <div className="w-px h-3 bg-zinc-800" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{selectedTask.status.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => deleteTask(selectedTask.id)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16} /></button>
                  <button onClick={() => setSelectedTask(null)} className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all"><X size={16} /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <input type="text" value={selectedTask.title} onChange={(e) => updateTask(selectedTask.id, { title: e.target.value })} className="w-full bg-transparent text-xl font-bold text-zinc-100 border-none outline-none focus:ring-0 p-0 mb-4" />
                  <textarea placeholder="Add description..." value={selectedTask.description} onChange={(e) => updateTask(selectedTask.id, { description: e.target.value })} className="w-full h-32 bg-transparent text-sm text-zinc-400 border-none outline-none resize-none p-0 focus:ring-0 leading-relaxed" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-8 border-t border-zinc-900">
                  <DetailField label="Status" value={
                    <select value={selectedTask.status} onChange={(e) => moveTask(selectedTask.id, e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] font-bold text-zinc-300 outline-none">
                      {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  } />
                  <DetailField label="Priority" value={
                    <select value={selectedTask.priority} onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value })} className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] font-bold text-zinc-300 outline-none">
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  } />
                  <DetailField label="Assignee" value={<span className="text-[10px] font-bold text-zinc-300">Jane Doe</span>} />
                  <DetailField label="Label" value={<span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500"><Tag size={10} /> {selectedTask.label}</span>} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Command Menu */}
        {isCommandMenuOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-xl bg-[#0c0c0e] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
                <Search size={18} className="text-blue-500" />
                <input autoFocus type="text" placeholder="Type a command or search..." value={commandSearch} onChange={(e) => setCommandSearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-zinc-200 placeholder:text-zinc-600 text-sm" />
              </div>
              <div className="p-2 max-h-64 overflow-y-auto">
                {filteredCommands.length > 0 ? filteredCommands.map(cmd => (
                  <CommandItem key={cmd.id} icon={cmd.icon} label={cmd.label} shortcut={cmd.shortcut} onClick={() => { if (cmd.id === 'create') addTask('todo'); setIsCommandMenuOpen(false); }} />
                )) : <div className="p-8 text-center text-xs text-zinc-600">No matching commands found.</div>}
              </div>
              <div className="bg-zinc-950 px-4 py-2 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1"><ChevronDown size={10} /> Select</span>
                  <span className="flex items-center gap-1"><Command size={10} /> Enter to Run</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Sub-components ---
function NavItem({ icon, label, count, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all group ${active ? 'bg-zinc-800/50 text-zinc-100 shadow-sm' : 'hover:bg-zinc-900/50 text-zinc-500 hover:text-zinc-300'}`}>
      <div className="flex items-center gap-3">
        <span className={active ? 'text-blue-500' : 'text-zinc-600 group-hover:text-zinc-400'}>{icon}</span>
        <span className="font-medium tracking-tight">{label}</span>
      </div>
      {count && <span className="text-[10px] font-bold text-zinc-600">{count}</span>}
    </button>
  );
}

function TaskCard({ task, onMove, onClick, active }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className={`bg-zinc-900 border p-3.5 rounded-xl transition-all cursor-pointer group relative ${active ? 'border-blue-500 ring-1 ring-blue-500 shadow-lg shadow-blue-500/10' : 'border-zinc-800 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/40'}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors uppercase tracking-wider">{task.id}</span>
        <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-zinc-700'}`} />
      </div>
      <h3 className="text-sm text-zinc-200 font-medium mb-4 leading-tight">{task.title}</h3>
      <div className="flex items-center justify-between">
        <div className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700/50 rounded text-[9px] font-bold text-zinc-400 uppercase tracking-tight">{task.label}</div>
        <div className="w-5 h-5 rounded-full border border-zinc-900 bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-400">JD</div>
      </div>
      {isHovered && !active && (
        <div className="mt-3 pt-3 border-t border-zinc-800 flex gap-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
          {COLUMNS.filter(c => c.id !== task.status).map(c => (
            <button key={c.id} onClick={(e) => { e.stopPropagation(); onMove(c.id); }} className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-100 hover:text-zinc-900 rounded text-[9px] font-bold text-zinc-500 transition-colors uppercase tracking-tighter">To {c.title}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="space-y-1.5">
      <span className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{label}</span>
      <div className="flex items-center h-8">{value}</div>
    </div>
  );
}

function CommandItem({ icon, label, shortcut, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-900 rounded-lg transition-colors text-sm text-zinc-400 group">
      <div className="flex items-center gap-3">
        <span className="text-zinc-600 group-hover:text-blue-500 transition-colors">{icon}</span>
        <span className="group-hover:text-zinc-100">{label}</span>
      </div>
      {shortcut && <span className="text-[10px] font-mono text-zinc-700 bg-zinc-950 border border-zinc-900 px-1.5 py-0.5 rounded uppercase">{shortcut}</span>}
    </button>
  );
} 
