//
//  Speak.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 26/06/24.
//

import Foundation
import AVFoundation

class Speaker: ObservableObject {
    let synthesizer = AVSpeechSynthesizer()

    func prepare(_ language: String, _ text: String) -> AVSpeechUtterance {
        let speechUtterance = AVSpeechUtterance(string: text)
        speechUtterance.voice = AVSpeechSynthesisVoice(language: language)
        return speechUtterance
    }

    func speak(toSpeak: AVSpeechUtterance) {
        synthesizer.stopSpeaking(at: .immediate)
        synthesizer.speak(toSpeak)
    }

    func speak(language: String, text: String) {
        synthesizer.stopSpeaking(at: .immediate)
        synthesizer.speak(prepare(language, text))
    }
}
