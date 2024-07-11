//
//  ButtonWithTTSView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 26/06/24.
//

import Foundation
import AVFoundation
import SwiftUI
import WrappingHStack

struct ButtonWithTTSView<Label: View>: View {
    let label: Label
    let speak: String
    let language: String
    let isActive: Bool
    let background: Color
    let onTapGesture: () -> Void
    
    @EnvironmentObject private var speaker: Speaker
    
    init(
        speak: String,
        language: String,
        isActive: Bool,
        background: Color,
        onTapGesture: @escaping (() -> Void),
        @ViewBuilder label: () -> Label
    ) {
        self.label = label()
        self.speak = speak
        self.language = language
        self.isActive = isActive
        self.background = background
        self.onTapGesture = onTapGesture
    }
    
    init(
        speak: String,
        language: String,
        isActive: Bool,
        onTapGesture: @escaping (() -> Void),
        @ViewBuilder label: () -> Label
    ) {
        self.init(
            speak: speak,
            language: language,
            isActive: isActive,
            background: .white,
            onTapGesture: onTapGesture,
            label: label
        )
    }
    
    init(
        speak: String,
        language: String,
        onTapGesture: @escaping (() -> Void),
        @ViewBuilder label: () -> Label
    ) {
        self.init(
            speak: speak,
            language: language,
            isActive: false,
            background: .white,
            onTapGesture: onTapGesture,
            label: label
        )
    }

    init(
        speak: String,
        language: String,
        @ViewBuilder label: () -> Label
    ) {
        self.init(
            speak: speak,
            language: language,
            isActive: false,
            background: .white,
            onTapGesture: {},
            label: label
        )
    }
    
    var body: some View {
        Button(action: {
            onTapGesture()
            speaker.speak(language: language, text: speak)
        }, label: {
            HStack {
                Spacer()
                self.label
                Spacer()
            }
            .padding(.all, 20)
        })
        .frame(maxWidth: .infinity)
        .background(background.opacity(isActive ? 0.4: 0.1))
        .foregroundColor(.black)
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

#Preview {
    WrappingHStack {
        ButtonWithTTSView(speak: "Olá", language: "pt", onTapGesture: {}) {
            Text("Olá")
        }
        ButtonWithTTSView(speak: "Olá", language: "pt", isActive: true, onTapGesture: {}) {
            Text("2")
        }
        ButtonWithTTSView(speak: "Olá", language: "pt", isActive: true, background: .white, onTapGesture: {}) {
            Text("3")
        }
    }.environmentObject(Speaker())
    .frame(maxHeight: /*@START_MENU_TOKEN@*/.infinity/*@END_MENU_TOKEN@*/)
    .background(.red)
        
}
