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
    var onTapGesture: (() -> Void)? = nil
    
    init(speak: String, language: String) {
        self.label = speak
        self.speak = speak
        self.language = language
        self.icon = ""
    }
    
    init(label: String, speak: String, language: String) {
        self.label = label
        self.speak = speak
        self.language = language
        self.icon = ""
    }
    
    init(label: String, speak: String, language: String, onTapGesture: @escaping (() -> Void)) {
        self.label = label
        self.speak = speak
        self.language = language
        self.onTapGesture = onTapGesture
        self.icon = ""
    }
    
    init(icon: String, speak: String, language: String, onTapGesture: @escaping (() -> Void)) {
        self.label = ""
        self.speak = speak
        self.language = language
        self.onTapGesture = onTapGesture
        self.icon = icon
    }

    func onTap() {
        let synthesizer = AVSpeechSynthesizer()
        let speechUtterance = AVSpeechUtterance(string: speak)
        speechUtterance.voice = AVSpeechSynthesisVoice(language: language)
        synthesizer.speak(speechUtterance)
        onTapGesture?()
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
