//
//  Clients.swift
//  Client
//
//  Created by Giovanna Zanardini on 17/09/24.
//

import WebRTC

class WSClient: WebSocketClientDelegate, WebRTCClientDelegate, ObservableObject {
    var rtcClientMap: [String: (WebRTCClient, [(Date, String, String)], [RTCMediaStream])] = [:]
    let wsClient = WebSocketClient()
    
    init() {
        wsClient.delegate = self
    }
    
    func createClientIfNeeded(from: String) {
        if rtcClientMap.keys.contains(where: { $0 == from }) { return }
    
        let client = WebRTCClient(otherOne: from)
        client.delegate = self
        rtcClientMap[from] = (client, [], [])
    }

    func onOffer(from: String, offer: String) {
        createClientIfNeeded(from: from)

        rtcClientMap[from]!.0.receivedOfferFromPeer(offerSDP: offer)
        rtcClientMap[from]!.0.sendAnswerToPeer { sessionDescription in
            self.wsClient.sendAnswer(from, ["sdp": sessionDescription.sdp, "type": "answer"])
        }
    }
    
    func onCandidate(to: String, candidate: RTCIceCandidate) {
        wsClient.sendCandidate(
            to,
            [
                "candidate": candidate.sdp,
                "sdpMid": candidate.sdpMid!,
                "sdpMLineIndex": candidate.sdpMLineIndex
            ]
        )
    }

    func onCandidate(from: String, candidate: RTCIceCandidate) {
        createClientIfNeeded(from: from)
        rtcClientMap[from]!.0.peerConnection?.add(candidate, completionHandler: {_ in})
    }
    
    func onStream(from: String, stream: RTCMediaStream) {
        createClientIfNeeded(from: from)
        rtcClientMap[from]!.2.append(stream)
    }
    
    func onChannelReady(from: String) {
        DispatchQueue.main.async {
            self.objectWillChange.send()
        }
    }
        
    func onMessage(from: String, message: String) {
        rtcClientMap[from]!.1.append((Date.now, from, message))
        DispatchQueue.main.async {
            self.objectWillChange.send()
        }
    }
}
