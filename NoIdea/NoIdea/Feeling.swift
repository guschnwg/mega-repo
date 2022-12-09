import Foundation

struct Feeling: Identifiable, Codable {
    let id: UUID
    let date: Date
    let emoji: String

    init(id: UUID = UUID(), date: Date = Date(), emoji: String) {
        self.id = id
        self.date = date
        self.emoji = emoji
    }
}
