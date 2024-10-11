const WebSocket = require('ws');
const { RTCPeerConnection, MediaStream } = require('@roamhq/wrtc');
const { RTCVideoSource, rgbaToI420 } = require('@roamhq/wrtc').nonstandard;
const rtsp = require('rtsp-ffmpeg');
const jpeg = require('jpeg-js');
const EventEmitter = require('node:events');

// IF DENO!!!

// import WebSocket from "npm:ws@8.18.0";
// import { RTCPeerConnection, MediaStream, nonstandard } from "npm:@roamhq/wrtc@0.8.0";
// import rtsp from "npm:rtsp-ffmpeg@0.0.19";
// import jpeg from "npm:jpeg-js@0.4.4";
// import { EventEmitter } from "node:events";
// import { Buffer } from "https://deno.land/std@0.139.0/node/buffer.ts";

// const { RTCVideoSource, RTCVideoSink, rgbaToI420 } = nonstandard;

const PASSWORD = process.env.PASSWORD || "";
const WS_HOST = process.env.WS_HOST || "";
const STREAM_URL = process.env.STREAM_URL || "";

const stream = new rtsp.FFMpeg({
  input: STREAM_URL,
  resolution: '640x480',
  // DOES NOT ACTUALLY CHANGE ANYTHING, but i think that's because of jpeg decode
  // arguments: ['-vf', 'format=yuv420p'],
});
// stream._args = function () {
//   return [
// 		'-loglevel', 'quiet',
// 		'-i', this.input,
//     ...(this.arguments || []),
// 		'-r', this.rate.toString(),
//     ...(this.quality ? ['-q:v', this.quality.toString()] : []),
//     ...(this.resolution ? ['-s', this.resolution] : []),
//     '-f', 'image2',
// 		'-update', '1',
// 		'-'
// 	];
// };
const frameEmitter = new EventEmitter();
stream.on('data', data => {
  try {
    // TODO: figure out how to do this without jpeg.decode
    const buffer = Buffer.from(data.toString('base64'), 'base64');
    const jpg = jpeg.decode(buffer);

    const height = jpg.height;
    const width = jpg.width;

    // THIS from L45
    // Expected a .byteLength of 460800, not 1228800
    // SHOULD BE
    // 460800 = jpg.width * jpg.height * 1.5;
    // BUT
    // 1228800 = jpg.width * jpg.height * 4;
    // ????
    // OKAY, this is RGBA to i420 conversion!!!

    const newData = new Uint8ClampedArray(width * height * 1.5);
    const frame = { width, height, data: newData };
    rgbaToI420(jpg, frame);

    frameEmitter.emit('frame', frame);
  } catch (e) {
    console.log('error', e);
  }
});
stream.on('error', err => console.error("err", err));
stream.on('exit', code => console.error("exit", code));


const socket = new WebSocket(WS_HOST + "/ws");
const clientsRTCMap = {};
let me = '';

socket.addEventListener("open", () => {
  console.log("Connected to server");
});

function createPeerConnection(client) {
  const peerConnection = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
  const channel = peerConnection.createDataChannel("chat", { negotiated: true, id: 0 });

  clientsRTCMap[client] = { peerConnection, channel };

  peerConnection.addEventListener("icecandidate", (event) => {
    if (!event.candidate) return;
    socket.send(JSON.stringify({ type: "candidate", to: client, candidate: event.candidate }));
  });

  channel.addEventListener('message', () => channel.send("Hello from server"));

  const source = new RTCVideoSource();
  const track = source.createTrack();
  const videoStream = new MediaStream([track]);
  peerConnection.addTrack(track, videoStream);

  frameEmitter.addListener('frame', frame => source.onFrame(frame));

  return { peerConnection, channel };
}

function sendOffer(to) {
  const { peerConnection } = createPeerConnection(to);

  peerConnection.createOffer().then((offer) => {
    peerConnection.setLocalDescription(offer).then(() => {
      console.log("Set local description to: ", to);
      socket.send(JSON.stringify({ type: "offer", to, offer }));
    });
  });
}

async function receiveOffer(from, offer) {
  const { peerConnection } = createPeerConnection(from);

  await peerConnection.setRemoteDescription(offer);
  console.log("Set remote description from: ", from);
}

async function receiveAnswer(from, answer) {
  const { peerConnection } = clientsRTCMap[from];

  await peerConnection.setRemoteDescription(answer);
  console.log("Set remote description from: ", from);
}

async function sendAnswer(to, password) {
  const { peerConnection } = clientsRTCMap[to];

  const answer = await peerConnection.createAnswer()
  await peerConnection.setLocalDescription(answer)
  socket.send(JSON.stringify({ type: "answer", to, answer, password }));
}

async function receiveIceCandidade(from, candidate) {
  const { peerConnection } = clientsRTCMap[from];

  try {
    await peerConnection.addIceCandidate(candidate);
    console.log("Added ICE candidate from: ", from);
  } catch {
    console.error("Error adding ICE candidate from: ", from);
  }
}

async function reject(from) {
  console.log("Rejecting...");

  const { peerConnection, channel } = clientsRTCMap[from];

  await peerConnection.close();
  await channel.close();
}

socket.addEventListener("message", async (message) => {
  const data = JSON.parse(message.data);

  if (data.type === 'welcome') {
    me = data.id;
    console.log("My id is: ", me);
  } else if (data.type === 'refresh') {
    // const notMe = data.clients.find(id => id !== me);
    // sendOffer(notMe);
  } else if (data.type === 'offer') {
    await receiveOffer(data.from, data.offer);
    if (data.password == PASSWORD) {
      await sendAnswer(data.from, data.password);
    } else {
      await reject(data.from);
    }
  } else if (data.type === 'answer') {
    if (data.password == PASSWORD) {
      await receiveAnswer(data.from, data.answer);
    } else {
      await reject(data.from);
    }
  } else if (data.type === 'candidate') {
    await receiveIceCandidade(data.from, data.candidate);
  }
});
