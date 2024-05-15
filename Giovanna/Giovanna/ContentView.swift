//
//  ContentView.swift
//  Giovanna
//
//  Created by Giovanna Zanardini on 15/05/24.
//

import SwiftUI
import AVKit
import WebKit


struct WebView: UIViewRepresentable {
 
    let webView: WKWebView
    
    init() {
        webView = WKWebView(frame: .zero)
    }
    
    func makeUIView(context: Context) -> WKWebView {
        return webView
    }
    func updateUIView(_ uiView: WKWebView, context: Context) {
        let streamUrl = Bundle.main.infoDictionary!["STREAM_URL"] as! String
        var request = URLRequest(url: URL(string: streamUrl)!)
        
        let headerOneKey = Bundle.main.infoDictionary!["HEADER_ONE_KEY"] as! String
        let headerOneVal = Bundle.main.infoDictionary!["HEADER_ONE_VAL"] as! String
        request.setValue(headerOneVal, forHTTPHeaderField: headerOneKey)
        
        let headerTwoKey = Bundle.main.infoDictionary!["HEADER_TWO_KEY"] as! String
        let headerTwoVal = Bundle.main.infoDictionary!["HEADER_TWO_VAL"] as! String
        request.setValue(headerTwoVal, forHTTPHeaderField: headerTwoKey)

        webView.load(request)
    }
}

struct ContentView: View {
    var body: some View {
        WebView()
    }
}

#Preview {
    ContentView()
}
