//
//  StreamIOSClientApp.swift
//  StreamIOSClient
//
//  Created by Giovanna Zanardini on 20/09/24.
//

import SwiftUI
import WebRTC

struct FloatingView<Content: View>: View {
    @ViewBuilder let content: Content
    
    @State private var lastOffset = CGSize.zero
    @State private var offset = CGSize.zero

    var body: some View {
        content
            .offset(x: lastOffset.width + offset.width, y: lastOffset.height + offset.height)
            .gesture(
                DragGesture()
                    .onChanged { gesture in
                        offset = gesture.translation
                    }
                    .onEnded { gesture in
                        lastOffset.width = lastOffset.width + offset.width
                        lastOffset.height = lastOffset.height + offset.height
                        offset = .zero
                    }
            )
    }
}

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
                        VideoView(rtcTrack: client.rtcClient.localVideoTrack as? RTCVideoTrack)
                            .frame(width: 100, height: 100)
                            .padding(EdgeInsets(top: 0, leading: 0, bottom: 20, trailing: 20))
                    }
                }
            } else {
                VStack {
                    Spacer()

                    Button("Start from remote") {
                        client = WSClient(baseUrl: "wss://workers.giovanna.workers.dev")
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
