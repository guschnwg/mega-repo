//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI
import WrappingHStack

struct ListenSpeakView: View {
    var listenSpeak: Challenge.ListenSpeak
    let languageSettings: LanguageSettings
    let onComplete: (Bool, Text) -> Void
    
    @State private var choiceChosen: [Int] = []
    @State private var shuffled: [String] = []
    
    var body: some View {
        VStack {
            TextWithTTSView(
                label: listenSpeak.prompt,
                speak: listenSpeak.prompt,
                language: languageSettings.fromLanguage
            )
            .font(.system(size: 36))

            Spacer()

            VStack {
                if !choiceChosen.isEmpty {
                    WrappingHStack(alignment: .center) {
                        ForEach(choiceChosen, id: \.self) { index in
                            let choice = listenSpeak.choices[index]
                            
                            ButtonWithTTSView(
                                speak: choice,
                                language: languageSettings.fromLanguage,
                                isActive: true,
                                onTapGesture: { choiceChosen.removeAll(where: { $0 == index }) }
                            ) {
                                Text(choice)
                                .padding(.all, -8) // These kind of stuff is kinda cool
                            }
                            .frame(width: CGFloat(choice.count * 15 + 40))
                        }
                    }.padding(.all, 10)
                }
            }
            .frame(maxWidth: /*@START_MENU_TOKEN@*/.infinity/*@END_MENU_TOKEN@*/, minHeight: 120)
            
            Spacer()
            
            WrappingHStack(alignment: .center) {
                ForEach(shuffled, id: \.self) { choice in
                    let index = listenSpeak.choices.firstIndex(of: choice)
                    let alreadyMatched = choiceChosen.contains(where: { $0 == index })

                    ButtonWithTTSView(
                        speak: choice,
                        language: languageSettings.fromLanguage,
                        isActive: false,
                        background: {
                            if alreadyMatched {
                                return .white.opacity(0.5)
                            } else {
                                return .white
                            }
                        }(),
                        onTapGesture: {
                            if alreadyMatched { return }
                            choiceChosen.append(index!)
                        }
                    ) {
                        Text(choice)
                        .foregroundStyle(alreadyMatched ? .black.opacity(0.5) : .black)
                        .padding(.all, -8)
                    }
                    .frame(width: CGFloat(choice.count * 15 + 40))
                }
            }.padding(.all, 10)
            
            Spacer()
            
            ConfirmButtonView() {
                onComplete(
                    listenSpeak.correctIndices == choiceChosen,
                    Text("???")
                )
            }
            .disabled(choiceChosen.isEmpty)
        }
        .onChange(of: listenSpeak) {
            choiceChosen = []
            shuffled = listenSpeak.choices.shuffled()
        }
        .onAppear {
            choiceChosen = []
            shuffled = listenSpeak.choices.shuffled()
        }
    }
}

#Preview {
    ListenSpeakView(
        listenSpeak: Challenge.ListenSpeak(
            prompt: "Hi, bye",
            solutionTranslation: "Oi, tchau",
            choices: ["Oi", "Tchau", "Não", "Sim", "Tchauziho", "Entshuldingug"],
            correctIndices: [0, 1]
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect, text in print("Is correct: \(isCorrect) \(text)")}
    )
    .environmentObject(Speaker())
    .environmentObject(ColorWrapper(.red))
    .background(.red.lighter(by: 0.3))
}
