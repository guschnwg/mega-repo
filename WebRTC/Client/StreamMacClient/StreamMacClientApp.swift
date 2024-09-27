//
//  StreamMacClientApp.swift
//  StreamMacClient
//
//  Created by Giovanna Zanardini on 17/09/24.
//

import SwiftUI

@main
struct StreamMacClientApp: App {
    @State var client: WSClient?
    
    var body: some Scene {
        WindowGroup {
            if let client = client {
                ContentView(client: client)
            } else {
                Button("Start") {
                    client = WSClient(baseUrl: "wss://workers.giovanna.workers.dev")
                }
            }
        }
    }
}
