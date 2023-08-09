// type: module 에서 require 사용 방법
import { createRequire } from "module";
const require = createRequire(import.meta.url);


import url from 'url';
import express from 'express';
import minimist from 'minimist';
import { WebSocketServer } from 'ws'
import fs from 'fs';
import https from 'https';

import config from './config.js'
import { RoomManager } from "./src/room/room_manager.js";
import { CallHandler } from "./src/call_handler.js";
import { UserRegistry } from "./src/user/user_registry.js";


let argv = minimist(process.argv.slice(2), {
    default: {
        as_uri: config.as_uri,
        ws_uri: config.ws_uri
    }
});


let options =
    {
        key:  fs.readFileSync('keys/server.key'),
        cert: fs.readFileSync('keys/server.crt')
    };

let app = express();

console.log('Set Server Setting')

/*
 * Server startup
 */
let asUrl = url.parse(argv.as_uri);
let port = asUrl.port;
let server = https.createServer(options, app).listen(port, function() {
    console.log('Kurento Tutorial started');
    console.log('Open ' + url.format(asUrl) + ' with a WebRTC capable browser');
});

console.log('Set WSS Setting')

let wss = new WebSocketServer({
    server: server,
    path: '/groupcall'
})



let roomManager = new RoomManager();
let userRegistry = new UserRegistry();
let callHandler = new CallHandler(roomManager,userRegistry);

wss.on('connection', function(ws) {

    ws.on('message',function (_message) {
        // Kurento WebRTC ManyToMany WebSocket Route
        callHandler.handleTextMessage(ws, _message);
    });



});


app.use(express.static(config.static_path));