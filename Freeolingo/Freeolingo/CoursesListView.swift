//
//  CoursesListView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 24/05/24.
//

import Foundation
import SwiftUI

struct CoursesListView : View {
    let availableCourses: [AvailableCourse]

    @EnvironmentObject var store: Store
    
    var body: some View {
        let baseColor = Color.teal.darker(by: 0.2)
        let increment = CGFloat(1) / CGFloat(availableCourses.count + 5)

        ScrollView {
            VStack (spacing: 0) {
                ForEach(availableCourses.indices, id: \.self) { index in
                    let course = availableCourses[index]
                    
                    let rowColor = baseColor.lighter(by: increment * CGFloat(index))
                    
                    let fromLanguageName = course.fromLanguageName
                    let learningLanguageName = course.learningLanguageName
                    let languageSettings = LanguageSettings(
                        fromLanguage: course.fromLanguage,
                        learningLanguage: course.learningLanguage
                    )
                    
                    NavigationLink(destination: CourseView(languageSettings: languageSettings)) {
                        Text(fromLanguageName + " -> " + learningLanguageName)
                            .font(.system(size: 24))
                            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                            .padding(.all, 10)
                    }
                    .frame(height: 100)
                    .frame(maxWidth: .infinity)
                    .background(rowColor)
                    .foregroundColor(.white)
                }
            }
        }.navigationTitle("Courses")
            .background(baseColor)
    }
}

#Preview {
    NavigationStack {
        CoursesListView(availableCourses: AVAILABLE_COURSES)
    }
}
