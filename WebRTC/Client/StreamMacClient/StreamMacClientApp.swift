//
//  StreamMacClientApp.swift
//  StreamMacClient
//
//  Created by Giovanna Zanardini on 17/09/24.
//

import SwiftUI
import WebRTC


struct VideoView: NSViewRepresentable {
    var rtcTrack: RTCVideoTrack

    func makeNSView(context: Context) -> NSView {
        let videoView = RTCMTLNSVideoView()
        
        rtcTrack.add(videoView)
        
        return videoView
    }

    func updateNSView(_ view: NSView, context: Context) {
    }
}

@main
struct StreamMacClientApp: App {
    @ObservedObject var client = WSClient()
    @State private var messageToSend = ""
    @State private var sendMessageTo = ""
    
    var body: some Scene {
        WindowGroup {
            ContentView()
            
            Text("You are: \(client.wsClient.me)")
            
            List(client.wsClient.clients, id: \.self) { id in
                VStack {
                    HStack {
                        Text(id)
                        
                        if let item = client.rtcClientMap[id] {
                            Text("\(item.0.peerConnection!.connectionState)")
                            Text("\(item.0.dataChannel!.readyState)")
                            Text("\(item.1.count)")
                        } else {
                            Button("Connect") {
                                
                            }
                        }
                    }
                    
                    if let item = client.rtcClientMap[id] {
                        VStack {
                            ForEach(item.1, id: \.self.0) { (date, from, content) in
                                Text("\(from): \(content) (\(date))")
                            }
                            
                            if !item.2[0].videoTracks.isEmpty {
                                VideoView(rtcTrack: item.2[0].videoTracks[0])
                                    .frame(width: 400, height: 400)
                            }
                            
                            if sendMessageTo == id {
                                TextField("Message", text: $messageToSend)
                                    .onSubmit {
                                        item.0.sendData(messageToSend)
                                        messageToSend = ""
                                    }
                            } else {
                                Button("Send message") {
                                    sendMessageTo = id
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
