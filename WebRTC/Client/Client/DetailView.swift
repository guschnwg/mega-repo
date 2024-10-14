//
//  DetailView.swift
//  Client
//
//  Created by Giovanna Zanardini on 03/10/24.
//

import SwiftUI
import WebRTC

struct DetailView: View {
    @ObservedObject var client: WSClient
    var selectedSideBarItem: String
    
    @State private var isGranted: Bool = false
    
    @State private var showingAlert = false
    @State private var password = ""
    
    var body: some View {
        VStack {
            if isGranted {
                if client.wsClient.clients.isEmpty {
                    Text("There is no one to chat with")
                } else {
                    if selectedSideBarItem == "" {
                        Text("Choose someone to chat with")
                    } else {
                        if let client = client.rtcClient.clientsMap[selectedSideBarItem] {
                            Text("Chatting with \(client.id)")
                        } else {
                            Button("Chat") {
                                showingAlert.toggle()
                            }
                            .alert("Enter password", isPresented: $showingAlert) {
                                TextField("123456", text: $password)
                                Button("OK") {
                                    client.sendOffer(to: selectedSideBarItem, password: password)
                                }
                            } message: {
                                Text(":)")
                            }
                        }
                    }
                }
                
                // This is to not have the blinking effect
                ForEach(client.rtcClient.clientsMap.keys.sorted(), id: \.self) {
                    let item = client.rtcClient.clientsMap[$0]!
                    
                    if selectedSideBarItem == $0 {
                        if item.peerConnection.connectionState == .connected && item.dataChannel.readyState == .open {
                            CommunicateView(item: item) {
                                client.rtcClient.sendData(to: selectedSideBarItem, $0)
                            }
                        } else if item.peerConnection.signalingState == .haveRemoteOffer {
                            Button("Accept call? \(item.password)") {
                                client.sendAnswer(to: item.id)
                            }
                        } else {
                            Text("Connecting...?")
                        }
                    }
                }
            } else {
                Text("Camera access not granted")
            }
        }.onAppear {
            AVCaptureDevice.requestAccess(for: .video) { granted in
                if granted {
                    self.isGranted = true
                }
            }
        }
    }
}
