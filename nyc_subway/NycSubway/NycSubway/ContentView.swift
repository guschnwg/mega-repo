//
//  ContentView.swift
//  NycSubway
//
//  Created by Giovanna Zanardini on 18/07/24.
//

import SwiftUI
import SwiftData
import ActivityKit

struct ContentView: View {
    var realtime: [Info]
    var stations: [Station]
    
    var body: some View {
        VStack {
            Button {
                do {
                    let widgetAttributes = NycSubwayWidgetAttributes(info: [])
                    let initialState = NycSubwayWidgetAttributes.ContentState()
                    
                    let activity = try Activity.request(
                        attributes: widgetAttributes,
                        content: .init(state: initialState, staleDate: nil),
                        pushType: .token
                    )
                } catch {
                    print(error)
                }
            } label: {
                Text("Open activity")
            }
            
            CanvasView(realtime: realtime, stations: stations)
        }
    }
}

#Preview {
    ContentView(realtime: [], stations: [])
}
