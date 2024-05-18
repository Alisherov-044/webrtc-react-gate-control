import { io } from "socket.io-client";

let socket;
export function socketConnection() {
    if (socket) {
        return socket;
    } else {
        socket = io("https://webrtc-socket-api.onrender.com");
        return socket;
    }
}
