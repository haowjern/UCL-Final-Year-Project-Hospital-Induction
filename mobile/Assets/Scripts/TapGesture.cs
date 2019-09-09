using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TapGesture : Gesture<TapGesture>
{
    private float m_ElapsedTime = 0.0f;

    /// <summary>
    /// Constructs a Tap gesture.
    /// </summary>
    /// <param name="recognizer">The gesture recognizer.</param>
    /// <param name="touch">The touch that started this gesture.</param>
    internal TapGesture(TapGestureRecognizer recognizer, Touch touch) : base(recognizer)
    {
        FingerId = touch.fingerId;
        StartPosition = touch.position;
    }

    /// <summary>
    /// Gets the id of the finger used in this gesture.
    /// </summary>
    public int FingerId { get; private set; }

    /// <summary>
    /// Gets the screen position where the gesture started.
    /// </summary>
    public Vector2 StartPosition { get; private set; }

    /// <summary>
    /// Returns true if this gesture can start.
    /// </summary>
    /// <returns>True if the gesture can start.</returns>
    protected internal override bool CanStart()
    {
        if (GestureTouchesUtility.IsFingerIdRetained(FingerId))
        {
            Cancel();
            return false;
        }

        return true;
    }

    /// <summary>
    /// Action to be performed when this gesture is started.
    /// </summary>
    protected internal override void OnStart()
    {
        RaycastHit hit;
        if (GestureTouchesUtility.RaycastFromCamera(StartPosition, out hit))
        {
            var gameObject = hit.transform.gameObject;
            if (gameObject != null)
            {
                Debug.Log("Getting target object");
                TargetObject = gameObject.GetComponentInParent<Manipulator>().gameObject;
            } else
            {
                Debug.Log("Tap Gesture not hitting anything");
            }
        }
    }

    /// <summary>
    /// Updates this gesture.
    /// </summary>
    /// <returns>True if the update was successful.</returns>
    protected internal override bool UpdateGesture()
    {
        Touch touch;
        if (GestureTouchesUtility.TryFindTouch(FingerId, out touch))
        {
            TapGestureRecognizer tapRecognizer = m_Recognizer as TapGestureRecognizer;
            m_ElapsedTime += touch.deltaTime;
            if (m_ElapsedTime > tapRecognizer.m_TimeSeconds)
            {
                Cancel();
            }
            else if (touch.phase == TouchPhase.Moved)
            {
                float diff = (touch.position - StartPosition).magnitude;
                float diffInches = GestureTouchesUtility.PixelsToInches(diff);
                if (diffInches > tapRecognizer.m_SlopInches)
                {
                    Cancel();
                }
            }
            else if (touch.phase == TouchPhase.Ended)
            {
                Complete();
            }
        }
        else
        {
            Cancel();
        }

        return false;
    }

    /// <summary>
    /// Action to be performed when this gesture is cancelled.
    /// </summary>
    protected internal override void OnCancel()
    {
    }

    /// <summary>
    /// Action to be performed when this gesture is finished.
    /// </summary>
    protected internal override void OnFinish()
    {
    }
}
