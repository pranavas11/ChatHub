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



// import http from "http";
// import { WebSocketServer } from "ws";
// import { handleConnection } from "./connectionManager";

// export const initServer = (server: http.Server) => {
//   const wss = new WebSocketServer({ noServer: true });

//   server.on("upgrade", (req, socket, head) => {
//     try {
//       const url = new URL(req.url || "/", `http://${req.headers.host}`);
//       if (url.pathname !== "/ws") {
//         socket.destroy();
//         return;
//       }
//       wss.handleUpgrade(req, socket, head, (ws) => {
//         wss.emit("connection", ws, req);
//       });
//     } catch {
//       socket.destroy();
//     }
//   });

//   wss.on("connection", (ws) => handleConnection(ws));
//   console.log("WebSocket upgrade route active at /ws");
// };





import http from "http";
import { WebSocketServer } from "ws";
import { handleConnection } from "./connectionManager";

export const initServer = (server: http.Server) => {
  // Accept WS upgrades only on /ws
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    console.log("WS client connected:", req.socket.remoteAddress);
    handleConnection(ws);
  });

  // Optional: keep-alive (helps prevent idle disconnects)
  const interval = setInterval(() => {
    for (const client of wss.clients) {
      // @ts-ignore add a simple heartbeat flag
      if ((client as any).isAlive === false) { client.terminate(); continue; }
      (client as any).isAlive = false;
      client.ping();
    }
  }, 30000);

  wss.on("connection", (ws) => {
    // @ts-ignore heartbeat flag
    (ws as any).isAlive = true;
    ws.on("pong", () => { /* @ts-ignore */ (ws as any).isAlive = true; });
  });

  wss.on("close", () => clearInterval(interval));

  console.log("WebSocket listening at path /ws");
};