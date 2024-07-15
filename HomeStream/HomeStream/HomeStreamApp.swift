//
//  HomeStreamApp.swift
//  HomeStream
//
//  Created by Giovanna Zanardini on 14/07/24.
//

import SwiftUI

@main
struct HomeStreamApp: App {
    @StateObject private var api = Api()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(api)
        }
    }
}
