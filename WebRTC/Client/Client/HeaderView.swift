//
//  ContentView.swift
//  StreamMacClient
//
//  Created by Giovanna Zanardini on 17/09/24.
//

import SwiftUI
import WebRTC

struct HeaderView: View {
    @ObservedObject var client: WSClient
    
    var selection: Binding<String?>? // Only use with NavigationSplitView

    var body: some View {
        List(client.wsClient.clients, id: \.self, selection: selection) { id in
            Toggle(client.autoAccept ? "Don't auto accept" : "Auto Accept", isOn: $client.autoAccept)

            HStack {
                NavigationLink(value: id) {
                    Text(id)

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
        }
        .navigationTitle(client.wsClient.me)
    }
}
