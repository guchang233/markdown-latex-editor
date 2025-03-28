import { writable } from 'svelte/store';
import { openDB } from 'idb';

export interface DocumentVersion {
  id: number;
  content: string;
  timestamp: number;
}

export interface DocumentState {
  currentContent: string;
  isSaving: boolean;
  lastSaved: number | null;
  versions: DocumentVersion[];
}

// DB setup for storing document data
const setupDB = async () => {
  return openDB('marktex-editor', 1, {
    upgrade(db) {
      // Create store for document content
      const documentStore = db.createObjectStore('documents', { keyPath: 'id' });
      documentStore.createIndex('timestamp', 'timestamp');
      
      // Create store for document versions
      db.createObjectStore('versions', { keyPath: 'id', autoIncrement: true });
    }
  });
};

// Initialize DB
const dbPromise = setupDB();

// Create document store
const createDocumentStore = () => {
  const initialState: DocumentState = {
    currentContent: '# Welcome to MarkTeX Editor\n\nThis is a **high-performance** Markdown and LaTeX editor.\n\n## Features\n\n- Real-time preview\n- Markdown syntax highlighting\n- LaTeX math rendering: $E = mc^2$\n- Code highlighting\n\n```javascript\nconsole.log("Hello, world!");\n```\n\n## Math Example\n\n$$\n\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)\n$$\n\n## Table Example\n\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n\n## Task List\n\n- [x] Create editor\n- [ ] Add more features\n- [ ] Release to the world\n',
    isSaving: false,
    lastSaved: null,
    versions: []
  };

  const { subscribe, update, set } = writable<DocumentState>(initialState);

  // Debounce helper
  const debounce = (fn: Function, ms = 500) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function(...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
  };

  // Load the document from IndexedDB
  const loadDocument = async () => {
    try {
      const db = await dbPromise;
      const tx = db.transaction('documents', 'readonly');
      const store = tx.objectStore('documents');
      const doc = await store.get('current');
      
      if (doc) {
        set({
          ...initialState,
          currentContent: doc.content,
          lastSaved: doc.timestamp
        });
      }
      
      // Load versions
      const versionTx = db.transaction('versions', 'readonly');
      const versionStore = versionTx.objectStore('versions');
      const versions = await versionStore.getAll();
      
      // Sort versions by timestamp (newest first) and limit to 10
      const sortedVersions = versions
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
      
      update(state => ({ ...state, versions: sortedVersions }));
    } catch (e) {
      console.error('Failed to load document:', e);
    }
  };

  // Save the document to IndexedDB with debounce
  const saveDocument = debounce(async (content: string) => {
    update(state => ({ ...state, isSaving: true }));
    
    try {
      const timestamp = Date.now();
      const db = await dbPromise;
      
      // Save current document
      const tx = db.transaction('documents', 'readwrite');
      const store = tx.objectStore('documents');
      await store.put({
        id: 'current',
        content,
        timestamp
      });
      
      // Save a new version
      const versionTx = db.transaction('versions', 'readwrite');
      const versionStore = versionTx.objectStore('versions');
      await versionStore.add({
        content,
        timestamp
      });
      
      // Clean up old versions (keep only 10)
      const allVersions = await versionStore.getAll();
      if (allVersions.length > 10) {
        const sortedVersions = allVersions.sort((a, b) => b.timestamp - a.timestamp);
        const versionsToDelete = sortedVersions.slice(10);
        
        const deleteVersions = versionsToDelete.map(v => versionStore.delete(v.id));
        await Promise.all(deleteVersions);
      }
      
      // Get updated versions
      const updatedVersions = await versionStore.getAll();
      const sortedUpdatedVersions = updatedVersions
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
      
      // Update state
      update(state => ({
        ...state,
        isSaving: false,
        lastSaved: timestamp,
        versions: sortedUpdatedVersions
      }));
    } catch (e) {
      console.error('Failed to save document:', e);
      update(state => ({ ...state, isSaving: false }));
    }
  });

  // Update the document content
  const updateContent = (content: string) => {
    update(state => ({ ...state, currentContent: content }));
    saveDocument(content);
  };

  // Restore a version
  const restoreVersion = async (versionId: number) => {
    try {
      const db = await dbPromise;
      const tx = db.transaction('versions', 'readonly');
      const store = tx.objectStore('versions');
      const version = await store.get(versionId);
      
      if (version) {
        update(state => ({ ...state, currentContent: version.content }));
        saveDocument(version.content);
      }
    } catch (e) {
      console.error('Failed to restore version:', e);
    }
  };

  // Export the document
  const exportDocument = () => {
    return new Promise<string>((resolve, reject) => {
      update(state => {
        resolve(state.currentContent);
        return state;
      });
    });
  };

  return {
    subscribe,
    updateContent,
    loadDocument,
    restoreVersion,
    exportDocument
  };
};

export const documentStore = createDocumentStore(); 