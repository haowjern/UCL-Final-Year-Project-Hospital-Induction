﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;


// gesture base class 
// represents a sequence of touch events
// gestures are created and updated by gesturerecognisers 
public abstract class Gesture<T> where T: Gesture<T>
{
    internal Gesture(GestureRecognizer<T> recognizer)
    {
        m_Recognizer = recognizer;
    }

    /// <summary>
    /// Action to be performed when a gesture is started.
    /// </summary>
    public event Action<T> onStart;

    /// <summary>
    /// Action to be performed when a gesture is updated.
    /// </summary>
    public event Action<T> onUpdated;

    /// <summary>
    /// Action to be performed when a gesture is finished.
    /// </summary>
    public event Action<T> onFinished;

    /// <summary>
    /// Gets a value indicating whether the gesture was cancelled.
    /// </summary>
    public bool WasCancelled { get; private set; }

    /// <summary>
    /// Gets or sets the object this gesture is targeting.
    /// </summary>
    public GameObject TargetObject { get; protected set; }

    /// <summary>
    /// Gets the gesture recognizer.
    /// </summary>
    protected internal GestureRecognizer<T> m_Recognizer { get; private set; }

    private bool m_HasStarted { get; set; }

    /// <summary>
    /// Updates this gesture.
    /// </summary>
    internal void Update()
    {
        if (!m_HasStarted && CanStart())
        {
            Start();
            return;
        }

        if (m_HasStarted)
        {
            if (UpdateGesture() && onUpdated != null)
            {
                onUpdated(this as T);
            }
        }
    }

    /// <summary>
    /// Cancels this gesture.
    /// </summary>
    internal void Cancel()
    {
        WasCancelled = true;
        OnCancel();
        Complete();
    }

    /// <summary>
    /// Returns true if this gesture can start.
    /// </summary>
    /// <returns>True if the gesture can start.</returns>
    protected internal abstract bool CanStart();

    /// <summary>
    /// Action to be performed when this gesture is started.
    /// </summary>
    protected internal abstract void OnStart();

    /// <summary>
    /// Updates this gesture.
    /// </summary>
    /// <returns>True if the update was successful.</returns>
    protected internal abstract bool UpdateGesture();

    /// <summary>
    /// Action to be performed when this gesture is cancelled.
    /// </summary>
    protected internal abstract void OnCancel();

    /// <summary>
    /// Action to be performed when this gesture is finished.
    /// </summary>
    protected internal abstract void OnFinish();

    /// <summary>
    /// Completes this gesture.
    /// </summary>
    protected internal void Complete()
    {
        OnFinish();
        if (onFinished != null)
        {
            onFinished(this as T);
        }
    }
        
    private void Start()
    {
        m_HasStarted = true;
        OnStart();
        if (onStart != null)
        {
            onStart(this as T);
        }
    }
}
