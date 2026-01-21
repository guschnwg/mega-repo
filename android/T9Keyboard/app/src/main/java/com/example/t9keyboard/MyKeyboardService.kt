package com.example.t9keyboard

import android.inputmethodservice.InputMethodService
import android.view.View
import android.view.inputmethod.CursorAnchorInfo
import android.widget.Button
import android.widget.TextView

class MyKeyboardService : InputMethodService() {
    override fun onCreateInputView(): View {
        val view = layoutInflater.inflate(R.layout.keyboard_view, null)

        val keyA = view.findViewById<Button>(R.id.keyA)
        keyA.setOnClickListener {
            currentInputConnection.commitText("a", 1)
        }

        val delete = view.findViewById<Button>(R.id.keyDelete)
        delete.setOnClickListener {
            currentInputConnection.deleteSurroundingText(1, 0)
        }

        val keyLeft = view.findViewById<Button>(R.id.keyLeft)
        keyLeft.setOnClickListener {
        }

        val keyRight = view.findViewById<Button>(R.id.keyRight)
        keyRight.setOnClickListener {
        }

        return view
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

        print(oldSelStart)
        print(oldSelEnd)
        print(newSelStart)
        print(newSelEnd)
        print(candidatesStart)
        print(candidatesEnd)

        val view = layoutInflater.inflate(R.layout.keyboard_view, null)
        val cursorPosition = view.findViewById<TextView>(R.id.cursorPosition)
        cursorPosition.text = newSelStart.toString()
    }

}

