import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
    if (socket?.connected) {
        return socket;
    }

    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    socket = io(url, {
        query: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        autoConnect: true,
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error: any) => {
        console.log(error)
        // console.error('Socket connection error:', {
        //     message: error.message,
        //     description: error.description,
        //     context: error.context,
        //     type: error.type,
        //     data: error.data,
        // });

        // Check if it's an authentication error
        const errorMsg = error.message?.toLowerCase() || '';
        if (
            errorMsg.includes('jwt expired') ||
            errorMsg.includes('invalid token') ||
            errorMsg.includes('authentication failed') ||
            errorMsg.includes('token validation failed')
        ) {
            console.error('Token expired or invalid - redirecting to login');
            socket?.disconnect();
            socket = null;
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    });

    socket.on('error', (error: any) => {
        console.error('Socket error:', error);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = (): Socket | null => {
    return socket;
};

// Event emitters
export const emitMessage = (data: { toUserUid: string; message: string }) => {
    socket?.emit('user.message', data);
};

export const emitTyping = (data: { toUserId: number; isTyping: boolean; chatUid: string }) => {
    socket?.emit('user.typing', data);
};

// Event listeners
export const onMessage = (callback: (data: any) => void) => {
    socket?.on('user.message', callback);
};

export const onTyping = (callback: (data: any) => void) => {
    socket?.on('user.typing', callback);
};

export const offMessage = (callback?: (data: any) => void) => {
    if (callback) {
        socket?.off('user.message', callback);
    } else {
        socket?.off('user.message');
    }
};

export const offTyping = (callback?: (data: any) => void) => {
    if (callback) {
        socket?.off('user.typing', callback);
    } else {
        socket?.off('user.typing');
    }
};
