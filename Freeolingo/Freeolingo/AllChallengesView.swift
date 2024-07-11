//
//  AllQuestionsView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 24/05/24.
//

import Foundation
import SwiftUI

struct AllChallengesView: View {
    @State var something = false

    var body: some View {
        Button("All challenges") {
            something = true
        }
        .sheet(isPresented: $something) {
            SessionChallengesView(
                course: COURSES[0],
                section: COURSES[0].sections[0],
                unit: COURSES[0].sections[0].units[0],
                level: COURSES[0].sections[0].units[0].levels[0],
                session: SESSIONS[0]
            ) {}
        }
        .environmentObject(Speaker())
        .environmentObject(ColorWrapper(.red))
    }
}

#Preview {
    AllChallengesView()
}
