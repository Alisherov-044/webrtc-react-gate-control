export function prepForCall(setLocalStream, callStatus, setCallStatus) {
    try {
        navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: true,
            })
            .then((stream) => {
                setLocalStream(stream);
                setCallStatus({
                    ...callStatus,
                    haveMedia: true,
                    videoEnabled: true,
                    audioEnabled: true,
                });
            });
    } catch (error) {
        console.error(error);
    }
}
