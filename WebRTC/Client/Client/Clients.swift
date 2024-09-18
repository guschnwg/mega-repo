//
//  Clients.swift
//  Client
//
//  Created by Giovanna Zanardini on 17/09/24.
//

import WebRTC

class WSClient: WebSocketClientDelegate, WebRTCClientDelegate, ObservableObject {
    
    var rtcClientMap: [String: (WebRTCClient, String)] = [:]
    let wsClient = WebSocketClient()
    
    init() {
        wsClient.delegate = self
    }
    
    func onOffer(from: String, offer: String) {
        let client = WebRTCClient(otherOne: from)
        client.delegate = self
        client.receivedOfferFromPeer(offerSDP: offer)
        client.sendAnswerToPeer { sessionDescription in
            self.wsClient.sendAnswer(from, ["sdp": sessionDescription.sdp, "type": "answer"])
        }
        
        rtcClientMap[from] = (client, "")
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
        rtcClientMap[from]!.0.peerConnection?.add(candidate, completionHandler: {_ in})
    }
    
    func onChannelReady(from: String) {
        DispatchQueue.main.async {
            self.objectWillChange.send()
        }
    }
        
    func onMessage(from: String, message: String) {
        rtcClientMap[from]!.1 = message
        DispatchQueue.main.async {
            self.objectWillChange.send()
        }
    }
}
