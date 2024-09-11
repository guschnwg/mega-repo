//
//  CanvasView.swift
//  NycSubway
//
//  Created by Giovanna Zanardini on 07/09/24.
//

import Foundation
import SwiftUI

func getCanvas(
    first: SubwayInfo,
    second: SubwayInfo,
    secondIndex: Int,
    hideSecond: Bool,
    rows: Int = ROWS,
    cols: Int = COLS
) -> [[Color]] {
    var canvas = (0..<rows).map { _ in (0..<cols).map { _ in Color.black}}

    let firstTimeStr = first.timeLeft >= 0 ? "\(first.timeLeft)min" : "delay"
    text(canvas: &canvas, x: 1, y: 2, text: "1.", color: .white, from: CHARACTERS)
    circle(canvas: &canvas, x: 13, y: 1, char: first.routeId, color: LINE_COLOR_MAP[first.routeId]!, charColor: .white)
    text(canvas: &canvas, x: 30, y: 2, text: first.goingToName, color: .white, from: CHARACTERS, cropAfter: cols - 45)
    rightAlignText(canvas: &canvas, x: cols - 1, y: 2, text: firstTimeStr, color: .white, from: CHARACTERS)
    
    if !hideSecond {
        let secondTimeStr = second.timeLeft >= 0 ? "\(second.timeLeft)min" : "delay"
        text(canvas: &canvas, x: 1, y: 19, text: "\(secondIndex + 1).", color: .white, from: CHARACTERS)
        circle(canvas: &canvas, x: 13, y: 18, char: second.routeId, color: LINE_COLOR_MAP[second.routeId]!, charColor: .white)
        text(canvas: &canvas, x: 30, y: 19, text: second.goingToName, color: .white, from: CHARACTERS, cropAfter: cols - 45)
        rightAlignText(canvas: &canvas, x: cols - 1, y: 19, text: secondTimeStr, color: .white, from: CHARACTERS)
    }
    
    return canvas
}

func getStationName(stations: [Station], id: String) -> String {
    return stations.first { id.contains($0.id) }?.name ?? "Unknown"
}

struct CanvasView: View {
    var subway: [SubwayInfo]
    var rows: Int = ROWS
    var cols: Int = COLS
    var secondIndex: Int = 0

    @State private var hideSecond: Bool = false
    
    var body: some View {
        let pixelSize = CGSize(width: 0.5, height: 0.5)
        let pixelSpacing = 3.0

        Canvas { context, size in
            if subway.isEmpty {
                return
            }
            
            let canvas = getCanvas(
                first: subway[0],
                second: subway[secondIndex + 1],
                secondIndex: secondIndex + 1,
                hideSecond: hideSecond,
                cols: cols
            )
            
            for i in 0..<rows {
                for j in 0..<cols {
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
        .frame(
            width: CGFloat(cols) * pixelSize.height * pixelSpacing,
            height: CGFloat(rows) * pixelSize.width * pixelSpacing
        )
        .background(.black)
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
