//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI

struct AssistView: View {
    let assist: Challenge.Assist
    let languageSettings: LanguageSettings
    let onComplete: (Bool, Text) -> Void
    
    @State private var choiceChosen: Int = -1
    @EnvironmentObject private var speaker: Speaker
    
    var body: some View {
        VStack {
            TextWithTTSView(
                label: assist.prompt,
                speak: assist.prompt,
                language: languageSettings.fromLanguage
            ).font(.system(size: 36))
            
            Spacer()
            
            VStack(spacing: 20) {
                ForEach(assist.choices.indices, id: \.self) { index in
                    let choice = assist.choices[index]
                    let isActive = index == choiceChosen
                    
                    ButtonWithTTSView(
                        speak: choice,
                        language: languageSettings.learningLanguage,
                        isActive: isActive,
                        onTapGesture: { self.choiceChosen = index }
                    ) {
                        Text(choice)
                    }
                }
            }

            Spacer()

            Button("Confirm") {
                onComplete(
                    assist.correctIndex == choiceChosen,
                    Text(assist.choices[assist.correctIndex])
                )
            }
            .frame(maxWidth: .infinity)
            .padding(.all, 20)
            .disabled(choiceChosen == -1)
        }
        .padding(.all, 100)
        .onChange(of: assist) { choiceChosen = -1 }
    }
}

#Preview {
    AssistView(
        assist: Challenge.Assist(
            prompt: "Oi",
            choices: ["Hi", "Bye"],
            correctIndex: 0
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt", learningLanguage: "en"
        ),
        onComplete: {isCorrect,_ in print("Is correct: \(isCorrect)")}
    )
        .background(.red.lighter(by: 0.3))
        .environmentObject(Speaker())
}
