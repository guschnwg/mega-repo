//
//  StreamMacClientApp.swift
//  StreamMacClient
//
//  Created by Giovanna Zanardini on 17/09/24.
//

import SwiftUI
import WebRTC

@main
struct StreamMacClientApp: App {
    @State var client: WSClient?
    @State var selection: String? = ""
    
    var body: some Scene {
        WindowGroup {
            if let client = client {
                NavigationSplitView {
                    VStack {
                        HeaderView(client: client, selection: $selection)
                        Spacer()
                        VideoView(rtcTrack: client.rtcClient.localVideoTrack as? RTCVideoTrack).frame(height: 100)
                    }
                } detail: {
                    DetailView(client: client, selectedSideBarItem: selection ?? "")
                }.navigationTitle(client.wsClient.me)
            } else {
                Button("Start from remote") {
                    client = WSClient(baseUrl: "wss://webrtc.giovanna.cc")
                }
                
                Button("Start from local") {
                    client = WSClient(baseUrl: "ws://localhost:8080")
                }
            }
        }
    }
}
