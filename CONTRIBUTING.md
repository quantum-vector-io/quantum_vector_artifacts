# Contributing to Quantum Vector Artifacts

Thank you for your interest in contributing! 🌌

## 🚀 Adding New Artifacts

1. Create a new `.jsx` file in `src/artifacts/`
2. Follow the metadata schema:

```jsx
export const metadata = {
  title: "Your Tool Name",
  category: "web-apps", // or ai-tools, data-viz, book-apps, games, experiments
  tags: ["React", "Useful", "Cool"],
  description: "Brief description of what it does",
  color: "#hexcolor", // Visual identity color
  isTop: false, // Featured in Top Projects
  isFavorite: false // Featured in Favorites
};
```

3. Export your React component as default
4. Test locally with `npm run dev`
5. Submit PR with descriptive title

## 🎨 Design Guidelines

- Use quantum aesthetic (blues, cyans, purples)
- Implement glassmorphism for UI elements
- Add hover effects and smooth transitions
- Make it responsive and accessible

## 🔧 Development Setup

```bash
npm install
npm run dev
```

## ✨ Code Style

- Use functional components with hooks
- Follow Tailwind CSS conventions
- Add meaningful comments for complex logic
- Test your artifact before submitting

Happy quantum coding! 🚀