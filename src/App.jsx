import { useState } from 'react'
import QuantumCatalog from './components/QuantumCatalog'
import DeepWorkOS_UA from './artifacts/DeepWorkOS'
import './styles/globals.css'

function App() {
  const [currentView, setCurrentView] = useState('catalog')
  const [currentArtifact, setCurrentArtifact] = useState(null)

  const navigateToArtifact = (artifactComponent) => {
    setCurrentArtifact(artifactComponent)
    setCurrentView('artifact')
  }

  const navigateToCatalog = () => {
    setCurrentView('catalog')
    setCurrentArtifact(null)
  }

  const renderArtifact = (componentName) => {
    switch (componentName) {
      case 'DeepWorkOS':
        return <DeepWorkOS_UA />
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
        
        {renderArtifact(currentArtifact)}
      </div>
    )
  }

  return <QuantumCatalog onNavigateToArtifact={navigateToArtifact} />
}

export default App
