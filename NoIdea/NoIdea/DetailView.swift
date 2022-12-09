//
//  DetailView.swift
//  NoIdea
//
//  Created by Giovanna Zanardini on 29/10/22.
//

import SwiftUI

struct DetailView: View {
    let prop: Lalala
    
    @State private var presentAlert = false
    @State private var presentAlertWith = ""

    var body: some View {
        VStack {
            Text("Ola ola ola")
            
            Text(prop.title)
            
            List {
                Section(header: Text("Meeting Info")) {
                    Button("Do it") {
                        presentAlert = true
                        presentAlertWith = "It"
                    }
                    Button("Do that") {
                        presentAlert = true
                        presentAlertWith = "It"
                    }
                }
            }
            
            
        }.alert(isPresented: $presentAlert) {
            Alert(
                title: Text(presentAlertWith)
            )
        }
    }
}

struct DetailView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            DetailView(prop: Lalala(title: "Hey"))
        }
    }
}
