//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI

struct MatchView: View {
    var match: Challenge.Match
    let languageSettings: LanguageSettings
    let onComplete: (Bool, Text) -> Void
    
    @State private var matches: [(Int, Int)] = []
    @State private var current: (Int, Int) = (-1, -1)
    @State private var shuffledLeft: [Int] = []
    @State private var shuffledRight: [Int] = []
    
    func setChoice(index: Int, value: Int) {
        if index == 0 {
            current.0 = shuffledLeft[value]
        } else if index == 1 {
            current.1 = shuffledRight[value]
        }
        
        if current.0 != -1 && current.1 != -1 {
            if current.0 == current.1 {
                // Right
                matches.append(current)
                current = (-1, -1)
                
                if matches.count == shuffledLeft.count {
                    onComplete(true, Text("Correct"))
                }
            } else {
                // Wrong
                var token = ""
                if index == 0 {
                    token = match.pairs[current.1].learningToken
                } else if index == 1 {
                    token = match.pairs[current.0].fromToken
                }
                onComplete(false, Text("No, it should be \(token)"))
            }
        }
    }
    
    var body: some View {
        VStack {
            ForEach(shuffledLeft.indices, id: \.self) { index in
                let leftIndex = shuffledLeft[index]
                let left = match.pairs[leftIndex]
                let rightIndex = shuffledRight[index]
                let right = match.pairs[rightIndex]
                
                HStack (alignment: .center, spacing: 50) {
                    TextWithTTSView(
                        label: left.learningToken,
                        speak: left.learningToken,
                        language: languageSettings.learningLanguage,
                        onTapGesture: { setChoice(index: 0, value: index) }
                    )
                    .padding(.vertical, 10)
                    .padding(.horizontal, 15)
                    .apply {
                        if current.0 == leftIndex { $0.background(.red) }
                        else if matches.map({ $0.0 }).contains(leftIndex) { $0.background(.gray) }
                        else { $0.background(.white) }
                    }
                    .clipShape(RoundedRectangle(cornerSize: CGSize(width: 20, height: 10)))
                    .onTapGesture { setChoice(index: 0, value: index) }
                    
                    TextWithTTSView(
                        label: right.fromToken,
                        speak: right.fromToken,
                        language: languageSettings.fromLanguage,
                        onTapGesture:  { setChoice(index: 1, value: index) }
                    )
                    .padding(.vertical, 10)
                    .padding(.horizontal, 15)
                    .apply {
                        if current.1 == rightIndex { $0.background(.red) }
                        else if matches.map({ $0.1 }).contains(rightIndex) { $0.background(.gray) }
                        else { $0.background(.white) }
                    }
                    .clipShape(RoundedRectangle(cornerSize: CGSize(width: 20, height: 10)))
                    .onTapGesture { setChoice(index: 1, value: index) }
                }
            }
        }
        .padding(.vertical, 100)
        .frame(maxWidth: .infinity)
        .frame(maxHeight: .infinity)
        .background(.green)
        .onChange(of: match) {
            matches = []
            current = (-1, -1)
            shuffledLeft = match.pairs.indices.shuffled()
            shuffledRight = match.pairs.indices.shuffled()
        }
        .onAppear {
            matches = []
            current = (-1, -1)
            shuffledLeft = match.pairs.indices.shuffled()
            shuffledRight = match.pairs.indices.shuffled()
        }
    }
}

#Preview {
    MatchView(
        match: Challenge.Match(
            pairs: [
                Challenge.MatchPair(learningToken: "Hi", fromToken: "Oi"),
                Challenge.MatchPair(learningToken: "Bye", fromToken: "Tchau"),
                Challenge.MatchPair(learningToken: "Yes", fromToken: "Sim"),
                Challenge.MatchPair(learningToken: "No", fromToken: "Não"),
            ]
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect,_ in print("Is correct: \(isCorrect)")}
    )
}
