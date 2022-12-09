//
//  EmojiPickerView.swift
//  NoIdea
//
//  Created by Giovanna Zanardini on 08/12/22.
//

import SwiftUI

struct EmojiPickerView: UIViewControllerRepresentable {
    let content: UIViewController
    
    init(_ content: UIViewController) {
        self.content = content
    }
        
    func makeUIViewController(context: Context) -> UIViewController {
        let size = content.view.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize)
        content.preferredContentSize = size
        return content
    }
    
    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
    }
}

struct EmojiPickerView_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 0) {
            EmojiPickerView(EmojiPickerController())
                .fixedSize()
        }
    }
}
