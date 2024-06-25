//
//  ListenView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 23/04/24.
//

import Foundation
import AVFoundation
import SwiftUI

struct TextListenView: View {
    let speak: String
    let language: String
    var onTapGesture: (() -> Void)? = nil

    let speechUtterance: AVSpeechUtterance
    
    init(speak: String, language: String) {
        self.speak = speak
        self.language = language
        
        speechUtterance = AVSpeechUtterance(string: speak)
        speechUtterance.voice = AVSpeechSynthesisVoice(language: language)
    }
    
    init(speak: String, language: String, onTapGesture: @escaping (() -> Void)) {
        self.init(speak: speak, language: language)
        self.onTapGesture = onTapGesture
    }
    
    var body: some View {
        Button(action: {
            let synthesizer = AVSpeechSynthesizer()
            synthesizer.speak(speechUtterance)
            onTapGesture?()
        }, label: {
            Label("", systemImage: "speaker.wave.2")
            .padding()
            .clipShape(RoundedRectangle(cornerRadius: 8))
        })
    }
}

#Preview {
    TextListenView(
        speak: "What",
        language: "en_US"
    )
}

