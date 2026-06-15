#include "ble.h"

#include <BLE2902.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include "config.h"

// ── Definitions ───────────────────────────────────────────────────────────────
bool               bt_connected = false;
// ponytail: fixed buffer, no heap alloc per message
char               bt_message[BT_MSG_MAX] = "Waiting for message...";
volatile bool      bt_msg_dirty           = false;
volatile int       bt_nav_cmd             = -1; // -1 = no pending nav, else cast to Screen
BLECharacteristic *ble_tx                 = nullptr;

// ── BLE callbacks ─────────────────────────────────────────────────────────────
class ServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer *)    override { bt_connected = true;  log_i("BLE connected"); }
    void onDisconnect(BLEServer *s) override {
        bt_connected = false;
        s->startAdvertising();
    }
};

class RxCallbacks : public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *c) override {
        std::string val = c->getValue();
        log_i("BLE RX len=%d: %s", (int)val.size(), val.c_str());
        if (val.empty()) return;
        // Navigation commands
        if (val == "BT" || val == "bt" || val == "bluetooth")  { bt_nav_cmd = BT_DETAIL;   return; }
        if (val == "WiFi" || val == "wifi")                    { bt_nav_cmd = WIFI_DETAIL; return; }
        if (val == "main" || val == "Main" || val == "home")   { bt_nav_cmd = MAIN;        return; }
        if (val == "?") {
            if (ble_tx) {
                std::string help = "Commands: BT, WiFi, main/home, ? | Other text shown on BT screen";
                ble_tx->setValue(help);
                ble_tx->notify();
            }
            return;
        }
        strncpy(bt_message, val.c_str(), BT_MSG_MAX - 1);
        bt_message[BT_MSG_MAX - 1] = '\0';
        bt_msg_dirty = true;
    }
};

// ── Implementation ────────────────────────────────────────────────────────────
void setup_bt() {
    BLEDevice::init("LilyGo");
    BLEServer *server = BLEDevice::createServer();
    server->setCallbacks(new ServerCallbacks());

    BLEService *svc = server->createService(NUS_SERVICE_UUID);

    BLECharacteristic *rx = svc->createCharacteristic(
        NUS_RX_UUID, BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR);
    rx->setCallbacks(new RxCallbacks());

    // Some apps write to TX UUID instead of RX — attach same callback to catch both
    ble_tx = svc->createCharacteristic(
        NUS_TX_UUID, BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR);
    ble_tx->setCallbacks(new RxCallbacks());
    ble_tx->addDescriptor(new BLE2902()); // CCCD — required for notify, some apps need it to enable writes

    svc->start();

    BLEAdvertising *adv = BLEDevice::getAdvertising();
    adv->addServiceUUID(NUS_SERVICE_UUID); // required for nRF apps to identify device
    adv->setScanResponse(true);
    BLEDevice::startAdvertising();
}
