using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Gesture Recognizer for when the user performs a drag motion on the touch screen.
/// </summary>
public class DragGestureRecognizer : GestureRecognizer<DragGesture>
{
    private const float k_SlopInches = 0.1f;

    internal float m_SlopInches
    {
        get
        {
            return k_SlopInches;
        }
    }

    /// <summary>
    /// Creates a Drag gesture with the given touch.
    /// </summary>
    /// <param name="touch">The touch that started this gesture.</param>
    /// <returns>The created Drag gesture.</returns>
    internal DragGesture CreateGesture(Touch touch)
    {
        return new DragGesture(this, touch);
    }

    /// <summary>
    /// Tries to create a Drag Gesture.
    /// </summary>
    protected internal override void TryCreateGestures()
    {
        TryCreateOneFingerGestureOnTouchBegan(CreateGesture);
    }
}
