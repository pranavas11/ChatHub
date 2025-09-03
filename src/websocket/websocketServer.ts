// import http from "http";
// import { WebSocketServer } from "ws";
// import { handleConnection } from "./connectionManager";
// import { getPort } from "../config";

// export const initServer = (
//   server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
// ) => {
//   const port = getPort();
//   const wss = new WebSocketServer({ server });

//   wss.on("connection", (ws) => {
//     handleConnection(ws);
//   });

//   console.log(`Websocket server started on port ${port}`);
// };



import http from "http";
import { WebSocketServer } from "ws";
import { handleConnection } from "./connectionManager";

export const initServer = (server: http.Server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    try {
      const url = new URL(req.url || "/", `http://${req.headers.host}`);
      if (url.pathname !== "/ws") {
        socket.destroy();
        return;
      }
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } catch {
      socket.destroy();
    }
  });

  wss.on("connection", (ws) => handleConnection(ws));
  console.log("WebSocket upgrade route active at /ws");
};