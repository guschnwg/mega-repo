//
//  ContentView.swift
//  Bluetooth
//
//  Created by Giovanna Zanardini on 29/07/23.
//

import SwiftUI
import CoreBluetooth
import CoreBluetooth.CBCharacteristic

class BLEManager: NSObject, ObservableObject, CBCentralManagerDelegate, CBPeripheralDelegate {
    var centralBE: CBCentralManager!
    @Published var peripherals = [CBPeripheral]()
    var toSend = ""
    var isScanning: Bool { centralBE.isScanning }
    @Published var connectedPeripheral: CBPeripheral!
    
    override init() {
        super.init()
        centralBE = CBCentralManager(delegate: self, queue: nil)
        centralBE.delegate = self
    }
    
    func clear() {
        peripherals = [];
    }
    
    func startScanning() {
        print("startScanning")
        centralBE.scanForPeripherals(withServices: nil, options: nil)
    }
    
    func stopScanning() {
        print("stopScanning")
        centralBE.stopScan()
        objectWillChange.send()
    }
    
    
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        print("centralManagerDidUpdateState")
        print(central.state.rawValue)
    }
    
    func centralManager(
        _ central: CBCentralManager,
        didDiscover peripheral: CBPeripheral,
        advertisementData: [String : Any],
        rssi RSSI: NSNumber
    ) {
        if !peripherals.contains(where: { $0.name == peripheral.name }) {
            peripherals.append(peripheral)
        }
    }
    
    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        print("didDisconnectPeripheral")
        connectedPeripheral = nil
    }
    
    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        print("Peripheral Connected")
        connectedPeripheral = peripherals.first(where: { $0.name == peripheral.name })
        centralBE.stopScan()

        // Make sure we get the discovery callbacks
        peripheral.delegate = self
        peripheral.discoverServices([])
    }
    
    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        print("didDiscoverServices")
        if let error = error {
            print("Error discovering services: %s", error.localizedDescription)
            return
        }
        
        guard let peripheralServices = peripheral.services else { return }
        for service in peripheralServices {
            peripheral.discoverCharacteristics([], for: service)
        }
        
        objectWillChange.send()
    }
    
    func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        print("didDiscoverCharacteristicsFor")
        if let error = error {
            print("Error discovering characteristics: %s", error.localizedDescription)
            return
        }

        objectWillChange.send()
    }
}

struct TextToSendView: View {
    @State private var msg = ""
    let action: (_ msg: String) -> Void
    
    var body: some View {
        HStack (spacing: 10) {
            TextField("Message to send", text: $msg)
            Button("Send", action: { action(msg) })
        }
    }
}

struct ContentView: View {
    @ObservedObject var bleManager = BLEManager()
    @State private var showDetailsFor: CBPeripheral!
    @State private var sendMessageTo: CBCharacteristic!
    
    var body: some View {
        VStack (spacing: 30) {
            if (bleManager.connectedPeripheral != nil) {
                VStack (spacing: 20) {
                    Text("Connected to: " + (bleManager.connectedPeripheral.name ?? bleManager.connectedPeripheral.identifier.uuidString))
                    
                    if bleManager.connectedPeripheral.services != nil {
                        List(bleManager.connectedPeripheral.services!, id: \.uuid) { service in
                            Text(service.uuid.description)

                            if service.characteristics != nil {
                                ForEach(service.characteristics!.enumerated().reversed(), id: \.offset) { item in
                                    VStack (alignment: .leading) {
                                        HStack {
                                            Text("> " + item.element.uuid.description)

                                            if (sendMessageTo != item.element && item.element.properties.contains(CBCharacteristicProperties.writeWithoutResponse)) {
                                                Button("Send message", action: { sendMessageTo = item.element })
                                            }
                                        }

                                        if (sendMessageTo == item.element) {
                                            TextToSendView(action: { msg in
                                                 bleManager.connectedPeripheral.writeValue(msg.data(using: .utf8)!, for: item.element, type: .withoutResponse)
                                                sendMessageTo = nil
                                            })
                                        }
                                    }
                                }
                            } else {
                                Text("No characteristics")
                            }
                        }
                    } else {
                        Text("No services")
                    }
                }
            } else {
                if bleManager.isScanning {
                    Button("Stop", action: {
                        self.bleManager.stopScanning()
                    })
                } else {
                    Button("Scan", action: {
                        self.bleManager.clear()
                        self.bleManager.startScanning()
                    })
                }

                Text("Bluetooth Devices")
                    .font(.largeTitle)
                    .frame(maxWidth: .infinity, alignment: .center)
                
                List(bleManager.peripherals, id: \.identifier.uuidString) { peripheral in
                    Button(action: {
                        if showDetailsFor == peripheral {
                            showDetailsFor = nil
                        } else {
                            showDetailsFor = peripheral
                        }
                    }) {
                        VStack (alignment: .leading, spacing: 10) {
                            Text(peripheral.name ?? peripheral.identifier.uuidString)
                            
                            if showDetailsFor == peripheral {
                                HStack {
                                    Text(String(peripheral.identifier.uuidString))
                                    Spacer()
                                    Button("Connect", action: {
                                        bleManager.centralBE.connect(peripheral, options: nil)
                                    })
                                }
                            }
                        }
                    }
                    .buttonStyle(.plain)
                }.frame(height: 300)
                Spacer()
            }
        }
    }}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
