import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectWebSocket = (onUsersUpdate) => {
  const socket = new SockJS("http://localhost:8080/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,
    onConnect: () => {
      stompClient.subscribe("/topic/online-users", message => {
        onUsersUpdate(JSON.parse(message.body));
      });
    }
  });

  stompClient.activate();
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
  }
};
