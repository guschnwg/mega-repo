package com.example.t9keyboard

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectDragGesturesAfterLongPress
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.snapping.SnapPosition
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.absoluteOffset
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Popup
import androidx.compose.ui.window.PopupProperties
import androidx.compose.ui.zIndex
import com.example.t9keyboard.ui.theme.Purple40
import com.example.t9keyboard.ui.theme.Purple80
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.logging.Logger

@Composable
fun SymbolsButton(symbolsShown: Boolean, onSymbolsTab: () -> Unit, onSymbolsToggle: (state: Boolean) -> Unit) {
    var lastPos by remember { mutableStateOf(Offset.Zero) }

    Box(
        modifier = Modifier.pointerInput(Unit) {
//            detectTapGestures { onSymbolsTab() }
//            detectDragGestures(
//                onDragStart = { pos ->
//                    lastPos = pos
//                    onSymbolsToggle(true)
//                },
//                onDrag = { change, _ ->
//                    lastPos = change.position
//                    change.consume()
//                },
//                onDragEnd = {
//                    onSymbolsToggle(false)
//                },
//                onDragCancel = {
//                    onSymbolsToggle(false)
//                }
//            )
            awaitEachGesture {
                val down = awaitFirstDown(requireUnconsumed = false)
                lastPos = Offset.Zero

                while (true) {
                    val event = awaitPointerEvent()
                    val change = event.changes.firstOrNull { it.id == down.id } ?: break

                    if (change.pressed) {
                        onSymbolsToggle(true)
                        lastPos = change.position
                        change.consume()
                    } else {
                        // RELEASE
                        if (lastPos == Offset.Zero) {
                            onSymbolsTab()
                        } else {
                            lastPos = change.position
                        }
                        break
                    }
                }

                onSymbolsToggle(false)
            }
        },
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .background(
                    color = Purple80,
                    shape = RoundedCornerShape(12.dp)
                )
                .width(width = 100.dp)
                .height(50.dp)
        ) {
            Text(
                "Symbols",
                fontSize = 20.sp,
                color = Color.White,
                textAlign = TextAlign.Center,
            )
        }

        Popup(
            properties = PopupProperties(focusable = false),
        ) {
            if (symbolsShown) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Row {
                        KeyButton(".", onClick = {})
                        Spacer(Modifier.width(20.dp))
                        KeyButton(",", onClick = {})
                        Spacer(Modifier.width(20.dp))
                        KeyButton("?", onClick = {})
                    }

                    Spacer(Modifier.height(4.dp))

                    Row {
                        KeyButton(".", onClick = {})
                        Spacer(Modifier.width(20.dp))
                        KeyButton(",", onClick = {})
                        Spacer(Modifier.width(20.dp))
                        KeyButton("?", onClick = {})
                    }

                    Spacer(Modifier.height(4.dp))

                    Row {
                        KeyButton(".", onClick = {})
                        Spacer(Modifier.width(20.dp))
                        KeyButton(",", onClick = {})
                        Spacer(Modifier.width(20.dp))
                        KeyButton("?", onClick = {})
                    }

                    Spacer(Modifier.height(4.dp))

                    Row {
                        KeyButton(".", onClick = {})
                        Spacer(Modifier.width(20.dp))
                        KeyButton(",", onClick = {})
                        Spacer(Modifier.width(20.dp))
                        KeyButton("?", onClick = {})
                    }
                }
            }

        }
    }
}

@Preview
@Composable
fun PreviewSymbolsButton() {
    Column {
        Row {
            SymbolsButton(true, {}, {})
            Text("HI")
            Text("HI")
            Text("HI")
            Text("HI")
            Text("HI")
            Text("HI")
            Text("HI")
            Text("HI")
        }
    }
}

@Preview
@Composable
fun PreviewSymbolsButton2() {
    Column (Modifier
        .width(500.dp)
        .height(500.dp)){
        SymbolsButton(false, {}, {})
    }
}