// Auto-generated artifact registry
// This file will be updated by build process

export const artifactRegistry = [
  // Artifacts will be automatically registered here
];

export const getArtifactsByCategory = (category) => {
  if (category === 'all') return artifactRegistry;
  return artifactRegistry.filter(artifact => artifact.category === category);
};

export const searchArtifacts = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return artifactRegistry.filter(artifact => 
    artifact.title.toLowerCase().includes(lowercaseQuery) ||
    artifact.description.toLowerCase().includes(lowercaseQuery) ||
    artifact.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};