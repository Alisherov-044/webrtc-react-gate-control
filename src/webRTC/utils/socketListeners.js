export function socketListeners(socket, peerConnection) {
    socket.on("new-answer", async (msg) => {
        console.log("== new answer ==");
        console.log(msg);
        console.log("== new answer ==");

        const desc = new RTCSessionDescription(msg.sdp);
        await peerConnection.setRemoteDescription(desc);

        console.log("== remote description ==");
        console.log(await peerConnection.remoteDescription);
        console.log("== remote description ==");
    });

    socket.on("new-candidate", async (msg) => {
        console.log("== new candidate ==");
        console.log(msg);
        console.log("== new candidate ==");

        try {
            await peerConnection.addIceCandidate(msg.candidate);
        } catch (error) {
            console.error(error);
        }
    });
}
