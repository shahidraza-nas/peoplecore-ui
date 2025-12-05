import { Socket } from 'socket.io-client';

export const connectSocket = (token: string): Socket | null => {
    return null;
};

export const disconnectSocket = () => {
};

export const getSocket = (): Socket | null => {
    return null;
};

// Event emitters - these now require socket to be passed from context
export const emitMessage = (socket: Socket | null, data: { toUserUid: string; chatUid: string; message: string }) => {
    if (!socket?.connected) {
        return;
    }
    socket.emit('user.message', data);
};

export const emitTyping = (socket: Socket | null, data: { toUserId: number; isTyping: boolean; chatUid: string }) => {
    if (!socket?.connected) {
        return;
    }
    socket.emit('user.typing', data);
};

// Event listeners - these now require socket to be passed from context
export const onMessage = (socket: Socket | null, callback: (data: any) => void) => {
    if (!socket) {
        return;
    }
    socket.on('user.message', callback);
};

export const onTyping = (socket: Socket | null, callback: (data: any) => void) => {
    if (!socket) {
        return;
    }
    socket.on('user.typing', callback);
};

export const onUserOnline = (socket: Socket | null, callback: (data: { userId: number }) => void) => {
    if (!socket) return;
    socket.on('user.online', callback);
};

export const onUserOffline = (socket: Socket | null, callback: (data: { userId: number }) => void) => {
    if (!socket) return;
    socket.on('user.offline', callback);
};

export const onOnlineUsersList = (socket: Socket | null, callback: (data: { userIds: number[] }) => void) => {
    if (!socket) return;
    socket.on('onlineUsers.list', callback);
};

export const offMessage = (socket: Socket | null, callback?: (data: any) => void) => {
    if (!socket) return;
    if (callback) {
        socket.off('user.message', callback);
    } else {
        socket.off('user.message');
    }
};

export const offTyping = (socket: Socket | null, callback?: (data: any) => void) => {
    if (!socket) return;
    if (callback) {
        socket.off('user.typing', callback);
    } else {
        socket.off('user.typing');
    }
};

export const offUserOnline = (socket: Socket | null, callback?: (data: any) => void) => {
    if (!socket) return;
    if (callback) {
        socket.off('user.online', callback);
    } else {
        socket.off('user.online');
    }
};

export const offUserOffline = (socket: Socket | null, callback?: (data: any) => void) => {
    if (!socket) return;
    if (callback) {
        socket.off('user.offline', callback);
    } else {
        socket.off('user.offline');
    }
};

export const offOnlineUsersList = (socket: Socket | null, callback?: (data: any) => void) => {
    if (!socket) return;
    if (callback) {
        socket.off('onlineUsers.list', callback);
    } else {
        socket.off('onlineUsers.list');
    }
};

export const onMessagesRead = (socket: Socket | null, callback: (data: { chatUid: string; readBy: number }) => void) => {
    if (!socket) return;
    socket.on('messages.read', callback);
};

export const offMessagesRead = (socket: Socket | null, callback?: (data: any) => void) => {
    if (!socket) return;
    if (callback) {
        socket.off('messages.read', callback);
    } else {
        socket.off('messages.read');
    }
};
