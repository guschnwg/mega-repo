//
//  FreeolingoApp.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 30/03/24.
//

import SwiftUI

@main
struct FreeolingoApp: App {
    @StateObject private var store = Store()
    @StateObject private var speaker = Speaker()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .environmentObject(speaker)
                .onAppear {
                    store.getAvailableCourses(fromLanguages: ["pt"])
                }
        }
    }
}
