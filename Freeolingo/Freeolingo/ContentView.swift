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
    let courses: Array<Course>
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    @State var state: Int = 0
    
    var body: some View {
        if courses.count == 0 {
            Text("No courses")
        } else {
            NavigationStack {
                VStack {
                    CoursesListView(courses: courses, viewSession: viewSession)
                    
                    Spacer()
                    
                    NavigationLink(destination: AllChallengesView()) {
                        Text("AllChallengesView")
                    }
                }
            }
        }
    }
}


#Preview {
    return ContentView(courses: COURSES) {_,_,_,_,_ in
        print("called it")
    }
}
