import http from "http";
import { WebSocketServer } from "ws";
import { handleConnection } from "./connectionManager";

export const initServer = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws'
  });

  wss.on("connection", (ws, request) => {
    console.log('WebSocket connection established at:', request.url);
    handleConnection(ws);
  });

  console.log(`WebSocket listening at path /ws`);
};