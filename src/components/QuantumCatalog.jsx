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

     return {
       isMobile,
       isTablet,
       isDesktop,
       particles: isMobile ? 50 : isTablet ? 200 : 1000,
       foamBubbles: isMobile ? 5 : isTablet ? 10 : 20,
       tesseracts: isMobile ? 1 : isTablet ? 2 : 3,
       quality: isMobile ? 'performance' : isTablet ? 'balanced' : 'beauty',
       frameRate: isMobile ? 30 : 60
     };
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

      setDeviceSettings({
        isMobile,
        isTablet,
        isDesktop,
        particles: isMobile ? 50 : isTablet ? 200 : 1000,
        foamBubbles: isMobile ? 5 : isTablet ? 10 : 20,
        tesseracts: isMobile ? 1 : isTablet ? 2 : 3,
        quality: isMobile ? 'performance' : isTablet ? 'balanced' : 'beauty',
        frameRate: isMobile ? 30 : 60
      });
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
      launch: 'Launch'
    },
    UA: {
      headerDesc: 'Досліджуйте перетин людської творчості та AI через інтерактивні інструменти й експерименти',
      searchPlaceholder: 'Пошук артефактів...',
      showingAll: (n) => `Показано ${n} артефактів`,
      working: 'Робочі',
      comingSoon: 'Незабаром',
      noResults: 'Артефакти не знайдено',
      footerStatus: (w, c, p) => `${w} робочих • ${c} незабаром • ${p} заплановано`,
      launch: 'Запустити'
    }
  };
  const L = TRANS[language] || TRANS.EN;

  // Clean catalog - only 1 working + 2 coming soon
  const mockProjects = [
    // ✅ WORKING ARTIFACTS
    {
      id: 1,
      title: 'Deep Work OS',
      category: 'productivity',
      tags: ['React', 'Productivity', 'Deep Work', 'Time Tracking'],
      description: 'Інтелектуальна система для глибокої роботи з таймерами, відстеженням завдань та аналітикою продуктивності',
      color: '#06b6d4',
      isTop: true,
      isFavorite: true,
      component: 'DeepWorkOS',
      status: 'working'
    },
    
    // 🔄 COMING SOON - TOP PRIORITY
    {
      id: 2,
      title: 'Smart Password Generator',
      category: 'web-apps',
      tags: ['Security', 'Tools', 'Encryption'],
      description: 'Advanced password generator with entropy visualization, breach checking, and secure sharing capabilities',
      color: '#ff6b6b',
      isTop: true,
      isFavorite: true,
      status: 'coming-soon'
    },
    {
      id: 3,
      title: 'JSON Formatter & Validator',
      category: 'ai-tools',
      tags: ['JSON', 'Developer Tools', 'Validation'],
      description: 'Beautiful JSON editing with syntax highlighting, validation, and diff comparison',
      color: '#45b7d1',
      isTop: true,
      isFavorite: true,
      status: 'coming-soon'
    }
  ];

  const categories = [
    { id: 'top', name: 'Top Projects', icon: '⭐', special: true },
    { id: 'favorites', name: 'My Favourite', icon: '❤️', special: true },
    { id: 'all', name: 'All Projects', icon: '🌐' },
    { id: 'data-viz', name: 'Data Visualization', icon: '📊' },
    { id: 'ai-tools', name: 'AI Tools', icon: '🤖' },
    { id: 'web-apps', name: 'Web Apps', icon: '💻' },
    { id: 'productivity', name: 'Productivity', icon: '⚡' },
    { id: 'book-apps', name: 'Book Apps', icon: '📚' },
    { id: 'games', name: 'Games', icon: '🎮' },
    { id: 'experiments', name: 'Experiments', icon: '🧪' }
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
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    sceneRef.current = { scene, camera, renderer };

    // Camera position
    camera.position.z = 50;

    // Quantum Foam Background - Adaptive density
    const foamBubbles = [];
    for (let i = 0; i < deviceSettings.foamBubbles; i++) {
      // Adaptive geometry complexity based on device
      const segments = deviceSettings.quality === 'performance' ? 4 :
                      deviceSettings.quality === 'balanced' ? 6 : 8;
      const geometry = new THREE.SphereGeometry(Math.random() * 0.5 + 0.1, segments, segments);
      const material = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color().setHSL(0.6 + Math.random() * 0.4, 0.7, 0.5),
        transparent: true,
        opacity: 0.3
      });
      const bubble = new THREE.Mesh(geometry, material);
      
      bubble.position.set(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      );
      
      foamBubbles.push(bubble);
      scene.add(bubble);
    }

    // Sacred Geometry - Adaptive Particle System
    const particleCount = deviceSettings.particles;
    const positions = [];
    const colors = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Golden ratio spiral
      const phi = (1 + Math.sqrt(5)) / 2;
      const theta = 2 * Math.PI * i / phi;
      const r = Math.sqrt(i) * 2;
      
      positions.push(
        r * Math.cos(theta),
        r * Math.sin(theta),
        (Math.random() - 0.5) * 50
      );
      
      colors.push(0.3, 0.7, 1.0);
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    // Adaptive particle material settings
    const particleSize = deviceSettings.quality === 'performance' ? 1.5 :
                        deviceSettings.quality === 'balanced' ? 2 : 2.5;
    const particleMaterial = new THREE.PointsMaterial({
      size: particleSize,
      vertexColors: true,
      transparent: true,
      opacity: deviceSettings.quality === 'performance' ? 0.4 : 0.6,
      sizeAttenuation: deviceSettings.quality !== 'performance'
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Tesseract (4D cube projection) - Adaptive complexity
    const tesseracts = [];
    for (let i = 0; i < deviceSettings.tesseracts; i++) {
      const tesseractGroup = new THREE.Group();
      
      // Create multiple cubes for 4D projection
      for (let j = 0; j < 8; j++) {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.1 + i * 0.3, 0.8, 0.6),
          wireframe: true,
          transparent: true,
          opacity: 0.4
        });
        const cube = new THREE.Mesh(geometry, material);
        
        const angle = (j / 8) * Math.PI * 2;
        cube.position.set(
          Math.cos(angle) * 5,
          Math.sin(angle) * 5,
          Math.cos(angle * 0.5) * 3
        );
        
        tesseractGroup.add(cube);
      }
      
      tesseractGroup.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
      
      tesseracts.push(tesseractGroup);
      scene.add(tesseractGroup);
    }

    // Hyperbolic Space Curves
    const curves = [];
    for (let i = 0; i < 5; i++) {
      const points = [];
      for (let t = 0; t <= 1; t += 0.01) {
        const x = Math.sinh(t * 4 - 2) * Math.cos(t * Math.PI * 4);
        const y = Math.sinh(t * 4 - 2) * Math.sin(t * Math.PI * 4);
        const z = Math.cosh(t * 4 - 2) * 0.5;
        points.push(new THREE.Vector3(x * 5, y * 5, z * 2));
      }
      
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.1, 8, false);
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.8, 0.9, 0.7),
        transparent: true,
        opacity: 0.5
      });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      
      tube.position.set(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80
      );
      tube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      
      curves.push(tube);
      scene.add(tube);
    }

    // Adaptive animation loop with frame rate control
    let lastTime = 0;
    const targetInterval = 1000 / deviceSettings.frameRate; // Convert FPS to interval

    const animate = (currentTime) => {
      if (currentTime - lastTime >= targetInterval) {
        lastTime = currentTime;

      // Rotate tesseracts
      tesseracts.forEach((tesseract, index) => {
        tesseract.rotation.x += 0.005 * (index + 1);
        tesseract.rotation.y += 0.007 * (index + 1);
        tesseract.rotation.z += 0.003 * (index + 1);
        
        tesseract.children.forEach((cube, cubeIndex) => {
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.015;
        });
      });

      // Animate foam bubbles
      foamBubbles.forEach((bubble, index) => {
        bubble.position.y += Math.sin(Date.now() * 0.001 + index) * 0.02;
        bubble.rotation.x += 0.005;
        bubble.rotation.y += 0.007;
      });

      // Rotate particle spiral
      particles.rotation.z += 0.002;
      particles.rotation.y += 0.001;

      // Animate curves
      curves.forEach((curve, index) => {
        curve.rotation.x += 0.003 * (index + 1);
        curve.rotation.y += 0.004 * (index + 1);
      });

      // Camera gentle movement
      const time = Date.now() * 0.0005;
      camera.position.x = Math.sin(time) * 5;
      camera.position.y = Math.cos(time * 0.7) * 3;
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
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [deviceSettings]); // Recreate 3D scene when device settings change

  return (
    <>
      {/* Global styles for mobile optimizations */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .touch-manipulation {
          touch-action: manipulation;
        }
        .transform-gpu {
          transform: translateZ(0);
        }
        .will-change-transform {
          will-change: transform;
        }
      `}</style>

      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* 3D Background */}
        <div ref={mountRef} className="fixed inset-0 -z-10" />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950/80 -z-5" />

      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
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
                     className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
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
                        English
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-slate-700"
                        onClick={() => { onLanguageChange('UA'); setLangOpen(false); }}
                      >
                        Українська
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
              <div className={`mb-6 ${
                deviceSettings.isMobile
                  ? 'overflow-x-auto scrollbar-hide'
                  : 'flex flex-wrap justify-center gap-3'
              }`}>
                <div className={`${
                  deviceSettings.isMobile
                    ? 'flex gap-3 px-4 pb-2 min-w-max'
                    : 'flex flex-wrap justify-center gap-3'
                }`}>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-md border
                      ${deviceSettings.isMobile ? 'touch-manipulation active:scale-95 min-h-[44px] flex items-center' : 'hover:scale-105'}
                      ${selectedCategory === category.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-400/50 shadow-lg shadow-cyan-500/25'
                        : `bg-white/10 text-gray-300 border-white/20 ${
                            deviceSettings.isMobile
                              ? 'active:bg-white/20 active:text-white active:border-white/40'
                              : 'hover:bg-white/20 hover:text-white hover:border-white/40'
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
                  {selectedCategory === 'top' && `Top ${filteredProjects.length} featured projects`}
                  {selectedCategory === 'favorites' && `${filteredProjects.length} favorite picks`}
                  {!['all', 'top', 'favorites'].includes(selectedCategory) && 
                    `${filteredProjects.length} artifacts in ${categories.find(c => c.id === selectedCategory)?.name}`}
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
                  onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && project.component) onNavigateToArtifact?.(project.component); }}
                  role={project.component ? 'button' : undefined}
                  tabIndex={project.component ? 0 : undefined}
                  className={`group cursor-pointer transform transition-all duration-300 ${
                    hoveredProject === project.id ? 'scale-105' : ''
                  }`}
                >
                  <div className={`backdrop-blur-md bg-white/10 rounded-xl border border-white/20 p-6 shadow-xl transition-all duration-300 h-full
                    ${deviceSettings.isMobile
                      ? 'active:bg-white/20 active:shadow-2xl active:scale-[0.98] active:border-cyan-400/40 touch-manipulation'
                      : 'hover:bg-white/15 hover:shadow-2xl hover:scale-[1.02] hover:border-cyan-400/30'
                    }
                    ${hoveredProject === project.id ? 'transform-gpu will-change-transform' : ''}
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
                           🚀 Launch
                         </button>
                      ) : project.status === 'coming-soon' ? (
                        <button className="flex-1 px-3 py-2 bg-amber-500/20 text-amber-400 rounded-md text-sm cursor-default font-semibold border border-amber-500/30">
                          🔄 {L.comingSoon}
                        </button>
                      ) : project.status === 'planned' ? (
                        <button className="flex-1 px-3 py-2 bg-slate-500/20 text-slate-400 rounded-md text-sm cursor-default font-semibold border border-slate-500/30">
                          📋 Planned
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
                <p className="text-gray-400">{language === 'EN' ? 'Try adjusting your search or category filter' : 'Спробуйте змінити пошук або фільтр категорій'}</p>
              </div>
            )}
            
            {/* Footer Info */}
            <div className="text-center mt-12 py-8">
              <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white/5 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
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
    </>
  );
};

export default QuantumCatalog;