import { useEffect, useRef, useState } from "react";
import {
    createPeerConnection,
    prepForCall,
    socketConnection,
    socketListeners,
} from "./webRTC";

export function App() {
    const [callStatus, setCallStatus] = useState({}); // haveMedia, videoEnabled, audioEnabled
    const [username, setUsername] = useState("");
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const [typeOfCall, setTypeOfCall] = useState(null);
    const [joined, setJoined] = useState(false);

    const [offerData, setOfferData] = useState(null);

    const localVideo = useRef(null);
    const remoteVideo = useRef(null);

    const [offerCreated, setOfferCreated] = useState(false);
    const [answerCreated, setAnswerCreated] = useState(false);

    function initCall(typeOfCall) {
        prepForCall(setLocalStream, callStatus, setCallStatus);
        setTypeOfCall(typeOfCall);
    }

    useEffect(() => {
        if (joined) {
            const name = prompt("username");
            setUsername(name);

            const socket = socketConnection();
            socket.on("new-call", (msg) => {
                console.log("== new call ==");
                console.log(msg);
                console.log("== new call ==");

                setOfferData(msg);
            });
        }
    }, [joined]);

    useEffect(() => {
        if (callStatus.haveMedia && !peerConnection) {
            console.log("== creating peerconnection ==");

            const { peerConnection, remoteStream } =
                createPeerConnection(username);
            setRemoteStream(remoteStream);
            setPeerConnection(peerConnection);
        }
    }, [callStatus.haveMedia]);

    useEffect(() => {
        if (typeOfCall && peerConnection) {
            console.log("== listening for socket events ==");

            const socket = socketConnection();
            socketListeners(socket, peerConnection);
        }
    }, [typeOfCall, peerConnection]);

    useEffect(() => {
        if (localStream && peerConnection) {
            localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
            });
        }
    }, [localStream, peerConnection]);

    useEffect(() => {
        if (remoteStream && peerConnection) {
            console.log("== ready to create an offer ==");

            localVideo.current.srcObject = localStream;
            remoteVideo.current.srcObject = remoteStream;
        }
    }, [remoteStream, peerConnection]);

    useEffect(() => {
        async function createOffer() {
            console.log("== creating offer ==");

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            console.log("== local description ==");
            console.log(await peerConnection.localDescription);
            console.log("== local description ==");

            setOfferCreated(true);

            const socket = socketConnection();
            socket.emit("call", {
                from: username,
                to: "all",
                type: "offer",
                sdp: peerConnection.localDescription,
            });
        }

        async function createAnswer() {
            console.log("== creating answer ==");

            const desc = new RTCSessionDescription(offerData.sdp);
            await peerConnection.setRemoteDescription(desc);

            console.log("== remote description ==");
            console.log(await peerConnection.remoteDescription);
            console.log("== remote description ==");

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            console.log("== local description ==");
            console.log(await peerConnection.localDescription);
            console.log("== local description ==");

            setAnswerCreated(true);

            const socket = socketConnection();
            socket.emit("answer", {
                from: username,
                to: "all",
                type: "answer",
                sdp: peerConnection.localDescription,
            });
        }

        if (typeOfCall === "offer") {
            if (!offerCreated && callStatus.videoEnabled && peerConnection) {
                console.log(
                    "== about to emit some offer data to signaling server =="
                );

                createOffer();
            }
        }

        if (typeOfCall === "answer") {
            if (!answerCreated && callStatus.videoEnabled && peerConnection) {
                console.log(
                    "== about to emit some answer data to signaling server =="
                );

                createAnswer();
            }
        }
    }, [
        callStatus.videoEnabled,
        offerCreated,
        answerCreated,
        typeOfCall,
        peerConnection,
    ]);

    function call() {
        initCall("offer");
    }

    function answer() {
        initCall("answer");
    }

    if (!joined) {
        return <button onClick={() => setJoined(true)}>join</button>;
    }

    return (
        <main>
            <h1>{username}</h1>
            <button onClick={call}>call</button>

            {offerData && <button onClick={answer}>answer</button>}

            <video ref={localVideo} autoPlay muted />
            <video ref={remoteVideo} autoPlay />
        </main>
    );
}
