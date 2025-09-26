// Example Artifact Template
export const metadata = {
  id: 'example-artifact',
  title: 'Example Quantum Tool',
  category: 'experiments',
  tags: ['React', 'Example', 'Template'],
  description: 'A template for creating new quantum artifacts',
  color: '#00ff88',
  isTop: false,
  isFavorite: false,
  author: 'Quantum Developer',
  createdAt: '2024-01-01'
};

const ExampleArtifact = () => {
  return (
    <div className="p-8 text-white">
      <h2 className="text-3xl font-bold mb-4 quantum-text-glow">
        Example Quantum Tool
      </h2>
      <p className="text-gray-300 mb-6">
        This is an example artifact. Replace this with your actual component.
      </p>
      <div className="quantum-glow p-4 rounded-lg bg-white/10">
        <p>Your amazing tool interface goes here!</p>
      </div>
    </div>
  );
};

export default ExampleArtifact;