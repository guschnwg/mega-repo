//
//  ContentView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 27/03/24.
//

import SwiftUI
import Foundation
import AVFoundation

struct ContentView: View {
    @EnvironmentObject var store: Store

    @State var state: Int = 0
    
    var body: some View {
        if store.availableCourses.isEmpty {
            Text("No courses")
        } else {
            NavigationStack {
                VStack {
                    CoursesListView(availableCourses: store.availableCourses)

                    if UserDefaults.standard.bool(forKey: "debug_mode") {
                        Spacer()

                        NavigationLink(destination: AllChallengesView()) {
                            Text("AllChallengesView")
                        }
                    }
                }
            }
        }
    }
}


#Preview {
    return ContentView()
}
