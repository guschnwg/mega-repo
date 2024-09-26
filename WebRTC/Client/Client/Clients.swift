//
//  Clients.swift
//  Client
//
//  Created by Giovanna Zanardini on 17/09/24.
//

import WebRTC
import SwiftUICore

class WSClient: WebSocketClientDelegate, WebRTCClientDelegate, ObservableObject {
    var wsClient: WebSocketClient
    var rtcClientMap: [String: (WebRTCClient, [(Date, String, String)], [RTCMediaStream])] = [:]

    init(baseUrl: String) {
        self.wsClient = WebSocketClient(baseUrl: baseUrl)
        wsClient.delegate = self
    }
    
    private func refresh() {
        DispatchQueue.main.async {
            self.objectWillChange.send()
        }
    }
    
    private func createClientIfNeeded(from: String) {
        if rtcClientMap.keys.contains(where: { $0 == from }) { return }
    
        let client = WebRTCClient(otherOne: from)
        client.delegate = self
        rtcClientMap[from] = (client, [], [])
    }
    
    func sendOffer(to: String) {
        createClientIfNeeded(from: to)

        rtcClientMap[to]!.0.sendOfferToPeer { sessionDescription in
            self.wsClient.sendOffer(to, ["sdp": sessionDescription.sdp, "type": "offer"])
            
            self.refresh()
        }
    }

    func onOffer(from: String, offer: String) {
        createClientIfNeeded(from: from)

        rtcClientMap[from]!.0.receivedRemoteDescriptionFromPeer(type: .offer, sdp: offer)
        rtcClientMap[from]!.0.sendAnswerToPeer { sessionDescription in
            self.wsClient.sendAnswer(from, ["sdp": sessionDescription.sdp, "type": "answer"])
            
            self.refresh()
        }
    }
    
    func onAnswer(from: String, answer: String) {
        createClientIfNeeded(from: from)

        rtcClientMap[from]!.0.receivedRemoteDescriptionFromPeer(type: .answer, sdp: answer)
        
        self.refresh()
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
        
        self.refresh()
    }

    func onCandidate(from: String, candidate: RTCIceCandidate) {
        createClientIfNeeded(from: from)
        rtcClientMap[from]!.0.peerConnection?.add(candidate, completionHandler: {_ in})
        
        self.refresh()
    }
    
    func onStream(from: String, stream: RTCMediaStream) {
        createClientIfNeeded(from: from)
        rtcClientMap[from]!.2.append(stream)
        
        self.refresh()
    }
    
    func onRefresh() {
        self.refresh()
    }
    
    func onChannelReady(from: String) {
        self.refresh()
    }
    
    func onClose(from: String) {
        self.refresh()
    }
        
    func onMessage(from: String, inConversation: String, message: String) {
        rtcClientMap[inConversation]!.1.append((Date.now, from, message))
        self.refresh()
    }
}
