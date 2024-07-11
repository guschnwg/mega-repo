//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let url: URL
    
    func makeUIView(context: Context) -> WKWebView {
        return WKWebView()
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        uiView.isOpaque = false
        uiView.backgroundColor = UIColor.clear
        uiView.scrollView.backgroundColor = UIColor.clear
        uiView.load(request)
    }
}

struct SelectView: View {
    var select: Challenge.Select
    let languageSettings: LanguageSettings
    let onComplete: (Bool, Text) -> Void
    
    @State private var choiceChosen: Int = -1
    
    var body: some View {
        VStack(spacing: 30) {
            TextWithTTSView(
                label: select.prompt,
                speak: select.prompt,
                language: languageSettings.fromLanguage
            ).font(.system(size: 36))
            
            Spacer()

            VStack {
                ForEach(select.choices.indices, id: \.self) { index in
                    let choice = select.choices[index]
                    
                    ButtonWithTTSView(
                        speak: choice.phrase,
                        language: languageSettings.learningLanguage,
                        isActive: choiceChosen == index,
                        onTapGesture: { self.choiceChosen = index }
                    ) {
                        VStack {
                            WebView(url: URL(string: choice.image)!)
                                .frame(width: 55, height: 55, alignment: .center)
                            
                            Text(choice.phrase)
                        }
                    }
                    
                }
            }

            Spacer()

            ConfirmButtonView {
                let response = select.choices[select.correctIndex]
                onComplete(
                    select.correctIndex == choiceChosen,
                    Text("\(response.phrase) - \(response.hint)")
                )
            }
            .disabled(choiceChosen == -1)
        }
        .frame(maxHeight: /*@START_MENU_TOKEN@*/.infinity/*@END_MENU_TOKEN@*/)
        .onChange(of: select) { choiceChosen = -1 }
        .onAppear { choiceChosen = -1 }
    }
}

#Preview {
    SelectView(
        select: Challenge.Select(
            prompt: "preto",
            correctIndex: 0,
            choices: [
                Challenge.SelectChoice(
                    image: "https://d2pur3iezf4d1j.cloudfront.net/images/8a0bf2fda530b50c833af5ce0c4ab30f",
                    phrase: "noir",
                    hint: "preto"),
                Challenge.SelectChoice(
                    image: "https://d2pur3iezf4d1j.cloudfront.net/images/d753ed22f4bb63de85a295702d469e10",
                    phrase: "la robe",
                    hint: "o vestido"),
                Challenge.SelectChoice(
                    image: "https://d2pur3iezf4d1j.cloudfront.net/images/9aa862ebf2f8636383e54ce23d340db9",
                    phrase: "le chat",
                    hint: "o gato"),
            ]
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect,_ in print("Is correct: \(isCorrect)")}
    )
    .background(.red.lighter())
    .environmentObject(ColorWrapper(.red))
    .environmentObject(Speaker())
}
