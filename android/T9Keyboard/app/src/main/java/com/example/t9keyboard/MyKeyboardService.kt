package com.example.t9keyboard

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.inputmethodservice.InputMethodService
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.provider.Settings
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.transition.Visibility
import android.view.MotionEvent
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.Locale
import java.util.Timer
import java.util.logging.Logger
import kotlin.concurrent.scheduleAtFixedRate


class MyKeyboardService : InputMethodService(), RecognitionListener {
    private var speechRecognizer: SpeechRecognizer? = null
    private var wantsToListen = false
    private var isListening = false

    private val serviceJob = SupervisorJob()
    private val serviceScope = CoroutineScope(Dispatchers.Main + serviceJob)

    private lateinit var rootView: View
    private lateinit var keySymbols: Button
    private lateinit var keyABC: Button
    private lateinit var keyDEF: Button
    private lateinit var keyGHI: Button
    private lateinit var keyJKL: Button
    private lateinit var keyMNO: Button
    private lateinit var keyPQRS: Button
    private lateinit var keyTUV: Button
    private lateinit var keyWXYZ: Button
    private lateinit var keySpace: Button
    private lateinit var keyMic: Button
    private lateinit var keysGroup: View
    private lateinit var textRecognitionView: TextView
    private lateinit var textRecognitionGroup: View
    private lateinit var loadingView: TextView


    private var cursorPosition: Int = 0
    private var isComposing = false
    private var job: Job? = null

    private var shouldVibrate = true

    private var deleteTimer: Timer? = null

    private val handler = Handler(Looper.getMainLooper())

    //

    override fun onCreate() {
        super.onCreate()
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
        speechRecognizer?.setRecognitionListener(this)
    }

    override fun onDestroy() {
        speechRecognizer?.cancel()
        speechRecognizer?.destroy()
        speechRecognizer = null
        serviceJob.cancel()
        super.onDestroy()
    }

    //

    override fun onCreateInputView(): View {
        rootView = layoutInflater.inflate(R.layout.keyboard_view, null)
        ViewCompat.setOnApplyWindowInsetsListener(rootView) { v, insets ->
            val nav = insets.getInsets(WindowInsetsCompat.Type.navigationBars())
            v.updatePadding(bottom = nav.bottom + 15)
            insets
        }

        keySymbols = rootView.findViewById(R.id.keySymbols)
        keySymbols.setOnClickListener(keyListener(keySymbols, ",.?!"))
        keyABC = rootView.findViewById(R.id.keyABC)
        keyABC.setOnClickListener(keyListener(keyABC, "ABC"))
        keyDEF = rootView.findViewById(R.id.keyDEF)
        keyDEF.setOnClickListener(keyListener(keyDEF, "DEF"))
        keyGHI = rootView.findViewById(R.id.keyGHI)
        keyGHI.setOnClickListener(keyListener(keyGHI, "GHI"))
        keyJKL = rootView.findViewById(R.id.keyJKL)
        keyJKL.setOnClickListener(keyListener(keyJKL, "JKL"))
        keyMNO = rootView.findViewById(R.id.keyMNO)
        keyMNO.setOnClickListener(keyListener(keyMNO, "MNO"))
        keyPQRS = rootView.findViewById(R.id.keyPQRS)
        keyPQRS.setOnClickListener(keyListener(keyPQRS, "PQRS"))
        keyTUV = rootView.findViewById(R.id.keyTUV)
        keyTUV.setOnClickListener(keyListener(keyTUV, "TUV"))
        keyWXYZ = rootView.findViewById(R.id.keyWXYZ)
        keyWXYZ.setOnClickListener(keyListener(keyWXYZ, "WXYZ"))

        keySpace = rootView.findViewById(R.id.keySpace)
        keySpace.setOnClickListener {
            vibrate()
            finishText()
            currentInputConnection.commitText(" ", 1)
        }

        val delete = rootView.findViewById<Button>(R.id.keyDelete)
        delete.setOnTouchListener { _, event ->
            when (event?.action) {
                MotionEvent.ACTION_DOWN -> {
                    deleteTimer?.cancel()
                    deleteTimer = Timer()
                    deleteTimer?.scheduleAtFixedRate(0, 200, {
                        vibrate()
                        finishText()
                        currentInputConnection.deleteSurroundingText(1, 0)
                    })
                    true
                }
                MotionEvent.ACTION_UP,
                MotionEvent.ACTION_CANCEL -> {
                    deleteTimer?.cancel()
                    deleteTimer = null
                    true
                }

                else -> false
            }
        }

        val keyLeft = rootView.findViewById<Button>(R.id.keyLeft)
        keyLeft.setOnClickListener {
            vibrate()
            finishText()
            this.currentInputConnection.setSelection(cursorPosition - 1, cursorPosition - 1)
        }

        val keyRight = rootView.findViewById<Button>(R.id.keyRight)
        keyRight.setOnClickListener {
            vibrate()
            finishText()
            this.currentInputConnection.setSelection(cursorPosition + 1, cursorPosition + 1)
        }

        keyMic = rootView.findViewById(R.id.keyMic)
        keyMic.setOnClickListener {
            vibrate(false)
            if (isListening) {
                wantsToListen = false
                stopSpeechToText()
            } else {
                wantsToListen = true
                startSpeechToText()
            }
        }

        keysGroup = rootView.findViewById(R.id.keysGroup)
        textRecognitionGroup = rootView.findViewById(R.id.textRecognitionGroup)
        textRecognitionView = rootView.findViewById(R.id.textRecognitionView)
        loadingView = rootView.findViewById(R.id.loading)

        return rootView
    }

    override fun onUpdateSelection(
        oldSelStart: Int,
        oldSelEnd: Int,
        newSelStart: Int,
        newSelEnd: Int,
        candidatesStart: Int,
        candidatesEnd: Int
    ) {
        super.onUpdateSelection(
            oldSelStart,
            oldSelEnd,
            newSelStart,
            newSelEnd,
            candidatesStart,
            candidatesEnd
        )

        cursorPosition = newSelStart
    }

    override fun onFinishInputView(finishingInput: Boolean) {
        Logger.getGlobal().info("onFinishInputView")
        wantsToListen = false
        stopSpeechToText()
        super.onFinishInputView(finishingInput)
    }

//    override fun onWindowHidden() {
//        Logger.getGlobal().info("onWindowHidden")
//        super.onWindowHidden()
//    }


    fun vibrate(withSound: Boolean = true) {
        if (!shouldVibrate) return

        val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
        val vibrator = vibratorManager.defaultVibrator
        if (vibrator.hasVibrator()) {
            vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK))
        }

        if (withSound) {
            val mp = MediaPlayer.create(this, R.raw.water_drop);
            mp.start()
        }
    }

    //

    fun finishText() {
        isComposing = !currentInputConnection.finishComposingText()
    }

    fun composeText(text: String) {
        isComposing = currentInputConnection.setComposingText(text, 1)
        job?.cancel()
        job = serviceScope.launch {
            delay(500)
            finishText()
        }
    }

    fun keyListener(key: Button, possible: String): View.OnClickListener {
        key.text = possible
        return View.OnClickListener {
            vibrate()
            val existingText = currentInputConnection.getTextBeforeCursor(1, 0).toString()
            if (isComposing && possible.contains(existingText)) {
                val index = possible.indexOf(existingText)
                val next = possible[(index + 1) % possible.length]
                composeText(next.toString())
            } else {
                isComposing = !currentInputConnection.finishComposingText()
                composeText(possible[0].toString())
            }
        }
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
        if (!wantsToListen) return

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(
                RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
            )
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
        }
        speechRecognizer?.startListening(intent)

        keysGroup.visibility = View.GONE
        textRecognitionGroup.visibility = View.VISIBLE
        isListening = true
        loadingView.visibility = View.VISIBLE
        rotateInfinite(loadingView)

        textRecognitionView.text = "Speak!"
    }

    fun stopSpeechToText() {
        isListening = false

        speechRecognizer?.stopListening()
        loadingView.visibility = View.INVISIBLE
        loadingView.animate().cancel()
        loadingView.rotation = 0f
        keysGroup.visibility = View.VISIBLE
        textRecognitionGroup.visibility = View.GONE
    }

    override fun onPartialResults(partialResults: Bundle?) {
        if (textRecognitionView.text == "Speak!") {
            textRecognitionView.text = ""
        }
        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        Logger.getGlobal().info("onPartialResults $matches")
        val text = matches?.firstOrNull() ?: return
        textRecognitionView.text = text
    }

    override fun onResults(results: Bundle) {
        val list = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val best = list?.firstOrNull().orEmpty()
        currentInputConnection.commitText(best, 1)
        handler.postDelayed({ startSpeechToText() }, 200)
    }

    //

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

    //

    fun rotateInfinite(view: View, duration: Long = 1000L) {
        fun loop() {
            view.animate()
                .rotationBy(360f)
                .setDuration(duration)
                .withEndAction {
                    if (view.isAttachedToWindow) {
                        loop()
                    }
                }
                .start()
        }
        loop()
    }

}

