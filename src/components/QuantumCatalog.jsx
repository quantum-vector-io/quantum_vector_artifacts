import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

const QuantumCatalog = ({ onNavigateToArtifact, language = 'EN', onLanguageChange = () => {} }) => {
   const mountRef = useRef(null);
   const sceneRef = useRef(null);
   const [selectedCategory, setSelectedCategory] = useState('all');
   const [searchTerm, setSearchTerm] = useState('');
   const [hoveredProject, setHoveredProject] = useState(null);
   const [activeScrollZone, setActiveScrollZone] = useState('main');

   // Device detection and adaptive settings
   const [deviceSettings, setDeviceSettings] = useState(() => {
     const isMobile = window.innerWidth <= 768;
     const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
     const isDesktop = window.innerWidth > 1024;

     const settings = {
       isMobile,
       isTablet,
       isDesktop,
        quality: isMobile ? 'performance' : isTablet ? 'balanced' : 'beauty',
       frameRate: isMobile ? 30 : 60
     };

     console.log('🌌 Quantum Device Detection:', {
       windowWidth: window.innerWidth,
       deviceType: isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop',
       particles: settings.particles,
       quality: settings.quality
     });

     return settings;
   });
  // language dropdown state (controlled by parent for selected language)
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  // Close language dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Responsive device detection with resize listener
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
      const isDesktop = window.innerWidth > 1024;

      const newSettings = {
        isMobile,
        isTablet,
        isDesktop,
            quality: isMobile ? 'performance' : isTablet ? 'balanced' : 'beauty',
        frameRate: isMobile ? 30 : 60
      };

      console.log('🔄 Quantum Resize:', {
        windowWidth: window.innerWidth,
        deviceType: isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop',
        particles: newSettings.particles,
        quality: newSettings.quality
      });

      setDeviceSettings(newSettings);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // simple translation map for catalog UI
  const TRANS = {
    EN: {
      headerDesc: 'Explore the intersection of human creativity and AI assistance through interactive tools and experiments',
      searchPlaceholder: 'Search artifacts...',
      showingAll: (n) => `Showing all ${n} artifacts`,
      working: 'Working',
      comingSoon: 'Coming Soon',
      noResults: 'No artifacts found',
      footerStatus: (w, c, p) => `${w} working • ${c} coming soon • ${p} planned`,
      launch: 'Launch',
      // Categories
      catTopProjects: 'Top Projects',
      catMyFavourite: 'My Favourite',
      catAllProjects: 'All Projects',
      catDataVisualization: 'Data Visualization',
      catAiTools: 'AI Tools',
      catWebApps: 'Web Apps',
      catProductivity: 'Productivity',
      catBookApps: 'Book Apps',
      catGames: 'Games',
      catExperiments: 'Experiments',
      // Status descriptions
      topFeatured: 'Top featured projects',
      favoritePicks: 'favorite picks',
      artifactsIn: 'artifacts in',
      planned: 'Planned',
      tryAdjusting: 'Try adjusting your search or category filter',
      english: 'English',
      ukrainian: 'Українська',
      swipeToSee: 'Swipe to see all',
      categoriesArrow: 'categories →',
      // Project descriptions
      deepWorkDesc: 'Intelligent system for deep work with timers, task tracking and productivity analytics',
      passwordGenDesc: 'Advanced password generator with entropy visualization, breach checking, and secure sharing capabilities',
      jsonFormatterDesc: 'Beautiful JSON editing with syntax highlighting, validation, and diff comparison',
      // Project titles
      deepWorkTitle: 'Deep Work OS',
      passwordGenTitle: 'Smart Password Generator',
      jsonFormatterTitle: 'JSON Formatter & Validator',
      // Tags
      tagReact: 'React',
      tagProductivity: 'Productivity',
      tagDeepWork: 'Deep Work',
      tagTimeTracking: 'Time Tracking',
      tagSecurity: 'Security',
      tagTools: 'Tools',
      tagEncryption: 'Encryption',
      tagJSON: 'JSON',
      tagDeveloperTools: 'Developer Tools',
      tagValidation: 'Validation'
    },
    UA: {
      headerDesc: 'Досліджуйте перетин людської творчості та AI через інтерактивні інструменти й експерименти',
      searchPlaceholder: 'Пошук артефактів...',
      showingAll: (n) => `Показано ${n} артефактів`,
      working: 'Робочі',
      comingSoon: 'Незабаром',
      noResults: 'Артефакти не знайдено',
      footerStatus: (w, c, p) => `${w} робочих • ${c} незабаром • ${p} заплановано`,
      launch: 'Запустити',
      // Categories
      catTopProjects: 'Топ Проєкти',
      catMyFavourite: 'Мої Улюблені',
      catAllProjects: 'Всі Проєкти',
      catDataVisualization: 'Візуалізація Даних',
      catAiTools: 'AI Інструменти',
      catWebApps: 'Веб Додатки',
      catProductivity: 'Продуктивність',
      catBookApps: 'Книжкові Додатки',
      catGames: 'Ігри',
      catExperiments: 'Експерименти',
      // Status descriptions
      topFeatured: 'Топ рекомендовані проєкти',
      favoritePicks: 'улюблених вибірок',
      artifactsIn: 'артефактів в',
      planned: 'Заплановано',
      tryAdjusting: 'Спробуйте змінити пошук або фільтр категорій',
      english: 'English',
      ukrainian: 'Українська',
      swipeToSee: 'Гортайте, щоб побачити всі',
      categoriesArrow: 'категорії →',
      // Project descriptions
      deepWorkDesc: 'Інтелектуальна система для глибокої роботи з таймерами, відстеженням завдань та аналітикою продуктивності',
      passwordGenDesc: 'Розширений генератор паролів з візуалізацією ентропії, перевіркою витоків та безпечним обміном',
      jsonFormatterDesc: 'Красивий редактор JSON з підсвічуванням синтаксису, валідацією та порівнянням різниць',
      // Project titles
      deepWorkTitle: 'Deep Work OS',
      passwordGenTitle: 'Розумний Генератор Паролів',
      jsonFormatterTitle: 'JSON Форматер та Валідатор',
      // Tags
      tagReact: 'React',
      tagProductivity: 'Продуктивність',
      tagDeepWork: 'Глибока Робота',
      tagTimeTracking: 'Відстеження Часу',
      tagSecurity: 'Безпека',
      tagTools: 'Інструменти',
      tagEncryption: 'Шифрування',
      tagJSON: 'JSON',
      tagDeveloperTools: 'Інструменти Розробника',
      tagValidation: 'Валідація'
    }
  };
  const L = TRANS[language] || TRANS.EN;

  // Clean catalog - only 1 working + 2 coming soon
  const mockProjects = [
    // ✅ WORKING ARTIFACTS
    {
      id: 1,
      title: L.deepWorkTitle,
      category: 'productivity',
      tags: [L.tagReact, L.tagProductivity, L.tagDeepWork, L.tagTimeTracking],
      description: L.deepWorkDesc,
      color: '#06b6d4',
      isTop: true,
      isFavorite: true,
      component: 'DeepWorkOS',
      status: 'working'
    },

    // 🔄 COMING SOON - TOP PRIORITY
    {
      id: 2,
      title: L.passwordGenTitle,
      category: 'web-apps',
      tags: [L.tagSecurity, L.tagTools, L.tagEncryption],
      description: L.passwordGenDesc,
      color: '#ff6b6b',
      isTop: true,
      isFavorite: true,
      status: 'coming-soon'
    },
    {
      id: 3,
      title: L.jsonFormatterTitle,
      category: 'ai-tools',
      tags: [L.tagJSON, L.tagDeveloperTools, L.tagValidation],
      description: L.jsonFormatterDesc,
      color: '#45b7d1',
      isTop: true,
      isFavorite: true,
      status: 'coming-soon'
    }
  ];

  const categories = [
    { id: 'top', name: L.catTopProjects, icon: '⭐', special: true },
    { id: 'favorites', name: L.catMyFavourite, icon: '❤️', special: true },
    { id: 'all', name: L.catAllProjects, icon: '🌐' },
    { id: 'data-viz', name: L.catDataVisualization, icon: '📊' },
    { id: 'ai-tools', name: L.catAiTools, icon: '🤖' },
    { id: 'web-apps', name: L.catWebApps, icon: '💻' },
    { id: 'productivity', name: L.catProductivity, icon: '⚡' },
    { id: 'book-apps', name: L.catBookApps, icon: '📚' },
    { id: 'games', name: L.catGames, icon: '🎮' },
    { id: 'experiments', name: L.catExperiments, icon: '🧪' }
  ];

  // Enhanced filtering logic
  const filteredProjects = useMemo(() => {
    return mockProjects.filter(project => {
      // Category filter
      let matchesCategory = true;
      if (selectedCategory === 'top') {
        matchesCategory = project.isTop;
      } else if (selectedCategory === 'favorites') {
        matchesCategory = project.isFavorite;
      } else if (selectedCategory !== 'all') {
        matchesCategory = project.category === selectedCategory;
      }
      
      // Search filter
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [mockProjects, selectedCategory, searchTerm]);

  // 3D Scene Setup
  useEffect(() => {
    console.log('🎬 Starting 3D scene creation...', deviceSettings);
    if (!mountRef.current) {
      console.error('❌ Mount ref not available');
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Create beautiful dark cosmic background
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;

    // Create gradient background
    const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, '#020308');    // Very very dark blue center
    gradient.addColorStop(0.5, '#010203');  // Almost black
    gradient.addColorStop(1, '#000000');    // Pure black edge

    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;
    renderer.setClearColor(0x000000, 1);
    console.log('🖼️ Adding renderer to DOM...', renderer.domElement);
    mountRef.current.appendChild(renderer.domElement);
    console.log('✅ Renderer added to DOM');
    sceneRef.current = { scene, camera, renderer };

    // Camera position - center the view
    camera.position.set(0, 0, 80);
    camera.lookAt(0, 0, 0);


    // Quantum Space Simulation - Heisenberg Uncertainty Principle
    // Particles exist in superposition until user interaction
    const quantumParticles = [];
    const quantumCount = deviceSettings.quality === 'performance' ? 50 :
                        deviceSettings.quality === 'balanced' ? 100 : 200;

    // Simple Perlin-like noise function for smooth randomness
    const noise = (x, y, z, t) => {
      return Math.sin(x * 0.01 + t) * Math.cos(y * 0.01 + t) * Math.sin(z * 0.01 + t * 0.5);
    };

    for (let i = 0; i < quantumCount; i++) {
      const particle = {
        basePosition: new THREE.Vector3(
          (Math.random() - 0.5) * 120,
          (Math.random() - 0.5) * 120,
          (Math.random() - 0.5) * 120
        ),
        uncertainty: Math.random() * 5 + 1, // Uncertainty magnitude
        wavePhase: Math.random() * Math.PI * 2,
        quantumNumber: Math.floor(Math.random() * 5) + 1 // Energy level
      };

      // Create visual representation
      const geometry = new THREE.SphereGeometry(0.2, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(
          0.1 + particle.quantumNumber * 0.15, // Color based on quantum number
          0.8,
          0.6
        ),
        transparent: true,
        opacity: 0.7
      });

      particle.mesh = new THREE.Mesh(geometry, material);
      particle.mesh.position.copy(particle.basePosition);

      quantumParticles.push(particle);
      scene.add(particle.mesh);
    }

    // 4D Tesseract Projection System
    const tesseracts = [];
    const tesseractCount = deviceSettings.quality === 'performance' ? 2 :
                          deviceSettings.quality === 'balanced' ? 3 : 5;

    // 4D Tesseract vertices (hypercube)
    const generate4DVertices = () => {
      const vertices = [];
      for (let x = -1; x <= 1; x += 2) {
        for (let y = -1; y <= 1; y += 2) {
          for (let z = -1; z <= 1; z += 2) {
            for (let w = -1; w <= 1; w += 2) {
              vertices.push([x, y, z, w]);
            }
          }
        }
      }
      return vertices;
    };

    // Project 4D point to 3D space
    const project4Dto3D = (vertex4D, wOffset = 0) => {
      const [x, y, z, w] = vertex4D;
      const distance = 4; // Distance from 4D origin
      const scale = distance / (distance + w + wOffset);
      return new THREE.Vector3(x * scale * 10, y * scale * 10, z * scale * 10);
    };

    // Speed multipliers based on device
    const speedMultiplier = deviceSettings.quality === 'performance' ? 1.0 :  // Mobile - normal speed
                           deviceSettings.quality === 'balanced' ? 0.7 :    // Tablet - bit slower
                           0.4;  // Desktop - much slower for better viewing

    // Create grid layout for even distribution
    const gridSize = Math.ceil(Math.sqrt(tesseractCount));
    const spacing = deviceSettings.quality === 'performance' ? 60 :   // Mobile - closer
                   deviceSettings.quality === 'balanced' ? 80 :      // Tablet - medium
                   120;  // Desktop - far apart for better viewing

    for (let i = 0; i < tesseractCount; i++) {
      // Calculate grid position
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const gridOffset = spacing * (gridSize - 1) / 2; // Center the grid

      const tesseract = {
        vertices4D: generate4DVertices(),
        quantumNumber: i + 1, // Energy level affects frequency
        wPhase: Math.random() * Math.PI * 2, // 4D rotation phase
        breathPhase: Math.random() * Math.PI * 2, // Breathing phase
        speedMultiplier: speedMultiplier, // Device-specific speed
        position: new THREE.Vector3(
          col * spacing - gridOffset + (Math.random() - 0.5) * 20, // Grid + small random offset
          row * spacing - gridOffset + (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 40 // Some Z variation
        ),
        edges: []
      };

      // Create edges between vertices (hypercube connectivity)
      const vertices3D = tesseract.vertices4D.map(v => project4Dto3D(v));

      // Connect vertices that differ by exactly one coordinate
      for (let a = 0; a < tesseract.vertices4D.length; a++) {
        for (let b = a + 1; b < tesseract.vertices4D.length; b++) {
          let differences = 0;
          for (let coord = 0; coord < 4; coord++) {
            if (tesseract.vertices4D[a][coord] !== tesseract.vertices4D[b][coord]) {
              differences++;
            }
          }

          if (differences === 1) { // Adjacent vertices in 4D
            const geometry = new THREE.BufferGeometry().setFromPoints([
              vertices3D[a], vertices3D[b]
            ]);
            const material = new THREE.LineBasicMaterial({
              color: new THREE.Color().setHSL(
                0.4 + tesseract.quantumNumber * 0.1,
                0.9,
                0.7
              ),
              transparent: true,
              opacity: 0.6
            });

            const edge = new THREE.Line(geometry, material);
            edge.position.copy(tesseract.position);
            tesseract.edges.push(edge);
            scene.add(edge);
          }
        }
      }

      tesseracts.push(tesseract);
    }

    // Adaptive animation loop with frame rate control
    let lastTime = 0;
    const targetInterval = 1000 / deviceSettings.frameRate; // Convert FPS to interval

    const animate = (currentTime) => {
      if (currentTime - lastTime >= targetInterval) {
        lastTime = currentTime;

        const time = Date.now() * 0.001;

        // Animate Quantum Particles - Heisenberg Uncertainty Principle
        quantumParticles.forEach((particle, index) => {
          // Superposition - particles oscillate around base position
          const uncertaintyX = noise(particle.basePosition.x, 0, 0, time + particle.wavePhase) * particle.uncertainty;
          const uncertaintyY = noise(0, particle.basePosition.y, 0, time + particle.wavePhase) * particle.uncertainty;
          const uncertaintyZ = noise(0, 0, particle.basePosition.z, time + particle.wavePhase) * particle.uncertainty;

          particle.mesh.position.set(
            particle.basePosition.x + uncertaintyX,
            particle.basePosition.y + uncertaintyY,
            particle.basePosition.z + uncertaintyZ
          );

          // Wave function collapse effect - opacity changes
          const waveFunction = Math.sin(time * particle.quantumNumber + particle.wavePhase);
          particle.mesh.material.opacity = 0.3 + Math.abs(waveFunction) * 0.5;

          // Energy level color shifting
          const hue = 0.1 + particle.quantumNumber * 0.15 + Math.sin(time * 0.5) * 0.1;
          particle.mesh.material.color.setHSL(hue, 0.8, 0.6);
        });

        // Animate 4D Tesseracts - Breathing and Quantum Tunneling
        tesseracts.forEach((tesseract, index) => {
          const breathRate = 0.5 * tesseract.quantumNumber * tesseract.speedMultiplier;
          const wRotationRate = 0.3 * tesseract.quantumNumber * tesseract.speedMultiplier;

          // 4D rotation (w-axis)
          tesseract.wPhase += wRotationRate * 0.01;
          const wOffset = Math.sin(tesseract.wPhase) * 2;

          // Breathing effect - scale changes
          const breathScale = 1 + Math.sin(time * breathRate + tesseract.breathPhase) * 0.3;

          // Update all edges with quantum effects
          tesseract.edges.forEach((edge, edgeIndex) => {
            // Quantum tunneling effect - opacity changes
            const tunnelProbability = Math.sin(time * tesseract.quantumNumber * 2 * tesseract.speedMultiplier + edgeIndex) * 0.5 + 0.5;
            edge.material.opacity = 0.2 + tunnelProbability * 0.6;

            // Tesseract rotation
            edge.rotation.x += 0.005 * tesseract.quantumNumber * tesseract.speedMultiplier;
            edge.rotation.y += 0.007 * tesseract.quantumNumber * tesseract.speedMultiplier;
            edge.rotation.z += 0.003 * tesseract.quantumNumber * tesseract.speedMultiplier;

            // Breathing scale
            edge.scale.setScalar(breathScale);
          });
        });

      // Camera gentle movement
      const cameraTime = Date.now() * 0.0005;
      camera.position.x = Math.sin(cameraTime) * 5;
      camera.position.y = Math.cos(cameraTime * 0.7) * 3;
      camera.lookAt(scene.position);

        renderer.render(scene, camera);
      }
      requestAnimationFrame(animate);
    };

    console.log('🎭 Starting animation loop...');
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
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [deviceSettings]); // Recreate 3D scene when device settings change

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#000000' }}>
      {/* Global styles for mobile optimizations */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none !important;
        }
        .touch-manipulation {
          touch-action: manipulation !important;
        }
        .transform-gpu {
          transform: translateZ(0) !important;
        }
        .will-change-transform {
          will-change: transform !important;
        }

        /* Mobile scroll hints */
        @media (max-width: 768px) {
          .mobile-scroll-container::after {
            content: '';
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 20px;
            background: linear-gradient(to left, rgba(15, 23, 42, 0.8), transparent);
            pointer-events: none;
          }
        }
      `}</style>
        {/* 3D Background */}
        <div
          ref={mountRef}
          className="fixed inset-0"
          style={{ pointerEvents: 'none', zIndex: 0 }}
        />


      {/* Main Content with Glassmorphism */}
      <div className="relative z-10">
        <div className="container mx-auto px-8 py-12 relative overflow-hidden">
          <div className="relative z-10">
          {/* Enhanced Header */}
          <header className="text-center mb-12">
            <div className="mb-6">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 tracking-tight">
                Quantum Vector
              </h1>
              <div className="text-2xl text-cyan-300 font-light mb-2 tracking-wider">
                A R T I F A C T S
              </div>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
                {L.headerDesc}
              </p>
            </div>


            {/* Enhanced Search */}
            <div className="max-w-3xl mx-auto mb-8">
               <div className="flex items-center gap-4">
                 <div className="relative w-[70%]">
                   <input
                     type="text"
                     placeholder={L.searchPlaceholder}
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-cyan-400/70 focus:bg-white/15 transition-all duration-300 shadow-lg"
                   />
                   <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                 </div>

                 {/* Language selector on the right */}
                 <div className="relative" ref={langRef}>
                   <button
                     type="button"
                     aria-expanded={langOpen}
                     onClick={() => setLangOpen(!langOpen)}
                     className="px-3 py-2 rounded-md bg-white/6 text-slate-100 hover:bg-white/10 font-semibold"
                   >
                    {language} <span className="ml-1">▾</span>
                   </button>

                   {langOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50">
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-slate-700"
                        onClick={() => { onLanguageChange('EN'); setLangOpen(false); }}
                      >
                        {L.english}
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-slate-700"
                        onClick={() => { onLanguageChange('UA'); setLangOpen(false); }}
                      >
                        {L.ukrainian}
                      </button>
                    </div>
                   )}
                 </div>
               </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto">
            {/* Enhanced Category Pills */}
            <div className="mb-8">
              {/* Debug: Show total categories on mobile */}
              {deviceSettings.isMobile && (
                <div className="text-center mb-2 text-xs text-gray-400">
                  {L.swipeToSee} {categories.length} {L.categoriesArrow}
                </div>
              )}
              <div className={`mb-6 relative ${
                deviceSettings.isMobile
                  ? 'overflow-x-auto scrollbar-hide -mx-4 mobile-scroll-container'
                  : 'flex flex-wrap justify-center gap-3'
              }`}>
                <div className={`${
                  deviceSettings.isMobile
                    ? 'flex gap-3 px-4 pb-2'
                    : 'flex flex-wrap justify-center gap-3'
                }`} style={deviceSettings.isMobile ? { minWidth: 'max-content' } : {}}>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-500 backdrop-blur-xl border relative overflow-hidden whitespace-nowrap
                      ${deviceSettings.isMobile ? 'touch-manipulation active:scale-95 min-h-[44px] flex items-center flex-shrink-0' : 'hover:scale-110'}
                      ${selectedCategory === category.id
                        ? 'bg-gradient-to-r from-cyan-500/80 to-blue-500/80 text-white border-cyan-400/60 shadow-xl shadow-cyan-500/30 backdrop-blur-xl'
                        : `bg-white/10 text-gray-200 border-white/30 shadow-lg ${
                            deviceSettings.isMobile
                              ? 'active:bg-white/25 active:text-white active:border-white/50'
                              : 'hover:bg-white/20 hover:text-white hover:border-white/50 hover:shadow-xl'
                          }`
                      }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
                </div>
              </div>
              
              {/* Category Description with Stats */}
              <div className="text-center text-gray-400 text-sm">
                <div className="flex items-center justify-center gap-6 mb-2">
                  {selectedCategory === 'all' && (
                    <>
                      <span>{L.showingAll(filteredProjects.length)}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <div className="text-base font-bold text-emerald-400">{mockProjects.filter(p => p.status === 'working').length}</div>
                          <div className="text-xs">{L.working}</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-base font-bold text-amber-400">{mockProjects.filter(p => p.status === 'coming-soon').length}</div>
                          <div className="text-xs">{L.comingSoon}</div>
                        </div>
                      </div>
                    </>
                  )}
                  {selectedCategory === 'top' && `${L.topFeatured} ${filteredProjects.length}`}
                  {selectedCategory === 'favorites' && `${filteredProjects.length} ${L.favoritePicks}`}
                  {!['all', 'top', 'favorites'].includes(selectedCategory) &&
                    `${filteredProjects.length} ${L.artifactsIn} ${categories.find(c => c.id === selectedCategory)?.name}`}
                </div>
              </div>
            </div>
            
            {/* Projects Grid */}
            <div className={`grid gap-6 ${
              deviceSettings.isMobile
                ? 'grid-cols-1 px-4'
                : deviceSettings.isTablet
                ? 'grid-cols-2 px-6'
                : 'grid-cols-3'
            }`}>
              {filteredProjects.map(project => (
                <div
                  key={project.id}
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                  onClick={() => project.component && onNavigateToArtifact?.(project.component, language)}
                  onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && project.component) onNavigateToArtifact?.(project.component, language); }}
                  role={project.component ? 'button' : undefined}
                  tabIndex={project.component ? 0 : undefined}
                  className={`group cursor-pointer transform transition-all duration-300 ${
                    hoveredProject === project.id ? 'scale-105' : ''
                  }`}
                >
                  <div className={`backdrop-blur-xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 rounded-2xl border border-white/30 p-8 shadow-2xl transition-all duration-500 h-full relative overflow-hidden
                    ${deviceSettings.isMobile
                      ? 'active:bg-white/25 active:shadow-3xl active:scale-[0.98] active:border-cyan-400/60 touch-manipulation'
                      : 'hover:bg-white/20 hover:shadow-3xl hover:scale-[1.03] hover:border-cyan-400/50 hover:from-white/20 hover:via-white/15 hover:to-white/10'
                    }
                    ${hoveredProject === project.id ? 'transform-gpu will-change-transform' : ''}
                    before:absolute before:inset-0 before:bg-gradient-to-br before:from-cyan-400/10 before:via-transparent before:to-purple-400/10 before:opacity-0 before:transition-opacity before:duration-500
                    ${hoveredProject === project.id ? 'before:opacity-100' : ''}
                  `}>
                    {/* Project Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2">
                        {project.isTop && (
                          <div className="w-6 h-6 flex items-center justify-center bg-yellow-500/20 rounded-full border border-yellow-400/50">
                            <span className="text-yellow-400 text-xs">⭐</span>
                          </div>
                        )}
                        {project.isFavorite && (
                          <div className="w-6 h-6 flex items-center justify-center bg-red-500/20 rounded-full border border-red-400/50">
                            <span className="text-red-400 text-xs">❤️</span>
                          </div>
                        )}
                        {/* Status indicator */}
                        {project.status === 'working' && (
                          <div className="w-6 h-6 flex items-center justify-center bg-green-500/20 rounded-full border border-green-400/50">
                            <span className="text-green-400 text-xs">✓</span>
                          </div>
                        )}
                        {project.status === 'coming-soon' && (
                          <div className="w-6 h-6 flex items-center justify-center bg-amber-500/20 rounded-full border border-amber-400/50">
                            <span className="text-amber-400 text-xs">⏳</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <h4 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {project.title}
                    </h4>
                    
                    <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-white/10 rounded-md text-xs text-gray-300 border border-white/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions - Always Visible */}
                    <div className="flex gap-2 mt-3">
                      {project.component ? (
                        <button 
                          onClick={() => onNavigateToArtifact?.(project.component, language)}
                           className="flex-1 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-md text-sm hover:bg-cyan-500/30 transition-colors font-semibold border border-cyan-500/30"
                         >
                           🚀 {L.launch}
                         </button>
                      ) : project.status === 'coming-soon' ? (
                        <button className="flex-1 px-3 py-2 bg-amber-500/20 text-amber-400 rounded-md text-sm cursor-default font-semibold border border-amber-500/30">
                          🔄 {L.comingSoon}
                        </button>
                      ) : project.status === 'planned' ? (
                        <button className="flex-1 px-3 py-2 bg-slate-500/20 text-slate-400 rounded-md text-sm cursor-default font-semibold border border-slate-500/30">
                          📋 {L.planned}
                        </button>
                      ) : (
                        <button className="flex-1 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-md text-sm hover:bg-cyan-500/30 transition-colors font-semibold border border-cyan-500/30">
                          🚀 {L.launch}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl text-white mb-2">{L.noResults}</h3>
                <p className="text-gray-400">{L.tryAdjusting}</p>
              </div>
            )}
            
            {/* Footer Info */}
            <div className="text-center mt-12 py-8">
              <div className="inline-flex items-center gap-2 text-sm text-gray-400 bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 shadow-xl">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>{L.footerStatus(1,2,73)}</span>
                <div className="ml-4 flex items-center gap-3">
                  <a href="https://github.com/quantum-vector-io/quantum_vector_artifacts" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white text-xs font-semibold">
                    🐙 GitHub
                  </a>
                  <a href="https://linkedin.com/in/mykola-rudenko-b3791b102" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white text-xs font-semibold">
                    🔗 LinkedIn
                  </a>
                  <a href="https://threads.net/@vajra_dorje_8" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white text-xs font-semibold">
                    🧵 Threads
                  </a>
                </div>
              </div>
            </div>
          </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumCatalog;