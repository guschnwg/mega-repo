package com.example.t9keyboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun KeysGroup(
    onKeyClick: (id: String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        KeysRow(
            left = KeySpec("keySymbols", "Symbols", 20.sp),
            middle = KeySpec("keyABC", "ABC", 20.sp),
            right = KeySpec("keyDEF", "DEF", 20.sp),
            onKeyClick = onKeyClick
        )

        KeysRow(
            left = KeySpec("keyGHI", "GHI", 20.sp),
            middle = KeySpec("keyJKL", "JKL", 20.sp),
            right = KeySpec("keyMNO", "MNO", 20.sp),
            onKeyClick = onKeyClick
        )

        KeysRow(
            left = KeySpec("keyPQRS", "PQRS", 20.sp),
            middle = KeySpec("keyTUV", "TUV", 20.sp),
            right = KeySpec("keyWXYZ", "WXYZ", 20.sp),
            onKeyClick = onKeyClick
        )

        KeysRow(
            left = KeySpec("keyLeft", "👈", 30.sp),
            middle = KeySpec("keySpace", "␣", 20.sp),
            right = KeySpec("keyRight", "👉", 30.sp),
            onKeyClick = onKeyClick
        )
    }
}

data class KeySpec(
    val id: String,
    val label: String,
    val textSp: TextUnit
)

@Composable
private fun KeysRow(
    left: KeySpec,
    middle: KeySpec,
    right: KeySpec,
    onKeyClick: (id: String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical =2.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        KeyButton(left.label, {onKeyClick(left.id)}, left.textSp)

        Spacer(Modifier.width(20.dp))

        KeyButton(middle.label, {onKeyClick(middle.id)}, left.textSp)

        Spacer(Modifier.width(20.dp))

        KeyButton(right.label, {onKeyClick(right.id)}, left.textSp)
    }
}

@Composable
@Preview
fun _Preview() {
    KeysGroup({})
}
