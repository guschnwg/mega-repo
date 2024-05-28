//
//  CourseView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 24/05/24.
//

import Foundation
import SwiftUI

struct InnerCourseView: View {
    let course: Course
    
    @State private var selectedSection: Section? = nil

    var body: some View {
        ScrollView {
            ForEach(course.sections.indices, id: \.self) { index in
                let section = course.sections[index]
                
                NavigationLink(
                    destination: SectionView(
                        course: course,
                        section: section
                    )
                ) {
                    VStack (alignment: .leading) {
                        Spacer()
                        
                        Text("Section \(index + 1)")
                            .font(.system(size: 24))
                        
                        switch section.type {
                        case SectionType.learning:
                            if section.exampleSentence != nil {
                                Text(section.exampleSentence!.exampleSentence)
                                    .font(.system(size: 14))
                            } else {
                                Text("Lesson")
                            }
                            
                        case SectionType.dailyRefresh:
                            Text("Daily Refresh")
                            
                        case SectionType.personalizedPractice:
                            Text("Personalized Practice")
                            
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .frame(height: 150)
                .frame(maxWidth: .infinity)
                .padding(.all, 10)
                .background(colors[index % colors.count])
                .clipShape(.rect(cornerRadius: 10.0))
                .foregroundColor(.white)
            }
        }.navigationBarTitleDisplayMode(.inline)
            .navigationTitle("Sections")
            .padding(.horizontal, 10)
    }
}

struct CourseView: View {
    let languageSettings: LanguageSettings
    
    @EnvironmentObject var store: Store
    
    @State private var selectedSection: Section? = nil
    
    var body: some View {
        let expectedCourse: Course? = store.courses.first(where: {
            languageSettings.fromLanguage == $0.fromLanguage
            && languageSettings.learningLanguage == $0.learningLanguage
        })
        
        VStack {
            if let course = expectedCourse {
                InnerCourseView(course: course)
            } else {
                Text("No course for this")
            }
        }
        .onAppear {
            store.getCourse(languageSettings: languageSettings)
        }.background(PALETTE.Background)
    }
}

#Preview {
    NavigationStack {
        InnerCourseView(course: COURSES[0]).environmentObject(previewStore())
    }
}
