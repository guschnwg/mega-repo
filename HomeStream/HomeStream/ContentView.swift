//
//  ContentView.swift
//  HomeStream
//
//  Created by Giovanna Zanardini on 14/07/24.
//

import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    @EnvironmentObject var api: Api
    
    let webView: WKWebView
    
    init() {
        webView = WKWebView(frame: .zero)
        webView.scrollView.isScrollEnabled = false
    }
    
    func makeUIView(context: Context) -> WKWebView {
        return webView
    }
    func updateUIView(_ uiView: WKWebView, context: Context) {
        webView.load(api.getRequest("/my_camera"))
    }
}

struct ContentView: View {
    @EnvironmentObject var api: Api

    var body: some View {
        VStack {
            HStack {
                Button("Em casa?") {}
                Button("Na rua?") {}
                
                Spacer()
            }
            .padding()

            HStack(spacing: 30) {
                Button(action: api.turnLeft) {
                    Image(systemName: "arrowshape.left")
                        .font(.system(size: 36))
                }
                .disabled(api.turning)
                
                WebView()
//                GeometryReader { geo in
//                    WebView()
//                        .frame(maxWidth: geo.size.width - 100)
//                }
                
                Button(action: api.turnRight) {
                    Image(systemName: "arrowshape.right")
                        .font(.system(size: 36))
                }
                .disabled(api.turning)
            }
        }.padding()
    }
}

#Preview {
    ContentView()
        .environmentObject(Api())
}
