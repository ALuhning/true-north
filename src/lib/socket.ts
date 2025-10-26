import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:3002');

class SocketClient {
  private socket: Socket | null = null;

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  subscribeToLeaderboard(): void {
    this.socket?.emit('leaderboard:subscribe');
  }

  onLeaderboardUpdate(callback: () => void): void {
    this.socket?.on('leaderboard:update', callback);
  }

  offLeaderboardUpdate(callback: () => void): void {
    this.socket?.off('leaderboard:update', callback);
  }
}

export const socketClient = new SocketClient();
