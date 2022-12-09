//
//  SharedView.swift
//  NoIdea
//
//  Created by Giovanna Zanardini on 29/10/22.
//

import SwiftUI

struct Lalala: Identifiable {
    var title: String
    var id: String { title }
}

struct SharedView: View {
    let prop: Lalala

    var body: some View {
        Text(prop.title)
    }
}

struct SharedView_Previews: PreviewProvider {
    static var previews: some View {
        SharedView(prop: Lalala(title: "Hey"))
    }
}
