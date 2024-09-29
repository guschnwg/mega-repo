//
//  ContentView.swift
//  StreamMacClient
//
//  Created by Giovanna Zanardini on 17/09/24.
//

import SwiftUI
import WebRTC

struct CommunicateView: View {
    var item: WebRTCUser
    var onNewMessage: (String) -> Void
    
    @State private var messageToSend = ""
    
    var body: some View {
        VStack {
            if !item.mediaStreams.isEmpty && !item.mediaStreams[0].videoTracks.isEmpty {
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

struct DetailView: View {
    @ObservedObject var client: WSClient
    var selectedSideBarItem: String
    
    @State private var isGranted: Bool = false
    
    var body: some View {
        VStack {
            if isGranted {
                if client.wsClient.clients.isEmpty {
                    Text("There is no one to chat with")
                } else {
                    if selectedSideBarItem == "" {
                        Text("Choose someone to chat with")
                    } else {
                        if let client = client.rtcClient.clientsMap[selectedSideBarItem] {
                            Text("Chatting with \(client.id)")
                        } else {
                            Button("Chat") {
                                client.sendOffer(to: selectedSideBarItem)
                            }
                        }
                    }
                }
                
                // This is to not have the blinking effect
                ForEach(client.rtcClient.clientsMap.keys.sorted(), id: \.self) {
                    let item = client.rtcClient.clientsMap[$0]!
                    
                    if selectedSideBarItem == $0 {
                        if item.peerConnection.connectionState == .connected && item.dataChannel.readyState == .open {
                            CommunicateView(item: item) {
                                client.rtcClient.sendData(to: selectedSideBarItem, $0)
                            }
                        } else if item.peerConnection.signalingState == .haveRemoteOffer {
                            Button("Accept call?") {
                                client.sendAnswer(to: item.id)
                            }
                        } else {
                            Text("Connecting...?")
                        }
                    }
                }
            } else {
                Text("Camera access not granted")
            }
        }.onAppear {
            AVCaptureDevice.requestAccess(for: .video) { granted in
                if granted {
                    self.isGranted = true
                }
            }
        }
    }
}

struct HeaderView: View {
    @ObservedObject var client: WSClient
    
    var showMyVideo: Bool
    var selection: Binding<String?>? // Only use with NavigationSplitView

    var body: some View {
        List(client.wsClient.clients, id: \.self, selection: selection) { id in
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
        .navigationTitle(client.wsClient.me)
        
        // Méh
        Button(client.autoAccept ? "Don't auto accept" : "Auto Accept") {
            client.autoAccept = !client.autoAccept
            client.onRefresh()
        }
        
        if showMyVideo, let videoTrack = client.rtcClient.localVideoTrack as? RTCVideoTrack {
            VideoView(rtcTrack: videoTrack).frame(height: 100)
        }
    }
}
