/**
 * Socket.io client for PANORAMA queue system
 * 
 * Handles real-time updates from server with:
 * - Auto-reconnection
 * - Fallback to polling every 10 seconds
 * - Role-based subscriptions
 * - Patient-specific updates
 */

import { io } from 'socket.io-client';

class QueueSocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.pollingInterval = null;
    this.fallbackMode = false;
    this.role = null;
    this.queueNumber = null;
  }

  /**
   * Initialize socket connection
   * @param {string} role - Admin role (ENTRY, TRANSPORT, etc.) or 'patient'
   * @param {string} queueNumber - Patient's queue number (optional)
   */
  connect(role = null, queueNumber = null) {
    if (this.socket?.connected) {
      return;
    }

    this.role = role;
    this.queueNumber = queueNumber;

    // Try to connect to socket server
    try {
      this.socket = io({
        path: '/api/socketio',
        addTrailingSlash: false,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('Socket connection failed, using polling fallback:', error);
      this.enablePollingFallback();
    }
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.fallbackMode = false;
      this.reconnectAttempts = 0;
      
      // Stop polling if connected
      this.disablePollingFallback();

      // Join appropriate rooms
      if (this.role) {
        this.socket.emit('join:role', this.role);
      }
      if (this.queueNumber) {
        this.socket.emit('join:patient', this.queueNumber);
      }

      this.emit('connected', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', { reason });
      
      // Enable polling fallback if disconnected
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.enablePollingFallback();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('Max reconnect attempts reached, using polling fallback');
        this.enablePollingFallback();
      }
    });

    // Queue events
    this.socket.on('queue:created', (event) => {
      this.emit('queue:created', event);
    });

    this.socket.on('queue:updated', (event) => {
      this.emit('queue:updated', event);
    });

    this.socket.on('queue:moved', (event) => {
      this.emit('queue:moved', event);
    });

    this.socket.on('queue:completed', (event) => {
      this.emit('queue:completed', event);
    });

    // Patient notification events (optional)
    this.socket.on('patient:notification', (event) => {
      this.emit('patient:notification', event);
    });
  }

  /**
   * Enable polling fallback (every 10 seconds)
   */
  enablePollingFallback() {
    if (this.pollingInterval || this.fallbackMode) return;
    
    console.log('Enabling polling fallback (10s interval)');
    this.fallbackMode = true;
    
    this.pollingInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/admin/queue', { 
          cache: 'no-store' 
        });
        if (response.ok) {
          const queues = await response.json();
          this.emit('queue:polled', { queues, timestamp: new Date().toISOString() });
        }
      } catch (error) {
        console.error('Polling fallback error:', error);
      }
    }, 10000); // 10 seconds
  }

  /**
   * Disable polling fallback
   */
  disablePollingFallback() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.fallbackMode = false;
  }

  /**
   * Subscribe to queue events
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Emit event to local listeners
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Join a role room
   * @param {string} role - Admin role
   */
  joinRole(role) {
    this.role = role;
    if (this.socket?.connected) {
      this.socket.emit('join:role', role);
    }
  }

  /**
   * Leave a role room
   * @param {string} role - Admin role
   */
  leaveRole(role) {
    if (this.socket?.connected) {
      this.socket.emit('leave:role', role);
    }
  }

  /**
   * Join patient room
   * @param {string} queueNumber - Queue number
   */
  joinPatient(queueNumber) {
    this.queueNumber = queueNumber;
    if (this.socket?.connected) {
      this.socket.emit('join:patient', queueNumber);
    }
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    this.disablePollingFallback();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.listeners.clear();
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      fallbackMode: this.fallbackMode,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Singleton instance
let socketClient = null;

export function getSocketClient() {
  if (!socketClient) {
    socketClient = new QueueSocketClient();
  }
  return socketClient;
}

export default {
  getSocketClient,
};
