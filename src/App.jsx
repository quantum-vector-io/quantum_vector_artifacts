import { useState } from 'react'
import QuantumCatalog from './components/QuantumCatalog'
import DeepWorkOS_UA from './artifacts/DeepWorkOS'
import './styles/globals.css'

// Simple Error Boundary to prevent white screens and show errors
import React from 'react';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 text-white p-6">
          <div className="max-w-3xl bg-slate-800/80 border border-slate-700 p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
            <pre className="text-xs text-red-300 mb-4 whitespace-pre-wrap">{String(this.state.error)}</pre>
            <details className="text-xs text-slate-300">
              <summary className="cursor-pointer">Error details</summary>
              <pre className="mt-2">{this.state.info?.componentStack}</pre>
            </details>
            <div className="mt-4 text-right">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 rounded-md">Reload</button>
              <button onClick={() => this.setState({ hasError: false, error: null, info: null })} className="ml-2 px-4 py-2 bg-gray-700 rounded-md">Dismiss</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [currentView, setCurrentView] = useState('catalog')
  const [currentArtifact, setCurrentArtifact] = useState(null)
  const [currentLanguage, setCurrentLanguage] = useState('EN')

  // Accepts artifactComponent and optional language param
  const navigateToArtifact = (artifactComponent, lang = 'EN') => {
    setCurrentArtifact(artifactComponent)
    setCurrentLanguage(lang)
    setCurrentView('artifact')
  }

  const navigateToCatalog = () => {
    setCurrentView('catalog')
    setCurrentArtifact(null)
  }

  const renderArtifact = (componentName) => {
    switch (componentName) {
      case 'DeepWorkOS':
        return <DeepWorkOS_UA language={currentLanguage} />
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Component Not Available</h1>
              <p className="text-slate-300 mb-6">The requested artifact is not yet implemented.</p>
              <button
                onClick={navigateToCatalog}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all"
              >
                ← Back to Catalog
              </button>
            </div>
          </div>
        )
    }
  }

  if (currentView === 'artifact') {
    return (
      <div className="relative">
        {/* Back button overlay */}
        <div className="fixed top-6 left-6 z-50">
          <button
            onClick={navigateToCatalog}
            className="flex items-center px-4 py-2 bg-slate-800/90 backdrop-blur-sm border border-slate-600/50 rounded-lg text-slate-200 hover:text-slate-100 hover:bg-slate-700/90 transition-all shadow-xl"
          >
            <span className="mr-2">←</span>
            Back to Catalog
          </button>
        </div>
        
        <ErrorBoundary>
          {renderArtifact(currentArtifact)}
        </ErrorBoundary>
      </div>
    )
  }

  return <QuantumCatalog onNavigateToArtifact={navigateToArtifact} />
}

export default App
