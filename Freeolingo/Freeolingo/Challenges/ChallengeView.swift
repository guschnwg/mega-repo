//
//  ChallengeView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI
import Foundation

func emojiForNumber(_ number: Int) -> String {
    switch number {
    case 0: return "0️⃣"
    case 1: return "1️⃣"
    case 2: return "2️⃣"
    case 3: return "3️⃣"
    case 4: return "4️⃣"
    case 5: return "5️⃣"
    case 6: return "6️⃣"
    case 7: return "7️⃣"
    case 8: return "8️⃣"
    case 9: return "9️⃣"
    case 10: return "🔟"
    default: return "🔢"
    }
}

struct LanguageSettings {
    let fromLanguage: String
    let learningLanguage: String
}

struct ChallengeView: View {
    let languageSettings: LanguageSettings
    let challenge: Challenge
    let onAnswered: (Bool) -> Void
    let onComplete: (Bool) -> Void

    @State private var showAlert = false
    @State private var alertText: Text = Text("Nothing")
    @State private var answerCorrect: Bool = false

    func _onComplete(isCorrect: Bool, message: Text) {
        showAlert = true
        answerCorrect = isCorrect
        alertText = message
        onAnswered(isCorrect)
    }
    
    var body: some View {
        VStack {
            switch challenge.data {
            case .assist(let assist):
                AssistView(assist: assist, languageSettings: languageSettings, onComplete: _onComplete)
            case .completeReverseTranslation(let completeReverseTranslation):
                CompleteReverseTranslationView(completeReverseTranslation: completeReverseTranslation, languageSettings: languageSettings, onComplete: _onComplete)
            case .listen(let listen):
                ListenView(listen: listen, languageSettings: languageSettings, onComplete: _onComplete)
            case .listenComplete(let listenComplete):
                ListenCompleteView(listenComplete: listenComplete, languageSettings: languageSettings, onComplete: _onComplete)
            case .listenIsolation(let listenIsolation):
                ListenIsolationView(listenIsolation: listenIsolation, languageSettings: languageSettings, onComplete: _onComplete)
            case .listenMatch(let listenMatch):
                ListenMatchView(listenMatch: listenMatch, languageSettings: languageSettings, onComplete: _onComplete)
            case .listenSpeak(let listenSpeak):
                ListenSpeakView(listenSpeak: listenSpeak, languageSettings: languageSettings, onComplete: _onComplete)
            case .listenTap(let listenTap):
                ListenTapView(listenTap: listenTap, languageSettings: languageSettings, onComplete: _onComplete)
            case .match(let match):
                MatchView(match: match, languageSettings: languageSettings, onComplete: _onComplete)
            case .name(let name):
                NameView(name: name, languageSettings: languageSettings, onComplete: _onComplete)
            case .partialReverseTranslate(let partialReverseTranslate):
                PartialReverseTranslateView(partialReverseTranslate: partialReverseTranslate, languageSettings: languageSettings, onComplete: _onComplete)
            case .select(let select):
                SelectView(select: select, languageSettings: languageSettings, onComplete: _onComplete)
            case .speak(let speak):
                SpeakView(speak: speak, languageSettings: languageSettings, onComplete: _onComplete)
            case .translate(let translate):
                TranslateView(translate: translate, languageSettings: languageSettings, onComplete: _onComplete)
            case .gapFill(let gapFill):
                Text("GAP FILL")
            default:
                Text(challenge.type)
            }
        }
        .alert(isPresented: $showAlert) {
            Alert(
                title: answerCorrect ? Text("Correct") : Text("WRONG!"),
                message: alertText,
                dismissButton: .default(Text("OK")) {
                    showAlert = false
                    onComplete(answerCorrect)
                }
            )
        }
    }
}
