//
//  SectionView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 24/05/24.
//
// I don't know this calculations here, seem very weak

import Foundation
import SwiftUI

let colors = [
    Color.red,
    Color.blue,
    Color.orange,
    Color.pink,
    Color.brown,
    Color.cyan,
    Color.mint,
    Color.purple,
    Color.green,
]

func getColor(index: Int, exclude: Color? = nil) -> Color {
    let available = (exclude != nil) ? colors.filter { $0 != exclude } : colors
    return available[index % available.count]
}

struct SectionView: View {
    let course: Course
    let section: Section
    
    var body: some View {
        ScrollView {
            ForEach(section.units.indices, id: \.self) { index in
                let unit = section.units[index]
                let color = getColor(index: index)
                let increment = CGFloat(1) / CGFloat(unit.levels.count + 5)
                
                VStack {
                    Text(unit.name ?? "???")
                        .frame(maxWidth: .infinity)
                        .frame(height: 100).font(.system(size: 20))
                        .background(color)

                    Spacer(minLength: 20)
                    
                    // Can't be more arbitrary than this...
                    VStack (alignment: .center, spacing: 0) {
                        ForEach(unit.levels.indices, id: \.self) { levelIndex in
                            let level = unit.levels[levelIndex]
                            let levelColor = color.lighter(by: increment * CGFloat(levelIndex))
                            
                            LevelView(
                                course: course,
                                section: section,
                                unit: unit,
                                level: level,
                                color: levelColor
                            )
                            .frame(width: 120, height: 120)
                            .background(levelColor)
                            .clipShape(Circle())
                            .offset(
                                x: levelIndex % 2 == 0 ? 80.0 : -80.0,
                                y: CGFloat(-36 * levelIndex)
                            )
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.bottom, CGFloat(-36 * (unit.levels.count - 1)))
                    
                    Spacer(minLength: 20)
                }
                .frame(maxWidth: .infinity)
            }
        }.navigationBarTitleDisplayMode(.inline)
            .navigationTitle("Units")
            .background(PALETTE.Background)
    }
}

#Preview {
    NavigationStack {
        SectionView(
            course: COURSES[0],
            section: COURSES[0].sections[0]
        )
    }.environmentObject(previewStore())
}
