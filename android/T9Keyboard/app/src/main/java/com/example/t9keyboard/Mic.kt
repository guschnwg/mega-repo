package com.example.t9keyboard

import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.t9keyboard.ui.theme.Purple80
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.logging.Logger

@Composable
fun Mic(
    onMicClick: () -> Unit,
    wantsToSpeak: Boolean = false
) {
    KeyButton(
        text = "🎙️",
        onClick = onMicClick,
        width = if(wantsToSpeak) 50.dp else 100.dp
    )
}

@Composable
@Preview
fun Mic_Preview() {
    Mic({})
}

@Composable
@Preview
fun Mic_Preview2() {
    Mic({}, wantsToSpeak = true)
}
