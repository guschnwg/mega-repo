//
//  CommunicateView.swift
//  Client
//
//  Created by Giovanna Zanardini on 03/10/24.
//

import SwiftUI

import Combine
import UIKit


// Publisher to read keyboard changes.
protocol KeyboardReadable {
    var keyboardPublisher: AnyPublisher<Bool, Never> { get }
}

extension KeyboardReadable {
    var keyboardPublisher: AnyPublisher<Bool, Never> {
        Publishers.Merge(
            NotificationCenter.default
                .publisher(for: UIResponder.keyboardWillShowNotification)
                .map { _ in true },
            
            NotificationCenter.default
                .publisher(for: UIResponder.keyboardWillHideNotification)
                .map { _ in false }
        )
        .eraseToAnyPublisher()
    }
}

struct CommunicateView: View, KeyboardReadable {
    var item: WebRTCUser
    var onNewMessage: (String) -> Void
    
    @State private var messageToSend = ""
    @State private var isKeyboardVisible = false
    
    var body: some View {
        VStack {
            if !item.mediaStreams.isEmpty && !item.mediaStreams[0].videoTracks.isEmpty {
                VideoView(rtcTrack: item.mediaStreams[0].videoTracks[0])
                    .frame(width: 100, height: 100)
            }
            
            List(item.messages, id: \.self.0) { (date, from, content) in
                VStack(alignment: .leading) {
                    Text("\(from) - \(date)").font(.system(size: 8))
                    Text(content)
                }
            }
            
            Spacer()
            
            HStack {
                if isKeyboardVisible {
                    Button("", systemImage: "chevron.down") {
                        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                    }
                }

                TextField("Message", text: $messageToSend)
                    .onSubmit {
                        onNewMessage(messageToSend)
                        messageToSend = ""
                    }
                    .padding(.all, 10)

                Button("", systemImage: "arrow.up.circle.fill") {
                    onNewMessage(messageToSend)
                    messageToSend = ""
                }
            }.onReceive(keyboardPublisher) { newIsKeyboardVisible in
                isKeyboardVisible = newIsKeyboardVisible
            }
        }
    }
}
