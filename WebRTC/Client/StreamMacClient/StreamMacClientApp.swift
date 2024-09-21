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
    @State private var messageToSend = ""
    @State private var sendMessageTo = ""
    
    var body: some Scene {
        WindowGroup {
            ContentView(client: client)
        }
    }
}
