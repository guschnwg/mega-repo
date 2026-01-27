package com.example.t9keyboard

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.inputmethodservice.InputMethodService
import android.media.SoundPool
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.VibratorManager
import android.provider.Settings
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.view.View
import android.view.inputmethod.ExtractedTextRequest
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.ViewCompositionStrategy
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.example.t9keyboard.ui.theme.Purple40
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.Locale
import java.util.logging.Logger
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color

class MyKeyboardService : InputMethodService(), RecognitionListener {
    private var wantsToSpeak by mutableStateOf(false)
    private var isListening by mutableStateOf(false)
    private var modifierActive by mutableStateOf(true)
    private var spokenText by mutableStateOf("")


    private var isComposing = false
    private val serviceJob = SupervisorJob()
    private val serviceScope = CoroutineScope(Dispatchers.Main + serviceJob)
    private var stopComposeJob: Job? = null

    private lateinit var soundPool: SoundPool
    private var soundId: Int = 0

    private var speechRecognizer: SpeechRecognizer? = null
    private val handler = Handler(Looper.getMainLooper())
    private val owners = ImeOwners()

    //

    override fun onCreate() {
        super.onCreate()

        owners.onCreate()
        val decor = window?.window?.decorView
        val content = window?.window?.findViewById<View>(android.R.id.content)
        decor?.applyOwners(owners)
        content?.applyOwners(owners)

        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
        speechRecognizer?.setRecognitionListener(this)

        soundPool = SoundPool.Builder().setMaxStreams(10).build()
        soundId = soundPool.load(this, R.raw.water_drop, 1)
    }

    override fun onDestroy() {
        speechRecognizer?.cancel()
        speechRecognizer?.destroy()
        speechRecognizer = null
        serviceJob.cancel()
        owners.onDestroy()
        super.onDestroy()
    }

    //

    override fun onWindowShown() {
        modifierActive = true
        super.onWindowShown()
    }

    override fun onCreateInputView(): View {
        return ComposeView(this).apply {
            applyOwners(owners)
            setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnDetachedFromWindow)

            setContent {
                This(
                    wantsToSpeak = wantsToSpeak,
                    isListening = isListening,
                    spokenText = spokenText,
                    modifierActive = modifierActive,
                    onMicClick = {
                        vibrate(false)
                        wantsToSpeak = !wantsToSpeak
                        spokenText = ""
                        if (wantsToSpeak) {
                            startSpeechToText()
                        } else {
                            stopSpeechToText()
                        }
                    },
                    onDeleteClick = {
                        vibrate()
                        finishText()
                        currentInputConnection.deleteSurroundingText(1, 0)
                    },
                    onKeyClick = { id ->
                        when (id) {
                            "keySymbols" -> keyPress(",.?!")
                            "keyABC" -> keyPress("ABC")
                            "keyDEF" -> keyPress("DEF")
                            "keyGHI" -> keyPress("GHI")
                            "keyJKL" -> keyPress("JKL")
                            "keyMNO" -> keyPress("MNO")
                            "keyPQRS" -> keyPress("PQRS")
                            "keyTUV" -> keyPress("TUV")
                            "keyWXYZ" -> keyPress("WXYZ")
                            "keySpace" -> {
                                vibrate()
                                finishText()
                                composeText(" ")
                                finishText()
                            }
                            "keyLeft" -> moveCursor(-1)
                            "keyRight" -> moveCursor(+1)
                        }
                    },
                    onModifierClick = {
                        modifierActive = !modifierActive
                    },
                    onSymbolSelect = { symbol ->
                        vibrate()
                        finishText()
                        composeText(symbol)
                        finishText()
                    }
                )
            }
        }
    }

    override fun onFinishInputView(finishingInput: Boolean) {
        Logger.getGlobal().info("onFinishInputView")
        wantsToSpeak = false
        stopSpeechToText()
        super.onFinishInputView(finishingInput)
    }

    fun vibrate(withSound: Boolean = true) {
         if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(VIBRATOR_MANAGER_SERVICE) as VibratorManager
            val vibrator = vibratorManager.defaultVibrator
            if (vibrator.hasVibrator()) {
                vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK))
            }

            if (withSound) {
                soundPool.play(soundId, 1f, 1f, 1, 0, 1f)
            }
        } else {
            TODO("VERSION.SDK_INT < S")
        }
    }

    //

    fun finishText() {
        isComposing = !currentInputConnection.finishComposingText()
        if (modifierActive) {
            modifierActive = false
        }
    }

    fun composeText(text: String) {
        isComposing = currentInputConnection.setComposingText(text, 1)
        stopComposeJob?.cancel()
        stopComposeJob = serviceScope.launch {
            delay(500)
            finishText()
        }
    }

    fun keyPress(possible: String) {
        vibrate()

        val actualPossible = if (modifierActive) possible else possible.lowercase()

        val existingText = currentInputConnection.getTextBeforeCursor(1, 0).toString()
        if (isComposing && actualPossible.contains(existingText)) {
            val index = actualPossible.indexOf(existingText)
            val next = actualPossible[(index + 1) % actualPossible.length]
            composeText(next.toString())
        } else {
            isComposing = !currentInputConnection.finishComposingText()
            composeText(actualPossible[0].toString())
        }
    }

    fun moveCursor(offset: Int) {
        val ic = currentInputConnection ?: return

        val extracted = ic.getExtractedText(ExtractedTextRequest(), 0)
        val cursor = extracted?.selectionEnd ?: return

        vibrate()
        ic.setSelection(cursor + offset, cursor + offset)
    }

    //

    fun ensureMicPermissionOrOpenSettings(): Boolean {
        val granted = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
        if (!granted) {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.fromParts("package", packageName, null)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
        }
        return granted
    }

    fun startSpeechToText() {
        if (!ensureMicPermissionOrOpenSettings()) return
        if (!SpeechRecognizer.isRecognitionAvailable(this)) return
        if (!wantsToSpeak) return

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(
                RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
            )
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
        }
        speechRecognizer?.startListening(intent)

        isListening = true
    }

    fun stopSpeechToText() {
        isListening = false

        speechRecognizer?.stopListening()
    }

    //

    override fun onPartialResults(partialResults: Bundle?) {
        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        Logger.getGlobal().info("onPartialResults $matches")
        val text = matches?.firstOrNull() ?: return
        spokenText = text
    }

    override fun onResults(results: Bundle) {
        val list = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val best = list?.firstOrNull().orEmpty()
        currentInputConnection.commitText("$best ", 1)
        handler.postDelayed({ startSpeechToText() }, 200)
    }

    override fun onError(error: Int) {
        val message = when (error) {
            SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
            SpeechRecognizer.ERROR_CLIENT -> "Client side error"
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Please allow permissions"
            SpeechRecognizer.ERROR_NETWORK -> "Network error"
            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
            SpeechRecognizer.ERROR_NO_MATCH -> "No voice detected"
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Already Listening"
            SpeechRecognizer.ERROR_SERVER -> "Server error"
            else -> "Unknown error"
        }
        Toast.makeText(applicationContext, message, Toast.LENGTH_SHORT).show()

        handler.postDelayed({ startSpeechToText() }, 200)
    }

    override fun onReadyForSpeech(params: Bundle?) {}
    override fun onBeginningOfSpeech() {}
    override fun onEndOfSpeech() {}
    override fun onBufferReceived(buffer: ByteArray?) {}
    override fun onEvent(eventType: Int, params: Bundle?) {}
    override fun onRmsChanged(rmsdB: Float) {}
}

@Composable
fun This(
    wantsToSpeak: Boolean = false,
    isListening: Boolean = false,
    spokenText: String = "",
    modifierActive: Boolean = false,
    onMicClick: () -> Unit,
    onDeleteClick: () -> Unit,
    onKeyClick: (id: String) -> Unit,
    onModifierClick: () -> Unit,
    onSymbolSelect: (symbol: String) -> Unit
) {
    var symbolsShown by remember { mutableStateOf(false) }

    Box {
        Column(
            modifier = Modifier
                .background(Purple40)
                .padding(
                    top = 10.dp,
                    bottom = WindowInsets.navigationBars.asPaddingValues().calculateBottomPadding() + 10.dp,
                )
                .padding(horizontal = 10.dp)
                .alpha(if (symbolsShown) 0.2f else 1f)
        ) {
            MicLoadingDeleteRow(
                wantsToSpeak = wantsToSpeak,
                isListening = isListening,
                spokenText = spokenText,
                modifierActive = modifierActive,
                onMicClick = onMicClick,
                onDeleteClick = onDeleteClick,
                onModifierClick = onModifierClick,
            )

            if (!wantsToSpeak) {
                Spacer(modifier = Modifier.size(10.dp))

                KeysGroup(
                    symbolsShown = symbolsShown,
                    uppercase = modifierActive,
                    onKeyClick = onKeyClick,
                    onSymbolsToggle = { state ->
                        symbolsShown = state
                    }
                )
            }
        }
    }
}

@Composable
@Preview
fun Preview1() {
    This(
        wantsToSpeak = false,
        false,
        "",
        false,
        {},
        {},
        onKeyClick = {},
        onModifierClick = {},
        onSymbolSelect = {}
    )
}

@Composable
@Preview
fun Preview15() {
    This(
        wantsToSpeak = false,
        false,
        "",
        true,
        {},
        {},
        onKeyClick = {},
        onModifierClick = {},
        onSymbolSelect = {}
    )
}

@Composable
@Preview
fun Preview2() {
    This(
        wantsToSpeak = true,
        isListening = false,
        onMicClick = {},
        onDeleteClick = {},
        onKeyClick = {},
        onModifierClick = {},
        onSymbolSelect = {}
    )
}

@Composable
@Preview
fun Preview3() {
    This(
        wantsToSpeak = true,
        isListening = true,
        onMicClick = {},
        onDeleteClick = {},
        onKeyClick = {},
        onModifierClick = {},
        onSymbolSelect = {}
    )
}

@Composable
@Preview
fun Preview4() {
    This(
        wantsToSpeak = true,
        isListening = true,
        spokenText = "Hello",
        onMicClick = {},
        onDeleteClick = {},
        onKeyClick = {},
        onModifierClick = {},
        onSymbolSelect = {}
    )
}

