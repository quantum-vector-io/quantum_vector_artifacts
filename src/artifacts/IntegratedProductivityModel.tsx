import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, BookOpen, Target, Zap, Users, Award, ArrowLeft, X, Plus } from 'lucide-react';
import * as THREE from 'three';

type ModelNode = {
  id: number;
  title: string;
  level1: string;
  level2: string;
  level3: string;
  level4: string;
};

type ActionItem = {
  id: string;
  text: string;
};

const IntegratedProductivityModel = ({ onBackToCatalog, language = 'UA' }: { onBackToCatalog?: () => void; language?: string }) => {
  const [selectedNode, setSelectedNode] = useState<ModelNode | null>(null);
  const [activeTab, setActiveTab] = useState(1);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newActionText, setNewActionText] = useState('');
  const quantumMountRef = useRef<HTMLDivElement>(null);

  // Translation system
  const translations = {
    EN: {
      title: 'Integrated Model: Depth & Effectiveness',
      subtitle: 'Synthesis of "7 Habits" by S. Covey and "Deep Work" by C. Newport principles',
      description: 'Interactive model for achieving mastery in programming, data science and CS. Click on a principle to explore it in detail.',
      backToCatalog: 'Back to Catalog',
      principles: 'Principles',
      level1Tab: 'First Principles',
      level2Tab: 'Integration',
      level3Tab: 'Application',
      level4Tab: 'Action Planner',
      principle1: 'Attention Architect Principle',
      principle2: 'Leverage Actions Principle',
      principle3: 'Rhythmic Recovery Principle',
      principle4: 'Synergistic Result Principle',
      principle5: 'Mastery Principle',
      integratedPrinciple: 'Integrated Principle',
      myTasksToday: 'My tasks for today:',
      addTask: 'Add',
      placeholder: 'For example: Analyze error logs...'
    },
    UA: {
      title: 'Інтегрована Модель: Глибина та Ефективність',
      subtitle: 'Синтез першопринципів «7 звичок» С. Кові та «Глибокої роботи» К. Ньюпорта',
      description: 'Інтерактивна модель для досягнення майстерності у програмуванні, data science та CS. Клікніть на принцип, щоб дослідити його детально.',
      backToCatalog: 'До каталогу',
      principles: 'Принципи',
      level1Tab: 'Першопринципи',
      level2Tab: 'Інтеграція',
      level3Tab: 'Застосування',
      level4Tab: 'Планувальник',
      principle1: 'Принцип Архітектора Уваги',
      principle2: 'Принцип Важільних Дій',
      principle3: 'Принцип Ритмічного Відновлення',
      principle4: 'Принцип Синергетичного Результату',
      principle5: 'Принцип Майстерності',
      integratedPrinciple: 'Інтегрований Принцип',
      myTasksToday: 'Мої завдання на сьогодні:',
      addTask: 'Додати',
      placeholder: 'Наприклад: Проаналізувати лог помилок...'
    }
  };

  const t = (key: string) => translations[language as keyof typeof translations]?.[key as keyof typeof translations.EN] || translations.UA[key as keyof typeof translations.UA] || key;

  // Localized content helper
  const getLocalizedContent = (enContent: string, uaContent: string) => {
    return language === 'EN' ? enContent : uaContent;
  };

  // Model data with localized content
  const modelData: ModelNode[] = [
    {
      id: 1,
      title: t('principle1'),
      level1: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-purple-400 mb-3 text-lg">"Deep Work" (Newport):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Philosophy of Depth:</h5>
              <p class="text-gray-300 text-sm">Conscious choice between monastic, bimodal, rhythmic or journalistic approach to work.</p>
            </div>
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Ritualization:</h5>
              <p class="text-gray-300 text-sm">Creating consistent habits (where, how, how long) to minimize friction when transitioning to deep work.</p>
            </div>
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Grand Gestures:</h5>
              <p class="text-gray-300 text-sm">Investing significant resources (time, money, energy) to emphasize the importance of the task.</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-lg bg-gray-800/30 mt-4">
          <h4 class="font-semibold text-blue-400 mb-3 text-lg">"7 Habits" (Covey):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Be Proactive (Habit 1):</h5>
              <p class="text-gray-300 text-sm">You are responsible for your life. Your behavior is a function of your decisions, not your conditions.</p>
            </div>
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Begin with the End in Mind (Habit 2):</h5>
              <p class="text-gray-300 text-sm">Everything is created twice: first mentally, then physically. Define your values and goals.</p>
            </div>
          </div>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-purple-400 mb-3 text-lg">«Глибока Робота» (Ньюпорт):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Філософія глибини:</h5>
              <p class="text-gray-300 text-sm">Свідомий вибір між монастичним, бімодальним, ритмічним чи журналістським підходом до роботи.</p>
            </div>
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Ритуалізація:</h5>
              <p class="text-gray-300 text-sm">Створення сталих звичок (де, як, скільки) для мінімізації тертя при переході до глибокої роботи.</p>
            </div>
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Великі жести:</h5>
              <p class="text-gray-300 text-sm">Інвестування значних ресурсів (час, гроші, енергія) для підкреслення важливості завдання.</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-lg bg-gray-800/30 mt-4">
          <h4 class="font-semibold text-blue-400 mb-3 text-lg">«7 звичок» (Кові):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Будьте проактивними (Звичка 1):</h5>
              <p class="text-gray-300 text-sm">Ви несете відповідальність за своє життя. Ваша поведінка — це функція ваших рішень, а не умов.</p>
            </div>
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Починайте з кінцевою метою в думці (Звичка 2):</h5>
              <p class="text-gray-300 text-sm">Все створюється двічі: спочатку в думках, потім фізично. Визначте свої цінності та цілі.</p>
            </div>
          </div>
        </div>
      `),
      level2: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">Key Idea:</h4>
          <p class="text-gray-300 leading-relaxed">
            Effectiveness begins not with time management, but with attention management. You must proactively design your work and life, consciously choosing what to focus on and what to ignore. This mental design (Habit 2), reinforced by rituals (Newport), creates a structure where deep work becomes not an accident, but a natural result of your proactive stance (Habit 1).
          </p>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">Ключова ідея:</h4>
          <p class="text-gray-300 leading-relaxed">
            Ефективність починається не з управління часом, а з управління увагою. Ви повинні проактивно проектувати свою роботу та життя, свідомо обираючи, на чому фокусуватися, а що ігнорувати. Це ментальне проектування (Звичка 2), підкріплене ритуалами (Ньюпорт), створює структуру, де глибока робота стає не випадковістю, а закономірним результатом вашої проактивної позиції (Звичка 1).
          </p>
        </div>
      `),
      level3: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">For Programmer / Data Scientist:</h4>
          <p class="text-gray-300 mb-3">
            <strong>Scenario:</strong> Learning a new complex library (e.g. TensorFlow) or developing microservices architecture.
          </p>
          <ul class="list-disc list-inside text-gray-300 space-y-2">
            <li><strong>Design:</strong> Define a specific mini-project you want to implement with the new technology (Habit 2).</li>
            <li><strong>Ritual:</strong> Daily from 9:00 to 11:00 turn off Slack/email, enable "do not disturb" mode and work exclusively on this project (Rhythmic philosophy).</li>
            <li><strong>Proactivity:</strong> When tempted to check messages, consciously return to code, reminding yourself of the project's end goal (Habit 1).</li>
          </ul>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">Для програміста / Data Scientist:</h4>
          <p class="text-gray-300 mb-3">
            <strong>Сценарій:</strong> Вивчення нової складної бібліотеки (напр. TensorFlow) або розробка архітектури мікросервісів.
          </p>
          <ul class="list-disc list-inside text-gray-300 space-y-2">
            <li><strong>Проектування:</strong> Визначте конкретний міні-проект, який ви хочете реалізувати з новою технологією (Звичка 2).</li>
            <li><strong>Ритуал:</strong> Щодня з 9:00 до 11:00 вимикайте Slack/пошту, вмикайте режим "не турбувати" і працюйте виключно над цим проектом (Ритмічна філософія).</li>
            <li><strong>Проактивність:</strong> Коли виникає спокуса перевірити повідомлення, свідомо повертайте себе до коду, нагадуючи про кінцеву мету проекту (Звичка 1).</li>
          </ul>
        </div>
      `),
      level4: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-yellow-400 text-lg mb-4">Practical Workshop</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-white mb-2">Key Questions:</h5>
              <p class="text-gray-300 text-sm">What is my main goal for this week/month (Habit 2)? What ritual will help me guarantee time for achieving it (Newport)?</p>
            </div>
            <div>
              <h5 class="font-semibold text-white mb-2">Action Checklist:</h5>
              <ul class="list-disc list-inside text-gray-300 text-sm space-y-1">
                <li>Choose one deep work philosophy for the week.</li>
                <li>Create a ritual: define time, place and conditions for work.</li>
                <li>Block this time in your calendar.</li>
              </ul>
            </div>
          </div>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-yellow-400 text-lg mb-4">Практичний Воркшоп</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-white mb-2">Ключові запитання:</h5>
              <p class="text-gray-300 text-sm">Яка моя головна мета на цей тиждень/місяць (Звичка 2)? Який ритуал допоможе мені гарантовано виділити час на її досягнення (Ньюпорт)?</p>
            </div>
            <div>
              <h5 class="font-semibold text-white mb-2">Чекліст дій:</h5>
              <ul class="list-disc list-inside text-gray-300 text-sm space-y-1">
                <li>Обрати одну філософію глибокої роботи на тиждень.</li>
                <li>Створити ритуал: визначити час, місце та умови для роботи.</li>
                <li>Заблокувати цей час у календарі.</li>
              </ul>
            </div>
          </div>
        </div>
      `)
    },
    {
      id: 2,
      title: t('principle2'),
      level1: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-purple-400 mb-3 text-lg">"Deep Work" (Newport):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Value of Deep Work:</h5>
              <p class="text-gray-300 text-sm">The ability to perform deep work is becoming increasingly rare and, consequently, increasingly valuable in the economy.</p>
            </div>
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Productivity Formula:</h5>
              <p class="text-gray-300 text-sm">High-Quality Work = (Time Spent) x (Intensity of Focus).</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-lg bg-gray-800/30 mt-4">
          <h4 class="font-semibold text-blue-400 mb-3 text-lg">"7 Habits" (Covey):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Put First Things First (Habit 3):</h5>
              <p class="text-gray-300 text-sm">Time management matrix: focus on Quadrant II (important but not urgent).</p>
            </div>
          </div>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-purple-400 mb-3 text-lg">«Глибока Робота» (Ньюпорт):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Цінність глибокої роботи:</h5>
              <p class="text-gray-300 text-sm">Здатність до глибокої роботи стає все більш рідкісною і, відповідно, все більш цінною в економіці.</p>
            </div>
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Формула продуктивності:</h5>
              <p class="text-gray-300 text-sm">Високоякісна робота = (Витрачений час) x (Інтенсивність фокусу).</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-lg bg-gray-800/30 mt-4">
          <h4 class="font-semibold text-blue-400 mb-3 text-lg">«7 звичок» (Кові):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Спочатку робіть головне (Звичка 3):</h5>
              <p class="text-gray-300 text-sm">Матриця управління часом: фокус на Квадранті II (важливе, але не термінове).</p>
            </div>
          </div>
        </div>
      `),
      level2: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">Key Idea:</h4>
          <p class="text-gray-300 leading-relaxed">
            Greatest impact is achieved when you concentrate all your cognitive power on the 20% of tasks that deliver 80% of results. This combination of Quadrant II (Covey) with deep work (Newport) creates an exponential effect: you're not just working efficiently, but working on the right things with maximum intensity.
          </p>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">Ключова ідея:</h4>
          <p class="text-gray-300 leading-relaxed">
            Найбільший вплив досягається коли ви концентруєте всю свою когнітивну потужність на 20% завдань, які дають 80% результату. Це поєднання Квадранту II (Кові) з глибокою роботою (Ньюпорт) створює експоненційний ефект: ви не просто ефективно працюєте, а працюєте над правильними речами з максимальною інтенсивністю.
          </p>
        </div>
      `),
      level3: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">For Backend Developer:</h4>
          <p class="text-gray-300 mb-3">
            <strong>Scenario:</strong> Choosing between fixing minor bugs (Quadrant I/III) and refactoring critical module for system performance (Quadrant II).
          </p>
          <ul class="list-disc list-inside text-gray-300 space-y-2">
            <li><strong>Leverage identification:</strong> Refactoring has significantly greater long-term impact. Allocate 2-3 deep work sessions per week.</li>
            <li><strong>Planning:</strong> Block these sessions in calendar as "Technical debt: API refactoring". Makes invisible work visible and priority.</li>
            <li><strong>Intensity:</strong> During these sessions work with maximum intensity. One hour of deep refactoring is more valuable than three hours of interrupted work.</li>
          </ul>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">Для Backend-розробника:</h4>
          <p class="text-gray-300 mb-3">
            <strong>Сценарій:</strong> Вибір між виправленням дрібних багів (Квадрант I/III) та рефакторингом критичного модуля для підвищення продуктивності системи (Квадрант II).
          </p>
          <ul class="list-disc list-inside text-gray-300 space-y-2">
            <li><strong>Визначення важіля:</strong> Рефакторинг має значно більший довгостроковий вплив. Виділіть на це 2-3 сесії глибокої роботи на тиждень.</li>
            <li><strong>Планування:</strong> Заблокуйте ці сесії в календарі як "Технічний борг: рефакторинг API". Це робить невидиму роботу видимою та пріоритетною.</li>
            <li><strong>Інтенсивність:</strong> Під час цих сесій працюйте з максимальною інтенсивністю. Одна година глибокого рефакторингу цінніша за три години переривчастої роботи.</li>
          </ul>
        </div>
      `),
      level4: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-yellow-400 text-lg mb-4">Practical Workshop</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-white mb-2">Key Questions:</h5>
              <p class="text-gray-300 text-sm">Which one task (Quadrant II) will give the biggest result this week? How can I maximize focus intensity on it?</p>
            </div>
            <div>
              <h5 class="font-semibold text-white mb-2">Action Checklist:</h5>
              <ul class="list-disc list-inside text-gray-300 text-sm space-y-1">
                <li>Identify 1-3 most important tasks for the week.</li>
                <li>Break each into smaller, specific steps.</li>
                <li>Schedule first deep work session for the most important task.</li>
              </ul>
            </div>
          </div>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-yellow-400 text-lg mb-4">Практичний Воркшоп</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-white mb-2">Ключові запитання:</h5>
              <p class="text-gray-300 text-sm">Яке одне завдання (Квадрант II) дасть найбільший результат цього тижня? Як я можу максимізувати інтенсивність фокусу на ньому?</p>
            </div>
            <div>
              <h5 class="font-semibold text-white mb-2">Чекліст дій:</h5>
              <ul class="list-disc list-inside text-gray-300 text-sm space-y-1">
                <li>Визначити 1-3 найважливіші задачі на тиждень.</li>
                <li>Розбити кожну на менші, конкретні кроки.</li>
                <li>Запланувати першу сесію глибокої роботи для найважливішої задачі.</li>
              </ul>
            </div>
          </div>
        </div>
      `)
    },
    {
      id: 3,
      title: t('principle3'),
      level1: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-purple-400 mb-3 text-lg">"Deep Work" (Newport):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Embrace Boredom:</h5>
              <p class="text-gray-300 text-sm">Don't fill every free moment with stimuli. Train your brain to tolerate absence of novelty.</p>
            </div>
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Shutdown Ritual:</h5>
              <p class="text-gray-300 text-sm">Create a ritual to end your workday and fully disconnect from professional thoughts.</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-lg bg-gray-800/30 mt-4">
          <h4 class="font-semibold text-blue-400 mb-3 text-lg">"7 Habits" (Covey):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Sharpen the Saw (Habit 7):</h5>
              <p class="text-gray-300 text-sm">Regular and balanced renewal in four dimensions: physical, spiritual, intellectual and social-emotional.</p>
            </div>
          </div>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-purple-400 mb-3 text-lg">«Глибока Робота» (Ньюпорт):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Прийміть нудьгу:</h5>
              <p class="text-gray-300 text-sm">Не заповнюйте кожну вільну хвилину стимулами. Тренуйте мозок витримувати відсутність новизни.</p>
            </div>
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Завершуйте роботу:</h5>
              <p class="text-gray-300 text-sm">Створіть ритуал завершення робочого дня, щоб повністю відключитися від професійних думок.</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-lg bg-gray-800/30 mt-4">
          <h4 class="font-semibold text-blue-400 mb-3 text-lg">«7 звичок» (Кові):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Гостріть пилу (Звичка 7):</h5>
              <p class="text-gray-300 text-sm">Регулярне та збалансоване відновлення у чотирьох вимірах: фізичному, духовному, інтелектуальному та соціально-емоційному.</p>
            </div>
          </div>
        </div>
      `),
      level2: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">Key Idea:</h4>
          <p class="text-gray-300 leading-relaxed">
            Peak productivity is impossible without quality rest periods. This is not passive "doing nothing", but active, conscious renewal process (Habit 7). Training to tolerate "boredom" (Newport) develops mental endurance, while clear shutdown rituals allow the brain to enter recovery mode.
          </p>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">Ключова ідея:</h4>
          <p class="text-gray-300 leading-relaxed">
            Пікова продуктивність неможлива без періодів якісного відпочинку. Це не пасивне "нічогонероблення", а активний, свідомий процес відновлення (Звичка 7). Тренування витримувати "нудьгу" (Ньюпорт) розвиває ментальну витривалість, а чіткі ритуали завершення дня дозволяють мозку перейти в режим відновлення.
          </p>
        </div>
      `),
      level3: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">For Computer Science Specialist:</h4>
          <p class="text-gray-300 mb-3">
            <strong>Scenario:</strong> Working on complex theoretical problem or algorithm.
          </p>
          <ul class="list-disc list-inside text-gray-300 space-y-2">
            <li><strong>Shutdown ritual:</strong> At 6:00 PM clearly write down current problem state, hypotheses and next step. Close all work materials and tell yourself: "Work is complete".</li>
            <li><strong>Active recovery:</strong> Instead of mindless social media scrolling, engage in physical activity or read fiction literature.</li>
            <li><strong>Boredom training:</strong> While waiting for compilation or test execution, don't reach for your phone. Just look out the window.</li>
          </ul>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">Для спеціаліста з Computer Science:</h4>
          <p class="text-gray-300 mb-3">
            <strong>Сценарій:</strong> Робота над складною теоретичною проблемою або алгоритмом.
          </p>
          <ul class="list-disc list-inside text-gray-300 space-y-2">
            <li><strong>Ритуал завершення:</strong> О 18:00 чітко запишіть поточний стан проблеми, гіпотези та наступний крок. Закрийте всі робочі матеріали і скажіть собі: "Роботу завершено".</li>
            <li><strong>Активне відновлення:</strong> Замість бездумного скролінгу соцмереж, займіться фізичною активністю або почитайте художню літературу.</li>
            <li><strong>Тренування нудьги:</strong> Під час очікування компіляції чи виконання тестів, не хапайтеся за телефон. Просто подивіться у вікно.</li>
          </ul>
        </div>
      `),
      level4: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-yellow-400 text-lg mb-4">Practical Workshop</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-white mb-2">Key Questions:</h5>
              <p class="text-gray-300 text-sm">How do I restore my energy (Habit 7)? Do I have a clear shutdown ritual?</p>
            </div>
            <div>
              <h5 class="font-semibold text-white mb-2">Action Checklist:</h5>
              <ul class="list-disc list-inside text-gray-300 text-sm space-y-1">
                <li>Create a work shutdown ritual (review plan, write down ideas).</li>
                <li>Schedule one recovery activity for the evening.</li>
                <li>Try spending 15 minutes without phone during break.</li>
              </ul>
            </div>
          </div>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-yellow-400 text-lg mb-4">Практичний Воркшоп</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-white mb-2">Ключові запитання:</h5>
              <p class="text-gray-300 text-sm">Як я відновлюю свою енергію (Звичка 7)? Чи є у мене чіткий ритуал завершення дня?</p>
            </div>
            <div>
              <h5 class="font-semibold text-white mb-2">Чекліст дій:</h5>
              <ul class="list-disc list-inside text-gray-300 text-sm space-y-1">
                <li>Створити ритуал завершення роботи (переглянути план, записати ідеї).</li>
                <li>Запланувати на вечір одну активність для відновлення.</li>
                <li>Спробувати провести 15 хвилин без телефону під час перерви.</li>
              </ul>
            </div>
          </div>
        </div>
      `)
    },
    {
      id: 4,
      title: t('principle4'),
      level1: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-purple-400 mb-3 text-lg">"Deep Work" (Newport):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Whiteboard Effect:</h5>
              <p class="text-gray-300 text-sm">Working with another person on a problem can stimulate deeper concentration and unexpected ideas.</p>
            </div>
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Hub-and-Spoke Model:</h5>
              <p class="text-gray-300 text-sm">Alternating periods of open interaction (hub) for collecting ideas and isolated deep work (spokes) for processing them.</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-lg bg-gray-800/30 mt-4">
          <h4 class="font-semibold text-blue-400 mb-3 text-lg">"7 Habits" (Covey):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Think Win/Win (Habit 4):</h5>
              <p class="text-gray-300 text-sm">Seek mutual benefit in all interactions.</p>
            </div>
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Seek First to Understand (Habit 5):</h5>
              <p class="text-gray-300 text-sm">Empathic listening before expressing your position.</p>
            </div>
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Synergize (Habit 6):</h5>
              <p class="text-gray-300 text-sm">The whole is greater than sum of its parts. Creative cooperation that values differences.</p>
            </div>
          </div>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-purple-400 mb-3 text-lg">«Глибока Робота» (Ньюпорт):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Ефект білої дошки:</h5>
              <p class="text-gray-300 text-sm">Робота з іншою людиною над проблемою може стимулювати глибшу концентрацію та несподівані ідеї.</p>
            </div>
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Модель "хаб-і-спиці":</h5>
              <p class="text-gray-300 text-sm">Чергування періодів відкритої взаємодії (хаб) для збору ідей та ізольованої глибокої роботи (спиці) для їх опрацювання.</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-lg bg-gray-800/30 mt-4">
          <h4 class="font-semibold text-blue-400 mb-3 text-lg">«7 звичок» (Кові):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Думайте в стилі "Виграш/Виграш" (Звичка 4):</h5>
              <p class="text-gray-300 text-sm">Шукайте взаємну вигоду у всіх взаємодіях.</p>
            </div>
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Спочатку прагніть зрозуміти (Звичка 5):</h5>
              <p class="text-gray-300 text-sm">Емпатичне слухання перед тим, як висловлювати свою позицію.</p>
            </div>
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Досягайте синергії (Звичка 6):</h5>
              <p class="text-gray-300 text-sm">Ціле більше за суму його частин. Креативна співпраця, що цінує відмінності.</p>
            </div>
          </div>
        </div>
      `),
      level2: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">Key Idea:</h4>
          <p class="text-gray-300 leading-relaxed">
            Deep work doesn't have to be isolated. Greatest breakthroughs happen at intersection of deep individual work and effective collaboration. Using empathy (Habit 5) and seeking mutual benefit (Habit 4), you create trust that is the foundation for synergy (Habit 6).
          </p>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">Ключова ідея:</h4>
          <p class="text-gray-300 leading-relaxed">
            Глибока робота не обов'язково є ізольованою. Найбільші прориви стаються на перетині глибокої індивідуальної роботи та ефективної співпраці. Використовуючи емпатію (Звичка 5) та шукаючи взаємну вигоду (Звичка 4), ви створюєте довіру, яка є основою для синергії (Звичка 6).
          </p>
        </div>
      `),
      level3: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">For Data Engineering Team:</h4>
          <p class="text-gray-300 mb-3">
            <strong>Scenario:</strong> Designing complex ETL pipeline.
          </p>
          <ul class="list-disc list-inside text-gray-300 space-y-2">
            <li><strong>Hub:</strong> Conduct 1-hour brainstorming session where everyone shares ideas without criticism.</li>
            <li><strong>Spokes:</strong> Each team member takes 2-3 hours for individual deep work.</li>
            <li><strong>Whiteboard effect:</strong> Reconvene for 90-minute collaborative design session.</li>
          </ul>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">Для Data Engineering команди:</h4>
          <p class="text-gray-300 mb-3">
            <strong>Сценарій:</strong> Проектування складного ETL-пайплайну.
          </p>
          <ul class="list-disc list-inside text-gray-300 space-y-2">
            <li><strong>Хаб:</strong> Проведіть 1-годинну сесію брейншторму, де кожен висловлює ідеї без критики.</li>
            <li><strong>Спиці:</strong> Кожен член команди бере 2-3 години для індивідуальної глибокої роботи.</li>
            <li><strong>Ефект білої дошки:</strong> Зберіться знову для 90-хвилинної сесії спільного проектування.</li>
          </ul>
        </div>
      `),
      level4: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-yellow-400 text-lg mb-4">Practical Workshop</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-white mb-2">Key Questions:</h5>
              <p class="text-gray-300 text-sm">What complex problem can I discuss with a colleague to get new ideas?</p>
            </div>
            <div>
              <h5 class="font-semibold text-white mb-2">Action Checklist:</h5>
              <ul class="list-disc list-inside text-gray-300 text-sm space-y-1">
                <li>Identify problem that needs fresh perspective.</li>
                <li>Schedule paired session with colleague.</li>
                <li>Prepare your ideas, but be ready to abandon them.</li>
              </ul>
            </div>
          </div>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-yellow-400 text-lg mb-4">Практичний Воркшоп</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-white mb-2">Ключові запитання:</h5>
              <p class="text-gray-300 text-sm">Яку складну проблему я можу обговорити з колегою для отримання нових ідей?</p>
            </div>
            <div>
              <h5 class="font-semibold text-white mb-2">Чекліст дій:</h5>
              <ul class="list-disc list-inside text-gray-300 text-sm space-y-1">
                <li>Визначити проблему, де потрібна свіжа перспектива.</li>
                <li>Запланувати парну сесію з колегою.</li>
                <li>Підготувати свої ідеї, але бути готовим від них відмовитись.</li>
              </ul>
            </div>
          </div>
        </div>
      `)
    },
    {
      id: 5,
      title: t('principle5'),
      level1: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-purple-400 mb-3 text-lg">"Deep Work" (Newport):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Deliberate Practice:</h5>
              <p class="text-gray-300 text-sm">Systematic effort to improve performance in specific domain. Requires full concentration and feedback.</p>
            </div>
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Elite-level Production:</h5>
              <p class="text-gray-300 text-sm">It's not enough to just know, you must create tangible results that others value.</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-lg bg-gray-800/30 mt-4">
          <h4 class="font-semibold text-blue-400 mb-3 text-lg">"7 Habits" (Covey):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Circle of Influence (Habit 1):</h5>
              <p class="text-gray-300 text-sm">Focus on what you can control — your skills, knowledge and character.</p>
            </div>
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Upward Spiral (Habit 7):</h5>
              <p class="text-gray-300 text-sm">Process of continuous improvement where you learn, commit and act at ever higher levels.</p>
            </div>
          </div>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-purple-400 mb-3 text-lg">«Глибока Робота» (Ньюпорт):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Свідома практика:</h5>
              <p class="text-gray-300 text-sm">Систематичне зусилля для покращення продуктивності у конкретній сфері. Вимагає повної концентрації та зворотного зв'язку.</p>
            </div>
            <div>
              <h5 class="font-semibold text-purple-300 mb-1">Виробництво на елітному рівні:</h5>
              <p class="text-gray-300 text-sm">Недостатньо просто знати, треба створювати відчутні результати, які цінують інші.</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-lg bg-gray-800/30 mt-4">
          <h4 class="font-semibold text-blue-400 mb-3 text-lg">«7 звичок» (Кові):</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Коло Впливу (Звичка 1):</h5>
              <p class="text-gray-300 text-sm">Фокусуйтеся на тому, що ви можете контролювати — на своїх навичках, знаннях та характері.</p>
            </div>
            <div>
              <h5 class="font-semibold text-blue-300 mb-1">Спіраль зростання (Звичка 7):</h5>
              <p class="text-gray-300 text-sm">Процес постійного вдосконалення, де ви вивчаєте, зобов'язуєтесь і дієте на все вищих рівнях.</p>
            </div>
          </div>
        </div>
      `),
      level2: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">Key Idea:</h4>
          <p class="text-gray-300 leading-relaxed">
            True mastery is the result of a proactive and systematic self-improvement process. By focusing on your Circle of Influence (Habit 1), you apply deep work as a tool for deliberate practice (Newport). Each deep work session is a step on the upward spiral (Habit 7).
          </p>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">Ключова ідея:</h4>
          <p class="text-gray-300 leading-relaxed">
            Справжня майстерність — це результат проактивного та систематичного процесу самовдосконалення. Фокусуючись на своєму Колі Впливу (Звичка 1), ви застосовуєте глибоку роботу як інструмент для свідомої практики (Ньюпорт). Кожна сесія глибокої роботи — це крок на спіралі зростання (Звичка 7).
          </p>
        </div>
      `),
      level3: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">For Any Developer:</h4>
          <p class="text-gray-300 mb-3">
            <strong>Scenario:</strong> Improving SQL query skills.
          </p>
          <ul class="list-disc list-inside text-gray-300 space-y-2">
            <li><strong>Deliberate practice:</strong> Allocate 45 minutes of deep work to solve complex LeetCode problems, focusing on optimization.</li>
            <li><strong>Feedback:</strong> Show your solution to experienced colleague and ask for review.</li>
            <li><strong>Upward spiral:</strong> In next session apply gained knowledge to real work task.</li>
          </ul>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-white text-lg mb-3">Для будь-якого розробника:</h4>
          <p class="text-gray-300 mb-3">
            <strong>Сценарій:</strong> Вдосконалення навичок роботи з SQL-запитами.
          </p>
          <ul class="list-disc list-inside text-gray-300 space-y-2">
            <li><strong>Свідома практика:</strong> Виділіть 45 хвилин глибокої роботи на вирішення складних завдань на LeetCode, фокусуючись на оптимізації.</li>
            <li><strong>Зворотний зв'язок:</strong> Покажіть своє рішення досвідченому колезі та попросіть про рев'ю.</li>
            <li><strong>Спіраль зростання:</strong> На наступній сесії застосуйте отримані знання до реального робочого завдання.</li>
          </ul>
        </div>
      `),
      level4: getLocalizedContent(`
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-yellow-400 text-lg mb-4">Practical Workshop</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-white mb-2">Key Questions:</h5>
              <p class="text-gray-300 text-sm">Which one skill in my Circle of Influence do I want to improve this month?</p>
            </div>
            <div>
              <h5 class="font-semibold text-white mb-2">Action Checklist:</h5>
              <ul class="list-disc list-inside text-gray-300 text-sm space-y-1">
                <li>Choose specific skill for improvement.</li>
                <li>Find way to get feedback.</li>
                <li>Schedule 3 deliberate practice sessions of 45 minutes per week.</li>
              </ul>
            </div>
          </div>
        </div>
      `, `
        <div class="p-4 rounded-lg bg-gray-800/30">
          <h4 class="font-semibold text-yellow-400 text-lg mb-4">Практичний Воркшоп</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-semibold text-white mb-2">Ключові запитання:</h5>
              <p class="text-gray-300 text-sm">Яку одну навичку в моєму Колі Впливу я хочу покращити цього місяця?</p>
            </div>
            <div>
              <h5 class="font-semibold text-white mb-2">Чекліст дій:</h5>
              <ul class="list-disc list-inside text-gray-300 text-sm space-y-1">
                <li>Вибрати конкретну навичку для вдосконалення.</li>
                <li>Знайти спосіб отримання зворотного зв'язку.</li>
                <li>Запланувати 3 сесії свідомої практики по 45 хвилин на тиждень.</li>
              </ul>
            </div>
          </div>
        </div>
      `)
    }
  ];

  // Enhanced quantum background effect with dynamic movement
  useEffect(() => {
    if (!quantumMountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);

    if (quantumMountRef.current) {
      quantumMountRef.current.appendChild(renderer.domElement);
    }

    // Create particle system with more dynamic movement
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;

      velocities[i * 3] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.4 + 0.5, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    camera.position.set(0, 0, 100);

    let animationId: number;
    let time = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01;

      // Dynamic particle movement
      const positionAttribute = particleGeometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        positionAttribute.array[i * 3] += velocities[i * 3];
        positionAttribute.array[i * 3 + 1] += velocities[i * 3 + 1];
        positionAttribute.array[i * 3 + 2] += velocities[i * 3 + 2];

        // Wrap around screen
        if (Math.abs(positionAttribute.array[i * 3]) > 200) velocities[i * 3] *= -1;
        if (Math.abs(positionAttribute.array[i * 3 + 1]) > 200) velocities[i * 3 + 1] *= -1;
        if (Math.abs(positionAttribute.array[i * 3 + 2]) > 200) velocities[i * 3 + 2] *= -1;
      }
      positionAttribute.needsUpdate = true;

      // Global rotation
      particleSystem.rotation.x = Math.sin(time * 0.3) * 0.3;
      particleSystem.rotation.y += 0.005;
      particleSystem.rotation.z = Math.cos(time * 0.2) * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (quantumMountRef.current && renderer.domElement && quantumMountRef.current.contains(renderer.domElement)) {
        quantumMountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const openInfoPanel = (node: ModelNode) => {
    setSelectedNode(node);
    setActiveTab(1);
    setActionItems([]);
  };

  const closeInfoPanel = () => {
    setSelectedNode(null);
  };

  const switchTab = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  const addActionItem = () => {
    if (newActionText.trim()) {
      const newAction: ActionItem = {
        id: Date.now().toString(),
        text: newActionText.trim()
      };
      setActionItems([...actionItems, newAction]);
      setNewActionText('');
    }
  };

  const removeActionItem = (id: string) => {
    setActionItems(actionItems.filter(item => item.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addActionItem();
    }
  };

  const getNodeIcon = (id: number) => {
    switch (id) {
      case 1: return <Target className="w-8 h-8 text-purple-400" />;
      case 2: return <Zap className="w-8 h-8 text-blue-400" />;
      case 3: return <Brain className="w-8 h-8 text-green-400" />;
      case 4: return <Users className="w-8 h-8 text-orange-400" />;
      case 5: return <Award className="w-8 h-8 text-pink-400" />;
      default: return <BookOpen className="w-8 h-8 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 relative overflow-hidden">
      {/* Quantum Background */}
      <div
        ref={quantumMountRef}
        className="fixed inset-0"
        style={{ pointerEvents: 'none', zIndex: 0 }}
      />

      {/* Header */}
      <div className="relative z-10 bg-transparent border-b border-slate-600/20 sticky top-0 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center space-x-2 sm:space-x-3">
                <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
                <span className="leading-tight">{t('title')}</span>
              </h1>
              <p className="text-slate-400 mt-1 sm:mt-2 text-sm sm:text-base">
                {t('subtitle')}
              </p>
            </div>
            <Button
              onClick={() => onBackToCatalog ? onBackToCatalog() : window.location.href = '/'}
              className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-400/30 text-indigo-300 hover:text-indigo-200 text-sm px-3 py-2 shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t('backToCatalog')}</span>
              <span className="sm:hidden">{language === 'EN' ? 'Back' : 'Назад'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Principle Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {modelData.map((node) => (
            <Card
              key={node.id}
              className={`bg-slate-900/20 backdrop-blur-sm border-slate-700/30 hover:border-indigo-400/50 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 ${
                node.id === 5 ? 'sm:col-span-2 lg:col-span-1 lg:col-start-2' : ''
              }`}
              onClick={() => openInfoPanel(node)}
            >
              <CardContent className="p-4 sm:p-6 text-center h-40 sm:h-48 flex flex-col items-center justify-center">
                <div className="flex-shrink-0">
                  {getNodeIcon(node.id)}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-2 sm:mt-4 px-2 leading-tight">{node.title}</h3>
                <p className="text-xs sm:text-sm text-blue-400 mt-1 sm:mt-2">{language === 'EN' ? 'Principle' : 'Принцип'} #{node.id}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Info Panel Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/30 rounded-xl sm:rounded-2xl max-w-4xl w-full min-h-[95vh] sm:min-h-0 sm:max-h-[90vh] overflow-hidden shadow-2xl my-2 sm:my-0">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-800/40 backdrop-blur-md border-b border-slate-700/30 p-4 sm:p-6">
              <div className="flex items-start sm:items-center justify-between">
                <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getNodeIcon(selectedNode.id)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight pr-2">{selectedNode.title}</h2>
                    <p className="text-blue-400 font-medium text-sm sm:text-base">{t('integratedPrinciple')} #{selectedNode.id}</p>
                  </div>
                </div>
                <Button
                  onClick={closeInfoPanel}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white flex-shrink-0 p-2"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-700/30 bg-slate-800/20 overflow-x-auto">
              <nav className="flex space-x-1 px-4 sm:px-6 min-w-max" aria-label="Tabs">
                {[t('level1Tab'), t('level2Tab'), t('level3Tab'), t('level4Tab')].map((label, index) => (
                  <button
                    key={index}
                    onClick={() => switchTab(index + 1)}
                    className={`py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === index + 1
                        ? 'text-white border-b-2 border-blue-400'
                        : 'text-slate-400 hover:text-slate-200'
                    } ${index === 3 ? 'text-yellow-400' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[65vh] sm:max-h-[60vh]">
              {activeTab === 1 && (
                <div className="prose prose-sm sm:prose-base prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedNode.level1 }} />
              )}
              {activeTab === 2 && (
                <div className="prose prose-sm sm:prose-base prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedNode.level2 }} />
              )}
              {activeTab === 3 && (
                <div className="prose prose-sm sm:prose-base prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedNode.level3 }} />
              )}
              {activeTab === 4 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="prose prose-sm sm:prose-base prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedNode.level4 }} />

                  {/* Action Items Section */}
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-slate-800/30">
                    <h5 className="font-semibold text-white mb-3 text-sm sm:text-base">{t('myTasksToday')}</h5>
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                      <Input
                        type="text"
                        value={newActionText}
                        onChange={(e) => setNewActionText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('placeholder')}
                        className="bg-slate-700/40 border-slate-600/40 text-white placeholder-slate-400 text-sm flex-1"
                      />
                      <Button
                        onClick={addActionItem}
                        className="bg-blue-600/80 hover:bg-blue-700/80 text-white text-sm px-4 py-2 sm:px-3 sm:py-2 shrink-0"
                      >
                        <Plus className="w-4 h-4 mr-1 sm:mr-0" />
                        <span className="sm:hidden">{t('addTask')}</span>
                      </Button>
                    </div>

                    {/* Action Items List */}
                    <ul className="space-y-2">
                      {actionItems.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-start sm:items-center justify-between bg-slate-700/30 p-2 sm:p-3 rounded-md text-xs sm:text-sm gap-2"
                        >
                          <span className="text-slate-200 flex-1 break-words leading-relaxed">{item.text}</span>
                          <button
                            onClick={() => removeActionItem(item.id)}
                            className="text-red-400 hover:text-red-300 font-bold text-lg sm:text-xl px-1 sm:px-2 shrink-0 leading-none"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegratedProductivityModel;