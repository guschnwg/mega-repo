package com.example.t9keyboard

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun KeysGroup(
    symbolsShown: Boolean = false,
    uppercase: Boolean = false,
    onKeyClick: (id: String) -> Unit,
    onSymbolsToggle: (state: Boolean) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
//            KeyButton("Symbols", { onKeyClick("keySymbols") }, 20.sp)
            SymbolsButton(symbolsShown = symbolsShown, { onKeyClick("keySymbols") }, onSymbolsToggle = onSymbolsToggle)
            Spacer(Modifier.width(20.dp))
            KeyButton(if (uppercase) "ABC" else "abc", { onKeyClick("keyABC") }, 20.sp)
            Spacer(Modifier.width(20.dp))
            KeyButton(if (uppercase) "DEF" else "def", { onKeyClick("keyDEF") }, 20.sp)
        }

        Row(
            modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            KeyButton(if (uppercase) "GHI" else "ghi", { onKeyClick("keyGHI") }, 20.sp)
            Spacer(Modifier.width(20.dp))
            KeyButton(if (uppercase) "JKL" else "jkl", { onKeyClick("keyJKL") }, 20.sp)
            Spacer(Modifier.width(20.dp))
            KeyButton(if (uppercase) "MNO" else "mno", { onKeyClick("keyMNO") }, 20.sp)
        }

        Row(
            modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            KeyButton(if (uppercase) "PQRS" else "pqrs", { onKeyClick("keyPQRS") }, 20.sp)
            Spacer(Modifier.width(20.dp))
            KeyButton(if (uppercase) "TUV" else "tuv", { onKeyClick("keyTUV") }, 20.sp)
            Spacer(Modifier.width(20.dp))
            KeyButton(if (uppercase) "WXYZ" else "wxyz", { onKeyClick("keyWXYZ") }, 20.sp)
        }

        Row(
            modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            KeyButton("👈", { onKeyClick("keyLeft") }, 20.sp)
            Spacer(Modifier.width(20.dp))
            KeyButton("␣", { onKeyClick("keySpace") }, 20.sp)
            Spacer(Modifier.width(20.dp))
            KeyButton("👉", { onKeyClick("keyRight") }, 20.sp)
        }
    }
}

@Composable
@Preview
fun Preview() {
    Column {
        KeysGroup(false, onKeyClick = {}, onSymbolsToggle = {})
        KeysGroup(true, onKeyClick = {}, onSymbolsToggle = {})
    }
}
