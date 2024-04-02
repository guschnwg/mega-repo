//
//  Utils.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 01/04/24.
//

import Foundation

func listCourses() -> Array<Course> {
    guard let bundlePath = Bundle.main.resourcePath else {
        print("Unable to locate the app bundle.")
        return []
    }
    
    do {
        let fileManager = FileManager.default
        let contents = try fileManager.contentsOfDirectory(atPath: bundlePath + "/Data/Courses")
        let filtered = contents.filter { $0.hasSuffix(".json") }
        
        var courses: Array<NSDictionary> = []
        for file in filtered {
            let path = "/Data/Courses/" + file
            let filePath = Bundle.main.path(forResource: path, ofType: nil)
            do {
                let data = try Data(contentsOf: URL(fileURLWithPath: filePath!))
                let jsonResult = try JSONSerialization.jsonObject(with: data, options: .mutableLeaves)
                courses.append(jsonResult as! NSDictionary)
            }
        }
        
        let jsonData = try JSONSerialization.data(withJSONObject: courses, options: [])
        let data = try JSONDecoder().decode(Array<Course>.self, from: jsonData)
        return data
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
