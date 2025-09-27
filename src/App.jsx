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
  const navigateToArtifact = (artifactComponent, lang = null) => {
    setCurrentArtifact(artifactComponent)
    // If no language is provided, use current language
    if (lang !== null) {
      setCurrentLanguage(lang)
    }
    setCurrentView('artifact')
  }

  const navigateToCatalog = () => {
    setCurrentView('catalog')
    setCurrentArtifact(null)
  }

  const renderArtifact = (componentName) => {
    switch (componentName) {
      case 'DeepWorkOS':
        return <DeepWorkOS_UA language={currentLanguage} onBackToCatalog={navigateToCatalog} />
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">
                {currentLanguage === 'EN' ? 'Component Not Available' : 'Компонент недоступний'}
              </h1>
              <p className="text-slate-300 mb-6">
                {currentLanguage === 'EN' ? 'The requested artifact is not yet implemented.' : 'Запитаний артефакт ще не реалізований.'}
              </p>
              <button
                onClick={navigateToCatalog}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all"
              >
                {currentLanguage === 'EN' ? '← Back to Catalog' : '← Назад до Каталогу'}
              </button>
            </div>
          </div>
        )
    }
  }

  if (currentView === 'artifact') {
    return (
      <div className="relative">
        
        <ErrorBoundary>
          {renderArtifact(currentArtifact)}
        </ErrorBoundary>
      </div>
    )
  }

  return <QuantumCatalog onNavigateToArtifact={navigateToArtifact} language={currentLanguage} onLanguageChange={(lang) => setCurrentLanguage(lang)} />
}

export default App
