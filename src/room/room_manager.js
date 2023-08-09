export {RoomManager}

// export default RoomManager
import {Room} from "./room.js";
import {KurentoFunc} from "../kurento_func.js";

class RoomManager {

    constructor() {
        this.rooms = new Map();
    }

    createRoom(room) {

    }

    // 룸 조회 및 초기화
    getRoom(roomName) {

        console.log(`room name : ${roomName}`)
        let findRoom = this.rooms.get(roomName);
        if (!findRoom) {
            console.log("[RoomManager] 룸 생성!");
            // 새로운 방 생성
            findRoom = new Room(roomName, new KurentoFunc().createMediaPipeline());
            // 방 목록에 추가
            this.rooms.set(roomName,findRoom)
        } else {
            console.log("[RoomManager] 룸 찾음!");
        }

        return findRoom;
    }

    removeRoom(room) {
        this.rooms.delete(room.getName());
        room.close();
        console.log(`Room ${room.getName()} removed and closed`);
    }



}