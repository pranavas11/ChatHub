import express from "express";
import http from "http";
import cors from "cors";
import routes from "./routes";
import { startWebSocketServer } from "./websocket";
import { getPort } from "./config";

const PORT = Number(process.env.PORT) || getPort();

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);

const corsOptions = { origin: "*", credentials: true };

app.use(cors(corsOptions));
app.use(express.json());

app.get("/healthz", (_req, res) => res.status(200).send("ok"));

app.use("/api", routes);

app.get("/api", (_, res) => {
  res.status(200).json({ status: "ok" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`API Server started on port : ${PORT}`);
});

startWebSocketServer(server);