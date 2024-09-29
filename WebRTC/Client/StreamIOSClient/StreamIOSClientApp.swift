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
                NavigationStack {
                    HeaderView(client: client, showMyVideo: false, selection: nil)
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
