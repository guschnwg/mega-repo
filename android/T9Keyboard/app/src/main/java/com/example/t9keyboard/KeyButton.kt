package com.example.t9keyboard

import android.icu.number.IntegerWidth
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.t9keyboard.ui.theme.Pink80
import com.example.t9keyboard.ui.theme.Purple40
import com.example.t9keyboard.ui.theme.Purple80
import com.example.t9keyboard.ui.theme.PurpleGrey40
import com.example.t9keyboard.ui.theme.PurpleGrey80

@Composable
fun KeyButton(
    text: String,
    onClick: () -> Unit,
    fontSize: TextUnit = 30.sp,
    width: Dp = 100.dp,
    modifier: Modifier = Modifier.Companion,
    active: Boolean = false
) {
    Button(
        onClick = onClick,
        modifier = modifier
            .width(width)
            .height(50.dp),
        contentPadding = PaddingValues(0.dp),
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (active) Pink80 else Purple80
        ),
    ) {
        Text(text = text, fontSize = fontSize)
    }
}

@Preview
@Composable
fun _PreviewKeyButton() {
    Column {
        KeyButton("WZYX", {})
        KeyButton("WZYX", {}, fontSize = 20.sp)
        KeyButton("WZYX", {}, active = true)
    }
}