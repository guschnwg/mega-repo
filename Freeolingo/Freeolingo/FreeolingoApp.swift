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
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(api)
                .environmentObject(speaker)
                .environmentObject(state)
                .onAppear {
                    api.getAvailableCourses(fromLanguages: ["pt"])
                    Task { try await state.load() }
                }
        }
    }
}
