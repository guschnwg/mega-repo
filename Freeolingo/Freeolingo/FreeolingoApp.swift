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
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .onAppear {
                    store.getAvailableCourses(fromLanguages: ["pt"])
                }
        }
    }
}
