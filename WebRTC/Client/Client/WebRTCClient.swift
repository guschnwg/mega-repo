//
//  WebRTCClient.swift
//  Client
//
//  Created by Giovanna Zanardini on 13/09/24.
//

import Foundation
import WebRTC

struct WebRTCUser {
    let id: String
    let peerConnection: RTCPeerConnection
    let dataChannel: RTCDataChannel
    var mediaStreams: [RTCMediaStream]
    var messages: [(Date, String, String)]
    var password: String
}

let constraints = RTCMediaConstraints(
    mandatoryConstraints: [kRTCMediaConstraintsOfferToReceiveAudio: kRTCMediaConstraintsValueTrue,
                           kRTCMediaConstraintsOfferToReceiveVideo: kRTCMediaConstraintsValueTrue],
    optionalConstraints: ["DtlsSrtpKeyAgreement":kRTCMediaConstraintsValueTrue]
)

let factory = {
    let encoderFactory = RTCDefaultVideoEncoderFactory()
    encoderFactory.preferredCodec = RTCVideoCodecInfo(name: kRTCVideoCodecVp8Name)

    return RTCPeerConnectionFactory(
        encoderFactory: encoderFactory,
        decoderFactory: RTCDefaultVideoDecoderFactory()
    )
}()

class WebRTCClient: NSObject {
    var clientsMap: [String: WebRTCUser] = [:]
    
    private var capturer: RTCCameraVideoCapturer?
    var localVideoTrack: RTCMediaStreamTrack?
    private var videoSource: RTCVideoSource?
    private var localAudioTrack: RTCMediaStreamTrack?
    private var cameraIndex = 0
    
    weak var delegate: WebRTCClientDelegate?
    
    override init() {
        super.init()
        
        videoSource = factory.videoSource()
        capturer = RTCCameraVideoCapturer(delegate: videoSource!)

        setupTracks()
    }

    func get(otherOne: String) -> WebRTCUser {
        if let client = self.clientsMap[otherOne] { return client }

        // Shouldn't reach here, but let's not fail for now
        return self.create(otherOne: otherOne, password: "")
    }

    func create(otherOne: String, password: String) -> WebRTCUser {
        if let client = self.clientsMap[otherOne] { return client }
        
        let peerConnection = createPeerConnection()
        let dataChannel = createDataChannel(peerConnection: peerConnection)
        
        let user = WebRTCUser(
            id: otherOne,
            peerConnection: peerConnection,
            dataChannel: dataChannel,
            mediaStreams: [],
            messages: [],
            password: password
        )

        self.clientsMap[otherOne] = user

        return user
    }
    
    func getClientKey(peerConnection: RTCPeerConnection) -> String? {
        if let client = self.clientsMap.first(where: { $1.peerConnection == peerConnection }) {
            return client.key
        }
        return nil
    }
    
    func getClientKey(dataChannel: RTCDataChannel) -> String? {
        if let client = self.clientsMap.first(where: { $1.dataChannel == dataChannel }) {
            return client.key
        }
        return nil
    }
    
    func changeCamera() {
        setupTracks()
        setupTracksToPeerConnections()
    }
    
    private func setupTracks() {
        cameraIndex += 1

        localAudioTrack = factory.audioTrack(withTrackId: "camera_v\(cameraIndex)")

        let devices = RTCCameraVideoCapturer.captureDevices()
        if devices.isEmpty { return }

        capturer!.stopCapture()

        let camera = devices[cameraIndex % devices.count]
        let format = camera.formats.first!
        let fps = max(format.videoSupportedFrameRateRanges.first!.maxFrameRate, 30)

        capturer!.startCapture(with: camera, format: format, fps: Int(fps))

        localVideoTrack = factory.videoTrack(with: videoSource!, trackId: "camera_v\(cameraIndex)")
    }

    private func setupTracksToPeerConnection(peerConnection: RTCPeerConnection) {
        if let localAudioTrack = localAudioTrack {
            peerConnection.add(localAudioTrack, streamIds: ["ARDAMSv0"])
        }
        if let localVideoTrack = localVideoTrack {
            peerConnection.add(localVideoTrack, streamIds: ["ARDAMSv0"])
        }
    }

    func setupTracksToPeerConnections() {
        let peerConnections = self.clientsMap.values.map(\.peerConnection)
        for peerConnection in peerConnections {
            setupTracksToPeerConnection(peerConnection: peerConnection)
        }
        delegate?.onStream(from: "")
    }

    private func createPeerConnection() -> RTCPeerConnection {
        let config = RTCConfiguration()
        config.iceServers = [RTCIceServer(urlStrings: ["stun:stun.l.google.com:19302"])]
        config.sdpSemantics = .unifiedPlan
        config.continualGatheringPolicy = .gatherContinually
        
        let constraints = RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil)
        let peerConnection = factory.peerConnection(with: config, constraints: constraints, delegate: self)!
        
        setupTracksToPeerConnection(peerConnection: peerConnection)
        
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
        
        client.peerConnection.setLocalDescription(sdp, completionHandler: { (error) in
            if error != nil { return }
            print("Local description set")
        })
    }
    
    func sendOfferToPeer(to: String, _ completionHandler: @escaping (_ sdp: RTCSessionDescription) -> Void) {
        guard let client = self.clientsMap[to] else { return }
        
        client.peerConnection.offer(for: constraints) { (sdp, error) in
            guard let sdp = sdp else { return }
            
            self.setLocalDescription(to: to, sdp)
            
            completionHandler(sdp)
        }
    }
    
    func receivedRemoteDescriptionFromPeer(from: String, type: RTCSdpType, sdp: String) {
        guard let client = self.clientsMap[from] else { return }
        
        client.peerConnection.setRemoteDescription(RTCSessionDescription(type: type, sdp: sdp)) { _ in }
    }
    
    func receivedCandidateFromPeer(from: String, candidate: RTCIceCandidate) {
        guard let client = self.clientsMap[from] else { return }
        
        client.peerConnection.add(candidate) { _ in }
    }
    
    func sendAnswerToPeer(to: String, _ completionHandler: @escaping (_ sdp: RTCSessionDescription) -> Void) {
        guard let client = self.clientsMap[to] else { return }
        
        client.peerConnection.answer(for: constraints) { (sdp, error) in
            guard let sdp = sdp else { return }
            
            self.setLocalDescription(to: to, sdp)
            
            completionHandler(sdp)
        }
    }
    
    func sendData(to: String, _ message: String) {
        guard self.clientsMap[to] != nil else { return }
        
        self.clientsMap[to]!.dataChannel.sendData(RTCDataBuffer(data: message.data(using: .utf8)!, isBinary: false))
        self.clientsMap[to]!.messages.append((Date.now, "ME", message))
        
        delegate?.onMessage(from: to)
    }
}

extension WebRTCClient: RTCPeerConnectionDelegate {
    func peerConnection(_ peerConnection: RTCPeerConnection, didGenerate candidate: RTCIceCandidate) {
        if let key = getClientKey(peerConnection: peerConnection) {
            delegate?.onCandidate(sendTo: key, candidate: candidate)
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
        
        self.clientsMap[key]!.mediaStreams.append(stream)
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
        
        self.clientsMap[key]!.messages.append((Date.now, key, message))
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
