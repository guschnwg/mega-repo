package com.example.t9keyboard

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.t9keyboard.ui.theme.Purple80
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.logging.Logger

@Composable
fun DeleteButton(onDeleteClick: () -> Unit, wantsToSpeak: Boolean = false) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .background(color = Purple80, shape = RoundedCornerShape(12.dp))
            .pointerInput(Unit) {
                coroutineScope {
                    detectTapGestures(
                        onPress = {
                            Logger.getGlobal().info("DEBUG: onPress")

                            val job = launch {
                                while (isActive) {
                                    onDeleteClick()
                                    delay(200)
                                }
                            }

                            awaitRelease()
                            Logger.getGlobal().info("DEBUG: Released")

                            job.cancel()
                        },
                    )
                }
            }
            .width(width = if(wantsToSpeak) 50.dp else 100.dp)
            .height(50.dp)) {

        Text(
            "🗑️",
            fontSize = 30.sp,
            textAlign = TextAlign.Center,
        )
    }
}