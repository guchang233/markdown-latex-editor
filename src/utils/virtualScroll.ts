/**
 * Virtual Scrolling Utility
 * This helps render only the visible portion of long documents,
 * significantly improving performance with large documents.
 */

export interface VirtualScrollOptions {
  containerElement: HTMLElement;
  itemHeight: number;         // Average height of each item in pixels
  overscan: number;           // Number of items to render beyond visible area
  totalItems: number;         // Total number of items in the list
  renderItem: (index: number) => HTMLElement | string;
}

export interface VirtualScrollState {
  startIndex: number;  // First visible item index
  endIndex: number;    // Last visible item index
  visibleCount: number; // Number of visible items
  scrollTop: number;   // Current scroll position
  totalHeight: number; // Total scrollable height
}

export class VirtualScroll {
  private container: HTMLElement;
  private options: VirtualScrollOptions;
  private state: VirtualScrollState;
  private resizeObserver: ResizeObserver | null = null;
  private scrollHandler: (() => void) | null = null;
  private innerContainer: HTMLElement | null = null;
  private renderTimeout: ReturnType<typeof setTimeout> | null = null;
  
  constructor(options: VirtualScrollOptions) {
    this.container = options.containerElement;
    this.options = {
      ...options,
      overscan: options.overscan || 5,   // Default overscan
    };
    
    this.state = {
      startIndex: 0,
      endIndex: 0,
      visibleCount: 0,
      scrollTop: 0,
      totalHeight: options.totalItems * options.itemHeight
    };
    
    this.init();
  }
  
  /**
   * Initialize virtual scrolling
   */
  private init(): void {
    // Create inner container with proper height
    this.innerContainer = document.createElement('div');
    this.innerContainer.style.position = 'relative';
    this.innerContainer.style.height = `${this.state.totalHeight}px`;
    this.innerContainer.style.width = '100%';
    
    // Clear the container and append inner container
    this.container.innerHTML = '';
    this.container.appendChild(this.innerContainer);
    
    // Calculate initial visible items
    this.calculateVisibleItems();
    
    // Render initial items
    this.render();
    
    // Setup scroll event handling with performance optimizations
    this.scrollHandler = this.handleScroll.bind(this);
    this.container.addEventListener('scroll', this.scrollHandler, { passive: true });
    
    // Setup resize observer
    this.resizeObserver = new ResizeObserver(() => {
      this.calculateVisibleItems();
      this.render();
    });
    this.resizeObserver.observe(this.container);
  }
  
  /**
   * Handle scroll events with debouncing
   */
  private handleScroll(): void {
    // Update scroll position immediately for smooth feel
    this.state.scrollTop = this.container.scrollTop;
    
    // Debounce the actual rendering for performance
    if (this.renderTimeout) {
      cancelAnimationFrame(this.renderTimeout as unknown as number);
    }
    
    this.renderTimeout = requestAnimationFrame(() => {
      this.calculateVisibleItems();
      this.render();
    });
  }
  
  /**
   * Calculate which items should be visible
   */
  private calculateVisibleItems(): void {
    const { itemHeight, overscan, totalItems } = this.options;
    const { scrollTop } = this.state;
    const containerHeight = this.container.clientHeight;
    
    // Calculate visible range with overscan
    let startIndex = Math.floor(scrollTop / itemHeight) - overscan;
    startIndex = Math.max(0, startIndex);
    
    let visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
    visibleCount = Math.min(totalItems - startIndex, visibleCount);
    
    let endIndex = startIndex + visibleCount - 1;
    endIndex = Math.min(totalItems - 1, endIndex);
    
    this.state.startIndex = startIndex;
    this.state.endIndex = endIndex;
    this.state.visibleCount = visibleCount;
  }
  
  /**
   * Render the visible items
   */
  private render(): void {
    if (!this.innerContainer) return;
    
    const { startIndex, endIndex } = this.state;
    const { renderItem, itemHeight } = this.options;
    
    // Clear existing content with minimal DOM operations
    const fragment = document.createDocumentFragment();
    const existingItems = new Set<string>();
    const currentItems = Array.from(this.innerContainer.children);
    
    // Find which items already exist
    currentItems.forEach(child => {
      const index = child.getAttribute('data-index');
      if (index) existingItems.add(index);
    });
    
    // Create or update items
    for (let i = startIndex; i <= endIndex; i++) {
      const existingItem = this.innerContainer.querySelector(`[data-index="${i}"]`);
      
      if (existingItem) {
        // Item already exists, skip
        existingItems.delete(i.toString());
      } else {
        // Create new item
        const result = renderItem(i);
        const itemEl = typeof result === 'string' 
          ? (() => {
              const div = document.createElement('div');
              div.innerHTML = result;
              return div;
            })() 
          : result;
        
        // Position the item absolutely
        itemEl.style.position = 'absolute';
        itemEl.style.top = `${i * itemHeight}px`;
        itemEl.style.left = '0';
        itemEl.style.width = '100%';
        itemEl.style.height = `${itemHeight}px`;
        itemEl.setAttribute('data-index', i.toString());
        
        fragment.appendChild(itemEl);
      }
    }
    
    // Remove items that are no longer visible
    existingItems.forEach(index => {
      const itemToRemove = this.innerContainer!.querySelector(`[data-index="${index}"]`);
      if (itemToRemove) {
        this.innerContainer!.removeChild(itemToRemove);
      }
    });
    
    // Append new items
    this.innerContainer.appendChild(fragment);
  }
  
  /**
   * Scroll to a specific item
   */
  public scrollToIndex(index: number, behavior: ScrollBehavior = 'auto'): void {
    const { itemHeight } = this.options;
    this.container.scrollTo({
      top: index * itemHeight,
      behavior
    });
  }
  
  /**
   * Update the total number of items
   */
  public updateTotalItems(totalItems: number): void {
    this.options.totalItems = totalItems;
    this.state.totalHeight = totalItems * this.options.itemHeight;
    
    if (this.innerContainer) {
      this.innerContainer.style.height = `${this.state.totalHeight}px`;
    }
    
    this.calculateVisibleItems();
    this.render();
  }
  
  /**
   * Clean up event listeners and observers
   */
  public destroy(): void {
    if (this.scrollHandler) {
      this.container.removeEventListener('scroll', this.scrollHandler);
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    if (this.renderTimeout) {
      cancelAnimationFrame(this.renderTimeout as unknown as number);
    }
  }
} 