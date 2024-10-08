//
//  FloatingView.swift
//  Client
//
//  Created by Giovanna Zanardini on 08/10/24.
//

import SwiftUI

struct FloatingView<Content: View>: View {
    @ViewBuilder let content: Content
    
    @State private var lastOffset = CGSize.zero
    @State private var offset = CGSize.zero

    var body: some View {
        content
            .offset(x: lastOffset.width + offset.width, y: lastOffset.height + offset.height)
            .gesture(
                DragGesture()
                    .onChanged { gesture in
                        offset = gesture.translation
                    }
                    .onEnded { gesture in
                        lastOffset.width = lastOffset.width + offset.width
                        lastOffset.height = lastOffset.height + offset.height
                        offset = .zero
                    }
            )
    }
}
