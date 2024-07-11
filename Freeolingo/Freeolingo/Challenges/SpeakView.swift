//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI
import Speech

struct SpeakView: View {
    var speak: Challenge.Speak
    let languageSettings: LanguageSettings
    let onComplete: (Bool, Text) -> Void
    
    @State private var isRecording: Bool = false
    @State private var current: SFSpeechRecognitionResult? = nil
    
    var body: some View {
        let currentTranscription = current?.bestTranscription.formattedString ?? ""
        
        VStack(spacing: 50) {
            TextWithTTSView(
                label: speak.prompt,
                speak: speak.prompt,
                language: languageSettings.learningLanguage
            ).font(.system(size: 36))
            
            Spacer()

            Text(currentTranscription.isEmpty ? "..." : currentTranscription)
            
            Spacer()

            RecognizeSpeechView(
                result: $current,
                isRecording: $isRecording,
                language: languageSettings.learningLanguage
            )

            if !isRecording {
                HStack {
                    Button(action: {
                        isRecording = true
                    }) {
                        Label(
                            currentTranscription.isEmpty ? "Speak it up": "Try again",
                            systemImage: "speaker.wave.2"
                        )
                        .padding()
                        .foregroundColor(.white)
                        .background(Color.blue)
                        .cornerRadius(10)
                    }
                    
                    if !currentTranscription.isEmpty {
                        Button(action: {
                            let score = currentTranscription.distance(between: speak.prompt)
                            
                            if score > 0.85 {
                                onComplete(true, Text("OK: \(score)"))
                            } else {
                                onComplete(false, Text("NOT OK: \(score)"))
                            }
                        }) {
                            Label(
                                "I am ok with that",
                                systemImage: "checkmark.circle"
                            )
                            .padding()
                            .foregroundColor(.white)
                            .background(Color.orange)
                            .cornerRadius(10)
                        }
                    }
                }
            } else {
                Button(action: {
                    isRecording = false
                }) {
                    Label("Stop it", systemImage: "speaker.wave.2")
                        .padding()
                        .foregroundColor(.blue)
                        .background(Color.white)
                        .cornerRadius(10)
                }
            }
            
            Spacer()

            ConfirmButtonView {
                let score = currentTranscription.distance(between: speak.prompt)
                
                if score > 0.85 {
                    onComplete(true, Text("OK: \(score)"))
                } else {
                    onComplete(false, Text("NOT OK: \(score)"))
                }
            }
            .disabled(currentTranscription.isEmpty)
        }
        .frame(maxWidth: /*@START_MENU_TOKEN@*/.infinity/*@END_MENU_TOKEN@*/)
        .frame(maxHeight: .infinity)
        .onChange(of: speak) {
            current = nil
            isRecording = false
        }
    }
}

#Preview {
    SpeakView(
        speak: Challenge.Speak(
            prompt: "la hauteur",
            solutionTranslation: "a altura"
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect,_ in print("Is correct: \(isCorrect)")}
    )
    .environmentObject(Speaker())
    .environmentObject(ColorWrapper(.red))
    .background(.red.lighter())
}
