const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });


const rooms = new Map();


wss.on('connection', (ws) => {
ws.on('message', (raw) => {
try {
const msg = JSON.parse(raw);
const { type, room, payload } = msg;
if (!room) return;


if (type === 'join') {
if (!rooms.has(room)) rooms.set(room, new Set());
rooms.get(room).add(ws);
ws.room = room;
ws.send(JSON.stringify({ type: 'joined', room, count: rooms.get(room).size }));
return;
}


const set = rooms.get(room);
if (!set) return;
set.forEach((peer) => {
if (peer !== ws && peer.readyState === WebSocket.OPEN) {
peer.send(JSON.stringify({ type, room, payload }));
}
});
} catch (err) {
console.error('Invalid message', err);
}
});


ws.on('close', () => {
const room = ws.room;
if (!room) return;
const set = rooms.get(room);
if (!set) return;
set.delete(ws);
if (set.size === 0) rooms.delete(room);
});
});


console.log('Signaling server running on ws://localhost:8080');