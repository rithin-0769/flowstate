import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Search, Layout, Inbox, CheckCircle2, Circle, Clock, 
  Trash2, Tag, ChevronDown, Github, Mail, Lock, LogOut, ArrowRight,
  Zap, X, Hash, Filter, Calendar, User, Command, ChevronRight
} from 'lucide-react';
import './App.css'; // ensure styles are imported

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
  { id: 'filter', icon: <Filter size={16} />, label: "Focus Search", shortcut: "F" },
  { id: 'delete', icon: <Trash2 size={16} />, label: "Delete selected issue", shortcut: "Del" },
];

// --- Sub-components ---
function NavItem({ icon, label, count, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all duration-300 group ${active ? 'bg-zinc-800/80 text-zinc-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' : 'hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300'}`}>
      <div className="flex items-center gap-3">
        <span className={`${active ? 'text-blue-500 text-glow' : 'text-zinc-600 group-hover:text-zinc-400'} transition-all duration-300`}>{icon}</span>
        <span className="font-medium tracking-tight">{label}</span>
      </div>
      {count && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${active ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-500'}`}>{count}</span>}
    </button>
  );
}

function TaskCard({ task, onMove, onClick, active }) {
  return (
    <div 
      onClick={onClick} 
      className={`bg-zinc-900/80 backdrop-blur-sm border p-4 rounded-xl transition-all duration-300 cursor-pointer group relative overflow-hidden 
      ${active ? 'border-blue-500/50 ring-1 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] transform scale-[1.02]' : 'border-white/5 hover:border-white/10 hover:shadow-2xl hover:-translate-y-1'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <span className="text-[10px] font-mono font-semibold text-zinc-500 group-hover:text-zinc-400 transition-colors uppercase tracking-wider">{task.id}</span>
          <div className={`w-2 h-2 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-125 
            ${task.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : task.priority === 'medium' ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]' : 'bg-zinc-600'}`} />
        </div>
        <h3 className="text-sm text-zinc-200 font-semibold mb-4 leading-relaxed group-hover:text-white transition-colors">{task.title}</h3>
        <div className="flex items-center justify-between">
          <div className="px-2 py-1 bg-zinc-800/80 border border-white/5 rounded-md text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{task.label}</div>
          <div className="w-6 h-6 rounded-full border border-zinc-700 bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-300 shadow-inner">RR</div>
        </div>
        
        {/* Quick Actions (only visible on hover, but we use a robust approach) */}
        {!active && (
          <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-zinc-900 via-zinc-900/95 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100">
            {COLUMNS.filter(c => c.id !== task.status).map(c => (
              <button 
                key={c.id} 
                onClick={(e) => { e.stopPropagation(); onMove(c.id); }} 
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[9px] font-bold uppercase tracking-tight transition-colors"
                title={`Move to ${c.title}`}
              >
                {c.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="space-y-2">
      <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
      <div className="flex items-center h-8">{value}</div>
    </div>
  );
}

function CommandItem({ icon, label, shortcut, onClick, active }) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 
      ${active ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'}`}
    >
      <div className="flex items-center gap-3">
        <span className={`${active ? 'text-blue-500' : 'text-zinc-500'}`}>{icon}</span>
        <span className="font-medium text-sm">{label}</span>
      </div>
      {shortcut && <span className={`text-[10px] font-mono px-2 py-1 rounded-md uppercase font-bold
        ${active ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800/80 text-zinc-500 border border-white/5'}`}>{shortcut}</span>}
    </button>
  );
}

// --- Main App Component ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [commandIndex, setCommandIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('My Issues');
  const [selectedTask, setSelectedTask] = useState(null);
  const searchInputRef = useRef(null);

  // --- Auth Handlers ---
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 1500);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedTask(null);
  };

  // --- Filtering & Derived Data ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter(t => t.status === 'done').length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  const filteredCommands = useMemo(() => {
    return COMMANDS.filter(c => c.label.toLowerCase().includes(commandSearch.toLowerCase()));
  }, [commandSearch]);

  // Reset command index when text changes
  useEffect(() => {
    setCommandIndex(0);
  }, [commandSearch]);

  // --- Task Actions ---
  const moveTask = (id, newStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    if (selectedTask?.id === id) setSelectedTask(prev => ({ ...prev, status: newStatus }));
  };

  const addTask = (columnId) => {
    const newId = `FLW-${Math.floor(Math.random() * 900) + 200}`;
    const newTask = {
      id: newId,
      title: 'New Feature Request',
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

  const executeCommand = (cmdId) => {
    setIsCommandMenuOpen(false);
    switch (cmdId) {
      case 'create':
        addTask('todo');
        break;
      case 'assign':
        if (selectedTask) updateTask(selectedTask.id, { assignee: 'Rithin Ravoori' });
        break;
      case 'filter':
        setTimeout(() => searchInputRef.current?.focus(), 100);
        break;
      case 'delete':
        if (selectedTask) deleteTask(selectedTask.id);
        break;
      default:
        break;
    }
    setCommandSearch('');
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        if (isCommandMenuOpen) setIsCommandMenuOpen(false);
        else if (selectedTask) setSelectedTask(null);
      }
      
      // Command Palette Navigation
      if (isCommandMenuOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setCommandIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : prev));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setCommandIndex(prev => (prev > 0 ? prev - 1 : 0));
        }
        if (e.key === 'Enter' && filteredCommands.length > 0) {
          e.preventDefault();
          executeCommand(filteredCommands[commandIndex].id);
        }
      } else {
        // Global shortcuts when palette is closed
        if (e.key === 'c' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          addTask('todo');
        }
        if (e.key === 'f' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, isCommandMenuOpen, filteredCommands, commandIndex, selectedTask]);

  // --- Render Login View ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-glow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px] mix-blend-screen animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
        
        <div className="absolute top-1/2 left-20 w-32 h-32 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-3xl blur-[2px] animate-float rotate-12 hidden lg:block" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-gradient-to-br from-indigo-500/40 to-cyan-500/20 rounded-full blur-[1px] animate-float hidden lg:block" style={{ animationDelay: '1.5s' }} />

        <div className="glass-panel w-full max-w-[420px] p-8 rounded-3xl z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] mb-6 ring-1 ring-white/20">
              <Zap size={28} fill="white" className="animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2 text-glow">FlowState</h1>
            <p className="text-zinc-400 text-sm font-medium">Elevate your team's productivity</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Email address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors duration-300" size={18} />
                <input 
                  type="email" 
                  required
                  defaultValue="demo@flowstate.app"
                  placeholder="name@company.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-zinc-200 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Password</label>
                <button type="button" className="text-[11px] font-bold uppercase text-blue-400 hover:text-blue-300 tracking-widest transition-colors">Forgot?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors duration-300" size={18} />
                <input 
                  type="password" 
                  required
                  defaultValue="password123"
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-zinc-200 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Enter Workspace
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-xs font-medium text-zinc-500">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    );
  }

  // --- Render Dashboard View ---
  return (
    <div className="flex flex-col h-screen bg-[#050505] text-zinc-400 font-sans selection:bg-blue-500/30 overflow-hidden">
      <div className="flex flex-1 overflow-hidden animate-in fade-in duration-700">
        
        {/* --- Sidebar --- */}
        <aside className="w-64 border-r border-white/5 flex flex-col bg-[#0a0a0c] z-20 shadow-2xl relative">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                <Zap size={18} fill="white" />
              </div>
              <span className="text-zinc-100 font-bold tracking-tight text-lg">FlowState</span>
            </div>

            <nav className="space-y-1.5">
              <NavItem icon={<Inbox size={18} />} label="Inbox" count={3} onClick={() => setActiveCategory('Inbox')} active={activeCategory === 'Inbox'} />
              <NavItem icon={<Layout size={18} />} label="My Issues" onClick={() => setActiveCategory('My Issues')} active={activeCategory === 'My Issues'} />
              <NavItem icon={<CheckCircle2 size={18} />} label="Completed" onClick={() => setActiveCategory('Completed')} active={activeCategory === 'Completed'} />
            </nav>

            <div className="mt-10">
              <div className="flex items-center justify-between px-3 mb-3">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Projects</h3>
                <Plus size={14} className="text-zinc-500 hover:text-white cursor-pointer transition-colors" />
              </div>
              <nav className="space-y-1">
                <NavItem icon={<div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />} label="Vivid Board" />
                <NavItem icon={<div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-blue-400 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />} label="Mobile App" />
                <NavItem icon={<div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-purple-400 to-pink-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />} label="Marketing Site" />
              </nav>
            </div>
          </div>

          <div className="mt-auto p-6 border-t border-white/5 bg-gradient-to-b from-transparent to-black/20">
            <div className="flex items-center justify-between text-[10px] font-bold mb-3">
              <span className="text-zinc-500 uppercase tracking-widest">Sprint Progress</span>
              <span className="text-blue-400">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* User Profile / Logout Toggle */}
            <div className="mt-6 relative group">
              <div className="p-3 bg-zinc-900/40 rounded-2xl border border-white/5 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 focus:outline-none transition-all duration-300">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-400 border border-white/10 flex items-center justify-center text-white font-bold shadow-inner">RR</div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-zinc-200 truncate">Rithin Ravoori</p>
                  <p className="text-[10px] text-zinc-500 truncate uppercase tracking-widest">Pro Plan</p>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="absolute bottom-full left-0 w-full mb-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg backdrop-blur-md"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* --- Main Content Area --- */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-[#09090b]">
          {/* Subtle background glow for depth */}
          <div className="absolute top-0 left-1/2 w-[800px] h-[300px] bg-blue-500/5 rounded-[100%] blur-[100px] -translate-x-1/2 pointer-events-none" />

          {/* Header */}
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#09090b]/60 backdrop-blur-xl sticky top-0 z-10 supports-[backdrop-filter]:bg-[#09090b]/60">
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="text-zinc-500 px-2 py-1 bg-zinc-900 rounded-md border border-white/5">FlowState</span>
              <ChevronRight size={14} className="text-zinc-700" />
              <span className="text-zinc-100 px-2 py-1 bg-zinc-800/50 rounded-md shadow-sm">{activeCategory}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-500 rounded border border-white/10 font-mono">F</kbd>
                </div>
                <input 
                  type="text" 
                  ref={searchInputRef}
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/50 border border-white/10 text-sm rounded-xl pl-10 pr-12 py-2 w-64 md:w-80 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                />
              </div>
              
              <div className="h-6 w-px bg-white/10"></div>

              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-black/50 border border-white/10 text-xs font-semibold text-zinc-300 rounded-xl px-3 py-2 outline-none hover:border-white/20 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <button onClick={() => addTask('todo')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 active:translate-y-0">
                <Plus size={16} />
                New Issue
                <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[9px] bg-white/20 rounded font-mono">C</kbd>
              </button>
            </div>
          </header>

          {/* Kanban Board */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 flex gap-6 relative z-0">
            {COLUMNS.map(col => (
              <div key={col.id} className="w-80 flex-shrink-0 flex flex-col h-full bg-zinc-900/20 rounded-2xl p-2 border border-white/[0.02]">
                <div className="flex items-center justify-between mb-4 px-3 pt-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-zinc-500 bg-zinc-800 p-1.5 rounded-lg shadow-sm border border-white/5">{col.icon}</span>
                    <h2 className="text-sm font-bold text-zinc-200 tracking-wide">{col.title}</h2>
                    <span className="ml-1 text-[11px] font-bold px-2 py-0.5 bg-zinc-800 border border-white/5 rounded-full text-zinc-400">
                      {filteredTasks.filter(t => t.status === col.id).length}
                    </span>
                  </div>
                  <button onClick={() => addTask(col.id)} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors" title="Add issue">
                    <Plus size={16} />
                  </button>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-1 pb-4">
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
                    <div className="h-32 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-zinc-600 gap-2 m-1">
                      <Inbox size={24} className="opacity-50" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">No Issues</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Slide-over Detail View */}
          {selectedTask && (
            <div className="absolute inset-y-0 right-0 w-full max-w-[480px] bg-[#0c0c0e]/95 backdrop-blur-2xl border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-40 animate-in slide-in-from-right duration-500 supports-[backdrop-filter]:bg-[#0c0c0e]/80">
              <div className="flex flex-col h-full">
                <header className="flex items-center justify-between p-5 border-b border-white/5 bg-zinc-900/20">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-zinc-400 uppercase bg-black/40 px-2 py-1 rounded-md border border-white/5">{selectedTask.id}</span>
                    <ChevronRight size={14} className="text-zinc-600" />
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{selectedTask.status.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => deleteTask(selectedTask.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all" title="Delete Issue">
                      <Trash2 size={18} />
                    </button>
                    <button onClick={() => setSelectedTask(null)} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all" title="Close">
                      <X size={18} />
                    </button>
                  </div>
                </header>
                
                <div className="flex-1 overflow-y-auto p-8">
                  <div className="mb-8">
                    <input 
                      type="text" 
                      value={selectedTask.title} 
                      onChange={(e) => updateTask(selectedTask.id, { title: e.target.value })} 
                      className="w-full bg-transparent text-2xl font-bold text-white border-none outline-none focus:ring-0 p-0 mb-4 placeholder:text-zinc-700 hover:bg-white/5 focus:bg-white/5 rounded-lg px-2 -ml-2 transition-colors" 
                      placeholder="Issue Title"
                    />
                    <textarea 
                      placeholder="Add a detailed description..." 
                      value={selectedTask.description} 
                      onChange={(e) => updateTask(selectedTask.id, { description: e.target.value })} 
                      className="w-full h-40 bg-transparent text-sm text-zinc-400 border-none outline-none resize-none p-2 -ml-2 rounded-lg hover:bg-white/5 focus:bg-white/5 focus:ring-0 leading-relaxed transition-colors" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 p-6 rounded-2xl bg-black/30 border border-white/5">
                    <DetailField label="Status" value={
                      <div className="relative w-full">
                        <select value={selectedTask.status} onChange={(e) => moveTask(selectedTask.id, e.target.value)} className="w-full appearance-none bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-zinc-300 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 cursor-pointer transition-all">
                          {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      </div>
                    } />
                    <DetailField label="Priority" value={
                      <div className="relative w-full">
                        <select value={selectedTask.priority} onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value })} className="w-full appearance-none bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-zinc-300 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 cursor-pointer transition-all">
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      </div>
                    } />
                    <DetailField label="Assignee" value={
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg text-xs font-bold text-zinc-300 transition-colors">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center text-[8px] text-white">RR</div>
                        Rithin Ravoori
                      </button>
                    } />
                    <DetailField label="Label" value={
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold transition-colors">
                        <Tag size={12} /> {selectedTask.label}
                      </button>
                    } />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Command Menu Modal */}
          {isCommandMenuOpen && (
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/80 backdrop-blur-sm px-4">
              <div 
                className="w-full max-w-2xl bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center gap-4 p-5 border-b border-zinc-800/80 bg-black/40">
                  <Search size={20} className="text-blue-500" />
                  <input 
                    autoFocus 
                    type="text" 
                    placeholder="Type a command or search..." 
                    value={commandSearch} 
                    onChange={(e) => setCommandSearch(e.target.value)} 
                    className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-zinc-600" 
                  />
                  <kbd className="px-2 py-1 text-xs font-mono bg-zinc-900 text-zinc-500 rounded border border-white/5">ESC</kbd>
                </div>
                <div className="p-3 max-h-[60vh] overflow-y-auto">
                  {filteredCommands.length > 0 ? (
                    <div className="space-y-1">
                      {filteredCommands.map((cmd, idx) => (
                        <CommandItem 
                          key={cmd.id} 
                          icon={cmd.icon} 
                          label={cmd.label} 
                          shortcut={cmd.shortcut} 
                          active={idx === commandIndex}
                          onClick={() => executeCommand(cmd.id)} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center flex flex-col items-center gap-3">
                      <Command size={32} className="text-zinc-700" />
                      <div className="text-sm font-medium text-zinc-500">No matching commands found.</div>
                    </div>
                  )}
                </div>
                <div className="bg-[#050505] px-5 py-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-6 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><kbd className="bg-zinc-800 px-1 py-0.5 rounded">↑↓</kbd> Navigate</span>
                    <span className="flex items-center gap-1.5"><kbd className="bg-zinc-800 px-1 py-0.5 rounded">↵</kbd> Select</span>
                  </div>
                  <div className="text-[10px] text-zinc-600 font-medium">FlowState Command Menu</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- Footer (Dashboard Area) --- */}
      {isAuthenticated && (
        <footer className="h-10 border-t border-white/5 bg-[#050505] flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4 text-[11px] font-medium text-zinc-500">
            <span className="flex items-center gap-1.5"><Zap size={11} className="text-blue-500" /> FlowState v1.0.0</span>
            <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Systems Operational</span>
          </div>
          
          <div className="flex items-center gap-6 text-[11px] font-medium text-zinc-500">
            <button className="hover:text-zinc-300 transition-colors">Documentation</button>
            <button className="hover:text-zinc-300 transition-colors">Support</button>
            <div className="flex items-center gap-1.5">
              <span>Shortcuts</span>
              <kbd className="font-mono bg-zinc-900 border border-white/10 px-1.5 py-0.5 rounded text-zinc-400">Ctrl/Cmd K</kbd>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
                      }
