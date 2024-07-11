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
    
    @EnvironmentObject var state: AppState
    
    @State private var selectedSection: Section? = nil

    var body: some View {
        ScrollView {
            ForEach(course.sections.indices, id: \.self) { index in
                let section = course.sections[index]
                let isAvailable = state.isAvailable(course: course, section: section)
                let color = colors[index % colors.count]
                
                NavigationLink(
                    destination: SectionView(
                        course: course,
                        section: section
                    )
                ) {
                    VStack {
                        HStack(alignment: .top) {
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
                            
                            if !isAvailable {
                                Spacer()
                                
                                Label("", systemImage: "lock")
                                    .padding(.top, 10)
                            } else {
                                Spacer()
                                
                                ZStack {
                                    let completed = state.completed(course, section)
                                    let all = section.units.count

                                    CircularProgressView(
                                        progress: CGFloat(completed) / CGFloat(all),
                                        color: color.lighter(by: 0.3),
                                        lineWidth: 5
                                    )
                                    
                                    if completed == all {
                                        Image(systemName: "checkmark")
                                            .font(.system(size: 12))
                                    } else {
                                        Text("\(completed)/\(all)")
                                            .font(.system(size: 12))
                                    }
                                }.frame(width: 40, height: 40)
                                
                            }
                        }
                    }
                }
                .frame(height: 150)
                .frame(maxWidth: .infinity)
                .padding(.all, 10)
                .background(isAvailable ? color : color.opacity(0.5))
                .clipShape(.rect(cornerRadius: 10.0))
                .foregroundColor(.white)
                .disabled(!isAvailable)
            }
        }.navigationBarTitleDisplayMode(.inline)
            .navigationTitle("Sections")
            .padding(.horizontal, 10)
    }
}

struct CourseView: View {
    let languageSettings: LanguageSettings
    
    @EnvironmentObject var api: Api
    
    @State private var selectedSection: Section? = nil
    
    var body: some View {
        let expectedCourse: Course? = api.courses.first(where: {
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
            api.getCourse(languageSettings: languageSettings)
        }.background(PALETTE.Background)
    }
}

#Preview {
    NavigationStack {
        InnerCourseView(course: COURSES[0]).environmentObject(previewApi())
    }.environmentObject(previewState())
        .environmentObject(previewApi())
}
