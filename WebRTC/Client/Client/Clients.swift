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
    var rtcClient: WebRTCClient

    init(baseUrl: String) {
        self.wsClient = WebSocketClient(baseUrl: baseUrl)
        self.rtcClient = WebRTCClient()
        wsClient.delegate = self
        rtcClient.delegate = self
    }
    
    private func refresh() {
        DispatchQueue.main.async {
            self.objectWillChange.send()
        }
    }
    
    func sendOffer(to: String) {
        self.rtcClient.create(otherOne: to)
        
        self.rtcClient.sendOfferToPeer(to: to) { sessionDescription in
            self.wsClient.sendOffer(to, ["sdp": sessionDescription.sdp, "type": "offer"])
            
            self.refresh()
        }
    }

    func onOffer(from: String, offer: String) {
        self.rtcClient.create(otherOne: from)

        self.rtcClient.receivedRemoteDescriptionFromPeer(from: from, type: .offer, sdp: offer)

        self.rtcClient.sendAnswerToPeer(to: from) { sessionDescription in
            self.wsClient.sendAnswer(from, ["sdp": sessionDescription.sdp, "type": "answer"])
            
            self.refresh()
        }
    }
    
    func onAnswer(from: String, answer: String) {
        self.rtcClient.create(otherOne: from)
        
        self.rtcClient.receivedRemoteDescriptionFromPeer(from: from, type: .answer, sdp: answer)
        
        self.refresh()
    }

    func onCandidate(receivedFrom: String, candidate: RTCIceCandidate) {
        self.rtcClient.create(otherOne: receivedFrom)
        self.rtcClient.receivedCandidateFromPeer(from: receivedFrom, candidate: candidate)
        self.refresh()
    }
    
    //
    
    func onRefresh() {
        self.refresh()
    }
    
    //
    
    func onCandidate(sendTo: String, candidate: RTCIceCandidate) {
        wsClient.sendCandidate(
            sendTo,
            [
                "candidate": candidate.sdp,
                "sdpMid": candidate.sdpMid!,
                "sdpMLineIndex": candidate.sdpMLineIndex
            ]
        )
    }
    
    func onStream(from: String) {
        self.refresh()
    }
    
    func onMessage(from: String) {
        self.refresh()
    }
    
    func onChannelReady(from: String) {
        self.refresh()
    }
    
    func onClose(from: String) {
        self.refresh()
    }
}
