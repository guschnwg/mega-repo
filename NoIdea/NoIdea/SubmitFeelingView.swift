//
//  SubmitFeelingView.swift
//  NoIdea
//
//  Created by Giovanna Zanardini on 08/12/22.
//

import AVFoundation
import Speech
import SwiftUI

func getDocumentsDirectory() -> URL {
    return FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
}

struct SubmitFeelingView: View {
    var emoji: String

    let filename = getDocumentsDirectory().appendingPathComponent("recording.m4a")
    @State var recorder: AVAudioRecorder!
    @State var player: AVAudioPlayer!

    @State var recognizer: SFSpeechRecognizer!
    @State var spokenText: String!

    @State var recording: Bool = false

    var body: some View {
        VStack {
            Spacer()

            Text("So...").font(.system(size: 24))
            Text("You are feeling like...").font(.system(size: 24))

            Spacer()

            Text(emoji)
                .font(.system(size: UIScreen.main.bounds.width / 3))

            Spacer()

            Text(spokenText ?? "Mind elaborating?").font(.system(size: 24))

            Spacer()

            HStack {
                if !recording {
                    if spokenText == nil {
                        Button("Record") {
                            recording = true
                            recorder.record()
                        }
                        
                        Button("Save as is") {
                            
                        }
                    } else {
                        Button("Listen") {
                            player = try! AVAudioPlayer(contentsOf: filename)
                            player.play()
                        }

                        Button("Restart recording") {
                            recording = true
                            recorder.record()
                        }
                    }
                }
                else {
                    Button("Stop and transcript") {
                        recording = false
                        recorder.stop()

                        let request = SFSpeechURLRecognitionRequest(url: filename)
                        request.shouldReportPartialResults = true

                        if (recognizer?.isAvailable)! {
                            recognizer?.recognitionTask(with: request) { result, error in
                                guard error == nil else { print("Error: \(error!)"); return }
                                guard let result = result else { print("No result!"); return }

                                spokenText = result.bestTranscription.formattedString
                            }
                        } else {
                            print("Device doesn't support speech recognition")
                        }
                    }
                }
            }
            Spacer()
        }.onAppear {
            recorder = try! AVAudioRecorder(url: filename, settings: [:])
            recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))

            SFSpeechRecognizer.requestAuthorization {_ in}
        }
    }
}

struct SubmitFeelingView_Previews: PreviewProvider {
    static var previews: some View {
        SubmitFeelingView(emoji: EMOJIS[0])
    }
}
