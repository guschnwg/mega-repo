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
    
    @State private var secondIndex = 0
    
    var body: some View {
        VStack {
            Button("Open activity") {
                do {
                    let widgetAttributes = NycSubwayWidgetAttributes(
                        info: realtime.prefix(6).map { $0.toSubwayInfo(stations: stations) }
                    )
                    let initialState = NycSubwayWidgetAttributes.ContentState()
                    
                    let _ = try Activity.request(
                        attributes: widgetAttributes,
                        content: .init(state: initialState, staleDate: nil),
                        pushType: .token
                    )
                } catch {
                    print(error)
                }
            }
            
            CanvasView(
                subway: realtime.prefix(6).map { $0.toSubwayInfo(stations: stations) },
                secondIndex: secondIndex
            )
        }
        .onReceive(Timer.publish(every: 2, on: .main, in: .common).autoconnect()) { time in
            if !realtime.isEmpty {
                secondIndex = (secondIndex + 1) % min(realtime.count, 5)

                for activity in Activity<NycSubwayWidgetAttributes>.activities {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                        Task {
                            let updatedState = NycSubwayWidgetAttributes.ContentState(secondIndex: secondIndex)
                            await activity.update(ActivityContent(state: updatedState, staleDate: nil))
                        }
                    }
                }
            }
        }
    }
}

#Preview {
    ContentView(realtime: [], stations: [])
}
