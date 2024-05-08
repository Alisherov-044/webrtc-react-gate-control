import { stunServers } from "./stunServers";
import { socketConnection } from "./socketConnection";

export function createPeerConnection(username) {
    const socket = socketConnection();

    try {
        const peerConnection = new RTCPeerConnection(stunServers);
        const remoteStream = new MediaStream();

        peerConnection.addEventListener("signalingstatechange", (e) => {
            console.log("== signalingstatechange ==");
            console.log(e);
            console.log("== signalingstatechange ==");
        });

        peerConnection.addEventListener("icecandidate", (e) => {
            console.log("== icecandidate ==");
            console.log(e);
            console.log("== icecandidate ==");

            socket.emit("candidate", {
                from: username,
                to: "all",
                type: "candidate",
                candidate: e.candidate,
            });
        });

        peerConnection.addEventListener("track", (e) => {
            console.log("== track ==");
            console.log(e);
            console.log("== track ==");

            if (e.streams[0]) {
                e.streams[0].getTracks().forEach((track) => {
                    remoteStream.addTrack(track, remoteStream);
                });
            }
        });

        return {
            peerConnection,
            remoteStream,
        };
    } catch (error) {
        console.error(error);
    }
}
