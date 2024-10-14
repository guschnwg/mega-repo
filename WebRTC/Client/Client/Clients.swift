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
    var autoAccept: Bool = false

    init(baseUrl: String) {
        self.wsClient = WebSocketClient(baseUrl: baseUrl)
        self.rtcClient = WebRTCClient()
        wsClient.delegate = self
        rtcClient.delegate = self
    }
    
    private func refresh(_ from: String) {
        print("Refreshing from \(from)")

        DispatchQueue.main.async {
            self.objectWillChange.send()
        }
    }
    
    func sendOffer(to: String, password: String) {
        let _ = self.rtcClient.create(otherOne: to, password: password)

        self.rtcClient.sendOfferToPeer(to: to) { sessionDescription in
            self.wsClient.sendOffer(to, ["sdp": sessionDescription.sdp, "type": "offer"], password: password)
            self.refresh("sendOffer")
        }
    }

    func onOffer(from: String, offer: String, password: String) {
        let _ = self.rtcClient.create(otherOne: from, password: password)

        self.rtcClient.receivedRemoteDescriptionFromPeer(from: from, type: .offer, sdp: offer)

        if autoAccept {
            self.sendAnswer(to: from)
        }
    }
    
    func sendAnswer(to: String) {
        let client = self.rtcClient.get(otherOne: to)

        self.rtcClient.sendAnswerToPeer(to: to) { sessionDescription in
            self.wsClient.sendAnswer(to, ["sdp": sessionDescription.sdp, "type": "answer"], password: client.password)
            
            self.refresh("onOffer")
        }
    }
    
    func onAnswer(from: String, answer: String) {
        let _ = self.rtcClient.get(otherOne: from)

        self.rtcClient.receivedRemoteDescriptionFromPeer(from: from, type: .answer, sdp: answer)
        self.refresh("onAnswer")
    }

    func onCandidate(receivedFrom: String, candidate: RTCIceCandidate) {
        let _ = self.rtcClient.get(otherOne: receivedFrom)

        self.rtcClient.receivedCandidateFromPeer(from: receivedFrom, candidate: candidate)
        self.refresh("onCandidate")
    }
    
    //
    
    func onRefresh() {
        self.refresh("onRefresh")
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
        self.refresh("onStream")
    }
    
    func onMessage(from: String) {
        self.refresh("onMessage")
    }
    
    func onChannelReady(from: String) {
        self.refresh("onChannelReady")
    }
    
    func onClose(from: String) {
        self.refresh("onClose")
    }
}
