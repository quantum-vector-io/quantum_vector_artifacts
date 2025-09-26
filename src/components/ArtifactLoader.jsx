import React, { useState, useEffect } from 'react';
import { getAllArtifacts } from '../artifacts/registry.js';

const ArtifactLoader = ({ onArtifactSelect }) => {
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load artifacts from registry
    const loadArtifacts = async () => {
      try {
        const artifactList = getAllArtifacts();
        setArtifacts(artifactList);
      } catch (error) {
        console.error('Error loading artifacts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArtifacts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading quantum artifacts...</span>
      </div>
    );
  }

  return (
    <div className="artifact-loader">
      <h2 className="text-2xl font-bold mb-4">Available Artifacts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artifacts.length > 0 ? (
          artifacts.map((artifact) => (
            <div 
              key={artifact.id} 
              className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onArtifactSelect(artifact)}
            >
              <h3 className="font-semibold">{artifact.name}</h3>
              <p className="text-gray-600 text-sm">{artifact.description}</p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">
            No artifacts available. Start creating your quantum artifacts!
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtifactLoader;