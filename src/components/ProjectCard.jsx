import React from 'react';

const ProjectCard = ({ project, onSelect }) => {
  const {
    id,
    name,
    description,
    category,
    difficulty,
    tags = [],
    preview,
    status = 'available'
  } = project;

  return (
    <div className="project-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Preview Image/Canvas */}
      <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-600 relative">
        {preview ? (
          <img 
            src={preview} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">🌌</span>
              </div>
              <p className="text-sm opacity-80">Quantum Artifact</p>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'completed' ? 'bg-green-500 text-white' :
            status === 'in-progress' ? 'bg-yellow-500 text-black' :
            'bg-gray-500 text-white'
          }`}>
            {status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-900 truncate">{name}</h3>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
            difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
            difficulty === 'advanced' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {difficulty}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {description}
        </p>

        {/* Category */}
        <div className="mb-3">
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {category}
          </span>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onSelect(project)}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium text-sm"
        >
          {status === 'completed' ? 'View Project' : 'Start Building'}
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;