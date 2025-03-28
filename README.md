# MarkTeX Editor

A high-performance web-based Markdown and LaTeX editor with real-time preview.

## Features

- **Dual-Pane Editing**: Edit markdown on the left, see rendered output on the right
- **Enhanced Markdown**: Support for GFM extensions (tables, task lists, etc.)
- **LaTeX Integration**: Seamless rendering of mathematical formulas with KaTeX
- **High Performance**: 
  - Web Worker for parsing to prevent UI blocking
  - Virtual scrolling for handling long documents
  - 500ms debounced updates
  - Minimal DOM operations
- **Modern UI**:
  - Light/dark theme support
  - Responsive design (min width 1280px)
  - Clean, distraction-free interface
- **Local Storage**:
  - Automatic saving to IndexedDB
  - Version history (keeps 10 recent versions)
  - Export to Markdown 

## Technical Stack

- **Framework**: Svelte (with TypeScript)
- **Editor**: CodeMirror 6
- **Markdown Processing**: Remarkable + Prism.js
- **Math Rendering**: KaTeX
- **Styling**: UnoCSS (Atomic CSS)
- **Build Tools**: Vite
- **Storage**: IndexedDB API

## Performance Optimizations

- Web Workers for heavy processing
- Virtual scrolling for large documents
- CSS hardware acceleration with will-change properties
- Debounced rendering (500ms)
- Font preloading
- Code splitting and lazy loading
- Efficient DOM updates (<50 nodes per update)

## Development

### Requirements

- Node.js 14+
- npm 7+

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
markdown-latex-editor/
├── public/            # Static assets
│   └── workers/       # Web Workers
├── src/               # Source code
│   ├── components/    # Svelte components
│   ├── stores/        # State management
│   ├── utils/         # Utilities
│   ├── App.svelte     # Main component
│   └── main.ts        # Entry point
├── index.html         # HTML template
└── vite.config.ts     # Vite configuration
```

## Future Extensions

- PDF export functionality
- Collaborative editing support
- Image upload and hosting integration

## Performance Goals

- First load time: <1s
- CPU usage: <30%
- Memory usage: <300MB
- No layout shifting
- LaTeX rendering precision: <5px error

## License

MIT 