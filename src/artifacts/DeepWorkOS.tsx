import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Pause, Square, RotateCcw, Clock, Target, Plus, Minus, 
  Save, NotebookPen, Trash2, Info, HelpCircle, Copy, ChevronDown, 
  ChevronUp, PlusCircle, BarChart3, TrendingUp, Calendar, 
  Zap, Brain, BookOpen, Coffee, Lightbulb, Download, Upload,
  Settings, Bell, BellOff, ChevronLeft, ChevronRight, Star,
  Award, Flame, Timer, Activity, Filter, Search, MoreHorizontal
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';

// Enhanced Types
type Domain = "Backend" | "Data" | "CS" | "Other" | "SystemDesign" | "AlgoDS" | "Study" | "Research";

type Priority = "Low" | "Medium" | "High" | "Critical";

type OOF = {
  id: string;
  title: string;
  domain: Domain;
  priority: Priority;
  estimatedMinutes: number;
  actualMinutes: number;
  definitionOfDone?: string;
  constraints?: string;
  firstStep?: string;
  planned?: boolean;
  createdAt: number;
  completedAt?: number;
  tags: string[];
  difficulty: number; // 1-5
  energy: number; // 1-5 (required energy level)
};

type BlockLog = {
  id: string;
  dateISO: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  startTs: number;
  endTs: number;
  minutes: number;
  oofId?: string;
  oofTitle: string;
  dq: number;
  ou: number;
  lr: number;
  energy: number; // energy level at start
  mood: number; // mood at end (1-5)
  notes?: string;
  interruptions: number;
  flowState: boolean;
  completedOOF?: boolean;
};

type ParkingItem = { 
  id: string; 
  text: string; 
  done: boolean; 
  createdDuringBlock?: string;
  priority: Priority;
  category: 'task' | 'idea' | 'distraction' | 'learning';
};

type ChecklistState = {
  pre: { oof: boolean; tabs: boolean; notifications: boolean; prep: boolean; energy: boolean };
  during: { singleTask: boolean; scratchpad: boolean; stuckRule: boolean; hydration: boolean };
  post: { artifact: boolean; summary: boolean; nextStep: boolean; reflect: boolean };
};

type RunningBlock = {
  active: boolean;
  blockId: string;
  oofId?: string;
  oofTitle: string;
  targetMinutes: number;
  startTs: number;
  paused: boolean;
  elapsedSec: number;
  pausedTime: number;
  interruptions: number;
  lastActivityTs: number;
};

type Template = { 
  id: string; 
  title: string; 
  body: string; 
  category: string;
  useCount: number;
  lastUsed: number;
};

type Settings = {
  notifications: boolean;
  soundEnabled: boolean;
  autoBreaks: boolean;
  breakDuration: number;
  dailyGoal: number;
  weeklyGoal: number;
  preferredBlockSize: number;
  energyTracking: boolean;
  advancedMetrics: boolean;
};

type StudySession = {
  id: string;
  subject: string;
  topics: string[];
  method: 'reading' | 'practice' | 'review' | 'research';
  duration: number;
  effectiveness: number;
  retention: number;
  date: string;
};

// Enhanced Helper Components
const QuickStats = ({ logs, className = "" }) => {
  const today = new Date().toISOString().split('T')[0];
  const thisWeek = logs.filter(log => {
    const logDate = new Date(log.dateISO);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    return logDate >= weekStart;
  });
  
  const todayTime = logs.filter(log => log.dateISO === today).reduce((sum, log) => sum + log.minutes, 0);
  const weekTime = thisWeek.reduce((sum, log) => sum + log.minutes, 0);
  const streak = calculateStreak(logs);
  
  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      <Card className="bg-slate-800 border-emerald-500/50 shadow-lg shadow-emerald-500/10">
        <CardContent className="pt-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-300">{Math.round(todayTime/60 * 10)/10}h</div>
            <div className="text-slate-200 text-sm font-medium">Сьогодні</div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800 border-blue-500/50 shadow-lg shadow-blue-500/10">
        <CardContent className="pt-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-300">{Math.round(weekTime/60 * 10)/10}h</div>
            <div className="text-slate-200 text-sm font-medium">Тиждень</div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800 border-amber-500/50 shadow-lg shadow-amber-500/10">
        <CardContent className="pt-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-300 flex items-center justify-center">
              <Flame className="w-7 h-7 mr-1" />
              {streak}
            </div>
            <div className="text-slate-200 text-sm font-medium">Стрік</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const calculateStreak = (logs) => {
  const sortedLogs = logs.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
  const uniqueDates = [...new Set(sortedLogs.map(log => log.dateISO))];
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const checkDateISO = checkDate.toISOString().split('T')[0];
    
    if (uniqueDates.includes(checkDateISO)) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

const SmartTimer = ({ run, onTogglePause, onReset, onStop, elapsedSec }) => {
  const targetSec = run.targetMinutes * 60;
  const progress = Math.min(100, Math.round((elapsedSec / targetSec) * 100));
  const remainingMin = Math.ceil((targetSec - elapsedSec) / 60);
  
  // Activity detection
  const isNearComplete = progress > 85;
  const isOvertime = progress > 100;
  
  return (
    <Card className={`bg-slate-800 border-2 ${isOvertime ? 'border-amber-500' : isNearComplete ? 'border-emerald-500' : 'border-slate-700'}`}>
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">{run.oofTitle}</h3>
            <div className="text-5xl font-mono font-bold text-emerald-400 mb-2">
              {formatTime(elapsedSec)}
            </div>
            <div className="text-sm text-slate-400">
              {isOvertime ? 
                <span className="text-amber-400 font-semibold">Овертайм! +{remainingMin-run.targetMinutes} хв</span> :
                <span>Залишилось: {remainingMin} хв ({progress}%)</span>
              }
            </div>
          </div>
          
          {/* Enhanced Progress Ring */}
          <div className="relative w-40 h-40 mx-auto">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-700"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={isOvertime ? "text-amber-400" : "text-emerald-400"}
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${Math.min(progress, 100)}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold ${isOvertime ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {progress}%
                </div>
                <div className="text-xs text-slate-400">готово</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-3">
            <Button
              onClick={onTogglePause}
              variant="outline"
              size="lg"
              className="border-slate-600 text-slate-300 hover:text-slate-100"
            >
              {run.paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              size="lg"
              className="border-slate-600 text-slate-300 hover:text-slate-100"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              onClick={onStop}
              variant="default"
              size="lg"
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Square className="w-5 h-5 mr-2" />
              Завершити
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EnhancedOOFCard = ({ oof, onStart, onEdit, onDelete, onToggleStar, isStarred }) => {
  const priorityColors = {
    Low: { bg: 'bg-slate-800/90', text: 'text-slate-300', border: 'border-slate-600' },
    Medium: { bg: 'bg-blue-900/60', text: 'text-blue-400', border: 'border-blue-700' },
    High: { bg: 'bg-amber-900/60', text: 'text-amber-400', border: 'border-amber-700' },
    Critical: { bg: 'bg-red-900/60', text: 'text-red-400', border: 'border-red-700' }
  };
  
  const domainConfig = {
    Backend: { label: 'Backend', color: 'text-blue-400', bgColor: 'bg-blue-900/40' },
    Data: { label: 'Data', color: 'text-emerald-400', bgColor: 'bg-emerald-900/40' },
    CS: { label: 'CS', color: 'text-purple-400', bgColor: 'bg-purple-900/40' },
    Other: { label: 'Other', color: 'text-amber-400', bgColor: 'bg-amber-900/40' },
    SystemDesign: { label: 'System Design', color: 'text-cyan-400', bgColor: 'bg-cyan-900/40' },
    AlgoDS: { label: 'Algo & DS', color: 'text-rose-400', bgColor: 'bg-rose-900/40' },
    Study: { label: 'Study', color: 'text-green-400', bgColor: 'bg-green-900/40' },
    Research: { label: 'Research', color: 'text-indigo-400', bgColor: 'bg-indigo-900/40' }
  };
  
  const completionRate = oof.actualMinutes > 0 ? Math.round((oof.actualMinutes / oof.estimatedMinutes) * 100) : 0;
  
  return (
    <Card className={`${priorityColors[oof.priority].bg} border-2 ${priorityColors[oof.priority].border} hover:border-opacity-80 transition-all duration-200 backdrop-blur-sm shadow-lg`}>
      <CardContent className="pt-4 bg-transparent">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={`${domainConfig[oof.domain].bgColor} ${domainConfig[oof.domain].color} border-0 text-xs font-semibold px-2 py-1`}>
                {domainConfig[oof.domain].label}
              </Badge>
              <Badge className={`${priorityColors[oof.priority].bg} ${priorityColors[oof.priority].text} border-0 text-xs font-semibold px-2 py-1`}>
                {oof.priority}
              </Badge>
              {oof.tags.map(tag => (
                <Badge key={tag} className="text-xs border border-slate-500/50 text-slate-300 bg-slate-800/60 px-2 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
            <h4 className="font-semibold text-slate-100 mb-2 leading-tight">{oof.title}</h4>
            <div className="text-sm text-slate-300 space-y-1">
              <div className="flex items-center space-x-4">
                <span className="text-slate-300">📊 {oof.estimatedMinutes}хв план</span>
                <span className="text-slate-300">⚡ Складність: {oof.difficulty}/5</span>
                <span className="text-slate-300">🔋 Енергія: {oof.energy}/5</span>
              </div>
              {completionRate > 0 && (
                <div className="flex items-center">
                  <div className="w-full bg-slate-700/80 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full ${completionRate >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(completionRate, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-300">{completionRate}%</span>
                </div>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleStar(oof.id)}
            className={`${isStarred ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-500 hover:text-yellow-400'} bg-transparent hover:bg-slate-700/50`}
          >
            <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
          </Button>
        </div>
        
        {oof.definitionOfDone && (
          <p className="text-slate-300 text-sm mb-2 bg-slate-800/40 p-2 rounded-lg border border-slate-700/50">
            ✅ DoD: {oof.definitionOfDone}
          </p>
        )}
        {oof.firstStep && (
          <p className="text-slate-300 text-sm mb-3 bg-slate-800/40 p-2 rounded-lg border border-slate-700/50">
            🚀 Наступний крок: {oof.firstStep}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button size="sm" onClick={() => onStart(oof, 60)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md">
              60хв
            </Button>
            <Button size="sm" onClick={() => onStart(oof, 90)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md">
              90хв
            </Button>
            <Button size="sm" onClick={() => onStart(oof, oof.estimatedMinutes)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md">
              {oof.estimatedMinutes}хв
            </Button>
          </div>
          <div className="flex space-x-1">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onEdit(oof)} 
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 bg-transparent border border-slate-600/50"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onDelete(oof.id)} 
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 bg-transparent border border-slate-600/50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SmartParkingList = ({ parking, onAdd, onToggle, onDelete, onCategorize, currentBlockId }) => {
  const [filter, setFilter] = useState('all');
  
  const filteredParking = parking.filter(item => {
    if (filter === 'all') return true;
    return item.category === filter;
  });
  
  const categories = ['task', 'idea', 'distraction', 'learning'];
  const categoryIcons = {
    task: '📋',
    idea: '💡', 
    distraction: '🚨',
    learning: '📚'
  };
  
  return (
    <div className="space-y-4">
      <div className="p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
        {/* Input поле на всю ширину */}
        <div className="w-full mb-4">
          <AddInline
            placeholder="Швидко запишіть думку або відволікання..."
            onAdd={onAdd}
            buttonText="Додати"
          />
        </div>
        
        {/* Кнопки фільтрів внизу */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3 flex-wrap">
            <Filter className="w-5 h-5 text-slate-300" />
            <span className="text-slate-100 text-sm font-bold">Категорії:</span>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => setFilter('all')}
                className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-md ${
                  filter === 'all' 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white border-2 border-indigo-400/50 shadow-lg shadow-indigo-500/25' 
                    : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-slate-200 border-2 border-slate-600/50 hover:border-slate-500/50'
                }`}
              >
                📋 Всі
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  onClick={() => setFilter(cat)}
                  className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-md ${
                    filter === cat 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white border-2 border-indigo-400/50 shadow-lg shadow-indigo-500/25' 
                      : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-slate-200 border-2 border-slate-600/50 hover:border-slate-500/50'
                  }`}
                >
                  {categoryIcons[cat]}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="text-slate-200 text-sm font-semibold bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700/50 shadow-md">
            {filteredParking.length} записів
          </div>
        </div>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {filteredParking.map(item => (
          <Card key={item.id} className={`bg-gradient-to-r from-slate-800/80 to-slate-700/60 backdrop-blur-sm border border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-200 ${item.createdDuringBlock === currentBlockId ? 'border-l-4 border-l-emerald-400 shadow-emerald-400/20' : ''}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <Switch
                    checked={item.done}
                    onCheckedChange={(checked) => onToggle(item.id, checked)}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium leading-relaxed ${item.done ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                        {item.text}
                      </span>
                      <span className="text-lg">{categoryIcons[item.category]}</span>
                    </div>
                    {item.createdDuringBlock === currentBlockId && (
                      <span className="text-xs text-emerald-400 font-semibold mt-1 inline-block bg-emerald-900/20 px-2 py-1 rounded-md border border-emerald-700/30">
                        • додано під час поточного блоку
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={item.category}
                    onChange={(e) => onCategorize(item.id, e.target.value)}
                    className="text-sm bg-slate-700/90 border border-slate-600/50 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 backdrop-blur-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{categoryIcons[cat]} {cat}</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(item.id)}
                    className="text-slate-400 hover:text-red-400 hover:bg-red-900/20 backdrop-blur-sm border border-slate-600/50 hover:border-red-700/50 p-2 rounded-lg transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Local Storage helpers with error handling
const ls = {
  get: <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },
  set: <T,>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const AddInline = ({ placeholder, onAdd, buttonText = "Додати" }) => {
  const [text, setText] = useState("");
  
  const handleAdd = () => {
    if (text.trim()) {
      onAdd(text.trim());
      setText("");
    }
  };
  
  return (
    <div className="flex flex-col space-y-3 w-full">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAdd())}
        className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-indigo-500 min-h-[80px] resize-y rounded-xl"
        rows={3}
      />
      <div className="flex justify-end">
        <Button onClick={handleAdd} size="sm" className="bg-indigo-600 hover:bg-indigo-500 whitespace-nowrap text-white font-medium px-6 py-2">
          <Plus className="w-4 h-4 mr-1" />
          {buttonText}
        </Button>
      </div>
      <div className="text-xs text-slate-400 bg-slate-800/30 px-3 py-2 rounded-lg border border-slate-700/30">
        <Lightbulb className="w-3 h-3 mr-1 inline text-indigo-400" />
        <strong>Підказка:</strong> Використовуйте Shift+Enter для нового рядка, Enter для додавання
      </div>
    </div>
  );
};

const ChecklistTile = ({ title, checked, onChange, infoContent, example, icon }) => {
  const [showInfo, setShowInfo] = useState(false);
  
  return (
    <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/60 border border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Switch checked={checked} onCheckedChange={onChange} />
            <div className="flex items-center space-x-2">
              {icon && <span className="text-xl">{icon}</span>}
              <span className="text-slate-100 text-sm font-bold">{title}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className="text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 backdrop-blur-sm border border-slate-600/30 px-3 py-1 rounded-lg font-semibold"
          >
            {showInfo ? 'Сховати' : 'Інфо'}
          </Button>
        </div>
        {showInfo && (
          <div className="mt-4 p-4 bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
            <p className="text-slate-200 text-sm mb-3 leading-relaxed font-medium">{infoContent}</p>
            {example && (
              <p className="text-slate-300 text-xs italic bg-slate-800/40 p-2 rounded-lg border border-slate-700/30">
                <strong>Приклад:</strong> {example}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const NotesSection = ({ notes, onNotesChange, className = "" }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const handleCopy = async () => {
    if (notes.trim()) {
      try {
        await navigator.clipboard.writeText(notes);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };
  
  const handleClear = () => {
    onNotesChange('');
  };
  
  const handleExport = () => {
    if (notes.trim()) {
      const blob = new Blob([notes], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-notes-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  
  const wordCount = notes.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = notes.length;
  
  return (
    <Card className={`bg-slate-800/90 border-slate-600/70 shadow-xl ${className}`}>
      <CardHeader className="bg-slate-700/50 border-b border-slate-600">
        <CardTitle className="text-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <NotebookPen className="w-5 h-5 text-purple-400" />
            <span>Нотатки поточної сесії</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>{wordCount} слів</span>
            <span>•</span>
            <span>{charCount} символів</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-4">
        <div className="space-y-4">
          <Textarea
            placeholder="Записуйте ідеї, інсайти, питання та висновки під час роботи..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="bg-slate-900/60 border-slate-600/50 text-slate-100 placeholder-slate-400 min-h-[175px] rounded-xl resize-y focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-200"
            style={{ minHeight: '175px', maxHeight: '600px' }}
          />
          
          <div className="flex items-center justify-between bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center text-xs text-slate-400">
              <Lightbulb className="w-4 h-4 mr-2 text-purple-400" />
              <span><strong>Підказка:</strong> Використовуйте шаблони з вкладки "Шаблони" - кнопка "В нотатки" додає їх сюди автоматично</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                disabled={!notes.trim()}
                className="border-slate-500 text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCopied ? (
                  <>
                    <span className="w-4 h-4 mr-1">✓</span>
                    Скопійовано
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Копіювати
                  </>
                )}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleExport}
                disabled={!notes.trim()}
                className="border-slate-500 text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-1" />
                Експорт
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleClear}
                disabled={!notes.trim()}
                className="border-red-600/50 text-red-400 hover:text-red-300 hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Очистити
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DeepWorkOS_UA = () => {
  // Enhanced state management with localStorage persistence
  const [oofs, setOofs] = useState<OOF[]>(() => ls.get('dw_oofs', []));
  const [parking, setParking] = useState<ParkingItem[]>(() => ls.get('dw_parking', []));
  const [checklists, setChecklists] = useState<ChecklistState>(() => ls.get('dw_checklists', {
    pre: { oof: false, tabs: false, notifications: false, prep: false, energy: false },
    during: { singleTask: false, scratchpad: false, stuckRule: false, hydration: false },
    post: { artifact: false, summary: false, nextStep: false, reflect: false }
  }));
  const [run, setRun] = useState<RunningBlock>(() => ls.get('dw_running', {
    active: false,
    blockId: '',
    oofId: undefined,
    oofTitle: '',
    targetMinutes: 60,
    startTs: 0,
    paused: false,
    elapsedSec: 0,
    pausedTime: 0,
    interruptions: 0,
    lastActivityTs: 0
  }));
  const [logs, setLogs] = useState<BlockLog[]>(() => ls.get('dw_logs', []));
  const [templates, setTemplates] = useState<Template[]>(() => ls.get('dw_templates', [
    { id: 'rag-slice', title: 'RAG слайс', body: `1. Визначити запит та контекст\n2. Налаштувати пошук документів\n3. Відфільтрувати релевантні фрагменти\n4. Згенерувати відповідь з контекстом\n5. Валідувати точність результату`, category: 'AI/ML', useCount: 0, lastUsed: 0 },
    { id: 'study-session', title: 'Навчальна сесія', body: `1. Визначити тему та цілі\n2. Підготувати матеріали\n3. Активне читання/практика\n4. Створити резюме\n5. Тестування розуміння\n6. Планування повторення`, category: 'Study', useCount: 0, lastUsed: 0 },
    { id: 'coding-problem', title: 'Вирішення задачі', body: `1. Прочитати і зрозуміти умову\n2. Розібрати приклади\n3. Визначити підхід та структури даних\n4. Написати псевдокод\n5. Імплементувати рішення\n6. Тестувати та оптимізувати`, category: 'Coding', useCount: 0, lastUsed: 0 }
  ]));
  const [settings, setSettings] = useState<Settings>(() => ls.get('dw_settings', {
    notifications: true,
    soundEnabled: true,
    autoBreaks: false,
    breakDuration: 15,
    dailyGoal: 240, // 4 hours
    weeklyGoal: 1200, // 20 hours
    preferredBlockSize: 90,
    energyTracking: true,
    advancedMetrics: true
  }));
  
  // UI state
  const [starredOOFs, setStarredOOFs] = useState<string[]>(() => ls.get('dw_starred', []));
  const [showHints, setShowHints] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [activeTab, setActiveTab] = useState('focus');
  const [oofFilter, setOofFilter] = useState('all');
  const [editingOOF, setEditingOOF] = useState<OOF | null>(null);
  
  // Form states
  const [newOOF, setNewOOF] = useState({
    title: '',
    domain: 'Backend' as Domain,
    priority: 'Medium' as Priority,
    estimatedMinutes: 90,
    definitionOfDone: '',
    constraints: '',
    firstStep: '',
    tags: [] as string[],
    difficulty: 3,
    energy: 3
  });
  
  const [postBlockData, setPostBlockData] = useState({
    dq: 3,
    ou: 0,
    lr: 0,
    energy: 3,
    mood: 3,
    interruptions: 0,
    flowState: false,
    completedOOF: false,
    notes: ''
  });
  
  const [newTemplate, setNewTemplate] = useState({
    id: '',
    title: '',
    body: '',
    category: 'General'
  });
  
  // Timer management
  const intervalRef = useRef<number | null>(null);
  const activityTimeoutRef = useRef<number | null>(null);
  
  // Persist state changes to localStorage
  useEffect(() => ls.set('dw_oofs', oofs), [oofs]);
  useEffect(() => ls.set('dw_parking', parking), [parking]);
  useEffect(() => ls.set('dw_checklists', checklists), [checklists]);
  useEffect(() => ls.set('dw_running', run), [run]);
  useEffect(() => ls.set('dw_logs', logs), [logs]);
  useEffect(() => ls.set('dw_templates', templates), [templates]);
  useEffect(() => ls.set('dw_settings', settings), [settings]);
  useEffect(() => ls.set('dw_starred', starredOOFs), [starredOOFs]);
  
  // Enhanced timer with activity tracking
  useEffect(() => {
    if (run.active && !run.paused) {
      intervalRef.current = window.setInterval(() => {
        setRun(prev => ({
          ...prev,
          elapsedSec: prev.elapsedSec + 1
        }));
      }, 1000);
      
      // Activity timeout
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      
      activityTimeoutRef.current = window.setTimeout(() => {
        if (settings.notifications) {
          // Show activity reminder
          console.log('Activity reminder: Consider taking a micro-break or changing approach');
        }
      }, 5 * 60 * 1000); // 5 minutes
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
        activityTimeoutRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    };
  }, [run.active, run.paused, settings.notifications]);
  
  // Smart notifications
  useEffect(() => {
    if (run.active && settings.notifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      const targetSec = run.targetMinutes * 60;
      if (run.elapsedSec >= targetSec && run.elapsedSec % 60 === 0) {
        if (Notification.permission === 'granted') {
          new Notification('Deep Work OS', {
            body: 'Час блоку завершено! Готові завершити?',
            icon: '/favicon.ico'
          });
        }
      }
    }
  }, [run.elapsedSec, run.active, settings.notifications, run.targetMinutes]);
  
  // Helper functions
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Скопійовано!');
    } catch (err) {
      // Fallback for non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      setCopyStatus(successful ? 'Скопійовано!' : 'Не вдалося скопіювати');
    }
    
    setTimeout(() => setCopyStatus(''), 2000);
  };
  
  // Enhanced OOF operations
  const addOOF = () => {
    if (!newOOF.title.trim()) return;
    
    const oof: OOF = {
      id: generateId(),
      title: newOOF.title.trim(),
      domain: newOOF.domain,
      priority: newOOF.priority,
      estimatedMinutes: newOOF.estimatedMinutes,
      actualMinutes: 0,
      definitionOfDone: newOOF.definitionOfDone.trim() || undefined,
      constraints: newOOF.constraints.trim() || undefined,
      firstStep: newOOF.firstStep.trim() || undefined,
      planned: true,
      createdAt: Date.now(),
      tags: newOOF.tags,
      difficulty: newOOF.difficulty,
      energy: newOOF.energy
    };
    
    setOofs(prev => [oof, ...prev]);
    setNewOOF({ 
      title: '', 
      domain: 'Backend', 
      priority: 'Medium', 
      estimatedMinutes: 90,
      definitionOfDone: '', 
      constraints: '', 
      firstStep: '',
      tags: [],
      difficulty: 3,
      energy: 3
    });
  };
  
  const updateOOF = (updatedOOF: OOF) => {
    setOofs(prev => prev.map(o => o.id === updatedOOF.id ? updatedOOF : o));
    setEditingOOF(null);
  };
  
  const deleteOOF = (id: string) => {
    setOofs(prev => prev.filter(o => o.id !== id));
    setStarredOOFs(prev => prev.filter(sid => sid !== id));
  };
  
  const toggleStarOOF = (id: string) => {
    setStarredOOFs(prev => 
      prev.includes(id) 
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };
  
  // Enhanced timer operations
  const startBlock = (oof: OOF | null, minutes: number) => {
    const blockId = generateId();
    setRun({
      active: true,
      blockId,
      oofId: oof?.id,
      oofTitle: oof?.title || 'Вільний режим',
      targetMinutes: minutes,
      startTs: Date.now(),
      paused: false,
      elapsedSec: 0,
      pausedTime: 0,
      interruptions: 0,
      lastActivityTs: Date.now()
    });
    
    setPostBlockData({
      dq: 3,
      ou: 0,
      lr: 0,
      energy: oof?.energy || 3,
      mood: 3,
      interruptions: 0,
      flowState: false,
      completedOOF: false,
      notes: ''
    });
    
    setActiveTab('timer');
  };
  
  const togglePause = () => {
    setRun(prev => ({ 
      ...prev, 
      paused: !prev.paused,
      pausedTime: prev.paused ? prev.pausedTime : prev.pausedTime + 1
    }));
  };
  
  const resetTimer = () => {
    setRun(prev => ({ ...prev, elapsedSec: 0, pausedTime: 0, interruptions: 0 }));
  };
  
  const stopBlock = () => {
    const minutes = Math.min(run.targetMinutes, Math.floor(run.elapsedSec / 60));
    const now = Date.now();
    const dateISO = new Date(now).toISOString().split('T')[0];
    const hour = new Date(now).getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    
    const blockLog: BlockLog = {
      id: run.blockId,
      dateISO,
      timeOfDay,
      startTs: run.startTs,
      endTs: now,
      minutes,
      oofId: run.oofId,
      oofTitle: run.oofTitle,
      dq: postBlockData.dq,
      ou: postBlockData.ou,
      lr: postBlockData.lr,
      energy: postBlockData.energy,
      mood: postBlockData.mood,
      notes: postBlockData.notes.trim() || undefined,
      interruptions: postBlockData.interruptions,
      flowState: postBlockData.flowState,
      completedOOF: postBlockData.completedOOF
    };
    
    setLogs(prev => [blockLog, ...prev]);
    
    // Update OOF actual minutes
    if (run.oofId) {
      setOofs(prev => prev.map(oof => 
        oof.id === run.oofId 
          ? { ...oof, actualMinutes: oof.actualMinutes + minutes, completedAt: postBlockData.completedOOF ? now : undefined }
          : oof
      ));
    }
    
    // Reset states
    setRun({
      active: false,
      blockId: '',
      oofId: undefined,
      oofTitle: '',
      targetMinutes: 60,
      startTs: 0,
      paused: false,
      elapsedSec: 0,
      pausedTime: 0,
      interruptions: 0,
      lastActivityTs: 0
    });
    
    setPostBlockData({
      dq: 3,
      ou: 0,
      lr: 0,
      energy: 3,
      mood: 3,
      interruptions: 0,
      flowState: false,
      completedOOF: false,
      notes: ''
    });
    
    setChecklists(prev => ({
      ...prev,
      post: { artifact: false, summary: false, nextStep: false, reflect: false }
    }));
    
    setActiveTab('summary');
  };
  
  // Enhanced parking operations
  const addParking = (text: string) => {
    if (!text.trim()) return;
    
    const item: ParkingItem = {
      id: generateId(),
      text: text.trim(),
      done: false,
      createdDuringBlock: run.active ? run.blockId : undefined,
      priority: 'Medium',
      category: 'task' // Smart categorization could be added here
    };
    
    setParking(prev => [item, ...prev]);
  };
  
  const setParkingDone = (id: string, done: boolean) => {
    setParking(prev => prev.map(p => p.id === id ? { ...p, done } : p));
  };
  
  const deleteParking = (id: string) => {
    setParking(prev => prev.filter(p => p.id !== id));
  };
  
  const categorizeParking = (id: string, category: string) => {
    setParking(prev => prev.map(p => 
      p.id === id ? { ...p, category: category as ParkingItem['category'] } : p
    ));
  };
  
  // Template operations with usage tracking
  const addTemplate = () => {
    if (!newTemplate.id.trim() || !newTemplate.title.trim() || !newTemplate.body.trim()) {
      return;
    }
    
    if (templates.find(t => t.id === newTemplate.id)) {
      return; // Duplicate ID
    }
    
    const template: Template = {
      id: newTemplate.id.trim(),
      title: newTemplate.title.trim(),
      body: newTemplate.body.trim(),
      category: newTemplate.category,
      useCount: 0,
      lastUsed: 0
    };
    
    setTemplates(prev => [...prev, template]);
    setNewTemplate({ id: '', title: '', body: '', category: 'General' });
  };
  
  const useTemplate = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId 
        ? { ...t, useCount: t.useCount + 1, lastUsed: Date.now() }
        : t
    ));
  };
  
  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };
  
  // Enhanced calculations with caching
  const analytics = useMemo(() => {
    const todayDateISO = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(log => log.dateISO === todayDateISO);
    const thisWeekLogs = logs.filter(log => {
      const logDate = new Date(log.dateISO);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      return logDate >= weekStart;
    });
    
    const todayMetrics = {
      dh: todayLogs.reduce((sum, log) => sum + log.minutes, 0) / 60,
      avgDQ: todayLogs.length ? todayLogs.reduce((sum, log) => sum + log.dq, 0) / todayLogs.length : 0,
      ou: todayLogs.reduce((sum, log) => sum + log.ou, 0),
      lr: todayLogs.reduce((sum, log) => sum + log.lr, 0),
      avgMood: todayLogs.length ? todayLogs.reduce((sum, log) => sum + log.mood, 0) / todayLogs.length : 0,
      flowSessions: todayLogs.filter(log => log.flowState).length
    };
    
    todayMetrics.avgDQ = Math.round(todayMetrics.avgDQ * 10) / 10;
    todayMetrics.avgMood = Math.round(todayMetrics.avgMood * 10) / 10;
    const dwi = todayMetrics.dh * todayMetrics.avgDQ + todayMetrics.ou + 0.5 * todayMetrics.lr;
    
    // Productivity patterns
    const timeOfDayStats = {
      morning: thisWeekLogs.filter(log => log.timeOfDay === 'morning'),
      afternoon: thisWeekLogs.filter(log => log.timeOfDay === 'afternoon'),
      evening: thisWeekLogs.filter(log => log.timeOfDay === 'evening')
    };
    
    const bestTimeOfDay = Object.entries(timeOfDayStats).reduce((best, [time, sessions]) => {
      const avgDQ = sessions.length ? sessions.reduce((sum, s) => sum + s.dq, 0) / sessions.length : 0;
      return avgDQ > best.avgDQ ? { time, avgDQ } : best;
    }, { time: 'morning', avgDQ: 0 });
    
    return {
      today: todayMetrics,
      dwi: Math.round(dwi * 10) / 10,
      weeklyHours: thisWeekLogs.reduce((sum, log) => sum + log.minutes, 0) / 60,
      bestTimeOfDay: bestTimeOfDay.time,
      dailyGoalProgress: (todayMetrics.dh / (settings.dailyGoal / 60)) * 100,
      weeklyGoalProgress: ((thisWeekLogs.reduce((sum, log) => sum + log.minutes, 0) / 60) / (settings.weeklyGoal / 60)) * 100
    };
  }, [logs, settings.dailyGoal, settings.weeklyGoal]);
  
  // Chart data with enhanced insights
  const chartData = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return date.toISOString().split('T')[0];
    });
    
    return last14Days.map(date => {
      const dayLogs = logs.filter(log => log.dateISO === date);
      const dh = dayLogs.reduce((sum, log) => sum + log.minutes, 0) / 60;
      const avgDQ = dayLogs.length ? dayLogs.reduce((sum, log) => sum + log.dq, 0) / dayLogs.length : 0;
      const avgMood = dayLogs.length ? dayLogs.reduce((sum, log) => sum + log.mood, 0) / dayLogs.length : 0;
      const ou = dayLogs.reduce((sum, log) => sum + log.ou, 0);
      const lr = dayLogs.reduce((sum, log) => sum + log.lr, 0);
      const dwi = dh * avgDQ + ou + 0.5 * lr;
      const flowSessions = dayLogs.filter(log => log.flowState).length;
      
      return {
        date: date.slice(5), // MM-DD
        DH: Math.round(dh * 10) / 10,
        DWI: Math.round(dwi * 10) / 10,
        avgDQ: Math.round(avgDQ * 10) / 10,
        avgMood: Math.round(avgMood * 10) / 10,
        flowSessions,
        totalSessions: dayLogs.length
      };
    });
  }, [logs]);
  
  // Smart OOF filtering and sorting
  const filteredOOFs = useMemo(() => {
    let filtered = oofs;
    
    switch (oofFilter) {
      case 'starred':
        filtered = oofs.filter(oof => starredOOFs.includes(oof.id));
        break;
      case 'high-priority':
        filtered = oofs.filter(oof => oof.priority === 'High' || oof.priority === 'Critical');
        break;
      case 'in-progress':
        filtered = oofs.filter(oof => oof.actualMinutes > 0 && !oof.completedAt);
        break;
      case 'completed':
        filtered = oofs.filter(oof => oof.completedAt);
        break;
      default:
        filtered = oofs.filter(oof => !oof.completedAt);
    }
    
    // Smart sorting: starred first, then by priority and creation date
    return filtered.sort((a, b) => {
      if (starredOOFs.includes(a.id) && !starredOOFs.includes(b.id)) return -1;
      if (!starredOOFs.includes(a.id) && starredOOFs.includes(b.id)) return 1;
      
      const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      
      return b.createdAt - a.createdAt;
    });
  }, [oofs, oofFilter, starredOOFs]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Enhanced Header with Quick Stats */}
      <div className="bg-slate-900 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-slate-50 flex items-center space-x-2">
                <Brain className="w-8 h-8 text-indigo-400" />
                <span>Deep Work OS — UA</span>
              </h1>
              <p className="text-slate-300 mt-1">Інтелектуальна система продуктивності</p>
            </div>
            
            <QuickStats logs={logs} className="lg:w-auto w-full" />
          </div>
          
          {/* Переміщений таймер вгору */}
          {run.active && (
            <div className="mt-6">
              <SmartTimer
                run={run}
                onTogglePause={togglePause}
                onReset={resetTimer}
                onStop={stopBlock}
                elapsedSec={run.elapsedSec}
              />
            </div>
          )}
          
          {/* Enhanced Tab Navigation */}
          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-6 lg:grid-cols-6 bg-slate-800 border border-slate-700 w-full">
                <TabsTrigger value="focus" className="data-[state=active]:bg-slate-600 data-[state=active]:text-slate-50 text-slate-300 hover:text-slate-200">
                  <Target className="w-4 h-4 mr-1" />
                  Фокус
                </TabsTrigger>
                <TabsTrigger value="timer" className="data-[state=active]:bg-slate-600 data-[state=active]:text-slate-50 text-slate-300 hover:text-slate-200">
                  <Clock className="w-4 h-4 mr-1" />
                  Таймер
                </TabsTrigger>
                <TabsTrigger value="parking" className="data-[state=active]:bg-slate-600 data-[state=active]:text-slate-50 text-slate-300 hover:text-slate-200">
                  <NotebookPen className="w-4 h-4 mr-1" />
                  Паркінг
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-600 data-[state=active]:text-slate-50 text-slate-300 hover:text-slate-200">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Аналітика
                </TabsTrigger>
                <TabsTrigger value="templates" className="data-[state=active]:bg-slate-600 data-[state=active]:text-slate-50 text-slate-300 hover:text-slate-200">
                  <Copy className="w-4 h-4 mr-1" />
                  Шаблони
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-slate-600 data-[state=active]:text-slate-50 text-slate-300 hover:text-slate-200">
                  <Settings className="w-4 h-4 mr-1" />
                  Налаштування
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-6 max-w-7xl mx-auto">
                {/* Focus Tab - Enhanced OOF Management */}
                <TabsContent value="focus" className="space-y-6">
                  {/* OOF Creation Form */}
                  <Card className="bg-slate-800 border-slate-600 backdrop-blur-sm shadow-xl">
                    <CardHeader className="bg-slate-700/50 border-b border-slate-600">
                      <CardTitle className="text-slate-50 flex items-center space-x-2">
                        <Target className="w-5 h-5 text-indigo-400" />
                        <span>Новий об'єкт фокусу (OOF)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <Input
                            placeholder="Назва завдання або проєкту"
                            value={newOOF.title}
                            onChange={(e) => setNewOOF(prev => ({ ...prev, title: e.target.value }))}
                            className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-indigo-500"
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-slate-200 text-sm font-medium mb-2 block">Домен</label>
                              <select
                                value={newOOF.domain}
                                onChange={(e) => setNewOOF(prev => ({ ...prev, domain: e.target.value as Domain }))}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:border-indigo-500"
                              >
                                <option value="Backend">Backend</option>
                                <option value="Data">Data Science</option>
                                <option value="CS">Computer Science</option>
                                <option value="SystemDesign">System Design</option>
                                <option value="AlgoDS">Algorithms & DS</option>
                                <option value="Study">Навчання</option>
                                <option value="Research">Дослідження</option>
                                <option value="Other">Інше</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="text-slate-200 text-sm font-medium mb-2 block">Пріоритет</label>
                              <select
                                value={newOOF.priority}
                                onChange={(e) => setNewOOF(prev => ({ ...prev, priority: e.target.value as Priority }))}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:border-indigo-500"
                              >
                                <option value="Low">Низький</option>
                                <option value="Medium">Середній</option>
                                <option value="High">Високий</option>
                                <option value="Critical">Критичний</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="text-slate-200 text-sm font-medium mb-2 block">Час (хв)</label>
                              <Input
                                type="number"
                                value={newOOF.estimatedMinutes}
                                onChange={(e) => setNewOOF(prev => ({ ...prev, estimatedMinutes: parseInt(e.target.value) || 90 }))}
                                className="bg-slate-700 border-slate-600 text-slate-100"
                              />
                            </div>
                            
                            <div>
                              <label className="text-slate-200 text-sm font-medium mb-2 block">Складність</label>
                              <Slider
                                value={[newOOF.difficulty]}
                                onValueChange={(vals) => setNewOOF(prev => ({ ...prev, difficulty: vals[0] }))}
                                min={1}
                                max={5}
                                step={1}
                                className="mt-2"
                              />
                              <div className="text-center text-slate-300 text-sm mt-1 font-semibold">{newOOF.difficulty}/5</div>
                            </div>
                            
                            <div>
                              <label className="text-slate-200 text-sm font-medium mb-2 block">Енергія</label>
                              <Slider
                                value={[newOOF.energy]}
                                onValueChange={(vals) => setNewOOF(prev => ({ ...prev, energy: vals[0] }))}
                                min={1}
                                max={5}
                                step={1}
                                className="mt-2"
                              />
                              <div className="text-center text-slate-300 text-sm mt-1 font-semibold">{newOOF.energy}/5</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Definition of Done - як ви зрозумієте, що завдання виконане?"
                            value={newOOF.definitionOfDone}
                            onChange={(e) => setNewOOF(prev => ({ ...prev, definitionOfDone: e.target.value }))}
                            className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                            rows={3}
                          />
                          
                          <Textarea
                            placeholder="Обмеження та контекст"
                            value={newOOF.constraints}
                            onChange={(e) => setNewOOF(prev => ({ ...prev, constraints: e.target.value }))}
                            className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                            rows={2}
                          />
                          
                          <Input
                            placeholder="Конкретний перший крок"
                            value={newOOF.firstStep}
                            onChange={(e) => setNewOOF(prev => ({ ...prev, firstStep: e.target.value }))}
                            className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                          />
                        </div>
                      </div>
                      
                      <Button onClick={addOOF} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold" size="lg">
                        <Plus className="w-4 h-4 mr-2" />
                        Створити OOF
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Виправлений OOF Filter - темніший */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/70 shadow-xl">
                    <div className="flex items-center space-x-3 flex-wrap">
                      <Filter className="w-5 h-5 text-slate-300" />
                      <span className="text-slate-100 text-sm font-bold">Фільтр:</span>
                      <div className="flex flex-wrap gap-2">
                        {['all', 'starred', 'high-priority', 'in-progress', 'completed'].map(filter => (
                          <Button
                            key={filter}
                            size="sm"
                            onClick={() => setOofFilter(filter)}
                            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-md ${
                              oofFilter === filter 
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white border-2 border-indigo-400/50 shadow-lg shadow-indigo-500/25' 
                                : 'bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-slate-200 border-2 border-slate-700/50 hover:border-slate-600/50'
                            }`}
                          >
                            {filter === 'all' && '📋 Всі'}
                            {filter === 'starred' && '⭐ Обрані'}
                            {filter === 'high-priority' && '🔥 Важливі'}
                            {filter === 'in-progress' && '⚡ В роботі'}
                            {filter === 'completed' && '✅ Завершені'}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-slate-200 text-sm font-semibold bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700/50 shadow-md">
                      {filteredOOFs.length} з {oofs.length} завдань
                    </div>
                  </div>
                  
                  {/* Enhanced OOF List */}
                  <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto">
                    {filteredOOFs.map(oof => (
                      <EnhancedOOFCard
                        key={oof.id}
                        oof={oof}
                        onStart={startBlock}
                        onEdit={setEditingOOF}
                        onDelete={deleteOOF}
                        onToggleStar={toggleStarOOF}
                        isStarred={starredOOFs.includes(oof.id)}
                      />
                    ))}
                  </div>
                </TabsContent>
                
                {/* Timer Tab - Виправлена секція з нотатками */}
                <TabsContent value="timer" className="space-y-6">
                  {!run.active ? (
                    <Card className="bg-slate-800 border-slate-600 shadow-xl">
                      <CardContent className="pt-8">
                        <div className="text-center space-y-6">
                          <div className="space-y-2">
                            <Clock className="w-16 h-16 text-slate-300 mx-auto" />
                            <h3 className="text-xl font-semibold text-slate-100">Готові розпочати глибоку роботу?</h3>
                            <p className="text-slate-300">Оберіть завдання з вкладки "Фокус" або запустіть вільний режим</p>
                          </div>
                          
                          <div className="flex justify-center space-x-3">
                            <Button
                              onClick={() => startBlock(null, 25)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                              size="lg"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Pomodoro 25хв
                            </Button>
                            <Button
                              onClick={() => startBlock(null, 60)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                              size="lg"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Стандарт 60хв
                            </Button>
                            <Button
                              onClick={() => startBlock(null, 90)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                              size="lg"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Глибокий 90хв
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {/* Секція нотаток завжди видима коли блок активний */}
                      <NotesSection 
                        notes={postBlockData.notes}
                        onNotesChange={(notes) => setPostBlockData(prev => ({ ...prev, notes }))}
                      />
                      
                      {/* Enhanced Hints */}
                      <Card className="bg-gradient-to-r from-slate-800/60 to-slate-700/40 backdrop-blur-sm border border-slate-600/50 shadow-xl">
                        <CardContent className="pt-5">
                          <Button
                            variant="ghost"
                            onClick={() => setShowHints(!showHints)}
                            className="w-full justify-between text-slate-100 hover:text-slate-50 hover:bg-slate-700/50 p-4 rounded-lg border border-slate-600/30"
                          >
                            <span className="flex items-center font-semibold">
                              <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                              Розумні підказки та мікроекспериментами
                            </span>
                            {showHints ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </Button>
                          
                          {showHints && (
                            <div className="mt-6 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-700/50 shadow-lg">
                                  <CardContent className="pt-5">
                                    <h4 className="text-emerald-300 font-bold mb-3 flex items-center text-lg">
                                      <Zap className="w-5 h-5 mr-2" />
                                      Мікроексперимент {'>'} 5хв
                                    </h4>
                                    <p className="text-slate-200 text-sm mb-4 leading-relaxed">
                                      Якщо застрягли більше 5 хвилин, спробуйте:
                                    </p>
                                    <ul className="text-slate-300 text-sm space-y-2">
                                      <li className="flex items-start"><span className="text-emerald-400 mr-2">•</span>Перефразувати проблему</li>
                                      <li className="flex items-start"><span className="text-emerald-400 mr-2">•</span>Розбити на менші кроки</li>
                                      <li className="flex items-start"><span className="text-emerald-400 mr-2">•</span>Змінити підхід або інструмент</li>
                                      <li className="flex items-start"><span className="text-emerald-400 mr-2">•</span>Почати з найпростішого варіанту</li>
                                    </ul>
                                  </CardContent>
                                </Card>
                                
                                <Card className="bg-gradient-to-br from-amber-900/30 to-orange-800/20 border border-amber-700/50 shadow-lg">
                                  <CardContent className="pt-5">
                                    <h4 className="text-amber-300 font-bold mb-3 flex items-center text-lg">
                                      <NotebookPen className="w-5 h-5 mr-2" />
                                      Управління відволіканнями
                                    </h4>
                                    <p className="text-slate-200 text-sm mb-4 leading-relaxed">
                                      Всі побічні думки записуйте в паркувальний список:
                                    </p>
                                    <ul className="text-slate-300 text-sm space-y-2">
                                      <li className="flex items-start"><span className="text-amber-400 mr-2">•</span>Ідеї для інших проєктів</li>
                                      <li className="flex items-start"><span className="text-amber-400 mr-2">•</span>Особисті нагадування</li>
                                      <li className="flex items-start"><span className="text-amber-400 mr-2">•</span>Технічні питання для дослідження</li>
                                      <li className="flex items-start"><span className="text-amber-400 mr-2">•</span>Покращення поточного процесу</li>
                                    </ul>
                                  </CardContent>
                                </Card>
                              </div>
                              
                              <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/25 border border-blue-700/50 shadow-xl">
                                <CardContent className="pt-5">
                                  <h4 className="text-blue-300 font-bold mb-3 flex items-center text-lg">
                                    <Brain className="w-5 h-5 mr-2" />
                                    Стан потоку (Flow State)
                                  </h4>
                                  <p className="text-slate-200 text-sm leading-relaxed">
                                    <strong>Ознаки досягнення стану потоку:</strong> втрата відчуття часу, повна концентрація на завданні, 
                                    легкість прийняття рішень, природний ритм роботи. Цей стан найефективніший для складних завдань.
                                  </p>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      {/* Enhanced During Checklists */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ChecklistTile
                          title="Одна справа"
                          checked={checklists.during.singleTask}
                          onChange={(checked) => setChecklists(prev => ({ 
                            ...prev, 
                            during: { ...prev.during, singleTask: checked } 
                          }))}
                          infoContent="Зосередьтесь виключно на поточному завданні. Закрийте все зайве."
                          example="Одна вкладка браузера, один редактор, вимкнені сповіщення"
                          icon="🎯"
                        />
                        
                        <ChecklistTile
                          title="Чернетка готова"
                          checked={checklists.during.scratchpad}
                          onChange={(checked) => setChecklists(prev => ({ 
                            ...prev, 
                            during: { ...prev.during, scratchpad: checked } 
                          }))}
                          infoContent="Використовуйте чернетку для швидких записів та ідей."
                          example="Текстовий файл, блокнот, або спеціальний додаток"
                          icon="📝"
                        />
                        
                        <ChecklistTile
                          title="Правило 5 хвилин"
                          checked={checklists.during.stuckRule}
                          onChange={(checked) => setChecklists(prev => ({ 
                            ...prev, 
                            during: { ...prev.during, stuckRule: checked } 
                          }))}
                          infoContent="При застою понад 5хв роблю мікроексперимент або змінюю підхід."
                          example="Нова перспектива, інший алгоритм, спрощення задачі"
                          icon="⚡"
                        />
                        
                        <ChecklistTile
                          title="Гідратація"
                          checked={checklists.during.hydration}
                          onChange={(checked) => setChecklists(prev => ({ 
                            ...prev, 
                            during: { ...prev.during, hydration: checked } 
                          }))}
                          infoContent="Пийте воду регулярно для підтримки концентрації."
                          example="Скляночка води кожні 30 хвилин"
                          icon="💧"
                        />
                      </div>
                      
                      {/* Block Summary Form - показується після 10 хвилин */}
                      {run.elapsedSec > 600 && (
                        <Card className="bg-gradient-to-r from-cyan-900/40 to-blue-900/30 border border-cyan-600/50 backdrop-blur-sm shadow-xl">
                          <CardHeader className="bg-cyan-900/20 border-b border-cyan-700/30">
                            <CardTitle className="text-slate-50 flex items-center space-x-2">
                              <Save className="w-5 h-5 text-cyan-400" />
                              <span>Підготовка до завершення блоку</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-5">
                                <div className="p-4 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600/50">
                                  <label className="text-slate-100 text-sm font-bold mb-3 block">
                                    Якість глибини (DQ): {postBlockData.dq}/5
                                  </label>
                                  <Slider
                                    value={[postBlockData.dq]}
                                    onValueChange={(vals) => setPostBlockData(prev => ({ ...prev, dq: vals[0] }))}
                                    min={1}
                                    max={5}
                                    step={1}
                                    className="w-full"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600/50">
                                    <label className="text-slate-100 text-sm font-bold mb-3 block">ОВ (Одиниці виходу)</label>
                                    <div className="flex items-center justify-center space-x-3">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setPostBlockData(prev => ({ ...prev, ou: Math.max(0, prev.ou - 1) }))}
                                        className="border-slate-500 hover:bg-slate-700"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </Button>
                                      <span className="text-slate-100 font-bold text-xl min-w-[50px] text-center">{postBlockData.ou}</span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setPostBlockData(prev => ({ ...prev, ou: prev.ou + 1 }))}
                                        className="border-slate-500 hover:bg-slate-700"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="p-4 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600/50">
                                    <label className="text-slate-100 text-sm font-bold mb-3 block">ПН (Повторення навчання)</label>
                                    <div className="flex items-center justify-center space-x-3">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setPostBlockData(prev => ({ ...prev, lr: Math.max(0, prev.lr - 1) }))}
                                        className="border-slate-500 hover:bg-slate-700"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </Button>
                                      <span className="text-slate-100 font-bold text-xl min-w-[50px] text-center">{postBlockData.lr}</span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setPostBlockData(prev => ({ ...prev, lr: prev.lr + 1 }))}
                                        className="border-slate-500 hover:bg-slate-700"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600/50">
                                    <label className="text-slate-100 text-sm font-bold mb-3 block">
                                      Настрій: {postBlockData.mood}/5
                                    </label>
                                    <Slider
                                      value={[postBlockData.mood]}
                                      onValueChange={(vals) => setPostBlockData(prev => ({ ...prev, mood: vals[0] }))}
                                      min={1}
                                      max={5}
                                      step={1}
                                      className="w-full"
                                    />
                                  </div>
                                  
                                  <div className="p-4 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600/50">
                                    <label className="text-slate-100 text-sm font-bold mb-3 block">Перерви</label>
                                    <div className="flex items-center justify-center space-x-3">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setPostBlockData(prev => ({ ...prev, interruptions: Math.max(0, prev.interruptions - 1) }))}
                                        className="border-slate-500 hover:bg-slate-700"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </Button>
                                      <span className="text-slate-100 font-bold text-xl min-w-[50px] text-center">{postBlockData.interruptions}</span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setPostBlockData(prev => ({ ...prev, interruptions: prev.interruptions + 1 }))}
                                        className="border-slate-500 hover:bg-slate-700"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-center space-x-8 p-4 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600/50">
                                  <div className="flex items-center space-x-3">
                                    <Switch
                                      checked={postBlockData.flowState}
                                      onCheckedChange={(checked) => setPostBlockData(prev => ({ ...prev, flowState: checked }))}
                                    />
                                    <span className="text-slate-100 text-sm font-semibold">Стан потоку досягнуто</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-3">
                                    <Switch
                                      checked={postBlockData.completedOOF}
                                      onCheckedChange={(checked) => setPostBlockData(prev => ({ ...prev, completedOOF: checked }))}
                                    />
                                    <span className="text-slate-100 text-sm font-semibold">OOF завершено</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                {/* Parking Tab - Enhanced Distraction Management */}
                <TabsContent value="parking" className="space-y-6">
                  <Card className="bg-slate-800 border-slate-600 shadow-xl">
                    <CardHeader className="bg-slate-700/50 border-b border-slate-600">
                      <CardTitle className="text-slate-50 flex items-center space-x-2">
                        <NotebookPen className="w-5 h-5 text-amber-400" />
                        <span>Розумний паркувальний список</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <SmartParkingList
                        parking={parking}
                        onAdd={addParking}
                        onToggle={setParkingDone}
                        onDelete={deleteParking}
                        onCategorize={categorizeParking}
                        currentBlockId={run.blockId}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Analytics Tab - Enhanced Insights */}
                <TabsContent value="analytics" className="space-y-6">
                  {/* Key Metrics Dashboard */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 bg-slate-800 border-slate-600 shadow-xl">
                      <CardHeader className="bg-slate-700/50">
                        <CardTitle className="text-slate-100 flex items-center space-x-2">
                          <Activity className="w-5 h-5 text-emerald-400" />
                          <span>Сьогоднішня продуктивність</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="text-center p-4 bg-emerald-900/20 border border-emerald-700/50 rounded-lg">
                            <div className="text-4xl font-bold text-emerald-300 mb-1">{Math.round(analytics.today.dh * 10) / 10}h</div>
                            <div className="text-slate-200 text-sm font-medium mb-1">Години глибини</div>
                            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                              <div 
                                className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(analytics.dailyGoalProgress, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="text-center p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                            <div className="text-4xl font-bold text-blue-300 mb-1">{analytics.today.avgDQ}</div>
                            <div className="text-slate-200 text-sm font-medium mb-1">Середнє DQ</div>
                            <div className="text-xs text-slate-300">Якість фокусу</div>
                          </div>
                          
                          <div className="text-center p-4 bg-cyan-900/20 border border-cyan-700/50 rounded-lg">
                            <div className="text-4xl font-bold text-cyan-300 mb-1">{analytics.dwi}</div>
                            <div className="text-slate-200 text-sm font-medium mb-1">Індекс глибини</div>
                            <div className="text-xs text-slate-300">DH×DQ+OU+0.5×LR</div>
                          </div>
                          
                          <div className="text-center p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                            <div className="text-4xl font-bold text-purple-300 flex items-center justify-center mb-1">
                              {analytics.today.flowSessions > 0 && <Zap className="w-8 h-8 mr-1" />}
                              {analytics.today.flowSessions}
                            </div>
                            <div className="text-slate-200 text-sm font-medium mb-1">Flow сесії</div>
                            <div className="text-xs text-slate-300">Стан потоку</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-800 border-amber-600/50 shadow-xl shadow-amber-600/10">
                      <CardHeader className="bg-amber-900/20 border-b border-amber-700/50">
                        <CardTitle className="text-slate-100 flex items-center space-x-2">
                          <Award className="w-5 h-5 text-amber-400" />
                          <span>Досягнення</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-6">
                        <div className="flex items-center justify-between p-4 bg-slate-700 border border-slate-600 rounded-lg">
                          <div>
                            <div className="text-slate-100 font-semibold">Щоденна ціль</div>
                            <div className="text-slate-300 text-sm">{settings.dailyGoal / 60}h щодня</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-300">{Math.round(analytics.dailyGoalProgress)}%</div>
                            {analytics.dailyGoalProgress >= 100 && <div className="text-sm text-emerald-300">🎉 Досягнуто!</div>}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-slate-700 border border-slate-600 rounded-lg">
                          <div>
                            <div className="text-slate-100 font-semibold">Тижнева ціль</div>
                            <div className="text-slate-300 text-sm">{settings.weeklyGoal / 60}h на тиждень</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-300">{Math.round(analytics.weeklyGoalProgress)}%</div>
                            {analytics.weeklyGoalProgress >= 100 && <div className="text-sm text-blue-300">🎉 Досягнуто!</div>}
                          </div>
                        </div>
                        
                        <div className="p-4 bg-slate-700 border border-slate-600 rounded-lg">
                          <div className="text-slate-100 font-semibold mb-2">Краща пора дня</div>
                          <div className="text-slate-200 text-lg capitalize bg-slate-800 px-3 py-1 rounded inline-block">
                            {analytics.bestTimeOfDay === 'morning' && '🌅 Ранок'}
                            {analytics.bestTimeOfDay === 'afternoon' && '☀️ День'}  
                            {analytics.bestTimeOfDay === 'evening' && '🌙 Вечір'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Enhanced Charts */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card className="bg-slate-800 border-slate-600 shadow-xl">
                      <CardHeader className="bg-slate-700/50 border-b border-slate-600">
                        <CardTitle className="text-slate-50 flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5 text-indigo-400" />
                          <span>Динаміка продуктивності (14 днів)</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm">
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="dhGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="dwiGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                              <XAxis dataKey="date" stroke="#CBD5E1" fontSize={12} />
                              <YAxis yAxisId="left" stroke="#10B981" fontSize={12} />
                              <YAxis yAxisId="right" orientation="right" stroke="#06B6D4" fontSize={12} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#0F172A', 
                                  border: '1px solid #475569', 
                                  borderRadius: '12px',
                                  color: '#E2E8F0',
                                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                                }} 
                              />
                              <Area 
                                yAxisId="left" 
                                type="monotone" 
                                dataKey="DH" 
                                stroke="#10B981" 
                                strokeWidth={3}
                                fill="url(#dhGradient)" 
                                name="Години глибини"
                              />
                              <Bar yAxisId="right" dataKey="DWI" fill="url(#dwiGradient)" name="Індекс глибини" opacity={0.8} radius={[4, 4, 0, 0]} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-800 border-slate-600 shadow-xl">
                      <CardHeader className="bg-slate-700/50 border-b border-slate-600">
                        <CardTitle className="text-slate-50 flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-emerald-400" />
                          <span>Якість та настрій</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm">
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                              <defs>
                                <linearGradient id="dqGradient" x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor="#F59E0B" />
                                  <stop offset="100%" stopColor="#EAB308" />
                                </linearGradient>
                                <linearGradient id="moodGradient" x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor="#8B5CF6" />
                                  <stop offset="100%" stopColor="#A855F7" />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                              <XAxis dataKey="date" stroke="#CBD5E1" fontSize={12} />
                              <YAxis yAxisId="left" stroke="#F59E0B" domain={[1, 5]} fontSize={12} />
                              <YAxis yAxisId="right" orientation="right" stroke="#8B5CF6" domain={[1, 5]} fontSize={12} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#0F172A', 
                                  border: '1px solid #475569', 
                                  borderRadius: '12px',
                                  color: '#E2E8F0',
                                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                                }} 
                              />
                              <Line 
                                yAxisId="left" 
                                type="monotone" 
                                dataKey="avgDQ" 
                                stroke="url(#dqGradient)" 
                                strokeWidth={4}
                                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6, stroke: '#1E293B' }}
                                activeDot={{ r: 8, stroke: '#F59E0B', strokeWidth: 2, fill: '#FEF3C7' }}
                                name="Середнє DQ"
                              />
                              <Line 
                                yAxisId="right" 
                                type="monotone" 
                                dataKey="avgMood" 
                                stroke="url(#moodGradient)" 
                                strokeWidth={4}
                                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6, stroke: '#1E293B' }}
                                activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2, fill: '#EDE9FE' }}
                                name="Середній настрій"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Enhanced Journal */}
                  <Card className="bg-slate-800 border-slate-600 shadow-xl">
                    <CardHeader className="bg-slate-700/50 border-b border-slate-600">
                      <CardTitle className="text-slate-50 flex items-center space-x-2">
                        <NotebookPen className="w-5 h-5 text-slate-400" />
                        <span>Журнал глибоких блоків</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-lg overflow-hidden">
                        <div className="overflow-x-auto max-h-[500px]">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-slate-800 border-b-2 border-slate-600">
                              <tr>
                                <th className="text-left text-slate-100 pb-4 pt-4 px-4 font-bold">Дата/Час</th>
                                <th className="text-left text-slate-100 pb-4 pt-4 px-4 font-bold">OOF</th>
                                <th className="text-left text-slate-100 pb-4 pt-4 px-4 font-bold">Хв</th>
                                <th className="text-left text-slate-100 pb-4 pt-4 px-4 font-bold">DQ</th>
                                <th className="text-left text-slate-100 pb-4 pt-4 px-4 font-bold">ОВ</th>
                                <th className="text-left text-slate-100 pb-4 pt-4 px-4 font-bold">ПН</th>
                                <th className="text-left text-slate-100 pb-4 pt-4 px-4 font-bold">💫</th>
                                <th className="text-left text-slate-100 pb-4 pt-4 px-4 font-bold">Нотатки</th>
                              </tr>
                            </thead>
                            <tbody>
                              {logs.map((log, index) => (
                                <tr key={log.id} className={`border-b border-slate-700/50 transition-colors hover:bg-slate-800/30 ${index % 2 === 0 ? 'bg-slate-900/20' : ''}`}>
                                  <td className="py-4 px-4">
                                    <div className="text-slate-200 font-medium">{log.dateISO.slice(5)}</div>
                                    <div className="text-xs text-slate-400 capitalize bg-slate-800/60 px-2 py-1 rounded-md mt-1 inline-block">
                                      {log.timeOfDay === 'morning' && '🌅 Ранок'}
                                      {log.timeOfDay === 'afternoon' && '☀️ День'}  
                                      {log.timeOfDay === 'evening' && '🌙 Вечір'}
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="text-slate-200 break-words max-w-[200px] font-medium">{log.oofTitle}</div>
                                    {log.completedOOF && <span className="text-emerald-400 text-xs font-semibold bg-emerald-900/30 px-2 py-1 rounded-md mt-1 inline-block">✅ Завершено</span>}
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="text-slate-200 font-semibold bg-slate-800/60 px-2 py-1 rounded-md">{log.minutes}</span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="text-slate-200 font-semibold bg-slate-800/60 px-2 py-1 rounded-md">{log.dq}</span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="text-slate-200 font-semibold bg-slate-800/60 px-2 py-1 rounded-md">{log.ou}</span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="text-slate-200 font-semibold bg-slate-800/60 px-2 py-1 rounded-md">{log.lr}</span>
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    {log.flowState && (
                                      <span className="text-purple-400 text-xl bg-purple-900/30 p-2 rounded-lg inline-block">⚡</span>
                                    )}
                                  </td>
                                  <td className="py-4 px-4 text-slate-300 break-words max-w-[300px] leading-relaxed">
                                    {log.notes ? (
                                      <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-700/30">
                                        {log.notes.substring(0, 100)}{log.notes.length > 100 ? '...' : ''}
                                      </div>
                                    ) : (
                                      <span className="text-slate-500 italic">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Templates Tab - Enhanced Template Management */}
                <TabsContent value="templates" className="space-y-6">
                  <Card className="bg-slate-800 border-slate-600 shadow-xl">
                    <CardHeader className="bg-slate-700/50 border-b border-slate-600">
                      <CardTitle className="text-slate-50 flex items-center space-x-2">
                        <Copy className="w-5 h-5 text-purple-400" />
                        <span>Шаблони та плейбуки</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-slate-700/90 border border-slate-600/50 shadow-lg">
                          <TabsTrigger value="all" className="data-[state=active]:bg-slate-600 data-[state=active]:text-slate-50 text-slate-300 font-semibold">
                            Всі шаблони
                          </TabsTrigger>
                          <TabsTrigger value="popular" className="data-[state=active]:bg-slate-600 data-[state=active]:text-slate-50 text-slate-300 font-semibold">
                            Популярні
                          </TabsTrigger>
                          <TabsTrigger value="custom" className="data-[state=active]:bg-slate-600 data-[state=active]:text-slate-50 text-slate-300 font-semibold">
                            Кастомні
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="all" className="space-y-4 mt-4">
                          <div className="grid gap-4">
                            {templates.map(template => (
                              <Card key={template.id} className="bg-gradient-to-br from-slate-800/80 to-slate-700/60 border border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm">
                                <CardContent className="pt-5">
                                  <div className="flex items-center justify-between mb-4">
                                    <div>
                                      <h4 className="text-slate-100 font-bold text-lg">{template.title}</h4>
                                      <div className="flex items-center space-x-4 text-sm text-slate-300 mt-2">
                                        <span className="bg-slate-700/60 px-2 py-1 rounded-md border border-slate-600/50">📂 {template.category}</span>
                                        <span className="bg-slate-700/60 px-2 py-1 rounded-md border border-slate-600/50">🔄 {template.useCount} використань</span>
                                        {template.lastUsed > 0 && (
                                          <span className="bg-slate-700/60 px-2 py-1 rounded-md border border-slate-600/50">⏰ {new Date(template.lastUsed).toLocaleDateString('uk-UA')}</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          copyToClipboard(template.body);
                                          useTemplate(template.id);
                                        }}
                                        className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold shadow-lg"
                                      >
                                        <Copy className="w-4 h-4 mr-1" />
                                        Копіювати
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setPostBlockData(prev => ({ 
                                            ...prev, 
                                            notes: prev.notes + (prev.notes ? '\n\n' : '') + template.body 
                                          }));
                                          useTemplate(template.id);
                                        }}
                                        className="border-slate-500 text-slate-200 hover:bg-slate-700/50 backdrop-blur-sm"
                                      >
                                        В нотатки
                                      </Button>
                                      {!['rag-slice', 'study-session', 'coding-problem'].includes(template.id) && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => deleteTemplate(template.id)}
                                          className="border-red-600/50 text-red-400 hover:text-red-300 hover:bg-red-900/20 backdrop-blur-sm"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  <div 
                                    className="bg-slate-900/60 backdrop-blur-sm border border-slate-600/50 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:bg-slate-800/60 hover:border-slate-500/50 shadow-lg"
                                    onClick={() => {
                                      copyToClipboard(template.body);
                                      useTemplate(template.id);
                                    }}
                                  >
                                    <pre className="text-slate-100 text-sm whitespace-pre-wrap overflow-x-auto leading-relaxed">
                                      {template.body}
                                    </pre>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="popular" className="space-y-4 mt-4">
                          <div className="grid gap-4">
                            {templates
                              .filter(t => t.useCount > 0)
                              .sort((a, b) => b.useCount - a.useCount)
                              .map(template => (
                                <Card key={template.id} className="bg-gradient-to-br from-slate-800/80 to-slate-700/60 border border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm">
                                  <CardContent className="pt-5">
                                    <div className="flex items-center justify-between mb-4">
                                      <div>
                                        <h4 className="text-slate-100 font-bold text-lg flex items-center">
                                          {template.title}
                                          <Badge className="ml-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold px-3 py-1 shadow-lg">
                                            🔥 {template.useCount}
                                          </Badge>
                                        </h4>
                                        <p className="text-slate-300 text-sm mt-2 bg-slate-700/60 px-2 py-1 rounded-md border border-slate-600/50 inline-block">
                                          Категорія: {template.category}
                                        </p>
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          copyToClipboard(template.body);
                                          useTemplate(template.id);
                                        }}
                                        className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold shadow-lg"
                                      >
                                        <Copy className="w-4 h-4 mr-1" />
                                        Використати
                                      </Button>
                                    </div>
                                    <div 
                                      className="bg-slate-900/60 backdrop-blur-sm border border-slate-600/50 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:bg-slate-800/60 hover:border-slate-500/50 shadow-lg"
                                      onClick={() => {
                                        copyToClipboard(template.body);
                                        useTemplate(template.id);
                                      }}
                                    >
                                      <pre className="text-slate-100 text-sm whitespace-pre-wrap leading-relaxed">
                                        {template.body}
                                      </pre>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="custom" className="space-y-4 mt-4">
                          {/* Add Custom Template Form */}
                          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/60 border border-slate-600/50 shadow-xl backdrop-blur-sm">
                            <CardContent className="pt-6">
                              <h4 className="text-slate-100 font-bold mb-4 text-lg flex items-center">
                                <Plus className="w-5 h-5 mr-2 text-indigo-400" />
                                Створити власний шаблон
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <Input
                                  placeholder="Унікальний ID"
                                  value={newTemplate.id}
                                  onChange={(e) => setNewTemplate(prev => ({ ...prev, id: e.target.value }))}
                                  className="bg-slate-700/90 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                                <Input
                                  placeholder="Назва шаблону"
                                  value={newTemplate.title}
                                  onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                                  className="bg-slate-700/90 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                                <Input
                                  placeholder="Категорія"
                                  value={newTemplate.category}
                                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                                  className="bg-slate-700/90 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                              <Textarea
                                placeholder="Тіло шаблону (кроки, інструкції, код тощо)..."
                                value={newTemplate.body}
                                onChange={(e) => setNewTemplate(prev => ({ ...prev, body: e.target.value }))}
                                className="bg-slate-700/90 border-slate-600/50 text-slate-100 placeholder-slate-400 h-32 mb-6 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl"
                              />
                              <Button onClick={addTemplate} className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold shadow-lg">
                                <Plus className="w-4 h-4 mr-2" />
                                Додати шаблон
                              </Button>
                            </CardContent>
                          </Card>
                          
                          {/* Custom Templates List */}
                          <div className="grid gap-4">
                            {templates
                              .filter(t => !['rag-slice', 'study-session', 'coding-problem'].includes(t.id))
                              .map(template => (
                                <Card key={template.id} className="bg-gradient-to-br from-slate-800/80 to-slate-700/60 border border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm">
                                  <CardContent className="pt-5">
                                    <div className="flex items-center justify-between mb-4">
                                      <div>
                                        <h4 className="text-slate-100 font-bold text-lg">{template.title}</h4>
                                        <p className="text-slate-300 text-sm mt-2 bg-slate-700/60 px-2 py-1 rounded-md border border-slate-600/50 inline-block">
                                          Категорія: {template.category}
                                        </p>
                                      </div>
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            copyToClipboard(template.body);
                                            useTemplate(template.id);
                                          }}
                                          className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold shadow-lg"
                                        >
                                          <Copy className="w-4 h-4 mr-1" />
                                          Копіювати
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => deleteTemplate(template.id)}
                                          className="border-red-600/50 text-red-400 hover:text-red-300 hover:bg-red-900/20 backdrop-blur-sm"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div 
                                      className="bg-slate-900/60 backdrop-blur-sm border border-slate-600/50 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:bg-slate-800/60 hover:border-slate-500/50 shadow-lg"
                                      onClick={() => {
                                        copyToClipboard(template.body);
                                        useTemplate(template.id);
                                      }}
                                    >
                                      <pre className="text-slate-100 text-sm whitespace-pre-wrap leading-relaxed">
                                        {template.body}
                                      </pre>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                      
                      {copyStatus && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-900/40 to-emerald-800/30 border border-emerald-600/50 rounded-xl backdrop-blur-sm shadow-xl">
                          <p className="text-emerald-200 text-sm text-center font-semibold flex items-center justify-center">
                            <span className="mr-2">✅</span>
                            {copyStatus}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Settings Tab - System Configuration */}
                <TabsContent value="settings" className="space-y-6">
                  <Card className="bg-slate-800 border-slate-600 shadow-xl">
                    <CardHeader className="bg-slate-700/50 border-b border-slate-600">
                      <CardTitle className="text-slate-50 flex items-center space-x-2">
                        <Settings className="w-5 h-5 text-slate-400" />
                        <span>Налаштування системи</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="text-slate-100 font-bold text-lg mb-4 flex items-center">
                            <Settings className="w-5 h-5 mr-2 text-indigo-400" />
                            Основні налаштування
                          </h4>
                          
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-700/80 to-slate-600/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
                            <div>
                              <div className="text-slate-100 font-bold">Сповіщення</div>
                              <div className="text-slate-300 text-sm">Показувати нагадування та підказки</div>
                            </div>
                            <Switch
                              checked={settings.notifications}
                              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-700/80 to-slate-600/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
                            <div>
                              <div className="text-slate-100 font-bold">Звукові сигнали</div>
                              <div className="text-slate-300 text-sm">Звук при завершенні блоків</div>
                            </div>
                            <Switch
                              checked={settings.soundEnabled}
                              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundEnabled: checked }))}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-700/80 to-slate-600/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
                            <div>
                              <div className="text-slate-100 font-bold">Автоматичні перерви</div>
                              <div className="text-slate-300 text-sm">Пропонувати перерви між блоками</div>
                            </div>
                            <Switch
                              checked={settings.autoBreaks}
                              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoBreaks: checked }))}
                            />
                          </div>
                          
                          <div className="space-y-3 p-4 bg-gradient-to-r from-slate-700/80 to-slate-600/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
                            <label className="text-slate-100 text-sm font-bold">Стандартна тривалість блоку</label>
                            <select
                              value={settings.preferredBlockSize}
                              onChange={(e) => setSettings(prev => ({ ...prev, preferredBlockSize: parseInt(e.target.value) }))}
                              className="w-full bg-slate-800/90 border border-slate-600/50 rounded-lg px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value={25}>25 хвилин (Pomodoro)</option>
                              <option value={60}>60 хвилин</option>
                              <option value={90}>90 хвилин</option>
                              <option value={120}>120 хвилин</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="text-slate-100 font-bold text-lg mb-4 flex items-center">
                            <Target className="w-5 h-5 mr-2 text-emerald-400" />
                            Цілі та метрики
                          </h4>
                          
                          <div className="space-y-3 p-4 bg-gradient-to-r from-slate-700/80 to-slate-600/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
                            <label className="text-slate-100 text-sm font-bold">Щоденна ціль (хвилини)</label>
                            <Input
                              type="number"
                              value={settings.dailyGoal}
                              onChange={(e) => setSettings(prev => ({ ...prev, dailyGoal: parseInt(e.target.value) || 240 }))}
                              className="bg-slate-800/90 border-slate-600/50 text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                            <div className="text-slate-300 text-xs bg-slate-800/50 px-2 py-1 rounded-md">
                              Поточна ціль: {settings.dailyGoal / 60} годин на день
                            </div>
                          </div>
                          
                          <div className="space-y-3 p-4 bg-gradient-to-r from-slate-700/80 to-slate-600/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
                            <label className="text-slate-100 text-sm font-bold">Тижнева ціль (хвилини)</label>
                            <Input
                              type="number"
                              value={settings.weeklyGoal}
                              onChange={(e) => setSettings(prev => ({ ...prev, weeklyGoal: parseInt(e.target.value) || 1200 }))}
                              className="bg-slate-800/90 border-slate-600/50 text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                            <div className="text-slate-300 text-xs bg-slate-800/50 px-2 py-1 rounded-md">
                              Поточна ціль: {settings.weeklyGoal / 60} годин на тиждень
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-700/80 to-slate-600/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
                            <div>
                              <div className="text-slate-100 font-bold">Відстеження енергії</div>
                              <div className="text-slate-300 text-sm">Враховувати рівень енергії в аналітиці</div>
                            </div>
                            <Switch
                              checked={settings.energyTracking}
                              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, energyTracking: checked }))}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-700/80 to-slate-600/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
                            <div>
                              <div className="text-slate-100 font-bold">Розширена аналітика</div>
                              <div className="text-slate-300 text-sm">Показувати детальні метрики продуктивності</div>
                            </div>
                            <Switch
                              checked={settings.advancedMetrics}
                              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, advancedMetrics: checked }))}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-600 pt-6">
                        <h4 className="text-slate-100 font-bold mb-6 text-lg flex items-center">
                          <Download className="w-5 h-5 mr-2 text-cyan-400" />
                          Експорт та імпорт даних
                        </h4>
                        <div className="flex items-center space-x-4 flex-wrap gap-4">
                          <Button
                            onClick={() => {
                              const data = {
                                oofs,
                                logs,
                                templates,
                                parking,
                                settings,
                                starredOOFs,
                                exportDate: new Date().toISOString()
                              };
                              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `deep-work-backup-${new Date().toISOString().split('T')[0]}.json`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold shadow-lg"
                            size="lg"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Експортувати дані
                          </Button>
                          
                          <input
                            type="file"
                            accept=".json"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  try {
                                    const data = JSON.parse(event.target?.result as string);
                                    if (data.oofs) setOofs(data.oofs);
                                    if (data.logs) setLogs(data.logs);
                                    if (data.templates) setTemplates(data.templates);
                                    if (data.parking) setParking(data.parking);
                                    if (data.settings) setSettings(data.settings);
                                    if (data.starredOOFs) setStarredOOFs(data.starredOOFs);
                                    setCopyStatus('Дані успішно імпортовано!');
                                  } catch (error) {
                                    setCopyStatus('Помилка імпорту даних');
                                  }
                                };
                                reader.readAsText(file);
                              }
                            }}
                            className="hidden"
                            id="import-file"
                          />
                          <Button
                            onClick={() => document.getElementById('import-file')?.click()}
                            variant="outline"
                            className="border-slate-500 text-slate-200 hover:bg-slate-700/50 backdrop-blur-sm font-bold"
                            size="lg"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Імportувати дані
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

// Artifact metadata export
export const artifactMetadata = {
  id: 'deep-work-os',
  title: 'Deep Work OS',
  category: 'productivity',
  tags: ['productivity', 'time-tracking', 'focus', 'deep-work', 'pomodoro'],
  description: 'Інтелектуальна система для глибокої роботи з таймерами, відстеженням завдань та аналітикою продуктивності',
  color: '#06b6d4',
  isTop: true,
  isFavorite: true,
  author: 'Quantum Vector',
  createdAt: '2025-01-26'
};

export default DeepWorkOS_UA;
