//
//  ViewControllerContainer.swift
//  NoIdea
//
//  Created by Giovanna Zanardini on 08/12/22.
//

import UIKit
import SwiftUI

struct ViewControllerContainer: UIViewControllerRepresentable {
    typealias UIViewControllerType = EmojiPickerController

    func makeUIViewController(context: Context) -> EmojiPickerController {
        let vc = EmojiPickerController()
        // Do some configurations here if needed.
        return vc
    }
    
    func updateUIViewController(_ uiViewController: EmojiPickerController, context: Context) {
        // Updates the state of the specified view controller with new information from SwiftUI.
    }
}


struct ViewControllerContainer_Previews: PreviewProvider {
    static var previews: some View {
        ViewControllerContainer()
    }
}
