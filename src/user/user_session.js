// const { v4: uuidv4 } = require('uuid');
import kurento from 'kurento-client';
import {KurentoFunc} from "../kurento_func.js";

// export default UserSession;
export { UserSession }
class UserSession {
    constructor(name, roomName, session, pipeline) {

        this.name = name;               // User 이름
        this.session = session;         // User 와 통신하는 WebSocket 객체
        this.pipeline = pipeline;       // Room 으로 부터 받는 pipeline
        this.roomName = roomName;       // 참여 방 이름

        this.incomingMedia = new Map(); // 방 참여자들의 WebRTC Endpoint 목록을 담게되는 변수

        // KurentoFunc.createMediaElements() 메소드를 이용하여 엔트포인트를 만들어줌
        this.outgoingMedia = new KurentoFunc().createMediaElements(this.pipeline);
        this.outgoingMedia.on('IceCandidateFound', (event) => {
            const candidate = kurento.getComplexType('IceCandidate')(event.candidate);
            this.sendMessage({
                id: 'iceCandidate',
                name: this.name,
                candidate: candidate,
            });
        });
    }

    getOutgoingWebRtcPeer() {
        return this.outgoingMedia;
    }

    getName() {
        return this.name;
    }

    getSession() {
        return this.session;
    }

    getRoomName() {
        return this.roomName;
    }

    receiveVideoFrom(sender, sdpOffer) {
        console.log(`USER ${this.name}: connecting with ${sender.getName()} in room ${this.roomName}`);
        // console.log(`USER ${this.name}: SdpOffer for ${sender.getName()} is ${sdpOffer}`);

        this.getEndpointForUser(sender).processOffer(sdpOffer, (error, sdpAnswer) => {
            if (error) {
                console.error(`ERROR: SdpAnswer generation for ${sender.getName()} failed: ${error}`);
                return;
            }

            const scParams = {
                id: 'receiveVideoAnswer',
                name: sender.getName(),
                sdpAnswer: sdpAnswer,
            };

            // console.log(`USER ${this.name}: SdpAnswer for ${sender.getName()} is ${sdpAnswer}`);
            this.sendMessage(scParams);
            console.log(`USER ${this.name}: gather candidates`)
            this.getEndpointForUser(sender).gatherCandidates((error) => {
                if (error) {
                    console.error(`ERROR: Gather candidates for ${sender.getName()} failed: ${error}`);
                }
            });
        });
    }

    getEndpointForUser(sender) {
        if (sender.getName() === this.name) {
            console.log(`PARTICIPANT ${this.name}: configuring loopback`);
            return this.outgoingMedia;
        }

        console.log(`PARTICIPANT ${this.name}: receiving video from ${sender.getName()}`);
        let incoming = this.incomingMedia.get(sender.getName());
        if (!incoming) {
            console.log(`PARTICIPANT ${this.name}: creating new endpoint for ${sender.getName()}`);
            incoming = new KurentoFunc().createMediaElements(this.pipeline);

            incoming.on('IceCandidateFound', (event) => {
                const candidate = kurento.getComplexType('IceCandidate')(event.candidate);
                this.sendMessage({
                    id: 'iceCandidate',
                    name: sender.getName(),
                    candidate: candidate,
                });
            });

            this.incomingMedia.set(sender.getName(), incoming);
        }

        console.log(`PARTICIPANT ${this.name}: obtained endpoint for ${sender.getName()}`);
        sender.getOutgoingWebRtcPeer().connect(incoming);
        return incoming;
    }

    cancelVideoFrom(sender) {
        this.cancelVideoFrom(sender.getName());
    }

    cancelVideoFrom(senderName) {
        console.log(`PARTICIPANT ${this.name}: canceling video reception from ${senderName}`);
        const incoming = this.incomingMedia.get(senderName);
        if (incoming) {
            this.incomingMedia.delete(senderName);
            console.log(`PARTICIPANT ${this.name}: removing endpoint for ${senderName}`);
            incoming.release((error) => {
                if (error) {
                    console.warn(`PARTICIPANT ${this.name}: Could not release incoming EP for ${senderName}`);
                } else {
                    console.trace(`PARTICIPANT ${this.name}: Released successfully incoming EP for ${senderName}`);
                }
            });
        }
    }

    close() {
        console.log(`PARTICIPANT ${this.name}: Releasing resources`);

        for (const [remoteParticipantName, incoming] of this.incomingMedia.entries()) {
            console.log(`PARTICIPANT ${this.name}: Released incoming EP for ${remoteParticipantName}`);
            incoming.release((error) => {
                if (error) {
                    console.warn(`PARTICIPANT ${this.name}: Could not release incoming EP for ${remoteParticipantName}`);
                } else {
                    console.trace(`PARTICIPANT ${this.name}: Released successfully incoming EP for ${remoteParticipantName}`);
                }
            });
        }

        this.incomingMedia.clear();

        this.outgoingMedia.release((error) => {
            if (error) {
                console.warn(`USER ${this.name}: Could not release outgoing EP`);
            } else {
                console.trace(`PARTICIPANT ${this.name}: Released outgoing EP`);
            }
        });
    }

    sendMessage(message) {
        // console.log(`USER ${this.name}: Sending message ${JSON.stringify(message)}`);
        this.session.send(JSON.stringify(message));
    }

    addCandidate(candidate, name) {

        if (this.name === name) {
            this.outgoingMedia.addIceCandidate(candidate);
        } else {
            console.log(`addCandidate connect user : ${this.name} | target : ${name}`)
            const webRtc = this.incomingMedia.get(name);
            if (webRtc) {
                webRtc.addIceCandidate(candidate);
                console.log(`complete addIceCandidate!!`)
            }
        }
    }

    equals(obj) {
        if (this === obj) {
            return true;
        }

        if (!obj || !(obj instanceof UserSession)) {
            return false;
        }

        const other = obj;
        return this.name === other.name && this.roomName === other.roomName;
    }

    hashCode() {
        let result = 1;
        result = 31 * result + this.name.hashCode();
        result = 31 * result + this.roomName.hashCode();
        return result;
    }
}
