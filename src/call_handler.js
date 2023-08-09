import {KurentoFunc} from "./kurento_func.js";

export {CallHandler}
class CallHandler {
    constructor(roomManager, userRegistry) {
        this.roomManager = roomManager;
        this.userRegistry = userRegistry;
    }

    async handleTextMessage(session, message) {
        let jsonMessage = JSON.parse(message)

        let user = this.userRegistry.getBySession(session);
        if (user) {
            console.log(`Incoming message from user '${user.getName()}:`, jsonMessage);
        } else {
            console.log('Incoming message from new user:', jsonMessage);
        }


        switch (jsonMessage.id) {
            // 방에 입장
            case 'joinRoom':
                await this.joinRoom(jsonMessage, session);
                break;
            // 미디어 연결을 위한 작업
            case 'receiveVideoFrom':
                const senderName = jsonMessage.sender;
                const sender = this.userRegistry.getByName(senderName);
                const sdpOffer = jsonMessage.sdpOffer;
                // 미디어 객체 정보 요청대로 주문 후 반환
                await user.receiveVideoFrom(sender, sdpOffer);
                break;
            // 방에서 퇴장
            case 'leaveRoom':
                await this.leaveRoom(user);
                break;
            // 나 또는 상대방의 Pear 등록 처리
            case 'onIceCandidate':
                const _candidate = jsonMessage.candidate;
                console.log(`User ${user.getName()} in onIceCandidate ${jsonMessage.name}`)
                if (user !== null) {
                    // IceCandidate 변환
                    let candidate = new KurentoFunc().onIceCandidate(_candidate);
                    // 유저 세션 객체에 candidate 정보 추가!
                    // 송출(out coming) 또는 수신(incoming) icecandidate 추가
                    user.addCandidate(candidate,jsonMessage.name);

                }
                break;
            default:
                break;
        }
    }

    async afterConnectionClosed(session, status) {
        const user = this.userRegistry.removeBySession(session);
        const room = this.roomManager.getRoom(user.getRoomName());
        await room.leave(user);
        if (room.getParticipants().length === 0) {
            this.roomManager.removeRoom(room);
        }
    }

    async joinRoom(params, session) {
        const roomName = params.room;
        const name = params.name;
        console.log(`PARTICIPANT ${name}: trying to join room ${roomName}`);

        const room = this.roomManager.getRoom(roomName);
        const user = await room.join(name, session);
        this.userRegistry.register(user);
    }

    async leaveRoom(user) {
        const room = this.roomManager.getRoom(user.getRoomName());
        await room.leave(user);
        if (room.getParticipants().length === 0) {
            this.roomManager.removeRoom(room);
        }
    }
}
