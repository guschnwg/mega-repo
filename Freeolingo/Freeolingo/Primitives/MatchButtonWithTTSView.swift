//
//  MatchButtonWithTTSView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 01/07/24.
//

import Foundation
import SwiftUI

enum MatchButtonWithTTSViewType {
    case icon, text
}

struct MatchButtonWithTTSView: View {
    let speak: String
    let language: String
    let isLastListened: Bool
    let isSelected: Bool
    let isSelectable: Bool
    let isWrong: Bool
    let type: MatchButtonWithTTSViewType
    
    let onSelect: () -> Void
    
    var body: some View {
        ButtonWithTTSView(
            speak: speak,
            language: language,
            isActive: isLastListened,
            background: isSelectable ? .white : .gray,
            onTapGesture: onSelect
        ) {
            switch type {
            case .icon:
                Label("", systemImage: "speaker.wave.2")
                    .foregroundColor(isSelectable ? .black : .black.opacity(0.4))
            case .text:
                Text(speak)
                    .foregroundColor(isSelectable ? .black : .black.opacity(0.4))
            }
        }.overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(
                    isWrong ? .red : .white,
                    lineWidth: isSelected ? 5 : 0
                )
                .animation(.spring, value: isLastListened)
        )
    }
}

#Preview {
    VStack {
        MatchButtonWithTTSView(
            speak: "something",
            language: "en_US",
            isLastListened: false,
            isSelected: false,
            isSelectable: false,
            isWrong: false,
            type: .icon
        ) {}
        
        MatchButtonWithTTSView(
            speak: "something",
            language: "en_US",
            isLastListened: false,
            isSelected: false,
            isSelectable: true,
            isWrong: false,
            type: .icon
        ) {}
        
        MatchButtonWithTTSView(
            speak: "something",
            language: "en_US",
            isLastListened: true,
            isSelected: false,
            isSelectable: true,
            isWrong: false,
            type: .icon
        ) {}
        
        MatchButtonWithTTSView(
            speak: "something",
            language: "en_US",
            isLastListened: true,
            isSelected: true,
            isSelectable: true,
            isWrong: false,
            type: .text
        ) {}
        
        MatchButtonWithTTSView(
            speak: "something",
            language: "en_US",
            isLastListened: true,
            isSelected: true,
            isSelectable: true,
            isWrong: true,
            type: .text
        ) {}
    }
    .frame(maxWidth: /*@START_MENU_TOKEN@*/.infinity/*@END_MENU_TOKEN@*/, maxHeight: .infinity)
    .padding(.all, 20)
    .background(.red.lighter(by: 0.4))
    .environmentObject(Speaker())
}
