import express from "express"
import http from "http"
import cors from "cors"
import { WebSocketServer } from "ws"
import router from "./routes/index.js"
import { handleWebSocketConnection } from "./controller/ragWebSocket.js"

const app = express();

app.use(cors())
app.use(express.json())
app.use(router)

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/rag/chat" });

wss.on("connection", (ws, req) => {
    handleWebSocketConnection(ws, req);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});