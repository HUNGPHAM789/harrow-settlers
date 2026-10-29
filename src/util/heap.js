/**
 * Binary MinHeap implementation using parallel primitive arrays to avoid object allocation.
 * Suitable for high-frequency operations like pathfinding algorithms.
 * @template T
 */
export class MinHeap {
  constructor() {
    /** @type {T[]} */
    this.items = [];
    /** @type {number[]} */
    this.priorities = [];
  }

  /**
   * Number of items currently in the heap.
   * @type {number}
   */
  get size() {
    return this.items.length;
  }

  /**
   * Pushes an item into the heap with a numeric priority.
   * @param {T} item
   * @param {number} priority
   * @throws {TypeError} If priority is not a finite number
   */
  push(item, priority) {
    if (typeof priority !== 'number' || !Number.isFinite(priority)) {
      throw new TypeError('Priority must be a finite number');
    }

    this.items.push(item);
    this.priorities.push(priority);
    this._up(this.items.length - 1);
  }

  /**
   * Removes and returns the item with the minimum priority.
   * @returns {T | undefined}
   */
  pop() {
    if (this.items.length === 0) {
      return undefined;
    }

    const topItem = this.items[0];
    const lastItem = this.items.pop();
    const lastPriority = this.priorities.pop();

    if (this.items.length > 0) {
      this.items[0] = lastItem;
      this.priorities[0] = lastPriority;
      this._down(0);
    }

    return topItem;
  }

  /**
   * Returns the item with minimum priority without removing it.
   * @returns {T | undefined}
   */
  peek() {
    return this.items.length > 0 ? this.items[0] : undefined;
  }

  /**
   * Clears all items from the heap.
   */
  clear() {
    this.items.length = 0;
    this.priorities.length = 0;
  }

  /** @private */
  _up(i) {
    const items = this.items;
    const priorities = this.priorities;

    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (priorities[i] < priorities[parent]) {
        const tmpItem = items[i];
        items[i] = items[parent];
        items[parent] = tmpItem;

        const tmpPri = priorities[i];
        priorities[i] = priorities[parent];
        priorities[parent] = tmpPri;

        i = parent;
      } else {
        break;
      }
    }
  }

  /** @private */
  _down(i) {
    const items = this.items;
    const priorities = this.priorities;
    const len = items.length;

    while (true) {
      const left = (i << 1) + 1;
      const right = left + 1;
      let smallest = i;

      if (left < len && priorities[left] < priorities[smallest]) {
        smallest = left;
      }
      if (right < len && priorities[right] < priorities[smallest]) {
        smallest = right;
      }

      if (smallest !== i) {
        const tmpItem = items[i];
        items[i] = items[smallest];
        items[smallest] = tmpItem;

        const tmpPri = priorities[i];
        priorities[i] = priorities[smallest];
        priorities[smallest] = tmpPri;

        i = smallest;
      } else {
        break;
      }
    }
  }
}
