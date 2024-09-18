//
//  StreamMacClientApp.swift
//  StreamMacClient
//
//  Created by Giovanna Zanardini on 17/09/24.
//

import SwiftUI

@main
struct StreamMacClientApp: App {
    @ObservedObject var client = WSClient()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
            
            Text("You are: \(client.wsClient.me)")
            
            List(client.wsClient.clients, id: \.self) { id in
                HStack {
                    Text(id)
                    
                    if let item = client.rtcClientMap[id] {
                        Text("\(item.0.peerConnection!.connectionState)")
                        Text("\(item.0.dataChannel!.readyState)")
                        Text("\(item.1)")
                    } else {
                        Button("Connect") {
                            
                        }
                    }
                }
            }
        }
    }
}
