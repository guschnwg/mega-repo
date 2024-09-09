//
//  NycSubwayWidgetAttributes.swift
//  NycSubway
//
//  Created by Giovanna Zanardini on 07/09/24.
//

import ActivityKit
import Foundation

struct NycSubwayWidgetAttributes : ActivityAttributes {
    struct ContentState: Codable & Hashable {
    }
    
    var info: [SubwayInfo]
}
