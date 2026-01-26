package com.example.t9keyboard

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.t9keyboard.ui.theme.T9KeyboardTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val name = mutableStateOf("Android")

            T9KeyboardTheme {
                Column(modifier = Modifier.padding(horizontal = 10.dp, vertical = 50.dp)) {
                    Text("HI")
                    TextField(
                        value = name.value,
                        onValueChange = { name.value = it }
                    )
                    Text(name.value)
                    Text("BYE")
                }

            }
        }
    }
}
