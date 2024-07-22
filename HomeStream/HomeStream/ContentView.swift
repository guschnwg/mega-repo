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
                Button("Em casa?") { api.setSource(.local) }
                    .padding(.all, 10)
                    .foregroundColor(api.isLocal ? .blue : .white)
                    .background(api.isLocal ? .white : .blue)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .disabled(api.isLocal)
                
                Spacer()
                
                Button("Resetar") { Task { await api.reset() } }
                    .padding(.all, 10)
                    .foregroundColor(.red)
                    .background(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .disabled(api.isDoingSomething)
                
                Spacer()
                
                Button("Na rua?") { api.setSource(.remote) }
                    .padding(.all, 10)
                    .foregroundColor(api.isRemote ? .blue : .white)
                    .background(api.isRemote ? .white : .blue)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .disabled(api.isRemote)
            }
            
            HStack {
                VStack(alignment: /*@START_MENU_TOKEN@*/.center/*@END_MENU_TOKEN@*/, spacing: 50) {
                    Button(action: api.turnLeft) {
                        Image(systemName: "arrowshape.left")
                            .font(.system(size: 22))
                            .padding(.all, 20)
                    }
                    .background(.blue)
                    .foregroundColor(.white)
                    .clipShape(Circle())
                    .disabled(api.isDoingSomething)
                    
                    Button(action: api.stop) {
                        Image(systemName: "stop")
                            .font(.system(size: 22))
                            .padding(.all, 10)
                    }
                    .background(.white)
                    .foregroundColor(.red)
                    .clipShape(Circle())
                }
                
                GeometryReader { geo in
                    let height = geo.size.width / 16 * 9
                    WebView()
                        .frame(height: height)
                        .padding(.vertical, (geo.size.height - height) / 2)
                }
                
                VStack(alignment: /*@START_MENU_TOKEN@*/.center/*@END_MENU_TOKEN@*/, spacing: 50) {
                    Button(action: api.turnRight) {
                        Image(systemName: "arrowshape.right")
                            .font(.system(size: 22))
                            .padding(.all, 20)
                    }
                    .background(.blue)
                    .foregroundColor(.white)
                    .clipShape(Circle())
                    .disabled(api.isDoingSomething)
                    
                    Button(action: api.stop) {
                        Image(systemName: "stop")
                            .font(.system(size: 22))
                            .padding(.all, 10)
                    }
                    .background(.white)
                    .foregroundColor(.red)
                    .clipShape(Circle())
                }
            }
        }
        .padding()
        .background(.blue.lighter(by: 0.9))
        .edgesIgnoringSafeArea(.vertical)
    }
}

#Preview {
    ContentView()
        .environmentObject(Api())
}
