/**
 * EventBus.js — Central pub/sub event system for decoupled communication
 */
export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.unsubscribe(event, callback);
  }

  unsubscribe(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, payload = {}) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        callback(payload);
      }
    }
  }

  once(event, callback) {
    const wrapper = (payload) => {
      callback(payload);
      this.unsubscribe(event, wrapper);
    };
    this.subscribe(event, wrapper);
  }
}

export default EventBus;
