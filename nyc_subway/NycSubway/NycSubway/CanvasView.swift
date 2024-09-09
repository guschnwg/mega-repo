//
//  CanvasView.swift
//  NycSubway
//
//  Created by Giovanna Zanardini on 07/09/24.
//

import Foundation
import SwiftUI

func getCanvas(realtime: [Info], stations: [Station], secondIndex: Int, hideSecond: Bool) -> [[Color]] {
    var canvas = (0..<ROWS).map { _ in (0..<COLS).map { _ in Color.black}}
    
    if realtime.isEmpty {
        return canvas
    }
    
    let first = realtime[0]
    //    let firstLeftFromName = stations.first { first.leftFrom.contains($0.id) }?.name ?? "Unknown"
    let firstGoingToName = stations.first { first.goingTo.contains($0.id) }?.name ?? "Unknown"
    let firstTimeStr = first.timeLeft >= 0 ? "\(first.timeLeft)min" : "delay"
    text(canvas: &canvas, x: 1, y: 2, text: "1.", color: .white, from: CHARACTERS)
    circle(canvas: &canvas, x: 13, y: 1, char: first.routeId, color: LINE_COLOR_MAP[first.routeId]!, charColor: .white)
    text(canvas: &canvas, x: 30, y: 2, text: firstGoingToName, color: .white, from: CHARACTERS, cropAfter: COLS - 45)
    rightAlignText(canvas: &canvas, x: COLS - 1, y: 2, text: firstTimeStr, color: .white, from: CHARACTERS)
    
    if !hideSecond {
        let second = realtime[secondIndex]
        //    let secondLeftFromName = stations.first { second.leftFrom.contains($0.id) }?.name ?? "Unknown"
        let secondGoingToName = stations.first { second.goingTo.contains($0.id) }?.name ?? "Unknown"
        let secondTimeStr = second.timeLeft >= 0 ? "\(second.timeLeft)min" : "delay"
        text(canvas: &canvas, x: 1, y: 19, text: "\(secondIndex + 1).", color: .white, from: CHARACTERS)
        circle(canvas: &canvas, x: 13, y: 18, char: second.routeId, color: LINE_COLOR_MAP[second.routeId]!, charColor: .white)
        text(canvas: &canvas, x: 30, y: 19, text: secondGoingToName, color: .white, from: CHARACTERS, cropAfter: COLS - 45)
        rightAlignText(canvas: &canvas, x: COLS - 1, y: 19, text: secondTimeStr, color: .white, from: CHARACTERS)
    }
    
    return canvas
}

struct CanvasView: View {
    var realtime: [Info]
    var stations: [Station]
    
    @State private var secondIndex: Int = 0
    @State private var hideSecond: Bool = false
    
    var body: some View {
        Canvas { context, size in
            let pixelSize = CGSize(width: 0.5, height: 0.5)
            let pixelSpacing = 3.0
            
            let canvas = getCanvas(
                realtime: realtime,
                stations: stations,
                secondIndex: secondIndex + 1,
                hideSecond: hideSecond
            )
            
            for i in 0..<ROWS {
                for j in 0..<COLS {
                    let point = CGPoint(
                        x: CGFloat(j) * pixelSize.width * pixelSpacing,
                        y: CGFloat(i) * pixelSize.height * pixelSpacing
                    )
                    context.stroke(
                        Path(ellipseIn: CGRect(origin: point, size: pixelSize)),
                        with: .color(canvas[i][j]),
                        style: StrokeStyle(lineWidth: 0.5, lineCap: .round, lineJoin: .round)
                    )
                }
            }
        }
        .background(.black)
        //
        .onReceive(Timer.publish(every: 10, on: .main, in: .common).autoconnect()) { time in
            if !realtime.isEmpty {
                secondIndex = (secondIndex + 1) % min(realtime.count, 5)
            }
        }
        .onChange(of: secondIndex) {
            hideSecond = true
        }
        .onChange(of: hideSecond) {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                hideSecond = false
            }
        }
    }
}
