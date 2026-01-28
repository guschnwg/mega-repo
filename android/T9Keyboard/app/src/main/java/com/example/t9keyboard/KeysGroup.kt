package com.example.t9keyboard

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class Button (
    val label: String,
    val onPressCandidates: String,
    val onHoldCandidates: List<List<String>>,
)

val buttonsGroup: List<List<Button>> = listOf(
    listOf(
        Button(
            "Symbols",
            ",.!?",
            listOf(
                listOf(",", ".", "!"),
                listOf("?", "(", ")"),
                listOf("...", "!!!", "???")
            )
        ),
        Button(
            "ABC",
            "ABC",
            listOf(
                listOf("A", "B", "C"),
                listOf("Á", "À", "Â"),
                listOf("Ä", "Ã", "Å")
            )
        ),
        Button(
            "DEF",
            "DEF",
            listOf(
                listOf("D", "E", "F"),
                listOf("É", "È", "Ê"),
                listOf("Ë")
            )
        )
    ),
    listOf(
        Button(
            "GHI",
            "GHI",
            listOf(
                listOf("G", "H", "I"),
                listOf("Í", "Ì", "Î"),
                listOf("Ï")
            )
        ),
        Button(
            "JKL",
            "JKL",
            listOf(
                listOf("J", "K", "L")
            )
        ),
        Button(
            "MNO",
            "MNO",
            listOf(
                listOf("M", "N", "O"),
                listOf("Ñ", "Ó", "Ò"),
                listOf("Ô", "Ö", "Õ")
            )
        )
    ),
    listOf(
        Button(
            "PQRS",
            "PQRS",
            listOf(
                listOf("P", "Q", "R"),
                listOf("S")
            )
        ),
        Button(
            "TUV",
            "TUV",
            listOf(
                listOf("T", "U", "V"),
                listOf("Ú", "Ù", "Û"),
                listOf("Ü")
            )
        ),
        Button(
            "WXYZ",
            "WXYZ",
            listOf(
                listOf("W", "X", "Y"),
                listOf("Z", "Ý", "Ÿ")
            )
        )
    )
)


@Composable
fun KeysGroup(
    symbolsShown: Boolean = false,
    uppercase: Boolean = false,
    onKeyClick: (id: String) -> Unit,
    onSymbolsToggle: (state: Boolean) -> Unit,
    onSymbolSelect: (symbol: String) -> Unit
) {
    var state by remember { mutableStateOf("RELEASED") }
    var boxSize by remember { mutableStateOf(IntSize.Zero) }
    var currentPosition by remember { mutableStateOf(Offset.Zero) }
    var activeButton: Button? by remember { mutableStateOf(null)}

    Box(
        modifier = Modifier
            .onSizeChanged { boxSize = it }
            .pointerInput(Unit) {
            awaitEachGesture {
                val down = awaitFirstDown(requireUnconsumed = false)
                state = "DOWN"
                currentPosition = Offset.Zero

                while (true) {
                    val event = awaitPointerEvent()
                    val change = event.changes.firstOrNull { it.id == down.id } ?: break
                    if (change.pressed) {
                        if (state == "DOWN") {
                            currentPosition = change.position
                            state = "MOVE"
                            onSymbolsToggle(true)

                            val xPercent = change.position.x / boxSize.width
                            val yPercent = change.position.y / boxSize.height

                            val yIndex = (yPercent * buttonsGroup.size).toInt().coerceIn(0, buttonsGroup.size - 1)
                            val buttonRow = buttonsGroup[yIndex]
                            val xIndex = (xPercent * buttonRow.size).toInt().coerceIn(0, buttonRow.size - 1)

                            activeButton = buttonRow[xIndex]
                        }
                        change.consume()
                    } else {
                        state = "RELEASED"
                        activeButton?.let { button ->
                            val xPercent = change.position.x / boxSize.width
                            val yPercent = change.position.y / boxSize.height

                            val yIndex = (yPercent * button.onHoldCandidates.size).toInt().coerceIn(0, button.onHoldCandidates.size - 1)
                            val buttonRow = button.onHoldCandidates[yIndex]
                            val xIndex = (xPercent * 3).toInt().coerceIn(0, 3 - 1)
                            if (xIndex < buttonRow.size) {
                                onSymbolSelect(buttonRow[xIndex])
                            }
                        }
                        break
                    }
                }

                onSymbolsToggle(false)
                activeButton = null
            }
        }
    ){
        Column(
            modifier = Modifier.fillMaxWidth().alpha(if (symbolsShown) 0.2f else 1f),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            buttonsGroup.map { buttons ->
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    buttons.map { button ->
                        KeyButton(if (uppercase) button.label else button.label.lowercase(), { onKeyClick(button.onPressCandidates) }, 20.sp)
                        if (button != buttons.last()) {
                            Spacer(Modifier.width(20.dp))
                        }
                    }
                }
            }
        }

        if (symbolsShown && activeButton != null) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.Start
            ) {
                activeButton!!.onHoldCandidates.map { symbols ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
                        horizontalArrangement = Arrangement.Start,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        symbols.map { symbol ->
                            val actualSymbol = if (uppercase) symbol else symbol.lowercase()
                            KeyButton(actualSymbol, { onSymbolSelect(actualSymbol) }, 20.sp)
                            if (symbol != symbols.last()) {
                                Spacer(Modifier.width(20.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
@Preview
fun Preview() {
    Column {
        KeysGroup(false, false, onKeyClick = {}, onSymbolsToggle = {}, onSymbolSelect = {})
        Spacer(Modifier.height(50.dp))
        KeysGroup(false, true, onKeyClick = {}, onSymbolsToggle = {}, onSymbolSelect = {})
        Spacer(Modifier.height(50.dp))
        KeysGroup(true, false, onKeyClick = {}, onSymbolsToggle = {}, onSymbolSelect = {})
        Spacer(Modifier.height(50.dp))
        KeysGroup(true, true, onKeyClick = {}, onSymbolsToggle = {}, onSymbolSelect = {})
    }
}
