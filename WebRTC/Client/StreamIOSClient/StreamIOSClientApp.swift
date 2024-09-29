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
    @State var showMyVideo: Bool = false

    var body: some Scene {
        WindowGroup {
            if let client = client {
                Toggle("Show my video", isOn: $showMyVideo)

                NavigationStack {
                    HeaderView(client: client, showMyVideo: showMyVideo, selection: nil)
                        .navigationDestination(for: String.self) { chosen in
                            DetailView(client: client, selectedSideBarItem: chosen)
                        }
                }
            } else {
                Button("Start from remote") {
                    client = WSClient(baseUrl: "wss://workers.giovanna.workers.dev")
                }
                
                Button("Start from local") {
                    client = WSClient(baseUrl: "ws://localhost:8080")
                }
            }
        }
    }
}
