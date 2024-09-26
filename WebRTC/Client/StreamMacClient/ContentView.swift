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
    var item: (WebRTCClient, [(Date, String, String)], [RTCMediaStream])
    var onNewMessage: (String) -> Void
    
    @State private var messageToSend = ""
    
    var body: some View {
        VStack {
            if !item.2.isEmpty && !item.2[0].videoTracks.isEmpty {
                VideoView(rtcTrack: item.2[0].videoTracks[0])
                    .frame(height: 100)
            }
            
            ForEach(item.1, id: \.self.0) { (date, from, content) in
                Text("\(from): \(content) (\(date))")
            }
            
            TextField("Message", text: $messageToSend)
                .onSubmit {
                    item.0.sendData(messageToSend)
                    onNewMessage(messageToSend)
                    messageToSend = ""
                }
        }
    }
}

struct ContentView: View {
    @ObservedObject var client: WSClient
    
    @State var selectedSideBarItem: String = ""
    
    var body: some View {
        NavigationSplitView() {
            List(client.wsClient.clients, id: \.self, selection: $selectedSideBarItem) { id in
                HStack {
                    NavigationLink(id, value: id)
                    
                    Spacer()
                    
                    if client.rtcClientMap[id] != nil {
                        Image(systemName: "checkmark.seal")
                    }
                }
            }
        } detail: {
            if let item = client.rtcClientMap[selectedSideBarItem] {
                CommunicateView(item: item) {
                    client.onMessage(from: "me", inConversation: selectedSideBarItem, message: $0)
                }
            } else {
                if selectedSideBarItem != "" {
                    Button("Chat") {
                        client.sendOffer(to: selectedSideBarItem)
//                        AVCaptureDevice.requestAccess(for: .video) { granted in
//                            if granted {
//                                client.sendOffer(to: selectedSideBarItem)
//                            }
//                        }
                    }
                } else {
                    Text("Choose someone to chat with")
                }
            }
        }.navigationTitle(client.wsClient.me)
    }
}
