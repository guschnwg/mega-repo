//
//  ContentView.swift
//  StreamIOSClient
//
//  Created by Giovanna Zanardini on 20/09/24.
//

import SwiftUI
import WebRTC

struct WebView: UIViewRepresentable {
    var url: URL

    func makeUIView(context: Context) -> RTCMTLVideoView {
        return RTCMTLVideoView()
    }

    func updateUIView(_ view: RTCMTLVideoView, context: Context) {
        
    }
}


struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Hello, world!")
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
