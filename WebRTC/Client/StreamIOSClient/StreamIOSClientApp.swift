//
//  StreamIOSClientApp.swift
//  StreamIOSClient
//
//  Created by Giovanna Zanardini on 20/09/24.
//

import SwiftUI
import WebRTC

@main
struct StreamIOSClientApp: App {
    @State var client: WSClient?
    
    var body: some Scene {
        WindowGroup {
            if let client = client {
                ZStack(alignment: .bottomTrailing) {
                    NavigationStack {
                        HeaderView(client: client, selection: nil)
                            .navigationDestination(for: String.self) { chosen in
                                DetailView(client: client, selectedSideBarItem: chosen)
                            }
                    }
                    
                    FloatingView {
                        VideoView(
                            rtcTrack: client.rtcClient.localVideoTrack as? RTCVideoTrack
                        )
                        .frame(width: 100, height: 100)
                        .padding(
                            EdgeInsets(top: 0, leading: 0, bottom: 20, trailing: 20)
                        )
                    }
                    
                    Button("Change camera") {
                        client.rtcClient.changeCamera()
                    }
                }
            } else {
                VStack {
                    Spacer()
                    
                    Button("Start from remote") {
                        client = WSClient(baseUrl: "wss://webrtc.giovanna.cc")
                    }.buttonStyle(BorderedButtonStyle())
                    
                    Spacer()
                    
                    Button("Start from local") {
                        client = WSClient(baseUrl: "ws://localhost:8080")
                    }.buttonStyle(BorderedButtonStyle())
                    
                    Spacer()
                }
            }
        }
    }
}
