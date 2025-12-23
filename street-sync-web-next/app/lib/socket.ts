import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { CONFIG } from './config';

export const createWebSocketClient = (onMessageReceived: (message: any) => void) => {
    const client = new Client({
        webSocketFactory: () => new SockJS(CONFIG.WS_URL), // Your Spring Boot WS endpoint
        onConnect: () => {
            client.subscribe('/topic/nearby-alerts', (message) => {
                onMessageReceived(JSON.parse(message.body));
            });
        },
        onStompError: (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
        },
    });

    return client;
};