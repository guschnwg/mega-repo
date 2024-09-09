//
//  NycSubwayWidgetLiveActivity.swift
//  NycSubwayWidget
//
//  Created by Giovanna Zanardini on 07/09/24.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct NycSubwayWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: NycSubwayWidgetAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                CanvasView(realtime: [], stations: [])
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)
            
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom")
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T")
            } minimal: {
                Text("???")
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

#Preview("Notification",
         as: .content,
         using: NycSubwayWidgetAttributes(info: [])) {
    NycSubwayWidgetLiveActivity()
} contentStates: {
    NycSubwayWidgetAttributes.ContentState()
    NycSubwayWidgetAttributes.ContentState()
}
