using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using Microsoft.Azure.SpatialAnchors.Unity.Examples;

public class SelectionManipulator : Manipulator
{
    /// <summary>
    /// The visualization game object that will become active when the object is selected.
    /// </summary>
    public GameObject SelectionVisualization;
    private GameObject Canvas;
    

    private float m_ScaledElevation;

    /// <summary>
    /// Should be called when the object elevation changes, to make sure that the Selection
    /// Visualization remains always at the plane level. This is the elevation that the object
    /// has, independently of the scale.
    /// </summary>
    /// <param name="elevation">The current object's elevation.</param>
    public void OnElevationChanged(float elevation)
    {
        m_ScaledElevation = elevation * transform.localScale.y;
        SelectionVisualization.transform.localPosition = new Vector3(0, -elevation, 0);
    }

    /// <summary>
    /// Should be called when the object elevation changes, to make sure that the Selection
    /// Visualization remains always at the plane level. This is the elevation that the object
    /// has multiplied by the local scale in the y coordinate.
    /// </summary>
    /// <param name="scaledElevation">The current object's elevation scaled with the local y
    /// scale.</param>
    public void OnElevationChangedScaled(float scaledElevation)
    {
        m_ScaledElevation = scaledElevation;
        SelectionVisualization.transform.localPosition =
            new Vector3(0, -scaledElevation / transform.localScale.y, 0);
    }

    /// <summary>
    /// The Unity Update() method.
    /// </summary>
    protected override void Update()
    {
        base.Update();
        if (transform.hasChanged)
        {
            float height = -m_ScaledElevation / transform.localScale.y;
            SelectionVisualization.transform.localPosition = new Vector3(0, height, 0);
        }
    }

    private void Start()
    {
        Canvas = XRUXPickerForSharedAnchorDemo.Instance.MobileAndEditorUXTree; 
    }

    /// <summary>
    /// Returns true if the manipulation can be started for the given gesture.
    /// </summary>
    /// <param name="gesture">The current gesture.</param>
    /// <returns>True if the manipulation can be started.</returns>
    protected override bool CanStartManipulationForGesture(TapGesture gesture)
    {
        return true;
    }

    /// <summary>
    /// Function called when the manipulation is ended.
    /// </summary>
    /// <param name="gesture">The current gesture.</param>
    protected override void OnEndManipulation(TapGesture gesture)
    {
        if (gesture.WasCancelled)
        {
            return;
        }

        if (ManipulationSystem.Instance == null)
        {
            return;
        }

        GameObject target = gesture.TargetObject;
        if (target == gameObject)
        {
            Select();
        }

        // Raycast against the location the player touched to search for planes.
        List<ARRaycastHit> aRRaycastHits = new List<ARRaycastHit>();
        TrackableType trackableTypeMask = TrackableType.PlaneWithinPolygon;
        ManipulationSystem.Instance.arRayCastManager.Raycast(gesture.StartPosition, aRRaycastHits, trackableTypeMask);

        // if there is no hit and not touching a ui button

        GraphicRaycaster gr = Canvas.GetComponent<GraphicRaycaster>();
        PointerEventData ped = new PointerEventData(null);
        ped.position = gesture.StartPosition;
        List<RaycastResult> results = new List<RaycastResult>();
        gr.Raycast(ped, results);

        if (results.Count == 0)
        {
            Debug.Log("Hit not detected on UI");
            if (aRRaycastHits.Count == 0)
            {
                Debug.Log("Hit not detected on plane");
                Deselect();
            }
        }
    }

    /// <summary>
    /// Function called when this game object is deselected if it was the Selected Object.
    /// </summary>
    protected override void OnSelected()
    {
        Debug.Log("Selection visualisation selected");
        SelectionVisualization.SetActive(true);
    }

    /// <summary>
    /// Function called when this game object is deselected if it was the Selected Object.
    /// </summary>
    protected override void OnDeselected()
    {
        SelectionVisualization.SetActive(false);
    }
}
