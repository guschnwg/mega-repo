//
//  FreeolingoApp.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 30/03/24.
//

import SwiftUI

@main
struct FreeolingoApp: App {
    @StateObject private var api = Api()
    @StateObject private var state = AppState()
    @StateObject private var speaker = Speaker()
    
    @State private var isReady = false
    
    var body: some Scene {
        WindowGroup {
            VStack {
                if isReady {
                    ContentView()
                        .environmentObject(api)
                        .environmentObject(speaker)
                        .environmentObject(state)
                } else {
                    Text("Loading...")
                }
            }
            .onAppear {
                Task {
                    try await state.load()
                    
                    api.getAvailableCourses(fromLanguages: ["pt"])
                    
                    isReady = true
                }
            }
        }
    }
}
