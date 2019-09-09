using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TapGestureRecognizer : GestureRecognizer<TapGesture>
{
    private const float k_SlopInches = 0.1f;
    private const float k_TimeSeconds = 0.3f;

    /// <summary>
    /// Gets the edge slop distance to filter tap gestures.
    /// </summary>
    internal float m_SlopInches
    {
        get
        {
            return k_SlopInches;
        }
    }

    /// <summary>
    /// Gets the max time to be considered a Tap gesture.
    /// </summary>
    internal float m_TimeSeconds
    {
        get
        {
            return k_TimeSeconds;
        }
    }

    /// <summary>
    /// Creates a Tap gesture with the given touch.
    /// </summary>
    /// <param name="touch">The touch that started this gesture.</param>
    /// <returns>The created Tap gesture.</returns>
    internal TapGesture CreateGesture(Touch touch)
    {
        return new TapGesture(this, touch);
    }

    /// <summary>
    /// Tries to create a Tap Gesture.
    /// </summary>
    protected internal override void TryCreateGestures()
    {
        TryCreateOneFingerGestureOnTouchBegan(CreateGesture);
    }
}
