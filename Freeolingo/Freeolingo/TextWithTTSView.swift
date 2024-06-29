//
//  TextWithTTSView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import Foundation
import AVFoundation
import SwiftUI

struct TextWithTTSView: View {
    let label: String
    let speak: String
    let icon: String
    let language: String
    var onTapGesture: () -> Void = {}
    
    @EnvironmentObject private var speaker: Speaker

    init(label: String, speak: String, icon: String, language: String, onTapGesture: @escaping (() -> Void)) {
        self.label = label
        self.speak = speak
        self.language = language
        self.icon = icon
        self.onTapGesture = onTapGesture
    }
    
    init(speak: String, language: String) {
        self.init(label: speak, speak: speak, icon: "", language: language, onTapGesture: {})
    }
    
    init(label: String, speak: String, language: String) {
        self.init(label: label, speak: speak, icon: "", language: language, onTapGesture: {})
    }
    
    init(label: String, speak: String, language: String, onTapGesture: @escaping (() -> Void)) {
        self.init(label: label, speak: speak, icon: "", language: language, onTapGesture: onTapGesture)
    }
    
    init(icon: String, speak: String, language: String, onTapGesture: @escaping (() -> Void)) {
        self.init(label: "", speak: speak, icon: icon, language: language, onTapGesture: onTapGesture)
    }

    let synthesizer = AVSpeechSynthesizer()
    func onTap() {
        speaker.speak(language: language, text: speak)
        onTapGesture()
    }
    
    var body: some View {
        if label != "" {
            Text(label)
                .onTapGesture(perform: onTap)
        } else if icon != "" {
            Label("", systemImage: icon)
                .onTapGesture(perform: onTap)
        }
    }
}

#Preview {
    TextWithTTSView(speak: "Olá", language: "pt")
        .environmentObject(Speaker())
}
