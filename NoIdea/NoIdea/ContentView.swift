//
//  ContentView.swift
//  NoIdea
//
//  Created by Giovanna Zanardini on 28/10/22.
//

import SwiftUI

struct ContentView: View {
    var props = [
        Lalala(title: "Oi"),
        Lalala(title: "Oi 2"),
        Lalala(title: "Oi3 ")
    ]

    var body: some View {
        VStack {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundColor(.accentColor)
            Text("Hello, world!")
            Spacer(minLength: 30)
            Button("hey") {}
            
            SharedView(prop: Lalala(title: "v snjkvnsfjkbnkjn"))
            
            List {
                ForEach(props) { prop in
                    NavigationLink(destination: DetailView(prop: prop)) {
                        SharedView(prop: prop)
                            .listRowBackground(Color.red)
                            .padding(.bottom, 30)
                            .padding(Edge.Set.top, 30)
                            .foregroundColor(.white)
                            .preferredColorScheme(.dark)
                    }
                }
            }
            
            ForEach(props) { prop in
                SharedView(prop: prop)
            }
        }
        .padding()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
