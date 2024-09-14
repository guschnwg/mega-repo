//
//  main.swift
//  Client
//
//  Created by Giovanna Zanardini on 20/08/24.
//

import Foundation
import WebRTC

let client = WSClient()

class RTCClient: WebRTCClientDelegate {
    var wsClient: WebSocketClient
    var from: String
    
    init(wsClient: WebSocketClient, from: String) {
        self.wsClient = wsClient
        self.from = from
    }
    
    func onCandidate(candidate: RTCIceCandidate) {
        wsClient.sendCandidate(
            from,
            [
                "candidate": candidate.sdp,
                "sdpMid": candidate.sdpMid!,
                "sdpMLineIndex": candidate.sdpMLineIndex
            ]
        )
    }
}

class WSClient: WebSocketClientDelegate {
    var rtcClientMap: [String: WebRTCClient] = [:]
    let wsClient = WebSocketClient()
    
    init() {
        wsClient.delegate = self
    }
    
    func onOffer(from: String, offer: String) {
        rtcClientMap[from] = WebRTCClient(otherOne: from)
        
        let client = RTCClient(wsClient: wsClient, from: from)
        rtcClientMap[from]?.delegate = client
        
        rtcClientMap[from]?.receivedOfferFromPeer(offerSDP: offer)
        
        rtcClientMap[from]?.sendAnswerToPeer { sessionDescription in
            self.wsClient.sendAnswer(from, ["sdp": sessionDescription.sdp, "type": "answer"])
        }
    }
    
    func onCandidate(from: String, candidate: RTCIceCandidate) {
        rtcClientMap[from]!.peerConnection?.add(candidate, completionHandler: {_ in})
    }
}

RunLoop.main.run()
