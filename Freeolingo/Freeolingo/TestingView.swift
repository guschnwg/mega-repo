//
//  Testing.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 24/05/24.
//

import Foundation
import SwiftUI

struct TestingView: View {
    var body: some View {
        VStack {
            ForEach(0...10, id: \.self) { index in
                Text("Something")
                    .frame(width: /*@START_MENU_TOKEN@*/100/*@END_MENU_TOKEN@*/, height: 100)
                    .background(.red)
                    .offset(x: index % 2 == 0 ? -60 : 60)
                    .offset(y: CGFloat(-20 * index))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(.yellow)
    }
}

#Preview {
    TestingView()
}
