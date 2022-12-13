//
//  EmojiPickerView.swift
//  NoIdea
//
//  Created by Giovanna Zanardini on 12/12/22.
//

import SwiftUI
import Smile

struct EmojiPickerView: View {
    @State private var selected = ""

    var body: some View {
        VStack(spacing: 0) {
            let emojiContainer = UIScreen.main.bounds.size.width / 9
            let emojiSize = emojiContainer * 3/4
            let emojiPadding = emojiContainer * 1/4

            let lazyColumns = (1...9).map { _ in GridItem(.flexible()) }

            ScrollView {
                ForEach(emojis, id: \.key) {category, categoryEmojis in
                    Text(category)

                    LazyVGrid(columns: lazyColumns, spacing: emojiPadding / 2) {
                        ForEach(categoryEmojis, id: \.self) { emoji in
                            Button(emoji) {
                                selected = emoji
                            }.font(.system(size: emojiSize))
                        }
                    }.padding(10)
                }
            }
            
            if selected != "" {
                Button("OK \(selected)") {
                    
                }
            }
        }
    }
}

struct EmojiPickerView_Previews: PreviewProvider {
    static var previews: some View {
        EmojiPickerView()
    }
}
