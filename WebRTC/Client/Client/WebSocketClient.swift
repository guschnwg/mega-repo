//
//  WebSocketClient.swift
//  Client
//
//  Created by Giovanna Zanardini on 13/09/24.
//

import Foundation
import WebRTC

class WebSocketClient: NSObject {
    var webSocketTask = URLSession.shared.webSocketTask(with: URL(string: "ws://localhost:8080/ws")!)
    
    weak var delegate: WebSocketClientDelegate?
    
    override init() {
        super.init()
        
        receiveMessage()
        webSocketTask.resume()
    }
    
    private func handleMessage(text: String) {
        do {
            let data = try JSONSerialization.jsonObject(with: text.data(using: .utf8)!, options: []) as? [String: Any]
            let type = data!["type"] as! String
            
            print("Received type \(type)")
            
            if type == "welcome" {
                print(data!["id"]!)
            } else if type == "refresh" {
                print(data!["clients"]!)
            } else if type == "offer" {
                let from = data!["from"]! as! String
                let offer = data!["offer"] as? [String: String]
                
                print(from)
                print(offer!["sdp"]!)
                
                delegate?.onOffer(from: from, offer: offer!["sdp"]!)
            } else if type == "candidate" {
                let from = data!["from"]! as! String
                let candidate = data!["candidate"] as! [String: Any]
                
                delegate?.onCandidate(
                    from: from,
                    candidate: RTCIceCandidate(
                        sdp: candidate["candidate"] as! String,
                        sdpMLineIndex: Int32(candidate["sdpMid"] as! String)!,
                        sdpMid: candidate["sdpMid"] as! String?
                    )
                )
            }
        } catch {
            print("Error \(error)")
        }
    }
    
    private func receiveMessage() {
        webSocketTask.receive { result in
            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    self.handleMessage(text: text)
                case .data(_):
                    print("data")
                @unknown default:
                    print("Unknown")
                }
            case .failure(let error):
                print("Error receiving message: \(error)")
                return
            }
            
            self.receiveMessage()
        }
    }
    
    private func sendMessage(to: String, type: String, data: Any) {
        do {
            let json = ["type": type, "to": to, type: data] as [String : Any]
            let jsonData = try JSONSerialization.data(withJSONObject: json)
            if let jsonString = String(data: jsonData, encoding: .utf8) {
                webSocketTask.send(
                    URLSessionWebSocketTask.Message.string(jsonString),
                    completionHandler: {_ in}
                )
            }
        } catch {
            print(error)
        }
    }
    
    func sendAnswer(_ to: String, _ answer: [String: String]) {
        sendMessage(to: to, type: "answer", data: answer)
    }
    
    func sendCandidate(_ to: String, _ candidate: [String: Any]) {
        sendMessage(to: to, type: "candidate", data: candidate)
    }
}

protocol WebSocketClientDelegate: AnyObject {
    func onOffer(from: String, offer: String)
    func onCandidate(from: String, candidate: RTCIceCandidate)
}
