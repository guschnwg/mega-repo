//
//  Models.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 01/04/24.
//

import Foundation

struct Challenge: Codable, Identifiable {
    let id: String
    let type: String
}

struct Session: Codable, Identifiable {
    let id: String
    let type: String
    
    let challenges: Array<Challenge>
}

struct Level: Codable, Identifiable {
    let id: String
    let name: String
    
    let sessions: Array<Session>
}

struct Unit: Codable, Identifiable {
    let id: Int
    let name: String
    
    let levels: Array<Level>
}

struct Section: Codable, Identifiable {
    let id: Int
    let name: String
    let units: Array<Unit>
}

struct Course: Codable, Identifiable {
    let id: String
    let fromLanguage: String
    let learningLanguage: String
    
    let sections: Array<Section>
}

