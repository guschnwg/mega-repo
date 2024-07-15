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
    private var source = Source.remote;

    private let localURL  = UserDefaults.standard.string(forKey: "local_url") ?? "http://192.168.0.35:9997"
    private let remoteURL = UserDefaults.standard.string(forKey: "remote_url") ?? "http://192.168.0.35:9997"

    private let headers = [
        UserDefaults.standard.string(forKey: "header_one") ?? "Key-One: Value",
        UserDefaults.standard.string(forKey: "header_two") ?? "Key-Two: Value"
    ]
    
    @Published var turning = false

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
    
    func turnRight() {
        turning = true
        let task = URLSession.shared.dataTask(with: getRequest("/turn?x=1&y=0&timeout=1&wait=0")) { _, _, _ in
            self.turning = false
        }
        task.resume()
    }
    
    func turnLeft() {
        turning = true
        let task = URLSession.shared.dataTask(with: getRequest("/turn?x=-1&y=0&timeout=1&wait=0")) { _, _, _ in
            self.turning = false
        }
        task.resume()
    }
}
