//
//  CourseView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 24/05/24.
//

import Foundation
import SwiftUI

struct CourseView: View {
    let course: Course
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    @State private var selectedSection: Section? = nil
    
    var body: some View {
        ScrollView {
            ForEach(course.sections.indices, id: \.self) { index in
                let section = course.sections[index]

                NavigationLink(
                    destination: SectionView(
                        course: course,
                        section: section,
                        viewSession: viewSession
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
                .frame(height: 250)
                .frame(maxWidth: .infinity)
                .padding(.all, 10)
                .background(colors[index % colors.count])
                .clipShape(.rect(cornerRadius: 10.0))
            }
        }.navigationBarTitleDisplayMode(.inline)
            .navigationTitle("Sections")
            .padding(.all, 10)
    }
}

#Preview {
    CourseView(course: COURSES[0]) {_,_,_,_,_ in}
}
