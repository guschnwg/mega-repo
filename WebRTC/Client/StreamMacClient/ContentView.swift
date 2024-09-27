//
//  ContentView.swift
//  StreamMacClient
//
//  Created by Giovanna Zanardini on 17/09/24.
//

import SwiftUI
import WebRTC

struct VideoView: NSViewRepresentable {
    var rtcTrack: RTCVideoTrack
    
    func makeNSView(context: Context) -> RTCMTLNSVideoView {
        return RTCMTLNSVideoView()
    }
    
    func updateNSView(_ view: RTCMTLNSVideoView, context: Context) {
        rtcTrack.add(view)
    }
}

struct CommunicateView: View {
    var item: WebRTCUser
    var onNewMessage: (String) -> Void
    
    @State private var messageToSend = ""
    
    var body: some View {
        VStack {
            if !item.mediaStreams.isEmpty && !item.mediaStreams[0].videoTracks.isEmpty {
                // TODO: this is probably something that i want to add only one time
                VideoView(rtcTrack: item.mediaStreams[0].videoTracks[0])
                    .frame(height: 100)
            }

            ForEach(item.messages, id: \.self.0) { (date, from, content) in
                Text("\(from): \(content) (\(date))")
            }
            
            TextField("Message", text: $messageToSend)
                .onSubmit {
                    onNewMessage(messageToSend)
                    messageToSend = ""
                }
        }
    }
}

struct ContentView: View {
    @ObservedObject var client: WSClient
    
    @State private var selectedSideBarItem: String = ""
    @State private var isGranted = false
    
    var body: some View {
        NavigationSplitView() {
            List(client.wsClient.clients, id: \.self, selection: $selectedSideBarItem) { id in
                HStack {
                    NavigationLink(id, value: id)
                    
                    Spacer()
                    
                    if let this = client.rtcClient.clientsMap[id] {
                        switch this.peerConnection.connectionState {
                            case .connected:
                                Image(systemName: "checkmark.seal")
                            case .new, .connecting:
                                Image(systemName: "arrow.2.circlepath.circle")
                            default:
                                Spacer()
                            }
                        
                        switch this.dataChannel.readyState {
                            case .open:
                                Image(systemName: "checkmark.seal")
                            case .connecting:
                                Image(systemName: "arrow.2.circlepath.circle")
                            default:
                                Spacer()
                            }
                    }
                }
            }
            
            Text("HI")

            if let videoTrack = client.rtcClient.localVideoTrack as? RTCVideoTrack {
                VideoView(rtcTrack: videoTrack).frame(height: 100)
            }
        } detail: {
            if let item = client.rtcClient.clientsMap[selectedSideBarItem] {
                if item.peerConnection.connectionState == .connected && item.dataChannel.readyState == .open {
                    CommunicateView(item: item) {
                        client.rtcClient.sendData(to: selectedSideBarItem, $0)
                    }
                } else {
                    Text("Connecting...?")
                }
            } else {
                if isGranted {
                    if selectedSideBarItem != "" {
                        Button("Chat") {
                            client.sendOffer(to: selectedSideBarItem)
                        }
                    } else {
                        Text("Choose someone to chat with")
                    }
                } else {
                    Text("Camera access not granted")
                }
            }
        }.navigationTitle(client.wsClient.me)
            .onAppear {
                AVCaptureDevice.requestAccess(for: .video) { granted in
                    if granted {
                        self.isGranted = true
                    }
                }
            }
    }
}
