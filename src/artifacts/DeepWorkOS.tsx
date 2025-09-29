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
  Award, Flame, Timer, Activity, Filter, Search, MoreHorizontal, ArrowLeft
  ,Pencil
} from 'lucide-react';

// Recharts components used in the charts below — import to avoid runtime ReferenceErrors
import { ResponsiveContainer, ComposedChart, Area, Bar, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

// Three.js for quantum background
import * as THREE from 'three';


type DoD = {
  id: string;
  text: string;
  completed: boolean;
};

type OOF = {
  id: string;
  title: string;
  domain: 'Backend' | 'Data' | 'CS' | 'SystemDesign' | 'AlgoDS' | 'Study' | 'Discovery' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedMinutes: number;
  actualMinutes: number;
  definitionOfDone?: string; // Keep for backward compatibility
  definitionOfDoneList?: DoD[]; // New checklist format
  constraints?: string;
  firstStep?: string;
  planned: boolean;
  createdAt: number;
  tags: string[];
  difficulty: number;
  energy: number;
  completedAt?: number;
};

type Domain = string; // Now allows custom domains in addition to the defaults
type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

type ParkingItem = {
  id: string;
  text: string;
  done: boolean;
  createdDuringBlock?: string;
  priority: 'Low' | 'Medium' | 'High';
  category: 'task' | 'idea' | 'distraction' | 'learning';
};

// Parking categories used by SmartParkingList
const categories = ['task', 'idea', 'distraction', 'learning'] as const;

const categoryIcons: Record<string, string> = {
  task: '📝',
  idea: '💡',
  distraction: '🔔',
  learning: '📚'
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
  energy: number;
  mood: number;
  notes?: string;
  interruptions: number;
  flowState: boolean;
  completedOOF: boolean;
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
  pauseStartTs?: number; // Track when pause started
  interruptions: number;
  lastActivityTs: number;
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

// Simple translations for DeepWorkOS and shared components
const TRANSLATIONS: Record<string, Record<string, any>> = {
  EN: {
    backToHome: 'Back to Catalog',
    resetData: 'Reset data',
    resetConfirm: 'Are you sure you want to reset all focus data? This will clear session logs and progress.',
    hint: 'Hint',
    copied: 'Copied',
    export: 'Export',
    clear: 'Clear',
    save: 'Save',
    saved: 'Saved!',
    today: 'Today',
    week: 'Week',
    streak: 'Streak',
    words: 'words',
    chars: 'chars',
    createOOF: 'Create OOF',
    launch: 'Launch',
    show: 'Show',
    hide: 'Hide',
    pause: 'Pause',
    resume: 'Resume',
    reset: 'Reset',
    finish: 'Finish',
    remaining: 'Remaining',
    completed: 'Completed',
    overtime: 'Overtime'
  },
  UA: {
    backToHome: 'На головну',
    resetData: 'Скинути дані',
    resetConfirm: 'Ви впевнені, що хочете скинути всі дані фокусу? Це очистить журнал сесій і статистику.',
    hint: 'Підказка',
    copied: 'Скопійовано',
    export: 'Експорт',
    clear: 'Очистити',
    save: 'Зберегти',
    saved: 'Збережено!',
    freeSession: 'Вільна сесія',
    noOofNotesYet: 'Поки немає нотаток OOF сесій. Запустіть таймер з OOF і збережіть нотатки!',
    noFreeNotesYet: 'Поки немає нотаток вільних сесій. Запустіть вільний таймер і збережіть нотатки!',
    confirmDeleteNote: 'Ви впевнені, що хочете видалити цю нотатку?',
    confirmDeleteAllNotes: 'Ви впевнені, що хочете видалити ВСІ збережені нотатки? Це назавжди видалить всі нотатки OOF та вільних сесій і не може бути скасовано.',
    confirmDeleteOofNotes: 'Ви впевнені, що хочете видалити всі нотатки OOF сесій? Це не може бути скасовано.',
    confirmDeleteFreeNotes: 'Ви впевнені, що хочете видалити всі нотатки вільних сесій? Це не може бути скасовано.',
    today: 'Сьогодні',
    week: 'Тиждень',
    streak: 'Стрік',
    words: 'слів',
    chars: 'символів',
    createOOF: 'Створити OOF',
    launch: 'Запустити',
    show: 'Показати',
    hide: 'Сховати',
    pause: 'Пауза',
    resume: 'Продовжити',
    reset: 'Скинути',
    finish: 'Завершити',
    remaining: 'Залишилось',
    completed: 'Завершено',
    overtime: 'Додатково'
  }
};

// additional keys used across the artifact UI
TRANSLATIONS.EN.tabFocus = 'Tasks';
TRANSLATIONS.EN.tabTimer = 'Timer';
TRANSLATIONS.EN.tabParking = 'Parking';
TRANSLATIONS.EN.tabAnalytics = 'Analytics';
TRANSLATIONS.EN.tabSettings = 'Settings';
TRANSLATIONS.EN.pomodoro25 = 'Pomodoro 25m';
TRANSLATIONS.EN.standard60 = 'Standard 60m';
TRANSLATIONS.EN.deep90 = 'Deep focus 90m';
TRANSLATIONS.EN.oofTitlePlaceholder = 'Task or project name';
TRANSLATIONS.EN.oofDefinitionPlaceholder = 'Definition of Done - how will you know the task is done?';
TRANSLATIONS.EN.constraintsPlaceholder = 'Constraints & context';
TRANSLATIONS.EN.firstStepPlaceholder = 'Specific first step';
TRANSLATIONS.EN.readyPrompt = 'Choose a task from the "Tasks" tab or start free mode';
TRANSLATIONS.EN.learnSystem = 'Help Guide';
TRANSLATIONS.EN.helpGuide = 'Help Guide';
TRANSLATIONS.EN.userFlow = 'User Flow';
TRANSLATIONS.EN.systemFeatures = 'System Features';
TRANSLATIONS.EN.helpGuideTitle = 'Deep Work OS - Help Guide';
TRANSLATIONS.EN.userFlowTitle = 'User Flow';
TRANSLATIONS.EN.systemFeaturesTitle = 'Key Features';
TRANSLATIONS.EN.userFlowStep1 = '1. Plan your deep work session';
TRANSLATIONS.EN.userFlowStep2 = '2. Set up your environment';
TRANSLATIONS.EN.userFlowStep3 = '3. Execute focused work';
TRANSLATIONS.EN.userFlowStep4 = '4. Review and learn';
TRANSLATIONS.EN.userFlowStep1Desc = 'Create Outcomes of Focus (OOFs) with clear definition of done, constraints, and first steps';
TRANSLATIONS.EN.userFlowStep2Desc = 'Use pre-work checklist: close tabs, disable notifications, prepare materials';
TRANSLATIONS.EN.userFlowStep3Desc = 'Start timer, follow single-task principle, use parking lot for distractions';
TRANSLATIONS.EN.userFlowStep4Desc = 'Complete post-block reflection: rate quality, energy, mood, and log insights';
TRANSLATIONS.EN.feature1 = 'Smart Task Management';
TRANSLATIONS.EN.feature2 = 'Focus Timer System';
TRANSLATIONS.EN.feature3 = 'Distraction Parking';
TRANSLATIONS.EN.feature4 = 'Progress Analytics';
TRANSLATIONS.EN.feature5 = 'Checklist Guidance';
TRANSLATIONS.EN.feature1Desc = 'Create structured OOFs with clear outcomes and actionable first steps';
TRANSLATIONS.EN.feature2Desc = 'Pomodoro, 60min, and 90min deep focus modes with pause/resume';
TRANSLATIONS.EN.feature3Desc = 'Capture and categorize distracting thoughts for later processing';
TRANSLATIONS.EN.feature4Desc = 'Track productivity patterns, mood, energy, and focus quality';
TRANSLATIONS.EN.feature5Desc = 'Pre, during, and post-work checklists to optimize flow state';
TRANSLATIONS.EN.closeGuide = 'Close Guide';
TRANSLATIONS.EN.tipLabel = 'Tip:';
TRANSLATIONS.EN.hintLongShort = 'Take notes about your progress, blockers, and insights.';
TRANSLATIONS.EN.check_single_title = 'Single task';
TRANSLATIONS.EN.check_single_info = 'Focus only on the current task. Close everything else.';
TRANSLATIONS.EN.check_single_example = 'One browser tab, one editor, notifications off';
TRANSLATIONS.EN.check_scratch_title = 'Draft ready';
TRANSLATIONS.EN.check_scratch_info = 'Use a scratchpad for quick notes and ideas.';
TRANSLATIONS.EN.check_scratch_example = 'Text file, notebook, or dedicated app';
TRANSLATIONS.EN.check_5min_title = '5-minute rule';
TRANSLATIONS.EN.check_5min_info = 'If stuck for over 5 minutes, try a micro-experiment or change approach.';
TRANSLATIONS.EN.check_5min_example = 'New perspective, different algorithm, simplify the task';
TRANSLATIONS.EN.check_hydration_title = 'Hydration';
TRANSLATIONS.EN.check_hydration_info = 'Drink water regularly to maintain focus.';
TRANSLATIONS.EN.check_hydration_example = 'A glass every 30 minutes';
TRANSLATIONS.EN.edit = 'Edit';
TRANSLATIONS.EN.delete = 'Delete';
TRANSLATIONS.EN.save = 'Save';

TRANSLATIONS.EN.domain = 'Domain';
TRANSLATIONS.EN.priority = 'Priority';
TRANSLATIONS.EN.time = 'Time (min)';
TRANSLATIONS.EN.difficulty = 'Difficulty';
TRANSLATIONS.EN.energy = 'Energy';
TRANSLATIONS.EN.quickAddPlaceholder = 'Quickly jot a thought or distraction...';
TRANSLATIONS.EN.add = 'Add';
TRANSLATIONS.EN.categoriesLabel = 'Categories:';
TRANSLATIONS.EN.all = 'All';
TRANSLATIONS.EN.starred = 'Starred';
TRANSLATIONS.EN.highPriority = 'Important';
TRANSLATIONS.EN.inProgress = 'In Progress';
TRANSLATIONS.EN.completed = 'Completed';
TRANSLATIONS.EN.entries = 'entries';
TRANSLATIONS.EN.definitionOfDoneChecklist = 'Definition of Done Checklist';
TRANSLATIONS.EN.definitionOfDone = 'Definition of Done';
TRANSLATIONS.EN.progress = 'Progress';
TRANSLATIONS.EN.addNewCriterion = 'Add new criterion...';
TRANSLATIONS.EN.noCriteriaAdded = 'No criteria added yet. Add specific criteria to track completion.';
TRANSLATIONS.EN.complete = 'complete';
TRANSLATIONS.EN.smartParkingList = 'Parking list';
TRANSLATIONS.EN.todaysProductivity = 'Today\'s productivity';
TRANSLATIONS.EN.achievements = 'Achievements';
TRANSLATIONS.EN.productivityDynamics = 'Productivity dynamics (14 days)';
TRANSLATIONS.EN.hintLong = 'Tip: take notes about your progress, blockers, and insights.';
TRANSLATIONS.EN.readyToStart = 'Ready to start deep work?';
TRANSLATIONS.EN.chooseTask = 'Choose a task from the "Tasks" tab or start free mode';
TRANSLATIONS.EN.useShiftEnter = 'Use Shift+Enter for newline, Enter to add';
TRANSLATIONS.EN.copy = 'Copy';
TRANSLATIONS.EN.copyStatus = 'Copied!';
TRANSLATIONS.EN.copyFailed = 'Failed to copy';
TRANSLATIONS.EN.popular = 'Popular';
TRANSLATIONS.EN.custom = 'Custom';
TRANSLATIONS.EN.uniqueIdPlaceholder = 'Unique ID';
TRANSLATIONS.EN.categoryPlaceholder = 'Category';
TRANSLATIONS.EN.copyText = 'Copy';
TRANSLATIONS.EN.systemSettings = 'System settings';
TRANSLATIONS.EN.exportImportData = 'Export and import data';
TRANSLATIONS.EN.exportData = 'Export data';
TRANSLATIONS.EN.toNotes = 'To notes';

// Settings translations
TRANSLATIONS.EN.basicSettings = 'Basic settings';
TRANSLATIONS.EN.notifications = 'Notifications';
TRANSLATIONS.EN.showReminders = 'Show reminders and tips';
TRANSLATIONS.EN.soundSignals = 'Sound signals';
TRANSLATIONS.EN.soundOnComplete = 'Sound when blocks complete';
TRANSLATIONS.EN.autoBreaks = 'Automatic breaks';
TRANSLATIONS.EN.suggestBreaks = 'Suggest breaks between blocks';
TRANSLATIONS.EN.defaultDuration = 'Default block duration';
TRANSLATIONS.EN.goalsMetrics = 'Goals and metrics';
TRANSLATIONS.EN.dailyGoal = 'Daily goal (minutes)';
TRANSLATIONS.EN.currentGoalDaily = 'Current goal: {0} hours per day';
TRANSLATIONS.EN.weeklyGoal = 'Weekly goal (minutes)';
TRANSLATIONS.EN.currentGoalWeekly = 'Current goal: {0} hours per week';
TRANSLATIONS.EN.energyTracking = 'Energy tracking';
TRANSLATIONS.EN.trackEnergyAnalytics = 'Include energy level in analytics';
TRANSLATIONS.EN.advancedAnalytics = 'Advanced analytics';
TRANSLATIONS.EN.showDetailedMetrics = 'Show detailed productivity metrics';
TRANSLATIONS.EN.dataImported = 'Data imported successfully!';
TRANSLATIONS.EN.importError = 'Import error';

// Priority translations
TRANSLATIONS.EN.priorityLow = 'Low';
TRANSLATIONS.EN.priorityMedium = 'Medium';
TRANSLATIONS.EN.priorityHigh = 'High';
TRANSLATIONS.EN.priorityCritical = 'Critical';
// Domain translations
TRANSLATIONS.EN.domainBackend = 'Backend';
TRANSLATIONS.EN.domainData = 'Data';
TRANSLATIONS.EN.domainCS = 'CS';
TRANSLATIONS.EN.domainSystemDesign = 'System Design';
TRANSLATIONS.EN.domainAlgoDS = 'Algo & DS';
TRANSLATIONS.EN.domainStudy = 'Study';
TRANSLATIONS.EN.domainDiscovery = 'Discovery';
TRANSLATIONS.EN.domainOther = 'Other';
// Analytics and metrics
TRANSLATIONS.EN.qualityDepth = 'Quality Depth (DQ)';
TRANSLATIONS.EN.energy = 'Energy';
TRANSLATIONS.EN.mood = 'Mood';
TRANSLATIONS.EN.avgDQ = 'Average DQ';
TRANSLATIONS.EN.qualityFocus = 'Focus Quality';
TRANSLATIONS.EN.flowSessions = 'Flow sessions';
TRANSLATIONS.EN.flowState = 'Flow State';
TRANSLATIONS.EN.completed = 'Completed';
TRANSLATIONS.EN.qualityMood = 'Quality and Mood';
TRANSLATIONS.EN.flowStateSigns = 'Signs of reaching flow state:';
TRANSLATIONS.EN.flowDescription = 'loss of sense of time, complete concentration on the task';
TRANSLATIONS.EN.deepWorkIndex = 'Deep Work Index';
TRANSLATIONS.EN.flowDescriptionFull = 'ease of decision making, natural work rhythm. This state is most effective for complex tasks.';
TRANSLATIONS.EN.minPlan = 'min plan';
TRANSLATIONS.EN.complexityLabel = 'Complexity';
TRANSLATIONS.EN.min = 'min';
TRANSLATIONS.EN.intelligentProductivitySystem = 'Intelligent productivity system';
TRANSLATIONS.EN.freeMode = 'Free mode';
TRANSLATIONS.EN.remaining = 'Remaining';
TRANSLATIONS.EN.finish = 'Finish';
TRANSLATIONS.EN.overtime = 'Overtime!';

// Analytics specific translations
TRANSLATIONS.EN.deepHours = 'Deep Hours';
TRANSLATIONS.EN.dailyGoalLabel = 'Daily Goal';
TRANSLATIONS.EN.dailyGoalText = 'daily';
TRANSLATIONS.EN.achieved = 'Achieved!';
TRANSLATIONS.EN.bestTimeOfDay = 'Best Time of Day';
TRANSLATIONS.EN.morning = 'Morning';
TRANSLATIONS.EN.afternoon = 'Afternoon';
TRANSLATIONS.EN.evening = 'Evening';
TRANSLATIONS.EN.deepWorkIndex = 'Deep Work Index';
TRANSLATIONS.EN.depthIndex = 'Depth Index';
TRANSLATIONS.EN.deepBlocksLog = 'Deep Blocks Log';
TRANSLATIONS.EN.dateTime = 'Date/Time';
TRANSLATIONS.EN.oof = 'OOF';
TRANSLATIONS.EN.minutes = 'Min';
TRANSLATIONS.EN.dq = 'DQ';
TRANSLATIONS.EN.dayLabel = 'Day';

// Post-Block Summary translations
TRANSLATIONS.EN.blockCompleted = 'Block Completed!';
TRANSLATIONS.EN.wellDone = 'Well done!';
TRANSLATIONS.EN.timeSpent = 'Time Spent';
TRANSLATIONS.EN.qualityRating = 'Quality Rating';
TRANSLATIONS.EN.energyLevel = 'Energy Level';
TRANSLATIONS.EN.dailyProgress = 'Daily Progress';
TRANSLATIONS.EN.achievement = 'Achievement';
TRANSLATIONS.EN.streak = 'Streak';
TRANSLATIONS.EN.blocks = 'blocks';
TRANSLATIONS.EN.startNewBlock = 'Start New Block';
TRANSLATIONS.EN.viewAnalytics = 'View Analytics';
TRANSLATIONS.EN.oofCompleted = 'OOF Completed';
TRANSLATIONS.EN.oofProgress = 'OOF Progress';
TRANSLATIONS.EN.greatWork = 'Great Work!';
TRANSLATIONS.EN.keepGoing = 'Keep going!';
TRANSLATIONS.EN.almostThere = 'Almost there!';
TRANSLATIONS.EN.goalReached = 'Daily goal reached!';
TRANSLATIONS.EN.onTrack = 'You\'re on track!';
TRANSLATIONS.EN.close = 'Close';

// Smart tips translations
TRANSLATIONS.EN.microExperiment = 'Micro-experiment > 5min';
TRANSLATIONS.EN.microExperimentDesc = 'If stuck for more than 5 minutes, try:';
TRANSLATIONS.EN.microTip1 = 'Rephrase the problem';
TRANSLATIONS.EN.microTip2 = 'Break into smaller steps';
TRANSLATIONS.EN.microTip3 = 'Change approach or tool';
TRANSLATIONS.EN.microTip4 = 'Start with the simplest option';

TRANSLATIONS.EN.distractionManagement = 'Distraction Management';
TRANSLATIONS.EN.distractionDesc = 'Write all side thoughts in the parking list:';
TRANSLATIONS.EN.distractionTip1 = 'Ideas for other projects';
TRANSLATIONS.EN.distractionTip2 = 'Personal reminders';
TRANSLATIONS.EN.distractionTip3 = 'Technical questions to research';
TRANSLATIONS.EN.distractionTip4 = 'Current process improvements';

// Ukrainian smart tips translations
TRANSLATIONS.UA.microExperiment = 'Мікроексперимент > 5хв';
TRANSLATIONS.UA.microExperimentDesc = 'Якщо застрягли більше 5 хвилин, спробуйте:';
TRANSLATIONS.UA.microTip1 = 'Перефразувати проблему';
TRANSLATIONS.UA.microTip2 = 'Розбити на менші кроки';
TRANSLATIONS.UA.microTip3 = 'Змінити підхід або інструмент';
TRANSLATIONS.UA.microTip4 = 'Почати з найпростішого варіанту';

TRANSLATIONS.UA.distractionManagement = 'Управління відволіканнями';
TRANSLATIONS.UA.distractionDesc = 'Всі побічні думки записуйте в паркувальний список:';
TRANSLATIONS.UA.distractionTip1 = 'Ідеї для інших проєктів';
TRANSLATIONS.UA.distractionTip2 = 'Особисті нагадування';
TRANSLATIONS.UA.distractionTip3 = 'Технічні питання для дослідження';
TRANSLATIONS.UA.distractionTip4 = 'Покращення поточного процесу';

// Flow state translations
TRANSLATIONS.EN.flowStateAchieved = 'Flow state achieved';
TRANSLATIONS.UA.flowStateAchieved = 'Стан потоку досягнуто';

// Smart hints header translations
TRANSLATIONS.EN.smartHintsTitle = 'Tips';
TRANSLATIONS.UA.smartHintsTitle = 'Підказки';

// Time unit translations
TRANSLATIONS.EN.hoursShort = 'h';
TRANSLATIONS.UA.hoursShort = 'г';
TRANSLATIONS.EN.hours = 'HOURS';
TRANSLATIONS.EN.minutes = 'MINUTES';
TRANSLATIONS.EN.seconds = 'SECONDS';
TRANSLATIONS.UA.hours = 'ГОДИНИ';
TRANSLATIONS.UA.minutes = 'ХВИЛИНИ';
TRANSLATIONS.UA.seconds = 'СЕКУНДИ';
TRANSLATIONS.EN.today = 'Today';
TRANSLATIONS.EN.week = 'Week';
TRANSLATIONS.EN.streak = 'Streak';
TRANSLATIONS.UA.today = 'Сьогодні';
TRANSLATIONS.UA.week = 'Тиждень';
TRANSLATIONS.UA.streak = 'Стрік';

TRANSLATIONS.UA.tabFocus = 'Задачі';
TRANSLATIONS.UA.tabTimer = 'Таймер';
TRANSLATIONS.UA.tabParking = 'Паркінг';
TRANSLATIONS.UA.tabAnalytics = 'Аналітика';
TRANSLATIONS.UA.tabSettings = 'Налаштування';
TRANSLATIONS.UA.pomodoro25 = 'Pomodoro 25хв';
TRANSLATIONS.UA.standard60 = 'Стандарт 60хв';
TRANSLATIONS.UA.deep90 = 'Глибокий фокус 90хв';
TRANSLATIONS.UA.domain = 'Домен';
TRANSLATIONS.UA.priority = 'Пріоритет';
TRANSLATIONS.UA.time = 'Час (хв)';
TRANSLATIONS.UA.difficulty = 'Складність';
TRANSLATIONS.UA.energy = 'Енергія';
TRANSLATIONS.UA.oofTitlePlaceholder = 'Назва завдання або проєкту';
TRANSLATIONS.UA.oofDefinitionPlaceholder = 'Критерії готовності - як ви зрозумієте, що завдання виконане?';
TRANSLATIONS.UA.constraintsPlaceholder = 'Обмеження та контекст';
TRANSLATIONS.UA.firstStepPlaceholder = 'Конкретний перший крок';
TRANSLATIONS.UA.readyPrompt = 'Оберіть завдання з вкладки "Фокус" або запустіть вільний режим';
TRANSLATIONS.UA.learnSystem = 'Довідка';
TRANSLATIONS.UA.helpGuide = 'Довідка';
TRANSLATIONS.UA.userFlow = 'Флоу користувача';
TRANSLATIONS.UA.systemFeatures = 'Функції системи';
TRANSLATIONS.UA.helpGuideTitle = 'Deep Work OS - Довідка';
TRANSLATIONS.UA.userFlowTitle = 'Флоу користувача';
TRANSLATIONS.UA.systemFeaturesTitle = 'Ключові функції';
TRANSLATIONS.UA.userFlowStep1 = '1. Плануйте сесію глибокої роботи';
TRANSLATIONS.UA.userFlowStep2 = '2. Налаштуйте середовище';
TRANSLATIONS.UA.userFlowStep3 = '3. Виконуйте сфокусовану роботу';
TRANSLATIONS.UA.userFlowStep4 = '4. Аналізуйте та вчіться';
TRANSLATIONS.UA.userFlowStep1Desc = 'Створіть ОФ (Outcomes of Focus) з чіткими критеріями готовності, обмеженнями та першими кроками';
TRANSLATIONS.UA.userFlowStep2Desc = 'Використовуйте чек-лист підготовки: закрийте вкладки, вимкніть сповіщення, підготуйте матеріали';
TRANSLATIONS.UA.userFlowStep3Desc = 'Запустіть таймер, дотримуйтесь принципу одного завдання, використовуйте парковку для відволікань';
TRANSLATIONS.UA.userFlowStep4Desc = 'Завершіть рефлексію після блоку: оцініть якість, енергію, настрій та зафіксуйте інсайти';
TRANSLATIONS.UA.feature1 = 'Розумне управління завданнями';
TRANSLATIONS.UA.feature2 = 'Система таймерів фокуса';
TRANSLATIONS.UA.feature3 = 'Парковка відволікань';
TRANSLATIONS.UA.feature4 = 'Аналітика прогресу';
TRANSLATIONS.UA.feature5 = 'Чек-листи для керівництва';
TRANSLATIONS.UA.feature1Desc = 'Створюйте структуровані ОФ з чіткими результатами та конкретними першими кроками';
TRANSLATIONS.UA.feature2Desc = 'Помодоро, 60хв та 90хв режими глибокого фокуса з можливістю паузи';
TRANSLATIONS.UA.feature3Desc = 'Фіксуйте та категоризуйте відволікаючі думки для подальшого опрацювання';
TRANSLATIONS.UA.feature4Desc = 'Відстежуйте патерни продуктивності, настрою, енергії та якості фокуса';
TRANSLATIONS.UA.feature5Desc = 'Чек-листи до, під час та після роботи для оптимізації стану потоку';
TRANSLATIONS.UA.closeGuide = 'Закрити довідку';
TRANSLATIONS.UA.tipLabel = 'Підказка:';
TRANSLATIONS.UA.hintLongShort = 'Використовуйте шаблони з вкладки "Шаблони" - кнопка "В нотатки" додає їх сюди автоматично';
TRANSLATIONS.UA.check_single_title = 'Одна справа';
TRANSLATIONS.UA.check_single_info = 'Зосередьтесь виключно на поточному завданні. Закрийте все зайве.';
TRANSLATIONS.UA.check_single_example = 'Одна вкладка браузера, один редактор, вимкнені сповіщення';
TRANSLATIONS.UA.check_scratch_title = 'Чернетка готова';
TRANSLATIONS.UA.check_scratch_info = 'Використовуйте чернетку для швидких записів та ідей.';
TRANSLATIONS.UA.check_scratch_example = 'Текстовий файл, блокнот, або спеціальний додаток';
TRANSLATIONS.UA.check_5min_title = 'Правило 5 хвилин';
TRANSLATIONS.UA.check_5min_info = 'При застою понад 5хв роблю мікроексперимент або змінюю підхід.';
TRANSLATIONS.UA.check_5min_example = 'Нова перспектива, інший алгоритм, спрощення задачі';
TRANSLATIONS.UA.check_hydration_title = 'Гідратація';
TRANSLATIONS.UA.check_hydration_info = 'Пийте воду регулярно для підтримки концентрації.';
TRANSLATIONS.UA.check_hydration_example = 'Скляночка води кожні 30 хвилин';
TRANSLATIONS.UA.edit = 'Редагувати';
TRANSLATIONS.UA.delete = 'Видалити';
TRANSLATIONS.UA.save = 'Зберегти';
TRANSLATIONS.UA.quickAddPlaceholder = 'Швидко запишіть думку або відволікання...';
TRANSLATIONS.UA.add = 'Додати';
TRANSLATIONS.UA.categoriesLabel = 'Категорії:';
TRANSLATIONS.UA.all = 'Всі';
TRANSLATIONS.UA.starred = 'Обрані';
TRANSLATIONS.UA.highPriority = 'Важливі';
TRANSLATIONS.UA.inProgress = 'В роботі';
TRANSLATIONS.UA.completed = 'Завершені';
TRANSLATIONS.UA.entries = 'записів';
TRANSLATIONS.UA.definitionOfDoneChecklist = 'Чекліст критеріїв завершення';
TRANSLATIONS.UA.definitionOfDone = 'Критерії завершення';
TRANSLATIONS.UA.progress = 'Прогрес';
TRANSLATIONS.UA.addNewCriterion = 'Додати новий критерій...';
TRANSLATIONS.UA.noCriteriaAdded = 'Критерії ще не додано. Додайте конкретні критерії для відстеження завершення.';
TRANSLATIONS.UA.complete = 'завершено';
TRANSLATIONS.UA.smartParkingList = 'Паркувальний список';
TRANSLATIONS.UA.todaysProductivity = 'Сьогоднішня продуктивність';
TRANSLATIONS.UA.achievements = 'Досягнення';
TRANSLATIONS.UA.productivityDynamics = 'Динаміка продуктивності (14 днів)';
TRANSLATIONS.UA.hintLong = 'Підказка: використовуйте шаблони з вкладки "Шаблони" — кнопка "В нотатки" додає їх сюди.';
TRANSLATIONS.UA.readyToStart = 'Готові розпочати глибоку роботу?';
TRANSLATIONS.UA.chooseTask = 'Оберіть завдання з вкладки "Фокус" або запустіть вільний режим';
TRANSLATIONS.UA.useShiftEnter = 'Використовуйте Shift+Enter для нового рядка, Enter для додавання';
TRANSLATIONS.UA.copy = 'Копіювати';
TRANSLATIONS.UA.copyStatus = 'Скопійовано!';
TRANSLATIONS.UA.copyFailed = 'Не вдалося скопіювати';
TRANSLATIONS.UA.popular = 'Популярні';
TRANSLATIONS.UA.custom = 'Кастомні';
TRANSLATIONS.UA.uniqueIdPlaceholder = 'Унікальний ID';
TRANSLATIONS.UA.categoryPlaceholder = 'Категорія';
TRANSLATIONS.UA.copyText = 'Копіювати';
TRANSLATIONS.UA.systemSettings = 'Налаштування системи';
TRANSLATIONS.UA.exportImportData = 'Експорт та імпорт даних';
TRANSLATIONS.UA.exportData = 'Експортувати дані';
TRANSLATIONS.UA.toNotes = 'В нотатки';

// Settings translations
TRANSLATIONS.UA.basicSettings = 'Основні налаштування';
TRANSLATIONS.UA.notifications = 'Сповіщення';
TRANSLATIONS.UA.showReminders = 'Показувати нагадування та підказки';
TRANSLATIONS.UA.soundSignals = 'Звукові сигнали';
TRANSLATIONS.UA.soundOnComplete = 'Звук при завершенні блоків';
TRANSLATIONS.UA.autoBreaks = 'Автоматичні перерви';
TRANSLATIONS.UA.suggestBreaks = 'Пропонувати перерви між блоками';
TRANSLATIONS.UA.defaultDuration = 'Стандартна тривалість блоку';
TRANSLATIONS.UA.goalsMetrics = 'Цілі та метрики';
TRANSLATIONS.UA.dailyGoal = 'Щоденна ціль (хвилини)';
TRANSLATIONS.UA.currentGoalDaily = 'Поточна ціль: {0} годин на день';
TRANSLATIONS.UA.weeklyGoal = 'Тижнева ціль (хвилини)';
TRANSLATIONS.UA.currentGoalWeekly = 'Поточна ціль: {0} годин на тиждень';
TRANSLATIONS.UA.energyTracking = 'Відстеження енергії';
TRANSLATIONS.UA.trackEnergyAnalytics = 'Враховувати рівень енергії в аналітиці';
TRANSLATIONS.UA.advancedAnalytics = 'Розширена аналітика';
TRANSLATIONS.UA.showDetailedMetrics = 'Показувати детальні метрики продуктивності';
TRANSLATIONS.UA.dataImported = 'Дані успішно імпортовано!';
TRANSLATIONS.UA.importError = 'Помилка імпорту даних';

// Priority translations
TRANSLATIONS.UA.priorityLow = 'Низький';
TRANSLATIONS.UA.priorityMedium = 'Середній';
TRANSLATIONS.UA.priorityHigh = 'Високий';
TRANSLATIONS.UA.priorityCritical = 'Критичний';
// Domain translations
TRANSLATIONS.UA.domainBackend = 'Backend';
TRANSLATIONS.UA.domainData = 'Дані';
TRANSLATIONS.UA.domainCS = 'CS';
TRANSLATIONS.UA.domainSystemDesign = 'Дизайн Систем';
TRANSLATIONS.UA.domainAlgoDS = 'Алгоритми & СД';
TRANSLATIONS.UA.domainStudy = 'Навчання';
TRANSLATIONS.UA.domainDiscovery = 'Дослідження';
TRANSLATIONS.UA.domainOther = 'Інше';
// Analytics and metrics
TRANSLATIONS.UA.qualityDepth = 'Якість глибини (DQ)';
TRANSLATIONS.UA.energy = 'Енергія';
TRANSLATIONS.UA.mood = 'Настрій';
TRANSLATIONS.UA.avgDQ = 'Середнє DQ';
TRANSLATIONS.UA.qualityFocus = 'Якість фокусу';
TRANSLATIONS.UA.flowSessions = 'Flow сесії';
TRANSLATIONS.UA.flowState = 'Стан потоку';
TRANSLATIONS.UA.completed = 'Завершено';
TRANSLATIONS.UA.qualityMood = 'Якість та настрій';
TRANSLATIONS.UA.flowStateSigns = 'Ознаки досягнення стану потоку:';
TRANSLATIONS.UA.flowDescription = 'втрата відчуття часу, повна концентрація на завданні';
TRANSLATIONS.UA.deepWorkIndex = 'Індекс Глибокої Роботи';
TRANSLATIONS.UA.flowDescriptionFull = 'легкість прийняття рішень, природний ритм роботи. Цей стан найефективніший для складних завдань.';
TRANSLATIONS.UA.minPlan = 'хв план';
TRANSLATIONS.UA.complexityLabel = 'Складність';
TRANSLATIONS.UA.min = 'хв';
TRANSLATIONS.UA.intelligentProductivitySystem = 'Інтелектуальна система продуктивності';
TRANSLATIONS.UA.freeMode = 'Вільний режим';
TRANSLATIONS.UA.remaining = 'Залишилось';
TRANSLATIONS.UA.finish = 'Завершити';
TRANSLATIONS.UA.overtime = 'Овертайм!';

// Analytics specific translations
TRANSLATIONS.UA.deepHours = 'Години глибини';
TRANSLATIONS.UA.dailyGoalLabel = 'Щоденна ціль';
TRANSLATIONS.UA.dailyGoalText = 'щодня';
TRANSLATIONS.UA.achieved = 'Досягнуто!';
TRANSLATIONS.UA.bestTimeOfDay = 'Краща пора дня';
TRANSLATIONS.UA.morning = 'Ранок';
TRANSLATIONS.UA.afternoon = 'День';
TRANSLATIONS.UA.evening = 'Вечір';
TRANSLATIONS.UA.deepWorkIndex = 'Індекс Глибокої Роботи';
TRANSLATIONS.UA.depthIndex = 'Індекс глибини';
TRANSLATIONS.UA.deepBlocksLog = 'Журнал глибоких блоків';
TRANSLATIONS.UA.dateTime = 'Дата/Час';
TRANSLATIONS.UA.oof = 'OOF';
TRANSLATIONS.UA.minutes = 'Хв';
TRANSLATIONS.UA.dq = 'DQ';
TRANSLATIONS.UA.dayLabel = 'День';

// Post-Block Summary translations
TRANSLATIONS.UA.blockCompleted = 'Блок завершено!';
TRANSLATIONS.UA.wellDone = 'Молодець!';
TRANSLATIONS.UA.timeSpent = 'Проведено часу';
TRANSLATIONS.UA.qualityRating = 'Оцінка якості';
TRANSLATIONS.UA.energyLevel = 'Рівень енергії';
TRANSLATIONS.UA.dailyProgress = 'Денний прогрес';
TRANSLATIONS.UA.achievement = 'Досягнення';
TRANSLATIONS.UA.streak = 'Серія';
TRANSLATIONS.UA.blocks = 'блоків';
TRANSLATIONS.UA.startNewBlock = 'Почати новий блок';
TRANSLATIONS.UA.viewAnalytics = 'Переглянути Аналітику';
TRANSLATIONS.UA.oofCompleted = 'OOF завершено';
TRANSLATIONS.UA.oofProgress = 'Прогрес OOF';
TRANSLATIONS.UA.greatWork = 'Відмінна робота!';
TRANSLATIONS.UA.keepGoing = 'Продовжуй!';
TRANSLATIONS.UA.almostThere = 'Майже досягли!';
TRANSLATIONS.UA.goalReached = 'Денна ціль досягнута!';
TRANSLATIONS.UA.onTrack = 'Ви на правильному шляху!';
TRANSLATIONS.UA.close = 'Закрити';


const translate = (language: string, key: string, ...args: any[]) => {
  const val = TRANSLATIONS[language]?.[key];
  if (typeof val === 'function') return val(...args);
  return val ?? key;
}

// Helper functions for translating priorities and domains
const translatePriority = (language: string, priority: Priority) => {
  const priorityMap: Record<Priority, string> = {
    'Low': 'priorityLow',
    'Medium': 'priorityMedium',
    'High': 'priorityHigh',
    'Critical': 'priorityCritical'
  };
  return translate(language, priorityMap[priority]);
};

const translateDomain = (language: string, domain: Domain) => {
  const domainMap: Record<string, string> = {
    'Backend': 'domainBackend',
    'Data': 'domainData',
    'CS': 'domainCS',
    'SystemDesign': 'domainSystemDesign',
    'AlgoDS': 'domainAlgoDS',
    'Study': 'domainStudy',
    'Discovery': 'domainDiscovery',
    'Other': 'domainOther'
  };
  // For custom domains, return the domain name as-is if no translation exists
  return translate(language, domainMap[domain]) || domain;
};


// Enhanced Helper Components
const QuickStats = ({ logs, className = "", onResetData, language = 'EN' }: { logs:any[]; className?:string; onResetData?:()=>void; language?: string }) => {
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
    <div className={`grid grid-cols-3 gap-1 ${className}`}>
      <Card className="bg-slate-800/5 backdrop-blur-md border-emerald-500/60 shadow-2xl shadow-emerald-500/20">
        <CardContent className="pt-2 pb-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-300">{Math.round(todayTime/60 * 10)/10}{translate(language,'hoursShort')}</div>
            <div className="text-slate-200 text-sm font-medium">{translate(language,'today')}</div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800/5 backdrop-blur-md border-blue-500/60 shadow-2xl shadow-blue-500/20">
        <CardContent className="pt-2 pb-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-300">{Math.round(weekTime/60 * 10)/10}{translate(language,'hoursShort')}</div>
            <div className="text-slate-200 text-sm font-medium">{translate(language,'week')}</div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800/5 backdrop-blur-md border-amber-500/60 shadow-2xl shadow-amber-500/20">
        <CardContent className="pt-2 pb-2">
          {/* Reset button removed here to avoid duplication; top header contains the single Reset */}
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-300 flex items-center justify-center">
              <Flame className="w-5 h-5 mr-1" />
              {streak}
            </div>
            <div className="text-slate-200 text-sm font-medium">{translate(language,'streak')}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const calculateStreak = (logs: BlockLog[]): number => {
  const sortedLogs = logs.sort((a: BlockLog, b: BlockLog) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
  const uniqueDates = [...new Set(sortedLogs.map((log: BlockLog) => log.dateISO))];
  
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


const SmartTimer = ({ run, onTogglePause, onReset, onStop, elapsedSec, language }: { run: RunningBlock; onTogglePause: ()=>void; onReset: ()=>void; onStop: ()=>void; elapsedSec: number; language: string }) => {
  const targetSec = run.targetMinutes * 60;
  const progress = Math.min(100, Math.round((elapsedSec / targetSec) * 100));
  const remainingMin = Math.ceil((targetSec - elapsedSec) / 60);

  // Activity detection
  const isNearComplete = progress > 85;
  const isOvertime = progress > 100;

  // Get time units for countdown display (remaining time)
  const remainingSec = Math.max(0, targetSec - elapsedSec);
  const timeUnits = formatTimeUnits(remainingSec);

  return (
    <>

      <Card className={`bg-slate-800/5 backdrop-blur-md border-2 ${isOvertime ? 'border-amber-500/70' : isNearComplete ? 'border-emerald-500/70' : 'border-slate-600/30'} shadow-2xl`}>
        <CardContent className="pt-2">
          <div className="text-center space-y-2">
            <div>
              {/* Linear Progress Bar */}
              <div className="mb-1 px-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-400">
                    {translate(language, 'remaining')}: {remainingMin} {translate(language, 'min')}
                  </span>
                  <span className={`text-sm font-semibold ${isOvertime ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-700/30 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ease-out rounded-full ${
                      isOvertime ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Three-Tile Timer Display */}
              <div className="bg-slate-900/20 backdrop-blur-sm border border-slate-600/20 rounded-xl p-2 sm:p-3 mb-1">
                <div className="flex gap-1 sm:gap-2 md:gap-3">
                  <AnimatedDigit value={timeUnits.hours} label="HOURS" language={language} />
                  <AnimatedDigit value={timeUnits.minutes} label="MINUTES" language={language} />
                  <AnimatedDigit value={timeUnits.seconds} label="SECONDS" language={language} />
                </div>
              </div>

              {isOvertime && (
                <div className="text-center mt-2">
                  <span className="text-amber-400 font-semibold text-sm">
                    {translate(language, 'overtime')} +{remainingMin-run.targetMinutes} {translate(language, 'min')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Control Buttons */}
            <div className="flex flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <Button
                onClick={onTogglePause}
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-300 hover:text-slate-100 hover:border-slate-500 flex-1 sm:flex-none min-h-[44px] sm:min-h-[48px] px-3 sm:px-4"
              >
                {run.paused ? (
                  <>
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                    <span className="hidden sm:inline">{translate(language, 'resume')}</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                    <span className="hidden sm:inline">{translate(language, 'pause')}</span>
                  </>
                )}
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-300 hover:text-slate-100 hover:border-slate-500 flex-1 sm:flex-none min-h-[44px] sm:min-h-[48px] px-3 sm:px-4"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">{translate(language, 'reset')}</span>
              </Button>
              <Button
                onClick={onStop}
                variant="default"
                size="lg"
                className="bg-cyan-600 hover:bg-cyan-700 flex-1 sm:flex-none min-h-[44px] sm:min-h-[48px] px-3 sm:px-4"
              >
                <Square className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">{translate(language, 'finish')}</span>
              </Button>
            </div>
        </CardContent>
      </Card>
    </>
  );
};

const PostBlockSummary = ({ block, analytics, settings, parking, onStartNew, onViewAnalytics, onClose, language = 'EN' }: {
  block: BlockLog;
  analytics: any;
  settings: any;
  parking: ParkingItem[];
  onStartNew: () => void;
  onViewAnalytics: () => void;
  onClose: () => void;
  language?: string;
}) => {
  const t = (key: string) => translate(language, key);
  const [animationPhase, setAnimationPhase] = React.useState(0);

  // Calculate achievements and progress
  const dailyProgress = Math.round((analytics.today.dh / (settings.dailyGoal / 60)) * 100);
  const isGoalReached = dailyProgress >= 100;
  const streakDays = analytics.streakDays || 0;

  // Start entrance animation
  React.useEffect(() => {
    const phases = [0, 1, 2, 3];
    let currentPhase = 0;

    const animationInterval = setInterval(() => {
      if (currentPhase < phases.length - 1) {
        currentPhase++;
        setAnimationPhase(currentPhase);
      } else {
        clearInterval(animationInterval);
      }
    }, 800);

    return () => clearInterval(animationInterval);
  }, []);

  // Motivational messages
  const getMotivationalMessage = () => {
    if (isGoalReached) return t('goalReached');
    if (dailyProgress >= 80) return t('almostThere');
    if (dailyProgress >= 50) return t('onTrack');
    return t('keepGoing');
  };

  // Energy indicators
  const getEnergyColor = (energy: number) => {
    if (energy >= 7) return 'text-green-400';
    if (energy >= 4) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Background stars animation
  const generateStars = () => {
    return Array.from({ length: 50 }, (_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 4}s`
        }}
      />
    ));
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center p-2 relative overflow-hidden" style={{ backgroundColor: 'transparent' }}>
      {/* Animated background stars */}
      <div className="absolute inset-0 pointer-events-none">
        {generateStars()}
      </div>

      {/* Cosmic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900/40 to-black/60 pointer-events-none" />

      <Card className={`relative z-10 w-full max-w-2xl mx-auto bg-slate-900/80 backdrop-blur-xl border-slate-700/40 shadow-2xl transition-all duration-1000 ${
        animationPhase >= 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
        <CardHeader className={`text-center bg-slate-800/50 backdrop-blur border-b border-slate-700/30 transition-all duration-800 delay-200 ${
          animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="mb-1">
            <div className="text-5xl mb-1 animate-bounce">🎉</div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-1">
              {t('blockCompleted')}
            </CardTitle>
            <p className="text-slate-300 text-lg">{t('wellDone')}</p>
            <div className="mt-2 flex justify-center space-x-2">
              {[0, 1, 2, 3].map((dot) => (
                <div
                  key={dot}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    animationPhase >= dot ? 'bg-emerald-400 scale-100' : 'bg-slate-600 scale-75'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {/* Enhanced Stats Grid with animations */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 mb-1 transition-all duration-800 delay-400 ${
            animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}>
            <div className="text-center p-3 bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 rounded-xl border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20">
              <div className="text-3xl font-bold text-emerald-400 mb-1 animate-pulse">{block.minutes}</div>
              <div className="text-slate-300 text-sm font-medium">{t('minutes')}</div>
              <div className="text-xs text-slate-400 mt-1">{t('timeSpent')}</div>
              {/* Visual indicator */}
              <div className="w-full bg-slate-700/30 rounded-full h-1 mt-3">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((block.minutes / 60) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-xl border border-blue-700/30 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="text-3xl font-bold text-blue-400 mb-1">{block.dq}</div>
              <div className="text-slate-300 text-sm font-medium">DQ</div>
              <div className="text-xs text-slate-400 mt-1">{t('qualityRating')}</div>
              {/* Quality stars */}
              <div className="flex justify-center mt-2 space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={`text-sm ${star <= block.dq ? 'text-blue-400' : 'text-slate-600'}`}
                  >
                    ⭐
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-yellow-900/40 to-orange-800/20 rounded-xl border border-yellow-700/30 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20">
              <div className={`text-3xl font-bold mb-1 ${getEnergyColor(block.energy)}`}>{block.energy}</div>
              <div className="text-slate-300 text-sm font-medium">{t('energy')}</div>
              <div className="text-xs text-slate-400 mt-1">{t('energyLevel')}</div>
              {/* Energy bar */}
              <div className="w-full bg-slate-700/30 rounded-full h-1 mt-3">
                <div
                  className={`h-1 rounded-full transition-all duration-1000 ${
                    block.energy >= 7 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                    block.energy >= 4 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    'bg-gradient-to-r from-red-400 to-red-500'
                  }`}
                  style={{ width: `${(block.energy / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-purple-900/40 to-indigo-800/20 rounded-xl border border-purple-700/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="text-3xl font-bold text-purple-400 mb-1">{dailyProgress}%</div>
              <div className="text-slate-300 text-sm font-medium">{t('dailyProgress')}</div>
              <div className="text-xs text-slate-400 mt-1">{Math.round(analytics.today.dh * 10) / 10}h / {settings.dailyGoal / 60}h</div>
              {/* Circular progress */}
              <div className="relative w-8 h-8 mx-auto mt-2">
                <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-slate-700"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${2 * Math.PI * 14}`}
                    strokeDashoffset={`${2 * Math.PI * 14 * (1 - dailyProgress / 100)}`}
                    className="text-purple-400 transition-all duration-1000"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Enhanced Parking Lot Ideas */}
          {parking && parking.length > 0 && (
            <div className={`mb-1 transition-all duration-800 delay-600 ${
              animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="flex items-center justify-between mb-1 p-2 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl border border-amber-700/30">
                <div className="flex items-center">
                  <NotebookPen className="w-6 h-6 text-amber-400 mr-3 animate-pulse" />
                  <span className="text-slate-100 font-bold text-lg">{translate(language, 'smartParkingList')}</span>
                </div>
                <div className="bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                  <span className="text-amber-300 text-sm font-semibold">{parking.length} ідей</span>
                </div>
              </div>
              <div className="grid gap-3 max-h-40 overflow-y-auto">
                {parking.slice(0, 6).map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center p-2 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/20 hover:border-amber-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${item.done ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                        {item.text}
                      </div>
                      {item.category && (
                        <div className="text-xs text-amber-400/70 mt-1 bg-amber-900/20 px-2 py-1 rounded-md inline-block">
                          {item.category}
                        </div>
                      )}
                    </div>
                    {item.done && <div className="text-emerald-400 ml-3 text-lg animate-pulse">✓</div>}
                    {!item.done && <div className="w-3 h-3 bg-amber-500/30 rounded-full ml-3 animate-pulse" />}
                  </div>
                ))}
                {parking.length > 6 && (
                  <div className="text-center text-slate-400 text-sm p-2 bg-slate-800/30 rounded-lg border border-slate-700/20">
                    та ще {parking.length - 6} ідей у паркінгу...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Progress Bar */}
          <div className={`mb-1 transition-all duration-800 delay-700 ${
            animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex justify-between items-center mb-1 p-2 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/20">
              <div className="flex items-center">
                <span className="text-slate-100 font-bold text-lg mr-3">{t('dailyProgress')}</span>
                <div className="bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                  <span className="text-purple-300 text-sm font-semibold">{dailyProgress}%</span>
                </div>
              </div>
              <span className="text-slate-300 text-sm bg-slate-700/50 px-3 py-1 rounded-full">{getMotivationalMessage()}</span>
            </div>
            <div className="relative">
              <div className="w-full bg-slate-700/30 rounded-full h-4 shadow-inner">
                <div
                  className={`h-4 rounded-full transition-all duration-2000 shadow-lg relative overflow-hidden ${
                    isGoalReached ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600' :
                    dailyProgress >= 50 ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500' :
                    'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500'
                  }`}
                  style={{ width: `${Math.min(dailyProgress, 100)}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
              {/* Progress milestones */}
              <div className="flex justify-between mt-2 text-xs text-slate-400">
                <span className={dailyProgress >= 25 ? 'text-emerald-400' : ''}>25%</span>
                <span className={dailyProgress >= 50 ? 'text-emerald-400' : ''}>50%</span>
                <span className={dailyProgress >= 75 ? 'text-emerald-400' : ''}>75%</span>
                <span className={dailyProgress >= 100 ? 'text-emerald-400' : ''}>🎯</span>
              </div>
            </div>
          </div>

          {/* Enhanced Special Achievements */}
          <div className={`space-y-2 mb-1 transition-all duration-800 delay-800 ${
            animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {block.completedOOF && (
              <div className="flex items-center p-2 bg-gradient-to-r from-emerald-900/40 to-green-900/30 rounded-xl border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/20">
                <div className="text-3xl mr-4 animate-bounce">✅</div>
                <div className="flex-1">
                  <div className="text-emerald-300 font-bold text-lg">{t('oofCompleted')}</div>
                  <div className="text-slate-200 text-sm bg-emerald-900/20 px-3 py-1 rounded-md mt-1 inline-block">{block.oofTitle}</div>
                </div>
                <div className="text-emerald-400 text-2xl">🎉</div>
              </div>
            )}

            {block.flowState && (
              <div className="flex items-center p-2 bg-gradient-to-r from-purple-900/40 to-indigo-900/30 rounded-xl border border-purple-700/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20">
                <div className="text-3xl mr-4 animate-pulse">⚡</div>
                <div className="flex-1">
                  <div className="text-purple-300 font-bold text-lg">{t('flowState')}</div>
                  <div className="text-slate-200 text-sm">{t('greatWork')}</div>
                </div>
                <div className="text-purple-400 text-2xl">🌊</div>
              </div>
            )}

            {streakDays > 1 && (
              <div className="flex items-center p-2 bg-gradient-to-r from-orange-900/40 to-red-900/30 rounded-xl border border-orange-700/30 hover:border-orange-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/20">
                <div className="text-3xl mr-4 animate-pulse">🔥</div>
                <div className="flex-1">
                  <div className="text-orange-300 font-bold text-lg">{streakDays} {t('dayLabel')} {t('streak')}</div>
                  <div className="text-slate-200 text-sm">{t('keepGoing')}</div>
                </div>
                <div className="text-orange-400 text-2xl">⭐</div>
              </div>
            )}

            {isGoalReached && (
              <div className="flex items-center p-2 bg-gradient-to-r from-yellow-900/40 to-amber-900/30 rounded-xl border border-yellow-700/30 hover:border-yellow-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/20">
                <div className="text-3xl mr-4 animate-bounce">🏆</div>
                <div className="flex-1">
                  <div className="text-yellow-300 font-bold text-lg">{t('achievement')}</div>
                  <div className="text-slate-200 text-sm">{t('goalReached')}</div>
                </div>
                <div className="text-yellow-400 text-2xl">👑</div>
              </div>
            )}
          </div>

          {/* Enhanced Action Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-800 delay-900 ${
            animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <Button
              onClick={onStartNew}
              className="group flex-1 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-500 hover:via-cyan-500 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-xl border-2 border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/25 relative overflow-hidden"
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Play className="w-6 h-6 mr-3 group-hover:animate-pulse" />
              <span className="text-lg">{t('startNewBlock')}</span>
              <div className="ml-auto text-xl group-hover:scale-110 transition-transform duration-300">🚀</div>
            </Button>

            <Button
              onClick={onViewAnalytics}
              variant="outline"
              className="group flex-1 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-slate-600/50 hover:border-purple-500/50 text-slate-200 hover:text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 relative overflow-hidden"
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-purple-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <BarChart3 className="w-6 h-6 mr-3 group-hover:animate-pulse" />
              <span className="text-lg">{t('viewAnalytics')}</span>
              <div className="ml-auto text-xl group-hover:scale-110 transition-transform duration-300">📊</div>
            </Button>
          </div>

          {/* Enhanced Close Button */}
          <div className={`text-center mt-8 transition-all duration-800 delay-1000 ${
            animationPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <Button
              onClick={onClose}
              variant="ghost"
              className="group text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
              size="sm"
            >
              <span className="group-hover:scale-110 transition-transform duration-300">
                {translate(language, 'close')}
              </span>
              <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">✨</div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const EnhancedOOFCard = ({ oof, onStart, onEdit, onDelete, onToggleStar, onUpdateDoD, isStarred, language = 'EN' }: { oof: OOF; onStart: (oof:OOF, minutes:number)=>void; onEdit: (oof:OOF)=>void; onDelete: (id:string)=>void; onToggleStar: (id:string)=>void; onUpdateDoD?: (oofId: string, dodList: DoD[])=>void; isStarred:boolean; language?:string }) => {
  const priorityColors = {
    Low: { bg: 'bg-slate-800/10', text: 'text-slate-300', border: 'border-slate-600' },
    Medium: { bg: 'bg-blue-900/60', text: 'text-blue-400', border: 'border-blue-700' },
    High: { bg: 'bg-amber-900/60', text: 'text-amber-400', border: 'border-amber-700' },
    Critical: { bg: 'bg-red-900/60', text: 'text-red-400', border: 'border-red-700' }
  };
  
  const toggleDoD = (dodId: string) => {
    if (oof.definitionOfDoneList && onUpdateDoD) {
      const updatedList = oof.definitionOfDoneList.map(item =>
        item.id === dodId ? { ...item, completed: !item.completed } : item
      );
      onUpdateDoD(oof.id, updatedList);
    }
  };

  const getDomainConfig = (language: string, domain: string) => {
    const defaultConfigs: Record<string, { label: string, color: string, bgColor: string }> = {
      Backend: { label: translateDomain(language, 'Backend'), color: 'text-blue-400', bgColor: 'bg-blue-900/40' },
      Data: { label: translateDomain(language, 'Data'), color: 'text-emerald-400', bgColor: 'bg-emerald-900/40' },
      CS: { label: translateDomain(language, 'CS'), color: 'text-purple-400', bgColor: 'bg-purple-900/40' },
      Other: { label: translateDomain(language, 'Other'), color: 'text-amber-400', bgColor: 'bg-amber-900/40' },
      SystemDesign: { label: translateDomain(language, 'SystemDesign'), color: 'text-cyan-400', bgColor: 'bg-cyan-900/40' },
      AlgoDS: { label: translateDomain(language, 'AlgoDS'), color: 'text-rose-400', bgColor: 'bg-rose-900/40' },
      Study: { label: translateDomain(language, 'Study'), color: 'text-green-400', bgColor: 'bg-green-900/40' },
      Discovery: { label: translateDomain(language, 'Discovery'), color: 'text-indigo-400', bgColor: 'bg-indigo-900/40' }
    };

    // Return specific config or fallback for custom domains
    return defaultConfigs[domain] || {
      label: translateDomain(language, domain),
      color: 'text-slate-400',
      bgColor: 'bg-slate-900/40'
    };
  };

  const domainConfig = getDomainConfig(language, oof.domain);
  
  const completionRate = oof.actualMinutes > 0 ? Math.round((oof.actualMinutes / oof.estimatedMinutes) * 100) : 0;
  
  return (
    <Card className={`${priorityColors[oof.priority].bg} border-2 ${priorityColors[oof.priority].border} hover:border-opacity-80 transition-all duration-200 backdrop-blur-sm shadow-lg`}>
      <CardContent className="pt-4 bg-transparent">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Badge className={`${domainConfig.bgColor} ${domainConfig.color} border-0 text-xs font-semibold px-2 py-1`}>
                {domainConfig.label}
              </Badge>
              <Badge className={`${priorityColors[oof.priority].bg} ${priorityColors[oof.priority].text} border-0 text-xs font-semibold px-2 py-1`}>
                {translatePriority(language, oof.priority)}
              </Badge>
              {oof.tags.map(tag => (
                <Badge key={tag} className="text-xs border border-slate-500/50 text-slate-300 bg-slate-800/10 px-2 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
            <h4 className="font-semibold text-slate-100 mb-1 leading-tight">{oof.title}</h4>
            <div className="text-sm text-slate-300 space-y-1">
              <div className="flex items-center space-x-4">
                <span className="text-slate-300">📊 {oof.estimatedMinutes}{translate(language, 'minPlan')}</span>
                <span className="text-slate-300">⚡ {translate(language, 'complexityLabel')}: {oof.difficulty}/10</span>
                <span className="text-slate-300">🔋 {translate(language, 'energy')}: {oof.energy}/10</span>
              </div>
              {completionRate > 0 && (
                <div className="flex items-center">
                  <div className="w-full bg-slate-700/10 rounded-full h-2 mr-2">
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
            className={`${isStarred ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-500 hover:text-yellow-400'} bg-transparent hover:bg-slate-700/10`}
          >
            <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
          </Button>
        </div>
        
        {oof.definitionOfDone && (
          <p className="text-slate-300 text-sm mb-1 bg-slate-800/5 p-2 rounded-lg border border-slate-700/50">
            ✅ DoD: {oof.definitionOfDone}
          </p>
        )}
        {oof.definitionOfDoneList && oof.definitionOfDoneList.length > 0 && (
          <div className="bg-slate-800/5 p-3 rounded-lg border border-slate-700/50 mb-1">
            <h5 className="text-slate-200 font-semibold text-sm mb-1 flex items-center">
              <span className="mr-2">✅</span>
              {translate(language, 'definitionOfDone')} ({oof.definitionOfDoneList.filter(item => item.completed).length}/{oof.definitionOfDoneList.length})
            </h5>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${(oof.definitionOfDoneList.filter(item => item.completed).length / oof.definitionOfDoneList.length) * 100}%`
                  }}
                ></div>
              </div>
              <div className="text-xs text-slate-400">
                {Math.round((oof.definitionOfDoneList.filter(item => item.completed).length / oof.definitionOfDoneList.length) * 100)}% {translate(language, 'complete')}
              </div>
            </div>

            <div className="space-y-1">
              {oof.definitionOfDoneList.map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-sm group">
                  <button
                    onClick={() => toggleDoD(item.id)}
                    className={`w-4 h-4 flex items-center justify-center rounded cursor-pointer transition-colors hover:scale-110 ${
                      item.completed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-600 border border-slate-500 hover:bg-slate-500'
                    }`}
                  >
                    {item.completed && '✓'}
                  </button>
                  <span className={`text-slate-300 ${item.completed ? 'line-through opacity-60' : ''} cursor-pointer`}
                        onClick={() => toggleDoD(item.id)}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {oof.firstStep && (
          <p className="text-slate-300 text-sm mb-3 bg-slate-800/5 p-2 rounded-lg border border-slate-700/50">
            🚀 Наступний крок: {oof.firstStep}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button size="sm" onClick={() => onStart(oof, 60)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md flex-1 sm:flex-none">
              60хв
            </Button>
            <Button size="sm" onClick={() => onStart(oof, 90)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md flex-1 sm:flex-none">
              90хв
            </Button>
            {oof.estimatedMinutes && ![60,90].includes(oof.estimatedMinutes) && (
              <Button size="sm" onClick={() => onStart(oof, oof.estimatedMinutes)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md flex-1 sm:flex-none">
                {oof.estimatedMinutes}{translate(language, 'min')}
              </Button>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(oof)}
              className="border-slate-600 text-slate-300 hover:text-slate-100 flex-1 sm:flex-none"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Редагувати
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(oof.id)}
              className="border-slate-600 text-red-400 hover:text-red-300 flex-1 sm:flex-none"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {translate(language,'delete')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SmartParkingList = ({ parking, onAdd, onToggle, onDelete, onCategorize, currentBlockId, language = 'EN' }: { parking: ParkingItem[]; onAdd: (text:string)=>void; onToggle: (id:string, done:boolean)=>void; onDelete: (id:string)=>void; onCategorize: (id:string, category:string)=>void; currentBlockId?: string; language?: string }) => {
  const [filter, setFilter] = useState('all');
  const filteredParking = parking.filter(item => {
    if (filter === 'all') return true;
    return item.category === filter;
  });
  
  return (
    <div className="space-y-2">
      {/* Input field for quick add */}
      <div className="w-full mb-4">
        <AddInline
          placeholder={translate(language,'quickAddPlaceholder')}
          onAdd={onAdd}
          buttonText={translate(language,'add')}
          language={language}
        />
      </div>
      
      {/* Filter buttons */}
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
              📋 {translate(language, 'all')}
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
        
        <div className="text-slate-200 text-sm font-semibold bg-slate-800/10 px-4 py-2 rounded-lg border border-slate-700/50 shadow-md">
          {filteredParking.length} {translate(language, 'entries')}
        </div>
      </div>
      
      {/* Parking items list */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {filteredParking.map(item => (
          <Card key={item.id} className={`bg-gradient-to-r from-slate-800/80 to-slate-700/60 backdrop-blur-sm border border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-200 ${item.createdDuringBlock === currentBlockId ? 'border-l-4 border-l-emerald-400 shadow-emerald-400/20' : ''}`}>
            <CardContent className="pt-4 pb-4 px-3 md:px-6">
              {/* Mobile Layout - Stack Vertically */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                {/* Main Content Row */}
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <Switch
                    checked={item.done}
                    onCheckedChange={(checked) => onToggle(item.id, checked)}
                    className="mt-1 scale-90 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    {/* Text and Category - Mobile Optimized */}
                    <div className="mb-1">
                      <div className="mb-1">
                        <span className={`text-sm md:text-base font-medium leading-relaxed break-words block text-left ${item.done ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                          {item.text}
                        </span>
                      </div>
                      {/* Category Icon - Below text on mobile */}
                      <div className="flex items-center gap-2 justify-start">
                        <span className="text-base md:text-lg">{categoryIcons[item.category]}</span>
                        <span className="text-xs text-slate-400 capitalize">{item.category}</span>
                      </div>
                    </div>
                    {item.createdDuringBlock === currentBlockId && (
                      <span className="text-xs text-emerald-400 font-semibold inline-block bg-emerald-900/20 px-2 py-1 rounded-md border border-emerald-700/30">
                        • додано під час поточного блоку
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Controls - Stack on Mobile */}
                <div className="flex items-center justify-between md:justify-end space-x-2 md:space-x-3 mt-2 md:mt-0">
                  <select
                    value={item.category}
                    onChange={(e) => onCategorize(item.id, e.target.value)}
                    className="text-xs md:text-sm bg-slate-700/10 border border-slate-600/50 rounded-lg px-2 md:px-3 py-1 md:py-2 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 backdrop-blur-sm flex-1 md:flex-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{categoryIcons[cat]} {cat}</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(item.id)}
                    className="text-slate-400 hover:text-red-400 hover:bg-red-900/20 backdrop-blur-sm border border-slate-600/50 hover:border-red-700/50 p-1 md:p-2 rounded-lg transition-all duration-200 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
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

const formatTimeUnits = (seconds: number) => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const secs = seconds % 60;

  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: secs.toString().padStart(2, '0')
  };
};

const AnimatedDigit = ({ value, label, language = 'EN' }: { value: string; label: string; language?: string }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);

      // Start animation after a short delay to allow for cascade effect
      const timeout = setTimeout(() => {
        setDisplayValue(value);
        setTimeout(() => setIsAnimating(false), 300);
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [value, displayValue]);

  return (
    <div className="flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-600/30 rounded-lg p-1 sm:p-2 text-center group hover:border-slate-500/50 transition-all duration-300 hover:bg-slate-800/30">
      <div className={`text-lg sm:text-xl md:text-2xl font-mono font-bold mb-0 sm:mb-1 tabular-nums transition-all duration-300 ${
        isAnimating
          ? 'text-emerald-300 scale-110 transform'
          : 'text-emerald-400 group-hover:text-emerald-300'
        }`}>
        {displayValue}
      </div>
      <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
        {translate(language, label.toLowerCase())}
      </div>
    </div>
  );
};

const AddInline = ({ placeholder, onAdd, buttonText = "Додати", language = 'EN' }: { placeholder?: string; onAdd: (text:string)=>void; buttonText?: string; language?: string }) => {
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
        <strong>{translate(language,'tipLabel')}</strong> {translate(language, 'useShiftEnter')}
      </div>
    </div>
  );
};

const ChecklistTile = ({ title, checked, onChange, infoContent, example, icon, language = 'EN' }: { title:string; checked:boolean; onChange:(v:boolean)=>void; infoContent?:string; example?:string; icon?:any; language?:string }) => {
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
            className="text-slate-300 hover:text-slate-100 hover:bg-slate-700/10 backdrop-blur-sm border border-slate-600/30 px-3 py-1 rounded-lg font-semibold"
          >
            {showInfo ? translate(language,'hide') : translate(language,'hint')}
          </Button>
        </div>
        {showInfo && (
          <div className="mt-4 p-4 bg-slate-900/5 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
            <p className="text-slate-200 text-sm mb-3 leading-relaxed font-medium">{infoContent}</p>
            {example && (
              <p className="text-slate-300 text-xs italic bg-slate-800/5 p-2 rounded-lg border border-slate-700/30">
                <strong>Приклад:</strong> {example}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};


// Definition of Done Editor Component
const DefinitionOfDoneEditor = ({
  definitionOfDone,
  definitionOfDoneList,
  onDefinitionChange,
  onListChange,
  language = 'EN'
}: {
  definitionOfDone: string;
  definitionOfDoneList: DoD[];
  onDefinitionChange: (value: string) => void;
  onListChange: (list: DoD[]) => void;
  language?: string;
}) => {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      const newDoD: DoD = {
        id: Date.now().toString(),
        text: newItem.trim(),
        completed: false
      };
      onListChange([...definitionOfDoneList, newDoD]);
      setNewItem('');
    }
  };

  const removeItem = (id: string) => {
    onListChange(definitionOfDoneList.filter(item => item.id !== id));
  };

  const toggleItem = (id: string) => {
    onListChange(definitionOfDoneList.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const updateItem = (id: string, newText: string) => {
    onListChange(definitionOfDoneList.map(item =>
      item.id === id ? { ...item, text: newText } : item
    ));
  };

  return (
    <div className="space-y-2">
      {/* Legacy text area for backward compatibility */}
      <Textarea
        placeholder={translate(language, 'oofDefinitionPlaceholder')}
        value={definitionOfDone}
        onChange={(e) => onDefinitionChange(e.target.value)}
        className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
        rows={2}
      />

      {/* Checklist section */}
      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-600/50">
        <h4 className="text-slate-200 font-semibold mb-3 flex items-center">
          <span className="mr-2">✅</span>
          {translate(language, 'definitionOfDoneChecklist')}
        </h4>

        {/* Progress bar */}
        {definitionOfDoneList.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-300 text-sm font-medium">{translate(language, 'progress')}</span>
              <span className="text-slate-300 text-sm">
                {definitionOfDoneList.filter(item => item.completed).length}/{definitionOfDoneList.length} {translate(language, 'completed').toLowerCase()}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${definitionOfDoneList.length > 0 ? (definitionOfDoneList.filter(item => item.completed).length / definitionOfDoneList.length) * 100 : 0}%`
                }}
              ></div>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {Math.round((definitionOfDoneList.filter(item => item.completed).length / definitionOfDoneList.length) * 100)}% {translate(language, 'complete')}
            </div>
          </div>
        )}

        {/* Add new item */}
        <div className="flex gap-2 mb-3">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={translate(language, 'addNewCriterion')}
            className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
          />
          <Button onClick={addItem} size="sm" className="bg-emerald-600 hover:bg-emerald-500">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Checklist items */}
        <div className="space-y-2">
          {definitionOfDoneList.map((item) => (
            <div key={item.id} className="flex items-center gap-2 group">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item.id)}
                className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
              />
              <Input
                value={item.text}
                onChange={(e) => updateItem(item.id, e.target.value)}
                className={`flex-1 bg-slate-700 border-slate-600 text-slate-100 ${
                  item.completed ? 'line-through opacity-60' : ''
                }`}
              />
              <Button
                onClick={() => removeItem(item.id)}
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {definitionOfDoneList.length === 0 && (
          <p className="text-slate-400 text-sm italic">
            {translate(language, 'noCriteriaAdded')}
          </p>
        )}
      </div>
    </div>
  );
};

const DeepWorkOS_UA = ({ language = 'EN', onBackToCatalog }: { language?: string; onBackToCatalog?: () => void }) => {
   const t = (key: string) => (TRANSLATIONS[language] && TRANSLATIONS[language][key]) || TRANSLATIONS['EN'][key] || key;

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
    pauseStartTs: undefined,
    interruptions: 0,
    lastActivityTs: 0
  }));
  const [logs, setLogs] = useState<BlockLog[]>(() => ls.get('dw_logs', []));
  const [showSummary, setShowSummary] = useState(false);
  const [lastCompletedBlock, setLastCompletedBlock] = useState<BlockLog | null>(null);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
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
  const [showCreateOOF, setShowCreateOOF] = useState(false);

  // Domain management state
  const [customDomains, setCustomDomains] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('deepwork-custom-domains') || '[]');
    } catch {
      return [];
    }
  });
  const [showDomainManager, setShowDomainManager] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const [editingDomain, setEditingDomain] = useState<{index: number, name: string} | null>(null);
  
  // Get all available domains (default + custom)
  const getAllDomains = (): string[] => {
    const defaultDomains = ['Backend', 'Data', 'CS', 'SystemDesign', 'AlgoDS', 'Study', 'Discovery', 'Other'];
    return [...defaultDomains, ...customDomains];
  };

  // Helper function to get preferred default domain from localStorage
  const getPreferredDomain = (): Domain => {
    try {
      const stored = localStorage.getItem('deepwork-preferred-domain');
      const allDomains = getAllDomains();
      if (stored && allDomains.includes(stored)) {
        console.log('🔥 Using stored preferred domain:', stored);
        return stored as Domain;
      }
    } catch (error) {
      console.warn('Error reading preferred domain from localStorage:', error);
    }
    console.log('🔥 Using default domain: Discovery');
    return 'Discovery';
  };

  // Domain management functions
  const saveCustomDomains = (domains: string[]) => {
    try {
      localStorage.setItem('deepwork-custom-domains', JSON.stringify(domains));
      setCustomDomains(domains);
    } catch (error) {
      console.warn('Error saving custom domains:', error);
    }
  };

  const addCustomDomain = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName || getAllDomains().includes(trimmedName)) return;
    const newDomains = [...customDomains, trimmedName];
    saveCustomDomains(newDomains);
    setNewDomainName('');
  };

  const editCustomDomain = (index: number, newName: string) => {
    const trimmedName = newName.trim();
    if (!trimmedName || getAllDomains().filter((_, i) => i !== index + 8).includes(trimmedName)) return; // +8 to skip default domains
    const newDomains = [...customDomains];
    newDomains[index] = trimmedName;
    saveCustomDomains(newDomains);
    setEditingDomain(null);
  };

  const removeCustomDomain = (index: number) => {
    const newDomains = customDomains.filter((_, i) => i !== index);
    saveCustomDomains(newDomains);
  };

  // Helper function to save preferred domain to localStorage
  const savePreferredDomain = (domain: Domain) => {
    try {
      localStorage.setItem('deepwork-preferred-domain', domain);
      console.log('🔥 Saved preferred domain to localStorage:', domain);
    } catch (error) {
      console.warn('Error saving preferred domain to localStorage:', error);
    }
  };

  // Form states
  const [newOOF, setNewOOF] = useState(() => {
    const preferredDomain = getPreferredDomain();
    console.log('🔥 Initializing newOOF with preferred domain:', preferredDomain);
    return {
      title: '',
      domain: preferredDomain,
      priority: 'Medium' as Priority,
      estimatedMinutes: '90',
      definitionOfDone: '',
      definitionOfDoneList: [] as DoD[],
      constraints: '',
      firstStep: '',
      tags: [] as string[],
      difficulty: 5,
      energy: 5
    };
  });

  // When editingOOF is set, populate the form with its values
  useEffect(() => {
    if (editingOOF) {
      setNewOOF({
        title: editingOOF.title,
        domain: editingOOF.domain,
        priority: editingOOF.priority,
        estimatedMinutes: String(editingOOF.estimatedMinutes),
        definitionOfDone: editingOOF.definitionOfDone || '',
        definitionOfDoneList: editingOOF.definitionOfDoneList || [],
        constraints: editingOOF.constraints || '',
        firstStep: editingOOF.firstStep || '',
        tags: editingOOF.tags || [],
        difficulty: editingOOF.difficulty || 5,
        energy: editingOOF.energy || 5
      });
    } else {
      // reset to defaults when not editing, using preferred domain
      const preferredDomain = getPreferredDomain();
      console.log('🔥 Resetting form to defaults with preferred domain:', preferredDomain);
      setNewOOF({
        title: '',
        domain: preferredDomain,
        priority: 'Medium',
        estimatedMinutes: '90',
        definitionOfDone: '',
        definitionOfDoneList: [],
        constraints: '',
        firstStep: '',
        tags: [],
        difficulty: 3,
        energy: 3
      });
    }
  }, [editingOOF]);
  
  const [postBlockData, setPostBlockData] = useState({
    dq: 3,
    ou: 0,
    lr: 0,
    energy: 3,
    mood: 3,
    interruptions: 0,
    flowState: false,
    completedOOF: false
  });
  
  
  // Timer management
  const intervalRef = useRef<number | null>(null);
  const activityTimeoutRef = useRef<number | null>(null);

  // Quantum background refs
  const quantumMountRef = useRef<HTMLDivElement>(null);
  const quantumHelpMountRef = useRef<HTMLDivElement>(null);
  const quantumSceneRef = useRef<any>(null);
  
  // Persist state changes to localStorage
  useEffect(() => ls.set('dw_oofs', oofs), [oofs]);
  useEffect(() => ls.set('dw_parking', parking), [parking]);
  useEffect(() => ls.set('dw_checklists', checklists), [checklists]);
  useEffect(() => ls.set('dw_running', run), [run]);
  useEffect(() => ls.set('dw_logs', logs), [logs]);
  useEffect(() => ls.set('dw_settings', settings), [settings]);
  useEffect(() => ls.set('dw_starred', starredOOFs), [starredOOFs]);


  // Quantum Background 3D Scene Setup
  useEffect(() => {
    if (!quantumMountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create dark cosmic background
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;

    const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, '#020308');
    gradient.addColorStop(0.5, '#010203');
    gradient.addColorStop(1, '#000000');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;
    renderer.setClearColor(0x000000, 1);

    quantumMountRef.current.appendChild(renderer.domElement);
    quantumSceneRef.current = { scene, camera, renderer };

    camera.position.set(0, 0, 80);
    camera.lookAt(0, 0, 0);

    // Smaller quantum particles for DeepWork focus
    const quantumParticles = [];
    const quantumCount = 30; // Fewer particles for focus

    const noise = (x, y, z, t) => {
      return Math.sin(x * 0.01 + t) * Math.cos(y * 0.01 + t) * Math.sin(z * 0.01 + t * 0.5);
    };

    for (let i = 0; i < quantumCount; i++) {
      const particle = {
        basePosition: new THREE.Vector3(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100
        ),
        uncertainty: Math.random() * 3 + 1,
        wavePhase: Math.random() * Math.PI * 2,
        quantumNumber: Math.floor(Math.random() * 3) + 1
      };

      const geometry = new THREE.SphereGeometry(0.15, 6, 6);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(
          0.6 + particle.quantumNumber * 0.1, // Blue-purple range for focus
          0.7,
          0.5
        ),
        transparent: true,
        opacity: 0.6
      });

      particle.mesh = new THREE.Mesh(geometry, material);
      particle.mesh.position.copy(particle.basePosition);

      quantumParticles.push(particle);
      scene.add(particle.mesh);
    }

    // Animation loop - slower for focus
    let lastTime = 0;
    const animate = (currentTime) => {
      if (currentTime - lastTime >= 50) { // 20 FPS for calm effect
        lastTime = currentTime;

        const time = Date.now() * 0.0005; // Slower time

        quantumParticles.forEach((particle, index) => {
          const uncertaintyX = noise(particle.basePosition.x, 0, 0, time + particle.wavePhase) * particle.uncertainty;
          const uncertaintyY = noise(0, particle.basePosition.y, 0, time + particle.wavePhase) * particle.uncertainty;
          const uncertaintyZ = noise(0, 0, particle.basePosition.z, time + particle.wavePhase) * particle.uncertainty;

          particle.mesh.position.set(
            particle.basePosition.x + uncertaintyX,
            particle.basePosition.y + uncertaintyY,
            particle.basePosition.z + uncertaintyZ
          );

          const waveFunction = Math.sin(time * particle.quantumNumber + particle.wavePhase);
          particle.mesh.material.opacity = 0.2 + Math.abs(waveFunction) * 0.4;

          const hue = 0.6 + particle.quantumNumber * 0.1 + Math.sin(time * 0.3) * 0.05;
          particle.mesh.material.color.setHSL(hue, 0.7, 0.5);
        });

        // Gentle camera movement
        const cameraTime = Date.now() * 0.0003;
        camera.position.x = Math.sin(cameraTime) * 3;
        camera.position.y = Math.cos(cameraTime * 0.7) * 2;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
      }
      requestAnimationFrame(animate);
    };

    animate(0);

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (quantumMountRef.current && renderer.domElement) {
        quantumMountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Quantum Background for Help Guide
  useEffect(() => {
    if (!quantumHelpMountRef.current || !showHelpGuide) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create starfield background
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSIjMDAwMDAwIi8+CjxjaXJjbGUgY3g9IjEyOCIgY3k9IjEyOCIgcj0iMiIgZmlsbD0iIzMzNDc2NiIvPgo8Y2lyY2xlIGN4PSI2NCIgY3k9IjY0IiByPSIxIiBmaWxsPSIjNDc1NTY5Ii8+CjxjaXJjbGUgY3g9IjE5MiIgY3k9IjE5MiIgcj0iMSIgZmlsbD0iIzQ3NTU2OSIvPgo8Y2lyY2xlIGN4PSI2NCIgY3k9IjE5MiIgcj0iMSIgZmlsbD0iIzMzNDc2NiIvPgo8Y2lyY2xlIGN4PSIxOTIiIGN5PSI2NCIgcj0iMSIgZmlsbD0iIzMzNDc2NiIvPgo8Y2lyY2xlIGN4PSIzMiIgY3k9IjEyOCIgcj0iMSIgZmlsbD0iIzQ3NTU2OSIvPgo8Y2lyY2xlIGN4PSIyMjQiIGN5PSIxMjgiIHI9IjEiIGZpbGw9IiM0NzU1NjkiLz4KPGNpcmNsZSBjeD0iMTI4IiBjeT0iMzIiIHI9IjEiIGZpbGw9IiMzMzQ3NjYiLz4KPGNpcmNsZSBjeD0iMTI4IiBjeT0iMjI0IiByPSIxIiBmaWxsPSIjMzM0NzY2Ii8+Cjwvc3ZnPgo=');
    scene.background = texture;
    renderer.setClearColor(0x000000, 1);

    quantumHelpMountRef.current.appendChild(renderer.domElement);

    camera.position.set(0, 0, 80);

    // Create quantum particles
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.3 + 0.5, 0.7, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Animation
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      particleSystem.rotation.x += 0.001;
      particleSystem.rotation.y += 0.002;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (quantumHelpMountRef.current && renderer.domElement) {
        quantumHelpMountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [showHelpGuide]);

  // Background-resistant timer using timestamps
  useEffect(() => {
    if (run.active && !run.paused) {
      intervalRef.current = window.setInterval(() => {
        setRun(prev => {
          // Calculate elapsed time based on actual timestamps, not increment
          const now = Date.now();
          // Don't count time while currently paused
          const currentPausedTime = prev.paused && prev.pauseStartTs ?
            now - prev.pauseStartTs : 0;
          const totalPausedMs = (prev.pausedTime * 1000) + currentPausedTime;
          const realElapsedMs = now - prev.startTs - totalPausedMs;
          const realElapsedSec = Math.max(0, Math.floor(realElapsedMs / 1000));


          return {
            ...prev,
            elapsedSec: realElapsedSec,
            lastActivityTs: now
          };
        });
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

  // Page Visibility API - force timer update when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && run.active) {
        // Force immediate timer update when page becomes visible
        setRun(prev => {
          const now = Date.now();
          const currentPausedTime = prev.paused && prev.pauseStartTs ?
            now - prev.pauseStartTs : 0;
          const totalPausedMs = (prev.pausedTime * 1000) + currentPausedTime;
          const realElapsedMs = now - prev.startTs - totalPausedMs;
          const realElapsedSec = Math.max(0, Math.floor(realElapsedMs / 1000));

          return {
            ...prev,
            elapsedSec: realElapsedSec,
            lastActivityTs: now
          };
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [run.active, run.startTs, run.pausedTime, run.paused, run.pauseStartTs]);

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
      setCopyStatus(translate(language, 'copyStatus'));
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
      setCopyStatus(successful ? translate(language, 'copyStatus') : translate(language, 'copyFailed'));
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
      estimatedMinutes: parseInt(String(newOOF.estimatedMinutes)) || 90,
      actualMinutes: 0,
      definitionOfDone: newOOF.definitionOfDone.trim() || undefined,
      definitionOfDoneList: newOOF.definitionOfDoneList.length > 0 ? newOOF.definitionOfDoneList : undefined,
      constraints: newOOF.constraints.trim() || undefined,
      firstStep: newOOF.firstStep.trim() || undefined,
      planned: true,
      createdAt: Date.now(),
      tags: newOOF.tags,
      difficulty: newOOF.difficulty,
      energy: newOOF.energy
    };

    setOofs(prev => [oof, ...prev]);

    // Save the selected domain as the new preferred default
    savePreferredDomain(oof.domain);

    // Auto-collapse Create OOF section and ensure new OOF is visible
    setShowCreateOOF(false);
    setOofFilter('all');

    console.log('🔥 After adding OOF, resetting form with preferred domain:', oof.domain);
    setNewOOF({
      title: '',
      domain: oof.domain,
      priority: 'Medium',
      estimatedMinutes: '90',
      definitionOfDone: '',
      constraints: '',
      firstStep: '',
      tags: [],
      difficulty: 5,
      energy: 5
    });
  };

  const saveOrUpdateOOF = () => {
    if (editingOOF) {
      const updated: OOF = {
        ...editingOOF,
        title: newOOF.title.trim(),
        domain: newOOF.domain,
        priority: newOOF.priority,
        estimatedMinutes: parseInt(String(newOOF.estimatedMinutes)) || 90,
        definitionOfDone: newOOF.definitionOfDone.trim() || undefined,
        definitionOfDoneList: newOOF.definitionOfDoneList.length > 0 ? newOOF.definitionOfDoneList : undefined,
        constraints: newOOF.constraints.trim() || undefined,
        firstStep: newOOF.firstStep.trim() || undefined,
        tags: newOOF.tags,
        difficulty: newOOF.difficulty,
        energy: newOOF.energy
      };
      updateOOF(updated);
    } else {
      addOOF();
    }
  };
  
  const updateOOF = (updatedOOF: OOF) => {
    setOofs(prev => prev.map(o => o.id === updatedOOF.id ? updatedOOF : o));
    setEditingOOF(null);
  };

  const updateOOFDoD = (oofId: string, dodList: DoD[]) => {
    setOofs(prev => prev.map(oof =>
      oof.id === oofId
        ? { ...oof, definitionOfDoneList: dodList }
        : oof
    ));
  };
  
  const deleteOOF = (id: string) => {
    setOofs(prev => prev.filter(o => o.id !== id));
    setStarredOOFs(prev => prev.filter(sid => sid !== id));
  };
  
  const toggleStarOOF = (id: string) => {
    const isCurrentlyStarred = starredOOFs.includes(id);

    setStarredOOFs(prev =>
      isCurrentlyStarred
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );

    // If starring an OOF, set it as the active timer OOF
    if (!isCurrentlyStarred) {
      const oof = oofs.find(o => o.id === id);
      if (oof) {
        console.log('🌟 Starring OOF:', oof.title);
        setRun(prev => {
          const newState = {
            ...prev,
            oofId: oof.id,
            oofTitle: oof.title || ''
          };
          console.log('🌟 Updated run state:', newState);
          return newState;
        });
      }
    } else {
      console.log('⭐ Unstarring OOF with id:', id);
      // When unstarring, clear the selected OOF
      setRun(prev => ({
        ...prev,
        oofId: undefined,
        oofTitle: ''
      }));
    }
  };
  
  // Enhanced timer operations
  const startBlock = (oof: OOF | null, minutes: number) => {
    const blockId = generateId();
    setRun({
      active: true,
      blockId,
      oofId: oof?.id,
      oofTitle: oof?.title || translate(language, 'freeMode'),
      targetMinutes: minutes,
      startTs: Date.now(),
      paused: false,
      elapsedSec: 0,
      pausedTime: 0,
      pauseStartTs: undefined,
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
    
    setActiveTab('parking');
  };
  
  const togglePause = () => {
    setRun(prev => {
      const now = Date.now();
      if (prev.paused) {
        // Resuming - add the paused duration to total paused time
        const pauseDuration = prev.pauseStartTs ? now - prev.pauseStartTs : 0;
        return {
          ...prev,
          paused: false,
          pausedTime: prev.pausedTime + Math.floor(pauseDuration / 1000),
          pauseStartTs: undefined
        };
      } else {
        // Pausing - record when pause started
        return {
          ...prev,
          paused: true,
          pauseStartTs: now
        };
      }
    });
  };
  
  const resetTimer = () => {
    setRun(prev => ({
      ...prev,
      elapsedSec: 0,
      pausedTime: 0,
      pauseStartTs: undefined,
      interruptions: 0,
      startTs: Date.now() // Reset start time too
    }));
  };
  
  const stopBlock = useCallback(() => {
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
      interruptions: postBlockData.interruptions,
      flowState: postBlockData.flowState,
      completedOOF: postBlockData.completedOOF
    };

    setLogs(prev => [blockLog, ...prev]);

    // Show summary screen
    setLastCompletedBlock(blockLog);
    setShowSummary(true);

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
      pauseStartTs: undefined,
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
  }, [run.targetMinutes, run.elapsedSec, run.blockId, run.startTs, run.oofId, run.oofTitle, postBlockData, setLogs, setLastCompletedBlock, setShowSummary, setOofs, setRun, setPostBlockData, setChecklists, setActiveTab]);

  // Auto-complete timer when it reaches 00:00:00
  useEffect(() => {
    if (run.active && !run.paused) {
      const targetSec = run.targetMinutes * 60;
      if (run.elapsedSec >= targetSec) {
        // Timer has reached completion (00:00:00)
        setTimeout(() => {
          stopBlock();
        }, 100); // Small delay to ensure state updates first
      }
    }
  }, [run.active, run.paused, run.elapsedSec, run.targetMinutes, stopBlock]);

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
  
  // Show summary if available
  if (showSummary && lastCompletedBlock) {
    return (
      <PostBlockSummary
        block={lastCompletedBlock}
        analytics={analytics}
        settings={settings}
        parking={parking}
        onStartNew={() => {
          setShowSummary(false);
          setActiveTab('focus');
        }}
        onViewAnalytics={() => {
          setShowSummary(false);
          setActiveTab('analytics');
        }}
        onClose={() => {
          setShowSummary(false);
        }}
        language={language}
      />
    );
  }

  // Help Guide Component
  if (showHelpGuide) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" style={{ backgroundColor: '#000000' }}>
        {/* Quantum Background for Help Guide */}
        <div
          ref={quantumHelpMountRef}
          className="fixed inset-0"
          style={{ pointerEvents: 'none', zIndex: 0 }}
        />

        <div className="bg-transparent border border-slate-700/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative z-10">
          <div className="sticky top-0 bg-slate-800/20 backdrop-blur-sm border-b border-slate-700/30 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-50 flex items-center space-x-2">
                <Brain className="w-7 h-7 text-indigo-400" />
                <span>{translate(language, 'helpGuideTitle')}</span>
              </h1>
              <Button
                onClick={() => setShowHelpGuide(false)}
                className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {translate(language, 'closeGuide')}
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* User Flow Section */}
            <div>
              <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center space-x-2">
                <Target className="w-6 h-6 text-emerald-400" />
                <span>{translate(language, 'userFlowTitle')}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-4">
                  <h3 className="font-semibold text-emerald-300 mb-2">{translate(language, 'userFlowStep1')}</h3>
                  <p className="text-slate-300 text-sm">{translate(language, 'userFlowStep1Desc')}</p>
                </div>
                <div className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-300 mb-2">{translate(language, 'userFlowStep2')}</h3>
                  <p className="text-slate-300 text-sm">{translate(language, 'userFlowStep2Desc')}</p>
                </div>
                <div className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-4">
                  <h3 className="font-semibold text-amber-300 mb-2">{translate(language, 'userFlowStep3')}</h3>
                  <p className="text-slate-300 text-sm">{translate(language, 'userFlowStep3Desc')}</p>
                </div>
                <div className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-300 mb-2">{translate(language, 'userFlowStep4')}</h3>
                  <p className="text-slate-300 text-sm">{translate(language, 'userFlowStep4Desc')}</p>
                </div>
              </div>
            </div>

            {/* System Features Section */}
            <div>
              <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center space-x-2">
                <Zap className="w-6 h-6 text-indigo-400" />
                <span>{translate(language, 'systemFeaturesTitle')}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-700/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-semibold text-indigo-200">{translate(language, 'feature1')}</h3>
                  </div>
                  <p className="text-slate-300 text-sm">{translate(language, 'feature1Desc')}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-700/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Timer className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-semibold text-emerald-200">{translate(language, 'feature2')}</h3>
                  </div>
                  <p className="text-slate-300 text-sm">{translate(language, 'feature2Desc')}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-700/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <NotebookPen className="w-5 h-5 text-amber-400" />
                    <h3 className="font-semibold text-amber-200">{translate(language, 'feature3')}</h3>
                  </div>
                  <p className="text-slate-300 text-sm">{translate(language, 'feature3Desc')}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-700/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-blue-200">{translate(language, 'feature4')}</h3>
                  </div>
                  <p className="text-slate-300 text-sm">{translate(language, 'feature4Desc')}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-700/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <HelpCircle className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-purple-200">{translate(language, 'feature5')}</h3>
                  </div>
                  <p className="text-slate-300 text-sm">{translate(language, 'feature5Desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[400px] text-slate-100 py-1" style={{ backgroundColor: '#000000' }}>
      {/* Quantum Background */}
      {!showHelpGuide && (
        <div
          ref={quantumMountRef}
          className="fixed inset-0"
          style={{ pointerEvents: 'none', zIndex: 0 }}
        />
      )}
      {/* Enhanced Header with Quick Stats */}
      <div className="bg-transparent border-b border-slate-600/20 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-3xl mx-auto px-2 py-1">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-1 lg:space-y-0">
            <div>
              <h1 className="text-xl font-bold text-slate-50 flex items-center space-x-2">
                <Brain className="w-6 h-6 text-indigo-400" />
                <span>Deep Work OS</span>
              </h1>
              <p className="text-slate-300 mt-0 text-sm">{translate(language, 'intelligentProductivitySystem')}</p>
            </div>

            <div className="flex flex-col items-end w-full lg:w-auto">
              <div className="flex flex-row items-center gap-3 mb-3">
                <Button
                  onClick={() => setShowHelpGuide(true)}
                  className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-400/30 text-emerald-300 hover:text-emerald-200 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 font-semibold"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {translate(language,'learnSystem')}
                </Button>
                <Button
                  onClick={() => onBackToCatalog ? onBackToCatalog() : window.location.href = '/'}
                  className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-400/30 text-indigo-300 hover:text-indigo-200 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {translate(language,'backToHome')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm(translate(language,'resetConfirm')) ) {
                      setLogs([]);
                      setOofs(prev => prev.map(o => ({ ...o, actualMinutes: 0, completedAt: undefined })));
                      setStarredOOFs([]);
                      setPostBlockData({ dq: 3, ou: 0, lr: 0, energy: 3, mood: 3, interruptions: 0, flowState: false, completedOOF: false, notes: '' });
                      setChecklists({
                        pre: { oof: false, tabs: false, notifications: false, prep: false, energy: false },
                        during: { singleTask: false, scratchpad: false, stuckRule: false, hydration: false },
                        post: { artifact: false, summary: false, nextStep: false, reflect: false }
                      });
                    }
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  {translate(language,'resetData')}
                </Button>
              </div>
              <QuickStats logs={logs} className="lg:w-auto w-full" language={language} onResetData={() => {
                // delegate to parent reset logic
                if (confirm(translate(language,'resetConfirm'))) {
                  setLogs([]);
                  setOofs(prev => prev.map(o => ({ ...o, actualMinutes: 0, completedAt: undefined })));
                  setStarredOOFs([]);
                }
              }} />
            </div>
          </div>
          
          {/* Selected OOF Card - Always Visible */}
          {run.oofId && (
            <div className="mt-2">
              {(() => {
                const selectedOOF = oofs.find(o => o.id === run.oofId);
                if (selectedOOF) {
                  return (
                    <EnhancedOOFCard
                      oof={selectedOOF}
                      onStart={startBlock}
                      onEdit={setEditingOOF}
                      onDelete={deleteOOF}
                      onToggleStar={toggleStarOOF}
                      onUpdateDoD={updateOOFDoD}
                      isStarred={starredOOFs.includes(selectedOOF.id)}
                      language={language}
                    />
                  );
                }
                return null;
              })()}
            </div>
          )}


          {/* Active Timer - Show when running */}
          {run.active && (
            <div className="mt-2">
              <SmartTimer
                run={run}
                onTogglePause={togglePause}
                onReset={resetTimer}
                onStop={stopBlock}
                elapsedSec={run.elapsedSec}
                language={language}
              />
            </div>
          )}

          {/* Timer Section - Always Visible */}
          <div className="space-y-2 mt-2">
            {!run.active ? (
              <Card className="bg-slate-800/5 backdrop-blur-md border-slate-600/40 shadow-2xl">
                <CardContent className="pt-8">
                  <div className="text-center space-y-2">
                    <div className="space-y-2">
                      <Clock className="w-16 h-16 text-slate-300 mx-auto" />
                      <h3 className="text-xl font-semibold text-slate-100 mb-1">{translate(language, 'readyToStart')}</h3>
                      <p className="text-slate-300">{translate(language, 'chooseTask')}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 px-4">
                      <Button
                        onClick={() => startBlock(null, 25)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex-1 sm:flex-none"
                        size="lg"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        <span className="whitespace-nowrap">{translate(language,'pomodoro25')}</span>
                      </Button>
                      <Button
                        onClick={() => startBlock(null, 60)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex-1 sm:flex-none"
                        size="lg"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        <span className="whitespace-nowrap">{translate(language,'standard60')}</span>
                      </Button>
                      <Button
                        onClick={() => startBlock(null, 90)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex-1 sm:flex-none"
                        size="lg"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        <span className="whitespace-nowrap">{translate(language,'deep90')}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {/* Enhanced Hints */}
                <Card className="bg-gradient-to-r from-slate-800/60 to-slate-700/40 backdrop-blur-sm border border-slate-600/50 shadow-xl">
                  <CardContent className="pt-5">
                    <Button
                      variant="ghost"
                      onClick={() => setShowHints(!showHints)}
                      className="w-full justify-between text-slate-100 hover:text-slate-50 hover:bg-slate-700/10 p-4 rounded-lg border border-slate-600/30"
                    >
                      <span className="flex items-center font-semibold">
                        <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                        {t('smartHintsTitle')}
                      </span>
                      {showHints ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>

                    {showHints && (
                      <div className="mt-2 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-700/50 shadow-lg">
                            <CardContent className="pt-5">
                              <h4 className="text-emerald-300 font-bold mb-3 flex items-center text-lg">
                                <Zap className="w-5 h-5 mr-2" />
                                {t('microExperiment')}
                              </h4>
                              <p className="text-slate-200 text-sm mb-4 leading-relaxed">
                                {t('microExperimentDesc')}
                              </p>
                              <ul className="text-slate-300 text-sm space-y-2">
                                <li className="flex items-start"><span className="text-emerald-400 mr-2">•</span>{t('microTip1')}</li>
                                <li className="flex items-start"><span className="text-emerald-400 mr-2">•</span>{t('microTip2')}</li>
                                <li className="flex items-start"><span className="text-emerald-400 mr-2">•</span>{t('microTip3')}</li>
                                <li className="flex items-start"><span className="text-emerald-400 mr-2">•</span>{t('microTip4')}</li>
                              </ul>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-amber-900/30 to-orange-800/20 border border-amber-700/50 shadow-lg">
                            <CardContent className="pt-5">
                              <h4 className="text-amber-300 font-bold mb-3 flex items-center text-lg">
                                <NotebookPen className="w-5 h-5 mr-2" />
                                {t('distractionManagement')}
                              </h4>
                              <p className="text-slate-200 text-sm mb-4 leading-relaxed">
                                {t('distractionDesc')}
                              </p>
                              <ul className="text-slate-300 text-sm space-y-2">
                                <li className="flex items-start"><span className="text-amber-400 mr-2">•</span>{t('distractionTip1')}</li>
                                <li className="flex items-start"><span className="text-amber-400 mr-2">•</span>{t('distractionTip2')}</li>
                                <li className="flex items-start"><span className="text-amber-400 mr-2">•</span>{t('distractionTip3')}</li>
                                <li className="flex items-start"><span className="text-amber-400 mr-2">•</span>{t('distractionTip4')}</li>
                              </ul>
                            </CardContent>
                          </Card>
                        </div>

                        <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/25 border border-blue-700/50 shadow-xl">
                          <CardContent className="pt-5">
                            <h4 className="text-blue-300 font-bold mb-3 flex items-center text-lg">
                              <Brain className="w-5 h-5 mr-2" />
                              {translate(language, 'flowState')} (Flow State)
                            </h4>
                            <p className="text-slate-200 text-sm leading-relaxed">
                              <strong>{translate(language, 'flowStateSigns')}</strong> {translate(language, 'flowDescription')},
                              {translate(language, 'flowDescriptionFull')}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Enhanced During Checklists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Hint blocks removed as requested */}
                </div>

              </div>
            )}
          </div>

          {/* Enhanced Tab Navigation - Mobile Responsive */}
          <div className="mt-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 bg-slate-800/5 backdrop-blur-md border border-slate-600/50 w-full gap-0.5 md:gap-1 h-auto p-1">
                <TabsTrigger value="focus" className="data-[state=active]:bg-slate-600 data-[state=active]:text-slate-50 text-slate-300 hover:text-slate-200 flex flex-col md:flex-row items-center justify-center py-2 md:py-1 px-1 md:px-3 text-xs md:text-sm min-h-[3rem] md:min-h-0">
                  <Target className="w-4 h-4 mb-1 md:mb-0 md:mr-1" />
                  <span>{translate(language,'tabFocus')}</span>
                </TabsTrigger>
                <TabsTrigger value="parking" className="data-[state=active]:bg-slate-600 data-[state=active]:text-slate-50 text-slate-300 hover:text-slate-200 flex flex-col md:flex-row items-center justify-center py-2 md:py-1 px-1 md:px-3 text-xs md:text-sm min-h-[3rem] md:min-h-0">
                  <NotebookPen className="w-4 h-4 mb-1 md:mb-0 md:mr-1" />
                  <span>{translate(language,'tabParking')}</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-600 data-[state=active]:text-slate-50 text-slate-300 hover:text-slate-200 flex flex-col md:flex-row items-center justify-center py-2 md:py-1 px-1 md:px-3 text-xs md:text-sm min-h-[3rem] md:min-h-0">
                  <BarChart3 className="w-4 h-4 mb-1 md:mb-0 md:mr-1" />
                  <span>{translate(language,'tabAnalytics')}</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-slate-600 data-[state=active]:text-slate-50 text-slate-300 hover:text-slate-200 flex flex-col md:flex-row items-center justify-center py-2 md:py-1 px-1 md:px-3 text-xs md:text-sm min-h-[3rem] md:min-h-0">
                  <Settings className="w-4 h-4 mb-1 md:mb-0 md:mr-1" />
                  <span>{translate(language,'tabSettings')}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>


          {/* Tab Content Sections */}
          <div className="mt-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="mt-1 max-w-3xl mx-auto">
                {/* Tasks Tab - Enhanced OOF Management */}
                <TabsContent value="focus" className="space-y-2">
                  {/* OOF Creation Form */}
                  <Card className="bg-slate-800/5 backdrop-blur-md border-slate-600/40 shadow-2xl">
                    <CardHeader className="bg-slate-700/5 backdrop-blur-md border-b border-slate-600/40">
                      <CardTitle
                        className="text-slate-50 flex items-center justify-between cursor-pointer hover:text-slate-100 transition-colors"
                        onClick={() => setShowCreateOOF(!showCreateOOF)}
                      >
                        <div className="flex items-center space-x-2">
                          <Target className="w-5 h-5 text-indigo-400" />
                          <span>{translate(language,'createOOF')}</span>
                        </div>
                        {showCreateOOF ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    {showCreateOOF && (
                    <CardContent className="space-y-2 pt-2">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Input
                            placeholder={translate(language,'oofTitlePlaceholder')}
                            value={newOOF.title}
                            onChange={(e) => setNewOOF(prev => ({ ...prev, title: e.target.value }))}
                            className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-indigo-500"
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-slate-200 text-sm font-medium">{translate(language,'domain')}</label>
                                <button
                                  type="button"
                                  onClick={() => setShowDomainManager(true)}
                                  className="text-xs text-indigo-400 hover:text-indigo-300 bg-slate-700 px-2 py-1 rounded border border-slate-600 hover:border-indigo-500 transition-colors"
                                >
                                  Manage
                                </button>
                              </div>
                              <select
                                value={newOOF.domain}
                                onChange={(e) => setNewOOF(prev => ({ ...prev, domain: e.target.value as Domain }))}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:border-indigo-500"
                              >
                                {getAllDomains().map(domain => (
                                  <option key={domain} value={domain}>
                                    {translateDomain(language, domain)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="text-slate-200 text-sm font-medium mb-1 block">{translate(language,'priority')}</label>
                              <select
                                value={newOOF.priority}
                                onChange={(e) => setNewOOF(prev => ({ ...prev, priority: e.target.value as Priority }))}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:border-indigo-500"
                              >
                                <option value="Low">{translatePriority(language, 'Low')}</option>
                                <option value="Medium">{translatePriority(language, 'Medium')}</option>
                                <option value="High">{translatePriority(language, 'High')}</option>
                                <option value="Critical">{translatePriority(language, 'Critical')}</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="text-slate-200 text-sm font-medium mb-1 block">{translate(language,'time')}</label>
                              <Input
                                type="number"
                                value={newOOF.estimatedMinutes as unknown as number}
                                onChange={(e) => setNewOOF(prev => ({ ...prev, estimatedMinutes: e.target.value }))}
                                className="bg-slate-700 border-slate-600 text-slate-100"
                              />
                            </div>
                            
                            <div>
                              <label className="text-slate-200 text-sm font-medium mb-1 block">{translate(language,'difficulty')}</label>
                              <div className="px-2 mt-2">
                                <Slider
                                  value={[newOOF.difficulty]}
                                  onValueChange={(vals) => setNewOOF(prev => ({ ...prev, difficulty: vals[0] }))}
                                  min={1}
                                  max={10}
                                  step={1}
                                  className="w-full [&>*]:bg-slate-600 [&_[role=slider]]:bg-indigo-500 [&_[role=slider]]:border-indigo-400 [&_[data-orientation=horizontal]]:h-2"
                                />
                              </div>
                              <div className="text-center text-slate-300 text-sm mt-2 font-semibold">{newOOF.difficulty}/10</div>
                            </div>
                            
                            <div>
                              <label className="text-slate-200 text-sm font-medium mb-1 block">{translate(language,'energy')}</label>
                              <div className="px-2 mt-2">
                                <Slider
                                  value={[newOOF.energy]}
                                  onValueChange={(vals) => setNewOOF(prev => ({ ...prev, energy: vals[0] }))}
                                  min={1}
                                  max={10}
                                  step={1}
                                  className="w-full [&>*]:bg-slate-600 [&_[role=slider]]:bg-indigo-500 [&_[role=slider]]:border-indigo-400 [&_[data-orientation=horizontal]]:h-2"
                                />
                              </div>
                              <div className="text-center text-slate-300 text-sm mt-2 font-semibold">{newOOF.energy}/10</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <DefinitionOfDoneEditor
                            definitionOfDone={newOOF.definitionOfDone}
                            definitionOfDoneList={newOOF.definitionOfDoneList}
                            onDefinitionChange={(value) => setNewOOF(prev => ({ ...prev, definitionOfDone: value }))}
                            onListChange={(list) => setNewOOF(prev => ({ ...prev, definitionOfDoneList: list }))}
                            language={language}
                          />
                          
                          <Textarea
                            placeholder={translate(language, 'constraintsPlaceholder')}
                            value={newOOF.constraints}
                            onChange={(e) => setNewOOF(prev => ({ ...prev, constraints: e.target.value }))}
                            className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                            rows={2}
                          />
                          
                          <Input
                            placeholder={translate(language, 'firstStepPlaceholder')}
                            value={newOOF.firstStep}
                            onChange={(e) => setNewOOF(prev => ({ ...prev, firstStep: e.target.value }))}
                            className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                          />
                        </div>
                      </div>
                      
                          {editingOOF ? (
                            <div className="flex items-center space-x-3">
                              <Button onClick={saveOrUpdateOOF} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold" size="lg">
                                <Save className="w-4 h-4 mr-2" />
                                {translate(language,'save')}
                              </Button>
                              <Button onClick={() => { if (editingOOF) { deleteOOF(editingOOF.id); setEditingOOF(null); } }} className="bg-red-600 hover:bg-red-500 text-white font-semibold" size="lg">
                                <Trash2 className="w-4 h-4 mr-2" />
                                {translate(language,'delete')}
                              </Button>
                              <Button onClick={() => setEditingOOF(null)} variant="outline" className="text-slate-200 border-slate-600" size="lg">
                                Відмінити
                              </Button>
                            </div>
                          ) : (
                            <Button onClick={addOOF} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold" size="lg">
                              <Plus className="w-4 h-4 mr-2" />
                              {translate(language,'createOOF')}
                            </Button>
                          )}
                    </CardContent>
                    )}
                  </Card>

                  {/* Виправлений OOF Filter - темніший */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-transparent rounded-xl border border-slate-700/30 shadow-xl">
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
                            {filter === 'all' && `📋 ${translate(language, 'all')}`}
                            {filter === 'starred' && `⭐ ${translate(language, 'starred')}`}
                            {filter === 'high-priority' && `🔥 ${translate(language, 'highPriority')}`}
                            {filter === 'in-progress' && `⚡ ${translate(language, 'inProgress')}`}
                            {filter === 'completed' && `✅ ${translate(language, 'completed')}`}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-slate-200 text-sm font-semibold bg-slate-800/10 px-4 py-2 rounded-lg border border-slate-700/50 shadow-md">
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
                        onUpdateDoD={updateOOFDoD}
                        isStarred={starredOOFs.includes(oof.id)}
                        language={language}
                      />
                    ))}
                  </div>
                </TabsContent>
                
                {/* Parking Tab - Enhanced Distraction Management */}
                <TabsContent value="parking" className="space-y-2">
                  <Card className="bg-slate-800/5 backdrop-blur-md border-slate-600/40 shadow-2xl">
                    <CardHeader className="bg-slate-700/5 backdrop-blur-md border-b border-slate-600/40">
                      <CardTitle className="text-slate-50 flex items-center space-x-2">
                        <NotebookPen className="w-5 h-5 text-amber-400" />
                        <span>{translate(language, 'smartParkingList')}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <SmartParkingList
                        parking={parking}
                        onAdd={addParking}
                        onToggle={setParkingDone}
                        onDelete={deleteParking}
                        onCategorize={categorizeParking}
                        currentBlockId={run.blockId}
                        language={language}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Analytics Tab - Enhanced Insights */}
                <TabsContent value="analytics" className="space-y-2">
                  {/* Key Metrics Dashboard */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <Card className="lg:col-span-2 bg-slate-800/5 backdrop-blur-md border-slate-600/40 shadow-2xl">
                      <CardHeader className="bg-slate-700/10">
                        <CardTitle className="text-slate-100 flex items-center space-x-2">
                          <Activity className="w-5 h-5 text-emerald-400" />
                          <span>{translate(language, 'todaysProductivity')}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                          <div className="text-center p-4 bg-emerald-900/20 border border-emerald-700/50 rounded-lg">
                            <div className="text-3xl font-bold text-emerald-300 mb-1">{Math.round(analytics.today.dh * 10) / 10}{t('hoursShort')}</div>
                            <div className="text-slate-200 text-sm font-medium mb-1">{translate(language, 'deepHours')}</div>
                            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                              <div 
                                className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(analytics.dailyGoalProgress, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="text-center p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                            <div className="text-3xl font-bold text-blue-300 mb-1">{analytics.today.avgDQ}</div>
                            <div className="text-slate-200 text-sm font-medium mb-1">{translate(language, 'avgDQ')}</div>
                            <div className="text-xs text-slate-300">{translate(language, 'qualityFocus')}</div>
                          </div>
                          
                          <div className="text-center p-4 bg-cyan-900/20 border border-cyan-700/50 rounded-lg">
                            <div className="text-3xl font-bold text-cyan-300 mb-1">{analytics.dwi}</div>
                            <div className="text-slate-200 text-sm font-medium mb-1">{translate(language, 'depthIndex')}</div>
                            <div className="text-xs text-slate-300">DH×DQ+OU+0.5×LR</div>
                          </div>
                          
                          <div className="text-center p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                            <div className="text-3xl font-bold text-purple-300 flex items-center justify-center mb-1">
                              {analytics.today.flowSessions > 0 && <Zap className="w-8 h-8 mr-1" />}
                              {analytics.today.flowSessions}
                            </div>
                            <div className="text-slate-200 text-sm font-medium mb-1">{translate(language, 'flowSessions')}</div>
                            <div className="text-xs text-slate-300">{translate(language, 'flowState')}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-800/5 backdrop-blur-md border-amber-600/50 shadow-xl shadow-amber-600/10">
                      <CardHeader className="bg-amber-900/20 border-b border-amber-700/50">
                        <CardTitle className="text-slate-100 flex items-center space-x-2">
                          <Award className="w-5 h-5 text-amber-400" />
                          <span>{translate(language, 'achievements')}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-2">
                        <div className="flex items-center justify-between p-4 bg-slate-700 border border-slate-600 rounded-lg">
                          <div>
                            <div className="text-slate-100 font-bold">{translate(language, 'dailyGoalLabel')}</div>
                            <div className="text-slate-300 text-sm">{settings.dailyGoal / 60}{t('hoursShort')} {translate(language, 'dailyGoalText')}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-300">{Math.round(analytics.dailyGoalProgress)}%</div>
                            {analytics.dailyGoalProgress >= 100 && <div className="text-sm text-emerald-300">🎉 {translate(language, 'achieved')}</div>}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-slate-700 border border-slate-600 rounded-lg">
                          <div>
                            <div className="text-slate-100 font-bold">Тижнева ціль</div>
                            <div className="text-slate-300 text-sm">{settings.weeklyGoal / 60}{t('hoursShort')} на тиждень</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-300">{Math.round(analytics.weeklyGoalProgress)}%</div>
                            {analytics.weeklyGoalProgress >= 100 && <div className="text-sm text-blue-300">🎉 {translate(language, 'achieved')}</div>}
                          </div>
                        </div>
                        
                        <div className="p-4 bg-slate-700 border border-slate-600 rounded-lg">
                          <div className="text-slate-100 font-semibold mb-1">{translate(language, 'bestTimeOfDay')}</div>
                          <div className="text-slate-200 text-lg capitalize bg-slate-800/5 backdrop-blur-md px-3 py-1 rounded inline-block">
                            {analytics.bestTimeOfDay === 'morning' && `🌅 ${translate(language, 'morning')}`}
                            {analytics.bestTimeOfDay === 'afternoon' && `☀️ ${translate(language, 'afternoon')}`}
                            {analytics.bestTimeOfDay === 'evening' && `🌙 ${translate(language, 'evening')}`}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Enhanced Charts */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    <Card className="bg-slate-800/5 backdrop-blur-md border-slate-600/40 shadow-2xl">
                      <CardHeader className="bg-slate-700/5 backdrop-blur-md border-b border-slate-600/40">
                        <CardTitle className="text-slate-50 flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5 text-indigo-400" />
                          <span>{translate(language, 'productivityDynamics')}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm">
                          <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={chartData}>
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
                                name={translate(language, 'deepHours')}
                              />
                              <Bar yAxisId="right" dataKey="DWI" fill="url(#dwiGradient)" name={translate(language, 'depthIndex')} opacity={0.8} radius={[4, 4, 0, 0]} />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-800/5 backdrop-blur-md border-slate-600/40 shadow-2xl">
                      <CardHeader className="bg-slate-700/5 backdrop-blur-md border-b border-slate-600/40">
                        <CardTitle className="text-slate-50 flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-emerald-400" />
                          <span>{translate(language, 'qualityMood')}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
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
                                name={translate(language, 'avgDQ')}
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
                  <Card className="bg-slate-800/5 backdrop-blur-md border-slate-600/40 shadow-2xl">
                    <CardHeader className="bg-slate-700/5 backdrop-blur-md border-b border-slate-600/40">
                      <CardTitle className="text-slate-50 flex items-center space-x-2">
                        <NotebookPen className="w-5 h-5 text-slate-400" />
                        <span>{translate(language, 'deepBlocksLog')}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-lg overflow-hidden">
                        <div className="overflow-x-auto max-h-[500px] pb-2">
                          <table className="min-w-[900px] w-full text-sm">
                            <thead className="sticky top-0 bg-slate-800/5 backdrop-blur-xl border-b-2 border-slate-600/50">
                              <tr>
                                <th className="text-left text-slate-100 pb-4 pt-4 px-4 font-bold">{translate(language, 'dateTime')}</th>
                                <th className="text-left text-slate-100 pb-4 pt-4 px-4 font-bold">{translate(language, 'oof')}</th>
                                <th className="text-left text-slate-100 pb-4 pt-4 px-4 font-bold">{translate(language, 'minutes')}</th>
                                <th className="text-left text-slate-100 pb-4 pt-4 px-4 font-bold">{translate(language, 'dq')}</th>
                                <th className="text-left text-slate-100 pb-4 pt-4 px-4 font-bold">ОВ</th>
                                <th className="text-left text-slate-100 pb-4 pt-4 px-4 font-bold">ПН</th>
                                <th className="text-left text-slate-100 pb-4 pt-4 px-4 font-bold">💫</th>
                                <th className="text-left text-slate-100 pb-4 pt-4 px-4 font-bold">Нотатки</th>
                              </tr>
                            </thead>
                            <tbody>
                              {logs.map((log, index) => (
                                <tr key={log.id} className={`border-b border-slate-700/50 transition-colors hover:bg-slate-800/30 ${index % 2 === 0 ? 'bg-slate-900/5' : ''}`}>
                                  <td className="py-4 px-4">
                                    <div className="text-slate-200 font-medium">{log.dateISO.slice(5)}</div>
                                    <div className="text-xs text-slate-400 capitalize bg-slate-800/10 px-2 py-1 rounded-md mt-1 inline-block">
                                      {log.timeOfDay === 'morning' && `🌅 ${translate(language, 'morning')}`}
                                      {log.timeOfDay === 'afternoon' && `☀️ ${translate(language, 'afternoon')}`}
                                      {log.timeOfDay === 'evening' && `🌙 ${translate(language, 'evening')}`}
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="text-slate-200 break-words max-w-[200px] font-medium">{log.oofTitle}</div>
                                    {log.completedOOF && <span className="text-emerald-400 text-xs font-semibold bg-emerald-900/30 px-2 py-1 rounded-md mt-1 inline-block">✅ {translate(language, 'completed')}</span>}
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="text-slate-200 font-semibold bg-slate-800/10 px-2 py-1 rounded-md">{log.minutes}</span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="text-slate-200 font-semibold bg-slate-800/10 px-2 py-1 rounded-md">{log.dq}</span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="text-slate-200 font-semibold bg-slate-800/10 px-2 py-1 rounded-md">{log.ou}</span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="text-slate-200 font-semibold bg-slate-800/10 px-2 py-1 rounded-md">{log.lr}</span>
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    {log.flowState && (
                                      <span className="text-purple-400 text-xl bg-purple-900/30 p-2 rounded-lg inline-block">⚡</span>
                                    )}
                                  </td>
                                  <td className="py-4 px-4 text-slate-300 break-words max-w-[300px] leading-relaxed">
                                    {log.notes ? (
                                      <div className="bg-slate-800/5 p-2 rounded-lg border border-slate-700/30">
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
                
                
                {/* Settings Tab - System Configuration */}
                <TabsContent value="settings" className="space-y-2">
                  <Card className="bg-slate-800/5 backdrop-blur-md border-slate-600/40 shadow-2xl">
                    <CardHeader className="bg-slate-700/5 backdrop-blur-md border-b border-slate-600/40">
                      <CardTitle className="text-slate-50 flex items-center space-x-2">
                        <Settings className="w-5 h-5 text-slate-400" />
                        <span>{translate(language, 'systemSettings')}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-2">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <h4 className="text-slate-100 font-bold text-lg mb-4 flex items-center">
                            <Settings className="w-5 h-5 mr-2 text-indigo-400" />
                            {translate(language, 'basicSettings')}
                          </h4>
                          
                          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-slate-700/80 to-slate-600/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
                            <div>
                              <div className="text-slate-100 font-bold">{translate(language, 'notifications')}</div>
                              <div className="text-slate-300 text-sm">{translate(language, 'showReminders')}</div>
                            </div>
                            <Switch
                              checked={settings.notifications}
                              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                              className="data-[state=checked]:bg-indigo-600"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-slate-700/80 to-slate-600/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
                            <div>
                              <div className="text-slate-100 font-bold">{translate(language, 'soundSignals')}</div>
                              <div className="text-slate-300 text-sm">{translate(language, 'soundOnComplete')}</div>
                            </div>
                            <Switch
                              checked={settings.soundEnabled}
                              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundEnabled: checked }))}
                              className="data-[state=checked]:bg-indigo-600"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-slate-700/80 to-slate-600/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
                            <div>
                              <div className="text-slate-100 font-bold">{translate(language, 'autoBreaks')}</div>
                              <div className="text-slate-300 text-sm">{translate(language, 'suggestBreaks')}</div>
                            </div>
                            <Switch
                              checked={settings.autoBreaks}
                              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoBreaks: checked }))}
                              className="data-[state=checked]:bg-indigo-600"
                            />
                          </div>
                          
                          <div className="space-y-3 p-2 bg-gradient-to-r from-slate-700/80 to-slate-600/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
                            <label className="text-slate-100 text-sm font-bold mb-3 block">{translate(language, 'defaultDuration')}</label>
                            <select
                              value={settings.preferredBlockSize}
                              onChange={(e) => setSettings(prev => ({ ...prev, preferredBlockSize: parseInt(e.target.value) }))}
                              className="w-full bg-slate-800/10 border border-slate-600/50 rounded-lg px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value={25}>25 хвилин (Pomodoro)</option>
                              <option value={60}>60 хвилин</option>
                              <option value={90}>90 хвилин</option>
                              <option value={120}>120 хвилин</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-slate-100 font-bold text-lg mb-4 flex items-center">
                            <Target className="w-5 h-5 mr-2 text-emerald-400" />
                            {translate(language, 'goalsMetrics')}
                          </h4>
                          
                          <div className="space-y-3 p-2 bg-gradient-to-r from-slate-700/80 to-slate-600/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
                            <label className="text-slate-100 text-sm font-bold">{translate(language, 'dailyGoal')}</label>
                            <Input
                              type="number"
                              value={settings.dailyGoal}
                              onChange={(e) => setSettings(prev => ({ ...prev, dailyGoal: parseInt(e.target.value) || 240 }))}
                              className="bg-slate-800/10 border-slate-600/50 text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                            <div className="text-slate-300 text-xs bg-slate-800/50 px-2 py-1 rounded-md">
                              {translate(language, 'currentGoalDaily', settings.dailyGoal / 60)}
                            </div>
                          </div>
                          
                          <div className="space-y-3 p-2 bg-gradient-to-r from-slate-700/80 to-slate-600/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
                            <label className="text-slate-100 text-sm font-bold">{translate(language, 'weeklyGoal')}</label>
                            <Input
                              type="number"
                              value={settings.weeklyGoal}
                              onChange={(e) => setSettings(prev => ({ ...prev, weeklyGoal: parseInt(e.target.value) || 1200 }))}
                              className="bg-slate-800/10 border-slate-600/50 text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                            <div className="text-slate-300 text-xs bg-slate-800/50 px-2 py-1 rounded-md">
                              {translate(language, 'currentGoalWeekly', settings.weeklyGoal / 60)}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-slate-700/80 to-slate-600/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
                            <div>
                              <div className="text-slate-100 font-bold">{translate(language, 'energyTracking')}</div>
                              <div className="text-slate-300 text-sm">{translate(language, 'trackEnergyAnalytics')}</div>
                            </div>
                            <Switch
                              checked={settings.energyTracking}
                              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, energyTracking: checked }))}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-slate-700/80 to-slate-600/60 backdrop-blur-sm rounded-xl border border-slate-600/50 shadow-lg">
                            <div>
                              <div className="text-slate-100 font-bold">{translate(language, 'advancedAnalytics')}</div>
                              <div className="text-slate-300 text-sm">{translate(language, 'showDetailedMetrics')}</div>
                            </div>
                            <Switch
                              checked={settings.advancedMetrics}
                              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, advancedMetrics: checked }))}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-600 pt-2">
                        <h4 className="text-slate-100 font-bold mb-6 text-lg flex items-center">
                          <Download className="w-5 h-5 mr-2 text-cyan-400" />
                          {translate(language, 'exportImportData')}
                        </h4>
                        <div className="flex items-center space-x-4 flex-wrap gap-4">
                          <Button
                            onClick={() => {
                              const data = {
                                oofs,
                                logs,
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
                            {translate(language, 'exportData')}
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
                                    if (data.parking) setParking(data.parking);
                                    if (data.settings) setSettings(data.settings);
                                    if (data.starredOOFs) setStarredOOFs(data.starredOOFs);
                                    setCopyStatus(translate(language, 'dataImported'));
                                  } catch (error) {
                                    setCopyStatus(translate(language, 'importError'));
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
                            className="border-slate-500 text-slate-200 hover:bg-slate-700/10 backdrop-blur-sm font-bold"
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

      {/* Domain Management Modal */}
      {showDomainManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-600 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-100">Manage Domains</h3>
                <button
                  onClick={() => setShowDomainManager(false)}
                  className="text-slate-400 hover:text-slate-200 p-1"
                >
                  ✕
                </button>
              </div>

              {/* Add new domain */}
              <div className="mb-6">
                <label className="text-slate-200 text-sm font-medium mb-1 block">Add New Domain</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDomainName}
                    onChange={(e) => setNewDomainName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomDomain(newDomainName)}
                    placeholder="Enter domain name"
                    className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-100 placeholder-slate-400 focus:border-indigo-500"
                  />
                  <button
                    onClick={() => addCustomDomain(newDomainName)}
                    disabled={!newDomainName.trim() || getAllDomains().includes(newDomainName.trim())}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Default domains */}
              <div className="mb-4">
                <h4 className="text-slate-200 text-sm font-medium mb-1">Default Domains</h4>
                <div className="space-y-2">
                  {['Backend', 'Data', 'CS', 'SystemDesign', 'AlgoDS', 'Study', 'Discovery', 'Other'].map(domain => (
                    <div key={domain} className="flex items-center justify-between bg-slate-700/50 px-3 py-2 rounded">
                      <span className="text-slate-200">{translateDomain(language, domain)}</span>
                      <span className="text-xs text-slate-400">Default</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom domains */}
              {customDomains.length > 0 && (
                <div>
                  <h4 className="text-slate-200 text-sm font-medium mb-1">Custom Domains</h4>
                  <div className="space-y-2">
                    {customDomains.map((domain, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-700 px-3 py-2 rounded">
                        {editingDomain?.index === index ? (
                          <input
                            type="text"
                            value={editingDomain.name}
                            onChange={(e) => setEditingDomain({...editingDomain, name: e.target.value})}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') editCustomDomain(index, editingDomain.name);
                              if (e.key === 'Escape') setEditingDomain(null);
                            }}
                            onBlur={() => editCustomDomain(index, editingDomain.name)}
                            autoFocus
                            className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-slate-100 text-sm flex-1"
                          />
                        ) : (
                          <span className="text-slate-200">{domain}</span>
                        )}
                        <div className="flex gap-2 ml-2">
                          <button
                            onClick={() => setEditingDomain({index, name: domain})}
                            className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded border border-slate-600 hover:border-indigo-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeCustomDomain(index)}
                            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded border border-slate-600 hover:border-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-2">
                <button
                  onClick={() => setShowDomainManager(false)}
                  className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
