import { io } from "socket.io-client";

let socket;
export function socketConnection() {
    if (socket) {
        return socket;
    } else {
        socket = io("http://localhost:3000");
        return socket;
    }
}
