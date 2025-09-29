import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

const QuantumArtifactsCatalogV3 = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredProject, setHoveredProject] = useState(null);
  const [activeScrollZone, setActiveScrollZone] = useState('main');

  // Expanded mock data з Book Apps
  const mockProjects = [
    {
      id: 1,
      title: 'Quantum Data Dashboard',
      category: 'data-viz',
      tags: ['React', 'D3.js', 'Analytics'],
      description: 'Interactive dashboard for quantum data visualization with real-time updates',
      color: '#00ff88',
      isTop: true,
      isFavorite: true
    },
    {
      id: 2,
      title: 'AI Chat Interface',
      category: 'ai-tools',
      tags: ['React', 'AI', 'ChatGPT'],
      description: 'Modern chat interface with AI capabilities and voice recognition',
      color: '#ff3366',
      isTop: true,
      isFavorite: false
    },
    {
      id: 3,
      title: 'Neural Network Visualizer',
      category: 'data-viz',
      tags: ['Three.js', 'ML', 'Visualization'],
      description: '3D neural network architecture viewer with interactive nodes',
      color: '#3366ff',
      isTop: false,
      isFavorite: true
    },
    {
      id: 4,
      title: 'Productivity Timer',
      category: 'web-apps',
      tags: ['React', 'Productivity', 'PWA'],
      description: 'Advanced pomodoro timer with analytics and habit tracking',
      color: '#ff8800',
      isTop: true,
      isFavorite: false
    },
    {
      id: 5,
      title: 'Quantum Tetris',
      category: 'games',
      tags: ['JavaScript', 'Canvas', 'Physics'],
      description: 'Tetris with quantum mechanics twist and superposition blocks',
      color: '#8800ff',
      isTop: false,
      isFavorite: true
    },
    {
      id: 6,
      title: 'Data Pipeline Monitor',
      category: 'ai-tools',
      tags: ['Python', 'Monitoring', 'ETL'],
      description: 'Real-time data pipeline health dashboard with anomaly detection',
      color: '#00ffff',
      isTop: false,
      isFavorite: false
    },
    {
      id: 7,
      title: 'Digital Library Manager',
      category: 'book-apps',
      tags: ['React', 'Database', 'Organization'],
      description: 'Personal digital library with smart categorization and search',
      color: '#8b4513',
      isTop: true,
      isFavorite: true
    },
    {
      id: 8,
      title: 'Speed Reading Trainer',
      category: 'book-apps',
      tags: ['JavaScript', 'Education', 'Productivity'],
      description: 'Interactive speed reading exercises with comprehension tests',
      color: '#ff6b6b',
      isTop: false,
      isFavorite: true
    },
    {
      id: 9,
      title: 'Book Quote Generator',
      category: 'book-apps',
      tags: ['API', 'Literature', 'Inspiration'],
      description: 'Beautiful quote generator from classic literature with sharing',
      color: '#4ecdc4',
      isTop: false,
      isFavorite: false
    },
    {
      id: 10,
      title: 'Reading Progress Tracker',
      category: 'book-apps',
      tags: ['React', 'Analytics', 'Habits'],
      description: 'Track reading goals, progress, and build consistent habits',
      color: '#45b7d1',
      isTop: true,
      isFavorite: false
    },
    {
      id: 11,
      title: 'Interactive Story Builder',
      category: 'book-apps',
      tags: ['JavaScript', 'Creative', 'Interactive'],
      description: 'Create branching interactive stories with visual editor',
      color: '#96ceb4',
      isTop: false,
      isFavorite: true
    },
    {
      id: 12,
      title: 'Book Recommendation AI',
      category: 'book-apps',
      tags: ['AI', 'Machine Learning', 'Personalization'],
      description: 'AI-powered book recommendations based on reading history',
      color: '#feca57',
      isTop: true,
      isFavorite: false
    },
    {
      id: 13,
      title: 'Crypto Portfolio Tracker',
      category: 'web-apps',
      tags: ['React', 'API', 'Finance'],
      description: 'Real-time cryptocurrency portfolio management with DeFi integration',
      color: '#f39c12',
      isTop: false,
      isFavorite: true
    },
    {
      id: 14,
      title: 'Voice Command Assistant',
      category: 'ai-tools',
      tags: ['JavaScript', 'Speech API', 'AI'],
      description: 'Voice-controlled productivity assistant with natural language processing',
      color: '#e74c3c',
      isTop: true,
      isFavorite: false
    },
    {
      id: 15,
      title: 'Interactive Code Editor',
      category: 'web-apps',
      tags: ['React', 'Monaco', 'CodeMirror'],
      description: 'Advanced code editor with live preview and collaborative features',
      color: '#9b59b6',
      isTop: false,
      isFavorite: false
    },
    {
      id: 16,
      title: 'Weather Mood Visualizer',
      category: 'data-viz',
      tags: ['D3.js', 'API', 'Canvas'],
      description: 'Artistic weather data visualization with emotional color mapping',
      color: '#3498db',
      isTop: false,
      isFavorite: true
    },
    {
      id: 17,
      title: 'Memory Palace Builder',
      category: 'games',
      tags: ['Three.js', 'VR', 'Memory'],
      description: '3D memory enhancement training tool with spatial mnemonics',
      color: '#2ecc71',
      isTop: true,
      isFavorite: false
    },
    {
      id: 18,
      title: 'Smart Habit Tracker',
      category: 'web-apps',
      tags: ['React', 'LocalStorage', 'Analytics'],
      description: 'Intelligent habit formation companion with behavioral insights',
      color: '#f1c40f',
      isTop: false,
      isFavorite: false
    },
    {
      id: 19,
      title: 'Quantum Maze Generator',
      category: 'games',
      tags: ['JavaScript', 'Algorithms', 'Canvas'],
      description: 'Procedural maze with quantum mechanics and entangled pathways',
      color: '#e67e22',
      isTop: false,
      isFavorite: true
    },
    {
      id: 20,
      title: 'AI Code Reviewer',
      category: 'ai-tools',
      tags: ['Python', 'AST', 'Machine Learning'],
      description: 'Automated code quality analysis tool with smart suggestions',
      color: '#34495e',
      isTop: true,
      isFavorite: false
    },
    {
      id: 21,
      title: 'Biometric Data Explorer',
      category: 'data-viz',
      tags: ['React', 'Recharts', 'Health'],
      description: 'Personal health metrics visualization with trend analysis',
      color: '#16a085',
      isTop: false,
      isFavorite: false
    },
    {
      id: 22,
      title: 'Fractal Art Generator',
      category: 'experiments',
      tags: ['Canvas', 'Math', 'WebGL'],
      description: 'Interactive fractal geometry creator with parameter tweaking',
      color: '#8e44ad',
      isTop: false,
      isFavorite: true
    },
    {
      id: 23,
      title: 'Meditation Soundscape',
      category: 'experiments',
      tags: ['Web Audio', 'Ambient', 'Wellness'],
      description: 'Generative ambient soundscape for meditation and focus',
      color: '#95a5a6',
      isTop: false,
      isFavorite: true
    },
    {
      id: 24,
      title: 'Knowledge Graph Explorer',
      category: 'data-viz',
      tags: ['D3.js', 'Graph Theory', 'Interactive'],
      description: 'Interactive knowledge graph with semantic relationships',
      color: '#1abc9c',
      isTop: false,
      isFavorite: false
    },
    {
      id: 25,
      title: 'Space Debris Tracker',
      category: 'experiments',
      tags: ['Three.js', 'Space', 'Real-time'],
      description: 'Real-time 3D visualization of space debris and satellites',
      color: '#2c3e50',
      isTop: true,
      isFavorite: true
    },
    {
      id: 26,
      title: 'Deep Work OS',
      category: 'web-apps',
      tags: ['React', 'Productivity', 'Deep Work'],
      description: 'Comprehensive deep work management system with time tracking, task management, and analytics',
      color: '#6366f1',
      isTop: true,
      isFavorite: true,
      component: 'DeepWorkOS'
    },
    {
      id: 27,
      title: 'Інтегрована Модель: Глибина та Ефективність',
      category: 'book-apps',
      tags: ['React', 'Education', 'Productivity', 'Deep Work'],
      description: 'Інтерактивна модель синтезу першопринципів «7 звичок» С. Кові та «Глибокої роботи» К. Ньюпорта',
      color: '#8b5cf6',
      isTop: true,
      isFavorite: true,
      component: 'IntegratedProductivityModel'
    },
    {
      id: 28,
      title: 'Quantum Chess',
      category: 'games',
      tags: ['JavaScript', 'Chess', 'Quantum'],
      description: 'Chess variant with quantum superposition moves',
      color: '#d35400',
      isTop: false,
      isFavorite: false
    }
  ];

  const categories = [
    { id: 'top', name: 'Top Projects', icon: '⭐', special: true },
    { id: 'favorites', name: 'My Favourite', icon: '❤️', special: true },
    { id: 'all', name: 'All Projects', icon: '🌐' },
    { id: 'data-viz', name: 'Data Visualization', icon: '📊' },
    { id: 'ai-tools', name: 'AI Tools', icon: '🤖' },
    { id: 'web-apps', name: 'Web Apps', icon: '💻' },
    { id: 'book-apps', name: 'Book Apps', icon: '📚' },
    { id: 'games', name: 'Games', icon: '🎮' },
    { id: 'experiments', name: 'Experiments', icon: '🧪' }
  ];

  // Фільтрація проектів
  const filteredProjects = useMemo(() => {
    return mockProjects.filter(project => {
      let matchesCategory = false;
      
      if (selectedCategory === 'all') {
        matchesCategory = true;
      } else if (selectedCategory === 'top') {
        matchesCategory = project.isTop;
      } else if (selectedCategory === 'favorites') {
        matchesCategory = project.isFavorite;
      } else {
        matchesCategory = project.category === selectedCategory;
      }
      
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  // Scroll zone management
  useEffect(() => {
    const handleMouseEnter = (e) => {
      const target = e.currentTarget;
      if (target.classList.contains('scroll-zone-main')) {
        setActiveScrollZone('main');
      } else if (target.classList.contains('scroll-zone-sidebar')) {
        setActiveScrollZone('sidebar');
      } else if (target.classList.contains('scroll-zone-header')) {
        setActiveScrollZone('header');
      }
    };

    const scrollZones = document.querySelectorAll('.scroll-zone-main, .scroll-zone-sidebar, .scroll-zone-header');
    scrollZones.forEach(zone => {
      zone.addEventListener('mouseenter', handleMouseEnter);
    });

    return () => {
      scrollZones.forEach(zone => {
        zone.removeEventListener('mouseenter', handleMouseEnter);
      });
    };
  }, []);

  // Quantum Vector Field Manifold
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000511, 0.95);
    mountRef.current.appendChild(renderer.domElement);

    // Quantum foam bubbles
    const foamBubbles = [];
    for (let i = 0; i < 60; i++) {
      const geometry = new THREE.SphereGeometry(Math.random() * 0.4 + 0.1, 8, 6);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.7, 0.3),
        transparent: true,
        opacity: Math.random() * 0.3 + 0.1,
        blending: THREE.AdditiveBlending
      });
      const bubble = new THREE.Mesh(geometry, material);
      bubble.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
      bubble.userData = {
        originalOpacity: bubble.material.opacity,
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.015
      };
      scene.add(bubble);
      foamBubbles.push(bubble);
    }

    // Tesseract wireframes
    const createTesseract = (size, position) => {
      const vertices = [];
      for (let i = 0; i < 16; i++) {
        const x = ((i & 1) ? 1 : -1) * size;
        const y = ((i & 2) ? 1 : -1) * size;
        const z = ((i & 4) ? 1 : -1) * size;
        const w = ((i & 8) ? 1 : -1) * size;
        const perspective = 2 / (2 - w * 0.3);
        vertices.push(new THREE.Vector3(x * perspective, y * perspective, z * perspective));
      }

      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];

      const edges = [
        [0,1],[1,3],[3,2],[2,0], [4,5],[5,7],[7,6],[6,4],
        [8,9],[9,11],[11,10],[10,8], [12,13],[13,15],[15,14],[14,12],
        [0,4],[1,5],[2,6],[3,7], [8,12],[9,13],[10,14],[11,15]
      ];

      edges.forEach(([a, b]) => {
        positions.push(vertices[a].x, vertices[a].y, vertices[a].z);
        positions.push(vertices[b].x, vertices[b].y, vertices[b].z);
        
        const hue = 0.65 + Math.sin(a * 0.3) * 0.15;
        const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
        colors.push(color.r, color.g, color.b);
        colors.push(color.r, color.g, color.b);
      });

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });

      const tesseract = new THREE.LineSegments(geometry, material);
      tesseract.position.copy(position);
      return tesseract;
    };

    const tesseracts = [];
    for (let i = 0; i < 3; i++) {
      const tesseract = createTesseract(
        6 + i * 2, 
        new THREE.Vector3(
          (Math.random() - 0.5) * 50, 
          (Math.random() - 0.5) * 50, 
          (Math.random() - 0.5) * 50
        )
      );
      scene.add(tesseract);
      tesseracts.push(tesseract);
    }

    // Sacred geometry mandala
    const createMandala = (radius, complexity) => {
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];

      for (let layer = 0; layer < 4; layer++) {
        const layerRadius = radius * (0.3 + layer * 0.2);
        const points = complexity * (layer + 1);
        
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const goldenAngle = angle * 1.618;
          
          const x = Math.cos(angle) * layerRadius * (1 + 0.2 * Math.sin(goldenAngle * 3));
          const y = Math.sin(angle) * layerRadius * (1 + 0.2 * Math.cos(goldenAngle * 2));
          const z = Math.sin(goldenAngle) * 1.5;

          positions.push(x, y, z);

          const hue = (layer * 0.2 + i / points * 0.3) % 1;
          const color = new THREE.Color().setHSL(0.7 + hue * 0.15, 0.8, 0.4);
          colors.push(color.r, color.g, color.b);
        }
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.6
      });

      return new THREE.Points(geometry, material);
    };

    const mandala = createMandala(20, 6);
    mandala.position.z = -25;
    scene.add(mandala);

    // Vector field ribbons
    const createVectorField = () => {
      const curves = [];
      for (let i = 0; i < 8; i++) {
        const points = [];
        const startPoint = new THREE.Vector3(
          (Math.random() - 0.5) * 80,
          (Math.random() - 0.5) * 80,
          (Math.random() - 0.5) * 80
        );
        
        for (let j = 0; j < 40; j++) {
          const t = j / 39;
          const x = startPoint.x + Math.sin(t * Math.PI * 2.5 + i) * 15;
          const y = startPoint.y + Math.cos(t * Math.PI * 1.8 + i * 0.7) * 15;
          const z = startPoint.z + Math.sin(t * Math.PI * 3 + i * 1.1) * 10;
          points.push(new THREE.Vector3(x, y, z));
        }

        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, 40, 0.08, 4, false);
        
        const hue = 0.55 + i * 0.04;
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(hue, 0.7, 0.3),
          transparent: true,
          opacity: 0.25,
          blending: THREE.AdditiveBlending
        });

        const ribbon = new THREE.Mesh(geometry, material);
        scene.add(ribbon);
        curves.push(ribbon);
      }
      return curves;
    };

    const vectorField = createVectorField();

    camera.position.z = 35;
    let mouseX = 0, mouseY = 0;
    let time = 0;

    sceneRef.current = { 
      scene, camera, renderer, tesseracts, foamBubbles, mandala, vectorField
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.004;

      // Quantum foam breathing
      foamBubbles.forEach((bubble, i) => {
        bubble.userData.phase += bubble.userData.speed;
        const breath = Math.sin(bubble.userData.phase) * 0.5 + 0.5;
        bubble.material.opacity = bubble.userData.originalOpacity * (0.3 + breath * 0.7);
        bubble.scale.setScalar(0.8 + breath * 0.3);
        
        if (Math.random() < 0.0003) {
          bubble.position.set(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100
          );
        }
      });

      // Tesseract calm breathing rotation
      tesseracts.forEach((tesseract, i) => {
        tesseract.rotation.x += 0.0004 * (i + 1);
        tesseract.rotation.y += 0.0006 * (i + 1);
        tesseract.rotation.z += 0.0002 * (i + 1);
        
        const breathPhase = time * 0.6 + i * 1.5;
        const breathScale = 1 + Math.sin(breathPhase) * 0.08;
        const floatY = Math.sin(breathPhase * 0.8) * 1.5;
        const floatX = Math.cos(breathPhase * 0.6) * 1;
        
        tesseract.scale.setScalar(breathScale);
        tesseract.position.y += floatY * 0.015;
        tesseract.position.x += floatX * 0.01;
      });

      // Sacred geometry mandala
      mandala.rotation.z += 0.0008;
      const positions = mandala.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] += Math.sin(time * 1.5 + i * 0.008) * 0.5;
      }
      mandala.geometry.attributes.position.needsUpdate = true;

      // Vector field flow
      vectorField.forEach((ribbon, i) => {
        ribbon.rotation.x += 0.0008 * (i % 3 + 1);
        ribbon.rotation.y += 0.001 * (i % 2 + 1);
      });

      // Subtle camera movement
      camera.position.x += (mouseX - camera.position.x) * 0.003;
      camera.position.y += (mouseY - camera.position.y) * 0.003;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Mouse interaction
    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 8;
      mouseY = -(event.clientY / window.innerHeight - 0.5) * 8;
      
      tesseracts.forEach((tesseract, i) => {
        const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
        const gravityWell = Math.max(0, (8 - distance) / 8);
        tesseract.scale.setScalar(1 + gravityWell * 0.15);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Global Styles */}
      <style jsx global>{`
        .scroll-zone-main:hover {
          box-shadow: inset 0 0 0 1px rgba(0, 255, 255, 0.4);
          border-radius: 16px;
          transition: box-shadow 0.3s ease;
        }
        .scroll-zone-sidebar:hover .backdrop-blur-md {
          box-shadow: inset 0 0 0 1px rgba(255, 255, 0, 0.4);
          border-radius: 16px;
          transition: box-shadow 0.3s ease;
        }
        .scroll-zone-header:hover .backdrop-blur-md {
          box-shadow: inset 0 0 0 1px rgba(255, 0, 255, 0.4);
          border-radius: 16px;
          transition: box-shadow 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          transition: background 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          transition: background 0.3s ease;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>

      {/* Three.js Background */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Glassmorphism UI Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Header with Scroll Zone */}
        <header className="p-6 flex-shrink-0 scroll-zone-header">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-6 shadow-2xl">
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Quantum Vector Artifacts
            </h1>
            <p className="text-gray-300">AI-Human collaboration experiments in interactive development</p>
            
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search artifacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              />
            </div>

            {/* Active scroll zone indicator */}
            <div className="mt-2 text-xs text-gray-400">
              Active scroll zone: <span className="text-cyan-400 font-medium">{activeScrollZone}</span>
              {activeScrollZone === 'header' && <span className="ml-2 text-purple-400">🔍 Search zone</span>}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex px-6 pb-6 min-h-0">
          {/* Sidebar with Scroll Zone */}
          <aside className="w-80 mr-6 flex-shrink-0 scroll-zone-sidebar">
            <div 
              className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-6 shadow-2xl"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                Categories
                {activeScrollZone === 'sidebar' && <span className="text-yellow-400 text-sm">📂</span>}
              </h3>
              <div 
                className="space-y-2 overflow-y-auto pr-2 sidebar-scroll"
                style={{ 
                  maxHeight: 'calc(100vh - 280px)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
                }}
              >
                {categories.map((category, index) => {
                  let projectCount;
                  if (category.id === 'all') {
                    projectCount = mockProjects.length;
                  } else if (category.id === 'top') {
                    projectCount = mockProjects.filter(p => p.isTop).length;
                  } else if (category.id === 'favorites') {
                    projectCount = mockProjects.filter(p => p.isFavorite).length;
                  } else {
                    projectCount = mockProjects.filter(p => p.category === category.id).length;
                  }

                  const isLastSpecial = category.special && index < categories.length - 1 && !categories[index + 1]?.special;

                  return (
                    <div key={category.id}>
                      <button
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                          selectedCategory === category.id
                            ? category.special 
                              ? 'bg-gradient-to-r from-yellow-500/20 to-red-500/20 text-white border border-yellow-400/50 shadow-lg'
                              : 'bg-white/20 text-white border border-white/30'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className={`text-xl ${category.special ? 'animate-pulse' : ''}`}>
                          {category.icon}
                        </span>
                        <span className={`font-medium ${category.special ? 'font-bold' : ''}`}>
                          {category.name}
                        </span>
                        <span className="ml-auto text-sm opacity-60">
                          {projectCount}
                        </span>
                      </button>
                      {isLastSpecial && (
                        <div className="my-4 border-t border-white/10"></div>
                      )}
                    </div>
                  );
                })}
                
                {/* Scroll hint */}
                <div className="text-center py-2 opacity-40">
                  <div className="text-xs text-gray-500">
                    {categories.length > 8 ? 'Hover & scroll for more' : ''}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content with Scroll Zone */}
          <main className="flex-1 min-w-0 scroll-zone-main">
            <div 
              className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl h-full flex flex-col"
              style={{ height: 'calc(100vh - 200px)' }}
            >
              {/* Scroll Indicator */}
              {filteredProjects.length > 6 && (
                <div className="flex items-center justify-between mb-4 text-sm text-gray-400 flex-shrink-0">
                  <span>Showing {filteredProjects.length} projects</span>
                  <span className="flex items-center gap-2">
                    <span>Scroll to explore</span>
                    <div className="w-1 h-4 bg-gradient-to-b from-white/40 to-transparent rounded-full animate-pulse"></div>
                    {activeScrollZone === 'main' && <span className="text-cyan-400">📊</span>}
                  </span>
                </div>
              )}
              
              {/* Scrollable Content */}
              <div 
                className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map(project => (
                    <div
                      key={project.id}
                      onMouseEnter={() => setHoveredProject(project.id)}
                      onMouseLeave={() => setHoveredProject(null)}
                      className={`group cursor-pointer transform transition-all duration-300 ${
                        hoveredProject === project.id ? 'scale-105' : ''
                      }`}
                    >
                      <div className="backdrop-blur-md bg-white/10 rounded-xl border border-white/20 p-6 shadow-xl hover:bg-white/15 transition-all duration-300 h-full">
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

                        {/* Actions */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-md text-sm hover:bg-cyan-500/30 transition-colors">
                            Demo
                          </button>
                          <button className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-md text-sm hover:bg-purple-500/30 transition-colors">
                            Code
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* End indicator */}
                {filteredProjects.length > 12 && (
                  <div className="mt-8 text-center py-4">
                    <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                      <span>End of catalog</span>
                      <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    </div>
                  </div>
                )}

                {/* No Results */}
                {filteredProjects.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl text-white mb-2">No artifacts found</h3>
                    <p className="text-gray-400">Try adjusting your search or category filter</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Enhanced Floating Stats */}
      <div className="absolute top-6 right-6 z-20 space-y-3">
        <div className="backdrop-blur-md bg-white/10 rounded-xl border border-white/20 p-4 shadow-xl">
          <div className="text-2xl font-bold text-white">{filteredProjects.length}</div>
          <div className="text-sm text-gray-300">Active Experiments</div>
        </div>
        
        {/* Scroll Zone Indicator */}
        <div className="backdrop-blur-md bg-white/5 rounded-xl border border-white/10 p-3 shadow-xl">
          <div className="text-xs text-gray-400 mb-1">Active Zone</div>
          <div className={`text-sm font-medium flex items-center gap-2 ${
            activeScrollZone === 'main' ? 'text-cyan-400' : 
            activeScrollZone === 'sidebar' ? 'text-yellow-400' : 
            'text-purple-400'
          }`}>
            {activeScrollZone === 'main' && '📊 Projects'}
            {activeScrollZone === 'sidebar' && '📂 Categories'}
            {activeScrollZone === 'header' && '🔍 Search'}
            <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumArtifactsCatalogV3;