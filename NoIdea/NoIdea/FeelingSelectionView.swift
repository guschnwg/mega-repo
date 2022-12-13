//
//  FeelingSelectionView.swift
//  NoIdea
//
//  Created by Giovanna Zanardini on 08/12/22.
//

import OSLog
import SwiftUI

struct FeelingSelectionView: View {
    var data: StoreData

    @State var showNewEmojiPicker: Bool = false

    var body: some View {
        VStack {
            Text("How are you feeling today?")

            Divider()

            GeometryReader { geo in
                let emojiContainer = geo.size.width / 4
                let emojiSize = emojiContainer * 3/4
                let emojiPadding = emojiContainer * 1/4

                let lazyColumns = [
                    GridItem(.flexible(), spacing: emojiPadding / 2),
                    GridItem(.flexible(), spacing: emojiPadding / 2),
                    GridItem(.flexible(), spacing: emojiPadding / 2),
                    GridItem(.flexible(), spacing: emojiPadding / 2)
                ]

                ScrollView {
                    LazyVGrid(columns: lazyColumns, spacing: emojiPadding / 2) {
                        ForEach(data.emojis, id: \.self) { emoji in
                            NavigationLink(destination: SubmitFeelingView(emoji: emoji)) {
                                Text(emoji)
                                    .font(.system(size: emojiSize))
                                    .frame(maxWidth: .infinity)
                            }
                        }
                    }.padding(20)

                    Button("Add new emoji") {
                        showNewEmojiPicker = true
                    }
                    .buttonStyle(.bordered)
                    .popover(isPresented: $showNewEmojiPicker) {
                        EmojiPickerView()
                    }
                }
            }
        }
    }
}

struct FeelingSelectionView_Previews: PreviewProvider {
    static var previews: some View {
        FeelingSelectionView(data: StoreData(emojis: EMOJIS))
    }
}
