/**
 * Web Worker Utilities
 * Helps manage worker communication and provides fallback for environments without worker support
 */

export interface WorkerRequest {
  id: string;
  type: string;
  data: any;
}

export interface WorkerResponse {
  id: string;
  type: string;
  html?: string;
  error?: string;
  latexValidation?: {
    formulas: Array<{
      formula: string;
      type: 'inline' | 'block';
      position: number;
    }>;
    errors: Array<{
      formula: string;
      type: 'inline' | 'block';
      position: number;
      error: string;
    }>;
  };
}

export type WorkerCallback = (response: WorkerResponse) => void;

export class MarkdownWorker {
  private worker: Worker | null = null;
  private callbacks: Map<string, WorkerCallback> = new Map();
  private workerSupported: boolean = typeof Worker !== 'undefined';
  private isProcessing: boolean = false;
  private processingQueue: Array<{ request: WorkerRequest, callback: WorkerCallback }> = [];
  
  constructor() {
    this.initWorker();
  }
  
  /**
   * Initialize the web worker
   */
  private initWorker(): void {
    if (this.workerSupported) {
      try {
        this.worker = new Worker('/workers/markdown-worker.js');
        
        this.worker.addEventListener('message', (event: MessageEvent) => {
          const response = event.data as WorkerResponse;
          const callback = this.callbacks.get(response.id);
          
          if (callback) {
            callback(response);
            this.callbacks.delete(response.id);
          }
          
          this.processNextInQueue();
        });
        
        this.worker.addEventListener('error', (error) => {
          console.error('Worker error:', error);
          // Fall back to main thread processing
          this.workerSupported = false;
          this.processNextInQueue();
        });
      } catch (error) {
        console.error('Failed to initialize worker:', error);
        this.workerSupported = false;
      }
    }
  }
  
  /**
   * Process the next request in the queue
   */
  private processNextInQueue(): void {
    if (this.processingQueue.length === 0) {
      this.isProcessing = false;
      return;
    }
    
    this.isProcessing = true;
    const next = this.processingQueue.shift();
    
    if (next) {
      this.processMarkdown(next.request, next.callback);
    }
  }
  
  /**
   * Process markdown using the worker or fallback
   */
  private processMarkdown(request: WorkerRequest, callback: WorkerCallback): void {
    if (this.workerSupported && this.worker) {
      // Use worker for processing
      this.callbacks.set(request.id, callback);
      this.worker.postMessage(request);
    } else {
      // Fallback to main thread processing
      setTimeout(() => {
        // This would typically import the same functions used in the worker
        // For demonstration, we'll return a simplified response
        const response: WorkerResponse = {
          id: request.id,
          type: 'parse-result',
          html: `<p>Fallback processing: ${request.data.substring(0, 100)}...</p>`,
          latexValidation: {
            formulas: [],
            errors: []
          }
        };
        
        callback(response);
        this.processNextInQueue();
      }, 50);
    }
  }
  
  /**
   * Queue a markdown processing request
   */
  public process(markdown: string, callback: WorkerCallback): void {
    const request: WorkerRequest = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'parse',
      data: markdown
    };
    
    // If worker is busy, add to queue
    if (this.isProcessing) {
      this.processingQueue.push({ request, callback });
      return;
    }
    
    this.isProcessing = true;
    this.processMarkdown(request, (response) => {
      callback(response);
      this.processNextInQueue();
    });
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    this.callbacks.clear();
    this.processingQueue = [];
  }
} 