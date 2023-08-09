export {UserRegistry} ;

import Hashmap from "hashmap";
import { UserSession } from "./user_session.js";

class UserRegistry {
    constructor() {
        this.usersByName = new Map();
        this.usersBySessionId = new Map();
    }

    register(user) {
        this.usersByName.set(user.getName(), user);
        this.usersBySessionId.set(user.getSession(), user);
    }

    getByName(name) {
        return this.usersByName.get(name);
    }

    getBySession(session) {
        return this.usersBySessionId.get(session);
    }

    exists(name) {
        return this.usersByName.has(name);
    }

    removeBySession(session) {
        const user = this.getBySession(session);
        this.usersByName.delete(user.getName());
        this.usersBySessionId.delete(session.id);
        return user;
    }
}
