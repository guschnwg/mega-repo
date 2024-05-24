//
//  CoursesListView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 24/05/24.
//

import Foundation
import SwiftUI

struct CoursesListView : View {
    let courses: Array<Course>
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    var body: some View {
        let baseColor = Color.red
        
        VStack(spacing: 0) {
            ForEach(courses.indices, id: \.self) { index in
                let course = courses[index]
                
                let brightness = Double(Double(index) * Double(1) / Double(courses.count + 3))
                let rowColor = baseColor.brightness(brightness)
                
                let fromLanguageName = getLanguageName(identifier: course.fromLanguage)
                let learningLanguageName = getLanguageName(identifier: course.learningLanguage)
                
                NavigationLink(destination: CourseView(course: course, viewSession: viewSession)) {
                    Text(fromLanguageName + " -> " + learningLanguageName)
                        .font(.system(size: 24))
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                        .padding(.all, 10)
                }
                .frame(height: 100)
                .frame(maxWidth: .infinity)
                .background(rowColor)
            }
        }.navigationTitle("Courses")
    }
}

#Preview {
    CoursesListView(courses: COURSES) {_,_,_,_,_ in}
}
