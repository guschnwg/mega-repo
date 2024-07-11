//
//  StoryView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 11/07/24.
//

import Foundation
import SwiftUI

struct StoryView: View {
    let course: Course
    let section: Section
    let unit: Unit
    let level: Level
    let story: Story
    
    let finishAction: () -> Void
    
    @EnvironmentObject var colorWrapper: ColorWrapper
    
    @State private var isPresented = false
    
    var body: some View {
        Button(action: { isPresented = true }) {
            Text("Start").frame(maxWidth: .infinity)
        }
        .onLongPressGesture(perform: {
            isPresented = false
            finishAction()
        })
        .padding()
        .background(colorWrapper.color)
        .foregroundColor(.white)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .sheet(isPresented: $isPresented) {
            Text("Not ready yet :)")
            
            Button("Go ahead") {
                isPresented = false
                finishAction()
            }
        }
    }
}

#Preview {
    StoryView(
        course: COURSES[0],
        section: COURSES[0].sections[0],
        unit: COURSES[0].sections[0].units[0],
        level: COURSES[0].sections[0].units[0].levels[0],
        story: STORIES[0]
    ) {}
        .environmentObject(ColorWrapper(.red))
}
