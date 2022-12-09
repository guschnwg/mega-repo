//
//  EmojiPickerController.swift
//  NoIdea
//
//  Created by Giovanna Zanardini on 08/12/22.
//

import SwiftUI

class EmojiPickerController: UIViewController {
    @Published private(set) var emoji: String!

    private lazy var emojiButton: UIButton = {
        let button = UIButton()
        button.setTitle("+ Add more", for: .normal)
        button.setTitleColor(.red, for: .normal)
        button.frame = CGRect(x: 20, y: 20, width: 100, height: 50)
        button.addTarget(self, action: #selector(openEmojiPickerModule), for: .touchUpInside)
        button.translatesAutoresizingMaskIntoConstraints = false
        return button
    }()

    override func viewDidLoad() {
        super.viewDidLoad()

        view.backgroundColor = .white
        view.addSubview(emojiButton)
    }

    @objc private func openEmojiPickerModule(sender: UIButton) {
        let configuration = EmojiPicker.Configuration(sourceViewController: self, sender: sender, arrowDirection: .down)
        EmojiPicker.present(with: configuration)
    }
}

extension EmojiPickerController: EmojiPickerDelegate {
    func didGetEmoji(emoji: String) {
        emojiButton.setTitle(emoji, for: .normal)
        self.emoji = emoji
    }
}
