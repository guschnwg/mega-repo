//
//  WebRTCClient.swift
//  Client
//
//  Created by Giovanna Zanardini on 13/09/24.
//

import Foundation
import WebRTC

class WebRTCClient: NSObject {
    var peerConnection: RTCPeerConnection?
    var dataChannel: RTCDataChannel?
    var otherOne: String = ""
    
    weak var delegate: WebRTCClientDelegate?
    
    init(otherOne: String) {
        super.init()

        self.otherOne = otherOne
        setupPeerConnection()
        createDataChannel()
    }
    
    func receivedOfferFromPeer(offerSDP: String) {
        let remoteSDP = RTCSessionDescription(type: .offer, sdp: offerSDP)
        peerConnection!.setRemoteDescription(remoteSDP) { _ in }
    }
    
    func sendAnswerToPeer(_ completionHandler: @escaping (_ sdp: RTCSessionDescription) -> Void) {
        let constraints = RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil)
        self.peerConnection!.answer(for: constraints) { (sdp, error) in
            guard let sdp = sdp else { return }
            
            self.peerConnection!.setLocalDescription(sdp, completionHandler: { (error) in
                if let error = error {
                    print("Failed to set local description: \(error)")
                    return
                }
                print("Local description set")
            })
            
            completionHandler(sdp)
        }
    }
    
    private func setupPeerConnection() {
        let config = RTCConfiguration()
        config.iceServers = [RTCIceServer(urlStrings: ["stun:stun.l.google.com:19302"])]
        
        let constraints = RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil)
        peerConnection = RTCPeerConnectionFactory().peerConnection(with: config, constraints: constraints, delegate: self)!
    }
    
    private func createDataChannel() {
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
        delegate?.onCandidate(to: otherOne, candidate: candidate)
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
        delegate?.onStream(from: otherOne, stream: stream)
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
            delegate?.onMessage(from: otherOne, message: message)
            sendData("You sent me \(message)")
        } else {
            print("Received binary data")
        }
    }

    func dataChannelDidChangeState(_ dataChannel: RTCDataChannel) {
        print("Data channel state changed: \(dataChannel.readyState.rawValue)")
        if dataChannel.readyState == .open {
            delegate?.onChannelReady(from: otherOne)
        }
    }
}

protocol WebRTCClientDelegate: AnyObject {
    func onCandidate(to: String, candidate: RTCIceCandidate)
    func onChannelReady(from: String)
    func onMessage(from: String, message: String)
    func onStream(from: String, stream: RTCMediaStream)
}
