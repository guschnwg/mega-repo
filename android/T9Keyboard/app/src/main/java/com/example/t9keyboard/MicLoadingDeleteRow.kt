package com.example.t9keyboard

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.t9keyboard.ui.theme.Pink80
import androidx.compose.runtime.getValue

@Composable
fun MicLoadingDeleteRow(
    wantsToSpeak: Boolean,
    isListening: Boolean,
    spokenText: String,
    modifierActive: Boolean,
    onMicClick: () -> Unit,
    onModifierClick: () -> Unit,
    onDeleteClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (!wantsToSpeak) {
            KeyButton("⬆️", onClick = onModifierClick, active = modifierActive)

            Spacer(Modifier.width(20.dp))
        }

        Mic(onMicClick, wantsToSpeak = wantsToSpeak)

        if (wantsToSpeak) {
            val infiniteTransition = rememberInfiniteTransition()
            val angle by infiniteTransition.animateFloat(
                initialValue = 0f,
                targetValue = 360f,
                animationSpec = infiniteRepeatable(
                    animation = tween(
                        durationMillis = 1000,
                        easing = LinearEasing
                    )
                )
            )
            Text(
                text = "꩜",
                fontSize = 30.sp,
                color = MaterialTheme.colorScheme.onPrimary,
                modifier = Modifier
                    .padding(horizontal = 10.dp)
                    .rotate(if (isListening) angle else 0f),
            )

            Box(Modifier.weight(1f)) {
                Text("$spokenText...", color = Pink80)
            }
        } else {
            Spacer(Modifier.width(20.dp))
        }

        DeleteButton(onDeleteClick, wantsToSpeak = wantsToSpeak)
    }
}

@Composable
@Preview
fun MicLoadingDeleteRow_Preview() {
    MicLoadingDeleteRow(true, isListening = false, "", modifierActive = false, {}, {}, {})

}

@Composable
@Preview
fun MicLoadingDeleteRow_Preview2() {
    MicLoadingDeleteRow(false, isListening = false, "", modifierActive = false, {}, {}, {})
}

@Composable
@Preview
fun MicLoadingDeleteRow_Preview5() {
    MicLoadingDeleteRow(false, isListening = false, "", modifierActive = true, {}, {}, {})
}

@Composable
@Preview
fun MicLoadingDeleteRow_Preview3() {
    MicLoadingDeleteRow(true, isListening = true, "", modifierActive = false, {}, {}, {})
}

@Composable
@Preview
fun MicLoadingDeleteRow_Preview4() {
    MicLoadingDeleteRow(true, isListening = true, "Hello hello", modifierActive = false, {}, {}, {})
}