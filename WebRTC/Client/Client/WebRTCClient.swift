//
//  WebRTCClient.swift
//  Client
//
//  Created by Giovanna Zanardini on 13/09/24.
//

import Foundation
import WebRTC

typealias Mine = (RTCPeerConnection, RTCDataChannel, [RTCMediaStream], [(Date, String, String)])

let constraints = RTCMediaConstraints(
    mandatoryConstraints: [kRTCMediaConstraintsOfferToReceiveAudio: kRTCMediaConstraintsValueTrue,
                           kRTCMediaConstraintsOfferToReceiveVideo: kRTCMediaConstraintsValueTrue],
    optionalConstraints: ["DtlsSrtpKeyAgreement":kRTCMediaConstraintsValueTrue]
)
let factory = RTCPeerConnectionFactory()

class WebRTCClient: NSObject {
    var clientsMap: [String: Mine] = [:]
    
    private var capturer: RTCCameraVideoCapturer?
    var localVideoTrack: RTCMediaStreamTrack? = nil
    var localAudioTrack: RTCMediaStreamTrack? = nil
    
    weak var delegate: WebRTCClientDelegate?
    
    override init() {
        localAudioTrack = factory.audioTrack(withTrackId: "ARDAMSa0")
        
        let videoSource = factory.videoSource()
        capturer = RTCCameraVideoCapturer(delegate: videoSource)
        if let frontCamera = RTCCameraVideoCapturer.captureDevices().first {
            let format = frontCamera.formats.first!
            let fps = format.videoSupportedFrameRateRanges.first!.minFrameRate
            capturer!.startCapture(with: frontCamera, format: format, fps: Int(fps))
        }
        localVideoTrack = factory.videoTrack(with: videoSource, trackId: "ARDAMSv0")
    }
    
    func create(otherOne: String) {
        if let _ = self.clientsMap[otherOne] { return }
        
        let peerConnection = createPeerConnection()
        let dataChannel = createDataChannel(peerConnection: peerConnection)
        
        self.clientsMap[otherOne] = (peerConnection, dataChannel, [], [])
    }
    
    func getClientKey(peerConnection: RTCPeerConnection) -> String? {
        if let client = self.clientsMap.first(where: { key, value in value.0 == peerConnection }) {
            return client.key
        }
        return nil
    }
    
    func getClientKey(dataChannel: RTCDataChannel) -> String? {
        if let client = self.clientsMap.first(where: { key, value in value.1 == dataChannel }) {
            return client.key
        }
        return nil
    }
    
    
    private func createPeerConnection() -> RTCPeerConnection {
        let config = RTCConfiguration()
        config.iceServers = [RTCIceServer(urlStrings: ["stun:stun.l.google.com:19302"])]
        config.sdpSemantics = .unifiedPlan
        config.continualGatheringPolicy = .gatherContinually
        
        let constraints = RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil)
        let peerConnection = factory.peerConnection(with: config, constraints: constraints, delegate: self)!

        peerConnection.add(localAudioTrack!, streamIds: ["ARDAMSv0"])
        peerConnection.add(localVideoTrack!, streamIds: ["ARDAMSv0"])

        return peerConnection
    }
    
    private func createDataChannel(peerConnection: RTCPeerConnection) -> RTCDataChannel {
        let config = RTCDataChannelConfiguration()
        config.isNegotiated = true
        config.channelId = 0
        
        let dataChannel = peerConnection.dataChannel(forLabel: "dataChannel", configuration: config)!
        dataChannel.delegate = self // Set delegate to receive data
        
        return dataChannel
    }

    private func setLocalDescription(to: String, _ sdp: RTCSessionDescription) {
        guard let client = self.clientsMap[to] else { return }

        client.0.setLocalDescription(sdp, completionHandler: { (error) in
            if error != nil { return }
            print("Local description set")
        })
    }
    
    func sendOfferToPeer(to: String, _ completionHandler: @escaping (_ sdp: RTCSessionDescription) -> Void) {
        guard let client = self.clientsMap[to] else { return }

        client.0.offer(for: constraints) { (sdp, error) in
            guard let sdp = sdp else { return }
            
            self.setLocalDescription(to: to, sdp)
            
            completionHandler(sdp)
        }
    }
    
    func receivedRemoteDescriptionFromPeer(from: String, type: RTCSdpType, sdp: String) {
        guard let client = self.clientsMap[from] else { return }

        client.0.setRemoteDescription(RTCSessionDescription(type: type, sdp: sdp)) { _ in }
    }
    
    func receivedCandidateFromPeer(from: String, candidate: RTCIceCandidate) {
        guard let client = self.clientsMap[from] else { return }
        
        client.0.add(candidate) { _ in }
    }
    
    func sendAnswerToPeer(to: String, _ completionHandler: @escaping (_ sdp: RTCSessionDescription) -> Void) {
        guard let client = self.clientsMap[to] else { return }

        client.0.answer(for: constraints) { (sdp, error) in
            guard let sdp = sdp else { return }
            
            self.setLocalDescription(to: to, sdp)
            
            completionHandler(sdp)
        }
    }
    
    func sendData(to: String, _ message: String) {
        guard self.clientsMap[to] != nil else { return }

        self.clientsMap[to]!.1.sendData(RTCDataBuffer(data: message.data(using: .utf8)!, isBinary: false))
        self.clientsMap[to]!.3.append((Date.now, "ME", message))
        
        delegate?.onMessage(from: to)
    }
}

extension WebRTCClient: RTCPeerConnectionDelegate {
    func peerConnection(_ peerConnection: RTCPeerConnection, didGenerate candidate: RTCIceCandidate) {
        if let client = self.clientsMap.first(where: { key, value in value.0 == peerConnection }) {
            delegate?.onCandidate(sendTo: client.key, candidate: candidate)
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
        guard let key = getClientKey(peerConnection: peerConnection) else { return }
        guard self.clientsMap[key] != nil else { return }

        self.clientsMap[key]!.2.append(stream)
        delegate?.onStream(from: key)
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didRemove stream: RTCMediaStream) {
        print("Stream removed")
    }
    
    func peerConnectionShouldNegotiate(_ peerConnection: RTCPeerConnection) {
        print("Negotiation needed")
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCIceConnectionState) {
        print("ICE Connection state changed: \(newState)")
        
        if newState == .failed || newState == .disconnected || newState == .closed {
            guard let key = getClientKey(peerConnection: peerConnection) else { return }
            delegate?.onClose(from: key)
        }
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
        if buffer.isBinary { return }

        guard let message = String(data: buffer.data, encoding: .utf8) else { return }

        guard let key = self.getClientKey(dataChannel: dataChannel) else { return }
        guard self.clientsMap[key] != nil else { return }

        self.clientsMap[key]!.3.append((Date.now, key, message))
        delegate?.onMessage(from: key)
    }

    func dataChannelDidChangeState(_ dataChannel: RTCDataChannel) {
        if dataChannel.readyState == .open {
            guard let key = self.getClientKey(dataChannel: dataChannel) else { return }
            delegate?.onChannelReady(from: key)
        }
    }
}

protocol WebRTCClientDelegate: AnyObject {
    func onCandidate(sendTo: String, candidate: RTCIceCandidate)
    func onStream(from: String)
    func onChannelReady(from: String)
    func onMessage(from: String)
    func onClose(from: String)
}
