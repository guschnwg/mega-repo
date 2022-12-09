//
//  NoIdeaApp.swift
//  NoIdea
//
//  Created by Giovanna Zanardini on 28/10/22.
//

import Algorithms
import SwiftUI

@main
struct NoIdeaApp: App {
    @StateObject private var store = Store()

    var body: some Scene {
        WindowGroup {
            NavigationView {
                FeelingSelectionView(data: store.data)
            }.onAppear {
                Store.load { result in
                    switch result {
                    case .failure(let error):
                        fatalError(error.localizedDescription)
                    case .success(let data):
                        store.data = data
                    }
                }
            }
        }
    }
}
