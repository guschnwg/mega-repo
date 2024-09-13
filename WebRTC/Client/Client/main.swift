//
//  main.swift
//  Client
//
//  Created by Giovanna Zanardini on 20/08/24.
//

import Foundation
import WebRTC

let client = WebRTCClient()
RunLoop.main.run()

class WebRTCClient: NSObject {
    var peerConnection: RTCPeerConnection?
    var dataChannel: RTCDataChannel?
    var webSocketTask = URLSession.shared.webSocketTask(with: URL(string: "ws://localhost:8080/ws")!)
    var otherOne = ""
    
    override init() {
        super.init()
        
        // WebRTC
        setupPeerConnection()
        createDataChannel()
        
        // WebSocket
        webSocketTask.resume()
        receiveMessage()
    }
    
    func receiveMessage() {
        webSocketTask.receive { result in
            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    do {
                        let data = try JSONSerialization.jsonObject(with: text.data(using: .utf8)!, options: []) as? [String: Any]
                        let type = data!["type"] as! String
                        
                        print("Received type \(type)")
                        
                        if type == "welcome" {
                            print(data!["id"]!)
                        } else if type == "refresh" {
                            print(data!["clients"]!)
                        } else if type == "offer" {
                            let from = data!["from"]! as! String
                            let offer = data!["offer"] as? [String: String]
                            self.otherOne = from
                            self.receivedOfferFromPeer(offerSDP: offer!["sdp"]!)
                        } else if type == "candidate" {
                            let candidate = data!["candidate"] as! [String: Any]
                            client.peerConnection!.add(
                                RTCIceCandidate(
                                    sdp: candidate["candidate"] as! String,
                                    sdpMLineIndex: Int32(candidate["sdpMid"] as! String)!,
                                    sdpMid: candidate["sdpMid"] as! String?
                                ),
                                completionHandler: {_ in}
                            )
                        }
                    } catch {
                        print("Error \(error)")
                    }
                case .data(_):
                    print("data")
                @unknown default:
                    print("Unknown")
                }
            case .failure(let error):
                print("Error receiving message: \(error)")
                return
            }
            
            self.receiveMessage()
        }
    }
    
    func receivedOfferFromPeer(offerSDP: String) {
        let remoteSDP = RTCSessionDescription(type: .offer, sdp: offerSDP)
        client.peerConnection!.setRemoteDescription(remoteSDP) { error in
            guard error == nil else { return }
            
            let constraints = RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil)
            client.peerConnection!.answer(for: constraints) { (sdp, error) in
                guard let sdp = sdp else { return }
                
                client.peerConnection!.setLocalDescription(sdp, completionHandler: { (error) in
                    if let error = error {
                        print("Failed to set local description: \(error)")
                        return
                    }
                    print("Local description set")
                })
                
                do {
                    let json = ["type": "answer", "to": self.otherOne, "answer": ["sdp": sdp.sdp, "type": "answer" /* sdp.type */]]
                    let jsonData = try JSONSerialization.data(withJSONObject: json)
                    if let jsonString = String(data: jsonData, encoding: .utf8) {
                        client.webSocketTask.send(
                            URLSessionWebSocketTask.Message.string(jsonString),
                            completionHandler: {_ in}
                        )
                    }
                } catch {
                    print(error)
                }
            }
        }
    }
    
    private func setupPeerConnection() {
        let config = RTCConfiguration()
        config.iceServers = [RTCIceServer(urlStrings: ["stun:stun.l.google.com:19302"])]
        
        let constraints = RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil)
        peerConnection = RTCPeerConnectionFactory().peerConnection(with: config, constraints: constraints, delegate: self)!
    }
    
    func createDataChannel() {
        let config = RTCDataChannelConfiguration()
        config.isOrdered = true // You can customize this based on your requirements
        
        dataChannel = peerConnection?.dataChannel(forLabel: "dataChannel", configuration: config)
        dataChannel?.delegate = self // Set delegate to receive data
    }
    
    func sendData(_ message: String) {
        guard let dataChannel = dataChannel else { return }
        let buffer = RTCDataBuffer(data: message.data(using: .utf8)!, isBinary: false)
        dataChannel.sendData(buffer)
    }
}

extension WebRTCClient: RTCPeerConnectionDelegate {
    func peerConnection(_ peerConnection: RTCPeerConnection, didGenerate candidate: RTCIceCandidate) {
        print("Generated local ICE candidate: \(candidate)")
        
        do {
            let json: [String: Any] = [
                "type": "candidate",
                "to": self.otherOne,
                "candidate": [
                    "candidate": candidate.sdp,
                    "sdpMid": candidate.sdpMid!,
                    "sdpMLineIndex": candidate.sdpMLineIndex
                ]
            ]
            let jsonData = try JSONSerialization.data(withJSONObject: json)
            if let jsonString = String(data: jsonData, encoding: .utf8) {
                self.webSocketTask.send(
                    URLSessionWebSocketTask.Message.string(jsonString),
                    completionHandler: {_ in}
                )
            }
        } catch {
            print(error)
        }
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, iceGatheringChanged newState: RTCIceGatheringState) {
        print("ICE Gathering State changed: \(newState)")
        if newState == .complete {
            print("ICE gathering completed")
        }
    }
    
    // Other RTCPeerConnectionDelegate methods...
    func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCSignalingState) {
        print("Signaling state changed: \(newState)")
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didAdd stream: RTCMediaStream) {
        print("Stream added")
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didRemove stream: RTCMediaStream) {
        print("Stream removed")
    }
    
    func peerConnectionShouldNegotiate(_ peerConnection: RTCPeerConnection) {
        print("Negotiation needed")
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCIceConnectionState) {
        print("ICE Connection state changed: \(newState)")
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCIceGatheringState) {
        print("ICE Gathering state changed: \(newState)")
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didRemove candidates: [RTCIceCandidate]) {
        print("Removed ICE candidates")
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didOpen dataChannel: RTCDataChannel) {
        print("Data channel opened")
    }
}

extension WebRTCClient: RTCDataChannelDelegate {
    func dataChannel(_ dataChannel: RTCDataChannel, didReceiveMessageWith buffer: RTCDataBuffer) {
        if !buffer.isBinary, let message = String(data: buffer.data, encoding: .utf8) {
            print("Received message: \(message)")
            client.sendData("You sent me \(message)")
        } else {
            print("Received binary data")
        }
    }

    func dataChannelDidChangeState(_ dataChannel: RTCDataChannel) {
        print("Data channel state changed: \(dataChannel.readyState.rawValue)")
    }
}

extension WebRTCClient {
    
}
