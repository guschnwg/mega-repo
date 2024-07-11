//
//  ConfirmButtonView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 01/07/24.
//

import Foundation
import SwiftUI

struct ConfirmButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) var isEnabled
    @Environment(\.backgroundStyle) var backgroundStyle

    @EnvironmentObject var colorWrapper: ColorWrapper

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding()
            .frame(maxWidth: .infinity)
            .background(isEnabled ? colorWrapper.color : colorWrapper.color.opacity(0.5))
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .scaleEffect(configuration.isPressed ? 1.2 : 1)
            .animation(.easeOut(duration: 0.2), value: configuration.isPressed)
    }
}

struct ConfirmButtonView: View {
    let action: () -> Void
    
    @EnvironmentObject var colorWrapper: ColorWrapper
    
    var body: some View {
        Button("Confirm", action: action)
            .frame(maxWidth: .infinity)
            .buttonStyle(ConfirmButtonStyle())
    }
}

#Preview {
    VStack {
        ConfirmButtonView() {}.environmentObject(ColorWrapper(.red))
        
        ConfirmButtonView() {}.environmentObject(ColorWrapper(.blue))
        
        ConfirmButtonView() {}.disabled(true).environmentObject(ColorWrapper(.yellow))
    }
}
