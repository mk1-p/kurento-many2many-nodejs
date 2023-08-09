import kurento from "kurento-client";

import config from "../config.js";


export { KurentoFunc }

let kurentoClient = null;
getKurentoClient().then(r => console.log("쿠렌토 클라이언트 연결 init!"))

class KurentoFunc {

    constructor() {
        getKurentoClient()
        this.kurentoClient = kurentoClient;

    }

    /**
     * Create Media Pipeline
     * By Room
     * @returns {MediaPipeline}
     */
    createMediaPipeline() {
        console.log(`kurento client : ${this.kurentoClient}`)
        return this.kurentoClient.create('MediaPipeline');
    }

    /**
     * Create WebRTC Endpoint
     * By User
     * @param pipeline
     * @returns {WebRtcEndpoint}
     */
    createMediaElements(pipeline) {
        console.log(`Pipeline : ${pipeline}`)
        let webRtcEndpoint = pipeline.create('WebRtcEndpoint');
        return webRtcEndpoint;
    }

    /**
     * Candidate convert IceCandidate Object
     * @param _candidate
     * @returns {*}
     */
    onIceCandidate(_candidate) {
        let candidate = kurento.getComplexType('IceCandidate')(_candidate);
        return candidate;
    }

}


/**
 * Kurento Media Server Connect Method
 * @param callback
 * @returns {Promise<*>}
 */
async function getKurentoClient(callback = () => {}) {
    if (kurentoClient !== null) {
        return callback(null, kurentoClient);
    }

    await kurento(config.ws_uri, function(error, _kurentoClient) {
        if (error) {
            console.log("Could not find media server at address " + config.ws_uri);
            return callback("Could not find media server at address" + config.ws_uri
                + ". Exiting with error " + error);
        }
        kurentoClient = _kurentoClient;
        callback(null, kurentoClient);
    });
}
