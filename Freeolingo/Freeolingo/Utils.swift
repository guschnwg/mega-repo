//
//  Utils.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 01/04/24.
//

import Foundation
import SwiftUI

func listCourses() -> Array<Course> {
    guard let bundlePath = Bundle.main.resourcePath else {
        print("Unable to locate the app bundle.")
        return []
    }
    
    do {
        let fileManager = FileManager.default
        let contents = try fileManager.contentsOfDirectory(atPath: bundlePath + "/Data/Courses")
        let filtered = contents.filter { $0.hasSuffix(".json") }
        
        var courses: Array<Course> = []
        for file in filtered {
            let path = "/Data/Courses/" + file
            let filePath = Bundle.main.path(forResource: path, ofType: nil)
            do {
                let data = try Data(contentsOf: URL(fileURLWithPath: filePath!))
                let course = try JSONDecoder().decode(Course.self, from: data)
                courses.append(course)
            } catch {
                print("Some error")
            }
        }

        return courses
    } catch {
        return []
    }
}

func listFoldersInBundle() -> Array<(String, Bool)> {
    guard let bundlePath = Bundle.main.resourcePath else {
        print("Unable to locate the app bundle.")
        return []
    }
    
    var files: Array<(String, Bool)> = []
    
    do {
        let fileManager = FileManager.default
        let contents = try fileManager.contentsOfDirectory(atPath: bundlePath + "/Data/Courses")
        
        for item in contents {
            var isDirectory: ObjCBool = false
            guard fileManager.fileExists(atPath: bundlePath + "/" + item, isDirectory: &isDirectory), isDirectory.boolValue else {
                files.append((item, true))
                continue
            }
            files.append((item, false))
        }
    } catch {
        print("Error: \(error)")
    }
    
    return files
}

func getLanguageName(identifier: String) -> String {
    return Locale.current.localizedString(forIdentifier: identifier) ?? identifier
}

extension View {
    @ViewBuilder func `if`<Content: View>(_ condition: Bool, transform: (Self) -> Content) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }
}

extension View {
    func apply<V: View>(@ViewBuilder _ block: (Self) -> V) -> V { block(self) }
}

public extension UIColor {
    func mix(with target: UIColor, amount: CGFloat) -> Self {
        var r1: CGFloat = 0, g1: CGFloat = 0, b1: CGFloat = 0, a1: CGFloat = 0
        var r2: CGFloat = 0, g2: CGFloat = 0, b2: CGFloat = 0, a2: CGFloat = 0

        #if !canImport(UIKit)
        let `self` = usingColorSpace(.sRGB)!
        let target = target.usingColorSpace(.sRGB)!
        #endif

        self.getRed(&r1, green: &g1, blue: &b1, alpha: &a1)
        target.getRed(&r2, green: &g2, blue: &b2, alpha: &a2)

        return Self(
            red: r1 * (1.0 - amount) + r2 * amount,
            green: g1 * (1.0 - amount) + g2 * amount,
            blue: b1 * (1.0 - amount) + b2 * amount,
            alpha: a1
        )
    }

    func lighter(by amount: CGFloat = 0.2) -> Self { mix(with: .white, amount: amount) }
    func darker(by amount: CGFloat = 0.2) -> Self { mix(with: .black, amount: amount) }
}

extension Color {
    public func lighter(by amount: CGFloat = 0.2) -> Self { Self(UIColor(self).lighter(by: amount)) }
    public func darker(by amount: CGFloat = 0.2) -> Self { Self(UIColor(self).darker(by: amount)) }
}
