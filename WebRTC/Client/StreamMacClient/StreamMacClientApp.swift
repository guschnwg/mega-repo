//
//  StreamMacClientApp.swift
//  StreamMacClient
//
//  Created by Giovanna Zanardini on 17/09/24.
//

import SwiftUI

@main
struct StreamMacClientApp: App {
    @ObservedObject var client = WSClient(baseUrl: "wss://workers.giovanna.workers.dev")
    
    var body: some Scene {
        WindowGroup {
            ContentView(client: client)
        }
    }
}
