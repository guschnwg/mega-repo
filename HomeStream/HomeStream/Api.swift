//
//  Api.swift
//  HomeStream
//
//  Created by Giovanna Zanardini on 14/07/24.
//

import Foundation

enum Source {
    case local
    case remote
}

class Api: ObservableObject {
    @Published private var source = Source.remote;
    var isLocal: Bool { source == .local }
    var isRemote: Bool { source == .remote }

    private let localURL  = UserDefaults.standard.string(forKey: "local_url") ?? "http://192.168.0.35:9997"
    private let remoteURL = UserDefaults.standard.string(forKey: "remote_url") ?? "http://192.168.0.35:9997"

    private let headers = [
        UserDefaults.standard.string(forKey: "header_one") ?? "Header-One: Value",
        UserDefaults.standard.string(forKey: "header_two") ?? "Header-Two: Value"
    ]
    
    @Published var isTurning = false
    @Published var isResetting = false
    var isDoingSomething: Bool { isTurning || isResetting }

    func getRequest(_ path: String = "") -> URLRequest {
        let stringURL = source == .local ? localURL : remoteURL
        let url = URL(string: stringURL + path)!

        var request = URLRequest(url: url)
        for header in headers {
            let components = header.components(separatedBy: ":")
            if components.count == 2 {
                let key = components[0].trimmingCharacters(in: .whitespacesAndNewlines)
                let value = components[1].trimmingCharacters(in: .whitespacesAndNewlines)
                request.setValue(value, forHTTPHeaderField: key)
            }
        }
        
        return request
    }
    
    func setSource(_ newSource: Source) {
        source = newSource
    }
    
    func turn(x: Double) async {
        Task {
            let url = "/turn?x=\(x)&y=0&timeout=2"
            _ = try await URLSession.shared.data(for: getRequest(url))
        }
    }
    
    func turnRight() {
        Task {
            await turn(x: 0.2)
        }
    }
    
    func turnLeft() {
        Task {
            await turn(x: -0.2)
        }
    }
    
    func stop() {
        Task {
            _ = try await URLSession.shared.data(for: getRequest("/stop"))
        }
    }
    
    func reset() async {
        Task {
            _ = try await URLSession.shared.data(for: getRequest("/reset"))
        }
    }
}
