
export { Room }


import Hashmap from 'hashmap'
import { UserSession } from "../user/user_session.js";

class Room {

    constructor(name, pipeline) {
        this.name = name;
        this.pipeline = pipeline;
        this.participants = new Map();
    }


    join(userName, ws) {
        // 유저 세션 만들기
        console.log(`userName : ${userName} | ws : ${ws.name}`)
        let newParticipant = new UserSession(userName, this.name, ws, this.pipeline);
        // Room.joinRoom()
        this.joinRoom(newParticipant).then(() =>
            // participants.set(유저이름,유저세션)
            this.participants.set(newParticipant.getName(),newParticipant)
        );
        // sendParticipantNames()
        this.sendParticipantNames(newParticipant);

        // participant 반환
        return newParticipant
    }

    async joinRoom(newParticipant) {
        const newParticipantMsg = {
            id: 'newParticipantArrived',
            name: newParticipant.getName(),
        };

        const participantsList = [];
        console.log(`ROOM ${this.name}: notifying other participants of new participant ${newParticipant.getName()}`);

        for (const participant of this.participants.values()) {
            try {
                console.log(`alter new participant ${newParticipant.getName()}  at User ${participant.getName()}`)
                await participant.sendMessage(newParticipantMsg);
            } catch (error) {
                console.log(`ROOM ${this.name}: participant ${participant.getName()} could not be notified: ${error}`);
            }
            participantsList.push(participant.getName());
        }

        return participantsList;
    }

    async sendParticipantNames(user) {

        // user 는 UserSession

        // 유저에게 반환해줄 방참가자 이름 리스트
        // 현재 유저와 방의 참가자 비교하여 참여자 이름 리스트를 만듦
        const participantsArray = [];
        for (let participant of this.getParticipants()) {
            console.log(`user name ${user.getName()} equals : ${!participant.equals(user)}`)
            if (participant.equals(user) === false) {
                participantsArray.push(participant.getName());
            }
        }

        // id : existingParticipants
        // data : participantsArray
        const existingParticipantsMsg = {
            id: 'existingParticipants',
            data: participantsArray,
        };

        // user.sendMessage()
        console.log(`PARTICIPANT ${user.getName()}: sending a list of ${participantsArray.length} participants`);
        await user.sendMessage(existingParticipantsMsg);
    }

    getParticipants() {
        return this.participants.values();
    }



    async leave(user) {
        console.log(`PARTICIPANT ${user.getName()}: Leaving room ${this.name}`);
        await this.removeParticipant(user.getName());
        user.close();
    }
    async removeParticipant(name) {
        this.participants.delete(name);

        console.log(`ROOM ${this.name}: notifying all users that ${name} is leaving the room`);
        const unnotifiedParticipants = [];
        const participantLeftJson = {
            id: 'participantLeft',
            name: name,
        };

        for (const participant of this.participants.values()) {
            try {
                await participant.cancelVideoFrom(name);
                await participant.sendMessage(participantLeftJson);
            } catch (error) {
                unnotifiedParticipants.push(participant.getName());
            }
        }

        if (unnotifiedParticipants.length > 0) {
            console.log(`ROOM ${this.name}: The users ${unnotifiedParticipants} could not be notified that ${name} left the room`);
        }
    }


    async close() {
        for (const user of this.participants.values()) {
            try {
                await user.close();
            } catch (error) {
                console.log(`ROOM ${this.name}: Could not invoke close on participant ${user.getName()}: ${error}`);
            }
        }

        this.participants.clear();

        await this.pipeline.release();

        console.log(`Room ${this.name} closed`);
    }

}