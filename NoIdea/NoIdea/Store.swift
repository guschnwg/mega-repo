import Foundation
import OSLog
import SwiftUI

var EMOJIS = [ "😀", "🙂", "🙃", "🥰", "🤨", "😔", "☹️", "😕", "😠", "😭", "😢", "😶", "🤔", "😑", "🙄", "😐"]

struct StoreData: Codable {
    let emojis: [String]
    let feelings: [Feeling]

    init(emojis: [String] = EMOJIS, feelings: [Feeling] = []) {
        self.emojis = emojis
        self.feelings = feelings
    }
}

class Store: ObservableObject {
    @Published var feelings: [Feeling] = []
    @Published var data: StoreData = StoreData()

    private static func fileURL() throws -> URL {
        try FileManager.default.url(for: .documentDirectory,
                                       in: .userDomainMask,
                                       appropriateFor: nil,
                                       create: false)
            .appendingPathComponent("store.data")
    }

    static func load(completion: @escaping (Result<StoreData, Error>)->Void, autoCreate: Bool = true) {
        DispatchQueue.global(qos: .background).async {
            do {
                let fileURL = try fileURL()
                guard let file = try? FileHandle(forReadingFrom: fileURL) else {
                    if autoCreate {
                        Store.save(data: StoreData()) {_ in
                            Store.load(completion: completion, autoCreate: false)
                        }
                        return
                    }
                    DispatchQueue.main.async {
                        completion(.success(StoreData()))
                    }
                    return
                }
                let data = try JSONDecoder().decode(StoreData.self, from: file.availableData)
                DispatchQueue.main.async {
                    completion(.success(data))
                }
            } catch {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
            }
        }
    }

    static func save(data: StoreData, completion: @escaping (Result<Int, Error>)->Void) {
        DispatchQueue.global(qos: .background).async {
            do {
                let data = try JSONEncoder().encode(data)
                let outfile = try fileURL()
                try data.write(to: outfile)
                DispatchQueue.main.async {
                    completion(.success(0))
                }
            } catch {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
            }
        }
    }
}

