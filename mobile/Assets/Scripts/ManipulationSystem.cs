using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using Microsoft.Azure.SpatialAnchors.Unity.Examples;

/// <summary>
/// Manipulation system allows the user to manipulate virtual objects (select, translate,
/// rotate, scale and elevate) through gestures (tap, drag, twist, swipe).
/// Manipulation system also handles the current selected object and its visualization.
///
/// To enable it add one ManipulationSystem to your scene and one Manipulator as parent of each
/// of your virtual objects.
/// </summary>
/// 
/// inspired by ARCORE's sample

public class ManipulationSystem : MonoBehaviour
{
    public GameObject CameraParent;

    private static ManipulationSystem s_Instance = null;

    private ARRaycastManager m_arRaycastManager; // arraycastmanager must be inside an ARSessionOrigin, so during Awake will search for it
    private ARPlaneManager m_arPlaneManager;

    private DragGestureRecognizer m_DragGestureRecognizer = new DragGestureRecognizer();

    private TapGestureRecognizer m_TapGestureRecognizer = new TapGestureRecognizer();

    private PinchGestureRecognizer m_PinchGestureRecognizer = new PinchGestureRecognizer();

    private TwoFingerDragGestureRecognizer m_TwoFingerDragGestureRecognizer = new TwoFingerDragGestureRecognizer();

    private TwistGestureRecognizer m_TwistGestureRecognizer = new TwistGestureRecognizer();

    public static ManipulationSystem Instance
    {
        get
        {
            if (s_Instance == null)
            {
                var manipulationSystems = FindObjectsOfType<ManipulationSystem>();
                if (manipulationSystems.Length > 0)
                {
                    s_Instance = manipulationSystems[0];
                }
                else
                {
                    Debug.LogError("No instance of ManipulationSystem exists in the scene.");
                }
            }

            return s_Instance;
        }
    }

    public ARRaycastManager arRayCastManager
    {
        get
        {
            return m_arRaycastManager;
        }
    }

    public ARPlaneManager arPlaneManager
    {
        get
        {
            return m_arPlaneManager;
        }
    }

    /// <summary>
    /// Gets the Drag gesture recognizer.
    /// </summary>
    public DragGestureRecognizer DragGestureRecognizer
    {
        get
        {
            return m_DragGestureRecognizer;
        }
    }

    /// <summary>
    /// Gets the Tap gesture recognizer.
    /// </summary>
    public TapGestureRecognizer TapGestureRecognizer
    {
        get
        {
            return m_TapGestureRecognizer;
        }
    }

    /// <summary>
    /// Gets the Pinch gesture recognizer.
    /// </summary>
    public PinchGestureRecognizer PinchGestureRecognizer
    {
        get
        {
            return m_PinchGestureRecognizer;
        }
    }

    /// <summary>
    /// Gets the Twist gesture recognizer.
    /// </summary>
    public TwistGestureRecognizer TwistGestureRecognizer
    {
        get
        {
            return m_TwistGestureRecognizer;
        }
    }

    /// <summary>
    /// Gets the two finger drag gesture recognizer.
    /// </summary>
    public TwoFingerDragGestureRecognizer TwoFingerDragGestureRecognizer
    {
        get
        {
            return m_TwoFingerDragGestureRecognizer;
        }
    }

    /// <summary>
    /// Gets the current selected object.
    /// </summary>
    public GameObject SelectedObject { get; private set; }

    /// <summary>
    /// The Unity Awake() method.
    /// </summary>
    public void Awake()
    {
        Debug.Log("Awake Manipulation System");
        if (Instance != this)
        {
            Debug.LogWarning("Multiple instances of ManipulationSystem detected in the scene." +
                             " Only one instance can exist at a time. The duplicate instances" +
                             " will be destroyed.");
            DestroyImmediate(gameObject);
            return;
        }

        //Debug.Log("Dont destroy on load");
        //DontDestroyOnLoad(gameObject);
    }

    public void Start()
    {
        Debug.Log("CameraParent");
        var abc = CameraParent;

        Debug.Log("Get XR Camera Picker");
        var bcd = CameraParent.GetComponent<XRCameraPicker>();

        Debug.Log("Get Selected Camera");
        var cameraTree = CameraParent.GetComponent<XRCameraPicker>().getSelectedCamera();

        if (cameraTree == null)
        {
            Debug.Log("Missing Camera Tree Object");
        }

        Debug.Log("Get arraycast manager");
        m_arRaycastManager = cameraTree.GetComponent<ARRaycastManager>();

        if (m_arRaycastManager == null)
        {
            Debug.Log("Missing ARRaycastManager in scene");
        }
        else
        {
            Debug.Log("Found ARRaycastManager");
        }

        Debug.Log("Get arplanemanager");
        m_arPlaneManager = cameraTree.GetComponent<ARPlaneManager>();
        if (m_arPlaneManager == null)
        {
            Debug.Log("Missing ARPlaneManager in scene");
        }
        else
        {
            Debug.Log("Found ARPlaneManager");
        }
    }

    /// <summary>
    /// The Unity Update() method.
    /// </summary>
    public void Update()
    {
        DragGestureRecognizer.Update();
        TapGestureRecognizer.Update();
        PinchGestureRecognizer.Update();
        TwoFingerDragGestureRecognizer.Update();
        TwistGestureRecognizer.Update();
    }

    /// <summary>
    /// Deselects the selected object if any.
    /// </summary>
    internal void Deselect()
    {
        SelectedObject = null;
    }

    /// <summary>
    /// Select an object.
    /// </summary>
    /// <param name="target">The object to select.</param>
    internal void Select(GameObject target)
    {
        if (SelectedObject == target)
        {
            return;
        }

        Deselect();
        SelectedObject = target;
    }
}
