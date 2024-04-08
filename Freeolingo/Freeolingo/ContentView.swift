//
//  ContentView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 27/03/24.
//

import SwiftUI
import Foundation
import AVFoundation
import Speech

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

struct TextWithTTS: View {
    let label: String
    let speak: String
    let language: String
    
    let synthesizer = AVSpeechSynthesizer()
    
    var body: some View {
        Text(label).onTapGesture {
            let speechUtterance = AVSpeechUtterance(string: speak)
            speechUtterance.voice = AVSpeechSynthesisVoice(language: language)
            synthesizer.speak(speechUtterance)
        }
    }
}

struct RecognizeSpeechView: View {
    let language: String

    @State private var recognizedText = "Speech Recognition"
    @State private var isRecording = false
    
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "fr"))
    private let audioEngine = AVAudioEngine()
    @State private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    @State private var recognitionTask: SFSpeechRecognitionTask?
    
    func requestSpeechAuthorization() {
        SFSpeechRecognizer.requestAuthorization { authStatus in
            // Handle authorization status
            if authStatus == .authorized {
                print("Speech recognition authorized")
            } else {
                print("Speech recognition not authorized")
            }
        }
    }
    
    private func startRecording() {
        if recognitionTask != nil {
            recognitionTask?.cancel()
            recognitionTask = nil
        }
        
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            print("audioSession properties weren't set because of an error.")
        }
        
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        
        let inputNode = audioEngine.inputNode
        
        guard let recognitionRequest = recognitionRequest else {
            fatalError("Unable to create a SFSpeechAudioBufferRecognitionRequest object")
        }
        
        recognitionRequest.shouldReportPartialResults = true
        
        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { result, error in
            var isFinal = false
            
            if let result = result {
                self.recognizedText = result.bestTranscription.formattedString
                isFinal = result.isFinal
            }
            
            if error != nil || isFinal {
                self.audioEngine.stop()
                inputNode.removeTap(onBus: 0)
                
                self.recognitionRequest = nil
                self.recognitionTask = nil
                
                self.isRecording = false
            }
        }
        
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { (buffer, when) in
            self.recognitionRequest?.append(buffer)
        }
        
        audioEngine.prepare()
        
        do {
            try audioEngine.start()
            isRecording = true
        } catch {
            print("audioEngine couldn't start because of an error.")
        }
    }
    
    private func stopRecording() {
        audioEngine.stop()
        recognitionRequest?.endAudio()
        isRecording = false
    }
    
    var body: some View {
        VStack {
            Text(recognizedText)
                .padding()
            
            Button(action: {
                if self.isRecording {
                    stopRecording()
                } else {
                    startRecording()
                }
            }) {
                Text(isRecording ? "Stop Recording" : "Start Recording")
                    .padding()
            }
        }
        .onAppear {
            self.requestSpeechAuthorization()
        }
    }
}

struct ChallengeView: View {
    let fromLanguage: String
    let learningLanguage: String
    let challenge: Challenge
    private var jsonResult: NSDictionary?
    
    init(fromLanguage: String, learningLanguage: String, challenge: Challenge) {
        self.challenge = challenge
        self.fromLanguage = fromLanguage
        self.learningLanguage = learningLanguage
        
        if let data = challenge.rawData.data(using: .utf8) {
            do {
                let json = try JSONSerialization.jsonObject(with: data, options: .mutableLeaves)
                self.jsonResult = json as? NSDictionary
            } catch {
                print("JSON deserialization error: \(error)")
                self.jsonResult = nil
            }
        }
    }
    
    var body: some View {
        VStack {
            switch challenge.type {
            case "assist":
                let prompt = jsonResult!["prompt"] as! String
                
                TextWithTTS(label: "Prompt: \(prompt)", speak: prompt, language: fromLanguage)
                
                let choices = jsonResult!["choices"] as! [String]
                let correctIndex = jsonResult!["correctIndex"] as! Int
                let response = choices[correctIndex]
                
                List(choices, id: \.self) { choice in
                    let choiceStr = choice == response ? "\(choice) ✅" : choice
                    TextWithTTS(label: choiceStr, speak: choice, language: learningLanguage)
                }
            case "completeReverseTranslation":
                let prompt = jsonResult!["prompt"] as! String
                TextWithTTS(label: "Prompt: \(prompt)", speak: prompt, language: fromLanguage)
                
                var solutions: [String] = []
                
                let tokens = jsonResult!["displayTokens"] as! [NSDictionary]
                let response = tokens.map { token in
                    let text = token["text"] as! String
                    if token["isBlank"] as! Bool {
                        solutions.append(text)
                        return text.map { _ in "_" }.joined()
                    } else {
                        return text
                    }
                }.joined()
                
                TextWithTTS(label: "Translated: \(response)", speak: response, language: learningLanguage)
                
                List(solutions, id: \.self) { token in
                    TextWithTTS(label: token, speak: token, language: learningLanguage)
                }
            case "listen":
                let prompt = jsonResult!["prompt"] as! String
                TextWithTTS(label: "Prompt: \(prompt)", speak: prompt, language: learningLanguage)
                
                let solutionTranslation = jsonResult!["solutionTranslation"] as! String
                TextWithTTS(label: "Solution: \(solutionTranslation)", speak: solutionTranslation, language: fromLanguage)
            case "listenComplete":
                var solutions: [String] = []
                
                let tokens = jsonResult!["displayTokens"] as! [NSDictionary]
                let prompt = tokens.map { token in
                    let text = token["text"] as! String
                    if token["isBlank"] as! Bool {
                        solutions.append(text)
                        return text.map { _ in "_" }.joined()
                    } else {
                        return text
                    }
                }.joined()
                
                TextWithTTS(label: "Prompt: \(prompt)", speak: prompt, language: learningLanguage)
                
                let solutionTranslation = jsonResult!["solutionTranslation"] as! String
                TextWithTTS(label: "Translation: \(solutionTranslation)", speak: solutionTranslation, language: fromLanguage)
                
                List(solutions, id: \.self) { token in
                    TextWithTTS(label: token, speak: token, language: learningLanguage)
                }
            case "listenIsolation":
                let rangeStart = jsonResult!["blankRangeStart"] as! Int
                let rangeEnd = jsonResult!["blankRangeEnd"] as! Int
                let range = rangeStart...rangeEnd
                
                let tokens = jsonResult!["tokens"] as! [NSDictionary]
                let rawPrompt = tokens.map { $0["value"] as! String }.joined()
                let prompt = tokens.enumerated().map {(index, item) in
                    let word = item["value"] as! String
                    return range.contains(index) ? word.map { _ in "_" }.joined() : word
                }.joined()
                
                TextWithTTS(label: "Prompt: \(prompt)", speak: rawPrompt, language: learningLanguage)
                
                let solutionTranslation = jsonResult!["solutionTranslation"] as! String
                TextWithTTS(label: "Solution: \(solutionTranslation)", speak: solutionTranslation, language: fromLanguage)
                
                let options = (jsonResult!["options"] as! [NSDictionary]).map { $0["text"] as! String }
                let correctIndex = jsonResult!["correctIndex"] as! Int
                let response = options[correctIndex]
                
                List(options, id: \.self) { option in
                    TextWithTTS(label: option == response ? "\(option) ✅" : option, speak: option, language: learningLanguage)
                }
                
            case "listenMatch":
                let pairs = jsonResult!["pairs"] as! [NSDictionary]
                
                ForEach(pairs, id: \.self) {item in
                    HStack {
                        let learningWord = item["learningWord"] as! String
                        TextWithTTS(label: learningWord, speak: learningWord, language: learningLanguage)
                        
                        Text(" - ")
                        
                        let translation = item["translation"] as! String
                        TextWithTTS(label: translation, speak: translation, language: fromLanguage)
                    }
                }
            case "listenSpeak":
                let prompt = jsonResult!["prompt"] as! String
                TextWithTTS(label: "Prompt: \(prompt)", speak: prompt, language: learningLanguage)
                
                let choices = jsonResult!["choices"] as! [String]
                let correctIndices = jsonResult!["correctIndices"] as! [Int]
                
                List(choices, id: \.self) {choice in
                    let index = choices.firstIndex(of: choice)
                    let number = correctIndices.firstIndex(of: index!)
                    let emoji = number != nil ? emojiForNumber(number!) : "❌"
                    let choiceStr = "\(choice) \(emoji)"
                    
                    TextWithTTS(label: choiceStr, speak: choice, language: fromLanguage)
                }
            case "listenTap":
                let prompt = jsonResult!["prompt"] as! String
                TextWithTTS(label: "Prompt: \(prompt)", speak: prompt, language: learningLanguage)
                
                let solutionTranslation = jsonResult!["solutionTranslation"] as! String
                TextWithTTS(label: "Solution: \(solutionTranslation)", speak: solutionTranslation, language: fromLanguage)
                
                let choices = (jsonResult!["choices"] as! [NSDictionary]).map {$0["text"] as! String}
                let correctIndices = jsonResult!["correctIndices"] as! [Int]
                
                List(choices, id: \.self) {choice in
                    let index = choices.firstIndex(of: choice)
                    let number = correctIndices.firstIndex(of: index!)
                    let emoji = number != nil ? emojiForNumber(number!) : "❌"
                    let choiceStr = "\(choice) \(emoji)"
                    
                    TextWithTTS(label: choiceStr, speak: choice, language: learningLanguage)
                }
            case "match":
                let pairs = jsonResult!["pairs"] as! [NSDictionary]
                
                ForEach(pairs, id: \.self) {item in
                    HStack {
                        let learningToken = item["learningToken"] as! String
                        TextWithTTS(label: learningToken, speak: learningToken, language: learningLanguage)
                        
                        Text(" - ")
                        
                        let fromToken = item["fromToken"] as! String
                        TextWithTTS(label: fromToken, speak: fromToken, language: fromLanguage)
                    }
                }
            case "name":
                let prompt = jsonResult!["prompt"] as! String
                TextWithTTS(label: "Prompt: \(prompt)", speak: prompt, language: fromLanguage)
                
                let solutions = jsonResult!["correctSolutions"] as! [String]
                List(solutions, id: \.self) { solution in
                    TextWithTTS(label: solution, speak: solution, language: learningLanguage)
                }
            case "partialReverseTranslate":
                let prompt = jsonResult!["prompt"] as! String
                TextWithTTS(label: "Prompt: \(prompt)", speak: prompt, language: fromLanguage)
                
                var solution: String = ""
                let tokens = jsonResult!["displayTokens"] as! [NSDictionary]
                let toComplete = tokens.map { token in
                    let text = token["text"] as! String
                    if token["isBlank"] as! Bool {
                        solution.append(text)
                        return text.map { _ in "_" }.joined()
                    } else {
                        return text
                    }
                }.joined()
                TextWithTTS(label: "Prompt: \(toComplete)", speak: toComplete, language: learningLanguage)
                
                TextWithTTS(label: "Solution: \(solution)", speak: solution, language: learningLanguage)
            case "select":
                let prompt = jsonResult!["prompt"] as! String
                TextWithTTS(label: "Prompt: \(prompt)", speak: prompt, language: fromLanguage)
                
                let choices = jsonResult!["choices"] as! [NSDictionary]
                let correctIndex = jsonResult!["correctIndex"] as! Int
                let response = choices[correctIndex]
                
                List(choices, id: \.self) { choice in
                    let choiceImg = choice["image"] as! String
                    let choiceStr = choice["phrase"] as! String
                    let choiceHint = choice["hint"] as! String
                    
                    VStack {
                        AsyncImage(url: URL(string: choiceImg)!)
                        
                        TextWithTTS(label: choice == response ? "\(choiceStr) ✅" : choiceStr, speak: choiceStr, language: learningLanguage)
                        
                        TextWithTTS(label: choiceHint, speak: choiceHint, language: fromLanguage).italic()
                    }
                }
            case "speak":
                let prompt = jsonResult!["prompt"] as! String
                TextWithTTS(label: "Prompt: \(prompt)", speak: prompt, language: learningLanguage)
                
                let solutionTranslation = jsonResult!["solutionTranslation"] as! String
                TextWithTTS(label: "Solution: \(solutionTranslation)", speak: solutionTranslation, language: fromLanguage)
                
                RecognizeSpeechView(language: learningLanguage)
            case "translate":
                let prompt = jsonResult!["prompt"] as! String
                TextWithTTS(label: "Prompt: \(prompt)", speak: prompt, language: learningLanguage)
                
                let solutions = jsonResult!["correctSolutions"] as! [String]
                let solutionTranslation = solutions[0]
                TextWithTTS(label: "Solution: \(solutionTranslation)", speak: solutionTranslation, language: fromLanguage)
                
                let choices = jsonResult!["choices"] as! [NSDictionary]
                let correctIndices = jsonResult!["correctIndices"] as! [Int]
                
                List(choices, id: \.self) { choice in
                    let index = choices.firstIndex(of: choice)
                    let number = correctIndices.firstIndex(of: index!)
                    let emoji = number != nil ? emojiForNumber(number!) : "❌"
                    let choiceStr = choice["text"] as! String
                    
                    TextWithTTS(label: "\(choiceStr) \(emoji)", speak: choiceStr, language: fromLanguage)
                }
            default:
                Text(challenge.rawData)
            }
        }.navigationTitle(challenge.type)
    }
}

struct ContentView: View {
    let courses: Array<Course>
    @Binding var sessionAttempts: Array<SessionAttempt>
    let questionTypesMap: [String: Array<Challenge>]
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    @State var state: Int = 0
    
    var body: some View {
        NavigationView {
            List(courses) { course in
                let fromLanguageName = getLanguageName(identifier: course.fromLanguage)
                let learningLanguageName = getLanguageName(identifier: course.learningLanguage)
                
                NavigationLink(destination: CourseView(course: course, viewSession: viewSession)) {
                    Text(fromLanguageName + " -> " + learningLanguageName)
                }
            }
        }
        .navigationTitle("Courses")
        
        NavigationView {
            List(questionTypesMap.keys.sorted(), id: \.self) { key in
                if let value = questionTypesMap[key], let someChallenge = value.randomElement() {
                    NavigationLink(destination: ChallengeView(fromLanguage: "pt", learningLanguage: "fr", challenge: someChallenge)) {
                        Text("\(key): \(value.count)")
                    }.onAppear {
                        state += 1
                    }
                } else {
                    Text("\(key): 0")
                }
                
            }
        }
        
        //        List(sessionAttempts) { item in
        //            Text(item.sessionId)
        //        }
    }
}

struct LevelView: View {
    let course: Course
    let section: Section
    let unit: Unit
    let level: Level
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    @State private var isExpanded = false
    
    var body: some View {
        DisclosureGroup(level.name, isExpanded: $isExpanded) {
            ForEach(level.sessions) { session in
                Text(session.id + " - " + session.type)
                    .onTapGesture {
                        viewSession(course, section, unit, level, session)
                    }
            }
        }
    }
}

struct LevelListView: View {
    let course: Course
    let section: Section
    let unit: Unit
    let levels: Array<Level>
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    var body: some View {
        List(levels) { level in
            LevelView(
                course: course,
                section: section,
                unit: unit,
                level: level,
                viewSession: viewSession
            )
        }
    }
}

struct UnitView: View {
    let course: Course
    let section: Section
    let unit: Unit
    @State var sheetOpened: Bool = false
    
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    var body: some View {
        Text(unit.name).onTapGesture {
            sheetOpened = true
        }
        .sheet(isPresented: $sheetOpened) {
            LevelListView(
                course: course,
                section: section,
                unit: unit,
                levels: unit.levels,
                viewSession: viewSession
            )
            
            Button {
                sheetOpened = false
            } label: {
                Text("X")
            }
        }
    }
}

struct UnitListView: View {
    let course: Course
    let section: Section
    let units: Array<Unit>
    @State var selectedUnit: Unit?
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    var body: some View {
        ForEach(units) { unit in
            UnitView(course: course, section: section, unit: unit, viewSession: viewSession)
        }
    }
}

struct SessionListItemView: View {
    let course: Course
    let section: Section
    @State private var isExpanded = false
    
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    var body: some View {
        let firstUnitName = section.units.isEmpty ? "?" : section.units.first!.name
        let title = firstUnitName.isEmpty ? "?" : firstUnitName
        
        DisclosureGroup(title, isExpanded: $isExpanded) {
            UnitListView(course: course, section: section, units: section.units, viewSession: viewSession)
        }
    }
}

struct CourseView: View {
    let course: Course
    @State var selectedSection: Section? = nil
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    var body: some View {
        List(course.sections) { section in
            SessionListItemView(course: course, section: section, viewSession: viewSession)
        }
        .navigationTitle(course.id)
    }
}

//#Preview {
//    ContentView(courses: [], sessionAttempts: []) {
//        print("called it")
//    }
//}
