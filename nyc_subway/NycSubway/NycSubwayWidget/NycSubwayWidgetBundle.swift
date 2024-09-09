//
//  NycSubwayWidgetBundle.swift
//  NycSubwayWidget
//
//  Created by Giovanna Zanardini on 07/09/24.
//

import WidgetKit
import SwiftUI

@main
struct NycSubwayWidgetBundle: WidgetBundle {
    var body: some Widget {
        NycSubwayWidget()
        NycSubwayWidgetLiveActivity()
    }
}
