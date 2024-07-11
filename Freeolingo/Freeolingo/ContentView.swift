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
    @EnvironmentObject var api: Api

    @State var state: Int = 0
    
    var body: some View {
        if api.availableCourses.isEmpty {
            Text("No courses")
            
            Button("Refresh") {
                api.getAvailableCourses(fromLanguages: ["pt"])
            }
        } else {
            NavigationStack {
                CoursesListView(availableCourses: api.availableCourses)
            }
        }
    }
}


#Preview {
    return ContentView().environmentObject(previewApi())
}
