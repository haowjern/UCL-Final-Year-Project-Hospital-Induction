// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using UnityEngine.EventSystems;

namespace Microsoft.Azure.SpatialAnchors.Unity.Examples
{
    public abstract class ArAppScriptBase : Manipulator
    {
        #region Member Variables
        /// <summary>
        /// Manipulator prefab to attach placed objects to.
        /// </summary>
        public GameObject ManipulatorPrefab;
        public GameObject AddAssetManager; // to get its assetservice script
        public GameObject Canvas;
        private Task advanceTask = null;
        protected DatabaseService service; 
        protected bool isErrorActive = false;
        protected Text feedbackBox;
        protected readonly List<string> anchorIdsToLocate = new List<string>();
        protected AnchorLocateCriteria anchorLocateCriteria = null;
        protected CloudSpatialAnchor currentCloudAnchor;
        protected CloudSpatialAnchorWatcher currentWatcher;
        protected GameObject m_spawnedObject = null;
        protected GameObject spawnedObject
        {
            get
            {
                Debug.Log("Getting spawnedobject");
                Debug.Log("Getting Selected object");
                if (ManipulationSystem.Instance.SelectedObject != null)
                {
                    Debug.Log("Getting m_spawnedObject");
                    m_spawnedObject = ManipulationSystem.Instance.SelectedObject.transform.parent.gameObject; // anchor is set as a parent of the manipulator
     
                    if (m_spawnedObject != null)
                    {
                        if (!m_spawnedObject.TryGetComponent<AnchorModel>(out var temp))
                        {
                            Debug.Log("Selected object is not an anchor object");
                            m_spawnedObject = null; // only ensures spawnedObject are selected anchors
                        }
                        else
                        {
                            var tempObj = m_spawnedObject.GetComponent<AnchorModel>().anchor;
                            Debug.Log("Selected object is an anchor object with anchorNumber: " + tempObj.anchorNumber);
                        }
                    }
                } else
                {
                    m_spawnedObject = null;
                }
                
                return m_spawnedObject;
              
            }
            set
            {
                m_spawnedObject = value;
            }
        }
        protected Material spawnedObjectMat = null;
        protected List<GameObject> spawnedObjects = new List<GameObject>(); // list of manipulator objects, as deleting parent will also delete the child object
        #endregion // Member Variables

        #region Unity Inspector Variables
        [SerializeField]
        [Tooltip("The prefab used to represent an anchored object.")]
        private GameObject defaultAnchoredObjectPrefab = null;

        [SerializeField]
        [Tooltip("SpatialAnchorManager instance to use for this. This is required.")]
        private SpatialAnchorManager cloudManager = null;
        #endregion // Unity Inspector Variables

        /// <summary>
        /// Destroying the attached Behaviour will result in the game or Scene
        /// receiving OnDestroy.
        /// </summary>
        /// <remarks>OnDestroy will only be called on game objects that have previously been active.</remarks>
        public void OnDestroy()
        {
            if (CloudManager != null)
            {
                CloudManager.StopSession();
            }

            if (currentWatcher != null)
            {
                currentWatcher.Stop();
                currentWatcher = null;
            }

            // unload asset bundles, necessary to do so that it can be loaded again 
            var assetService = AddAssetManager.GetComponent<AssetService>();
            assetService.unloadExistingAssetBundles(); 

            CleanupSpawnedObjects();

            // Pass to base for final cleanup
        }

        protected override void Update()
        {
            base.Update();
        }

        public virtual bool SanityCheckAccessConfiguration()
        {
            if (string.IsNullOrWhiteSpace(CloudManager.SpatialAnchorsAccountId) || string.IsNullOrWhiteSpace(CloudManager.SpatialAnchorsAccountKey))
            {
                return false;
            }

            return true;
        }

        /// <summary>
        /// Start is called on the frame when a script is enabled just before any
        /// of the Update methods are called the first time.
        /// </summary>
        public virtual void Start()
        {
            service = DatabaseService.Instance;

            feedbackBox = XRUXPicker.Instance.GetFeedbackText();
            if (feedbackBox == null)
            {
                Debug.Log($"{nameof(feedbackBox)} not found in scene by XRUXPicker.");
                Destroy(this);
                return;
            }

            if (CloudManager == null)
            {
                Debug.Break();
                feedbackBox.text = $"{nameof(CloudManager)} reference has not been set. Make sure it has been added to the scene and wired up to {this.name}.";
                return;
            }

            if (!SanityCheckAccessConfiguration())
            {
                feedbackBox.text = $"{nameof(SpatialAnchorManager.SpatialAnchorsAccountId)} and {nameof(SpatialAnchorManager.SpatialAnchorsAccountKey)} must be set on {nameof(SpatialAnchorManager)}";
            }


            if (DefaultAnchoredObjectPrefab == null)
            {
                Debug.LogError("Defaultanchoredobjectprefab must be set");
                feedbackBox.text = "CreationTarget must be set on the  script.";
                return;
            }

            CloudManager.SessionUpdated += CloudManager_SessionUpdated;
            CloudManager.AnchorLocated += CloudManager_AnchorLocated;
            CloudManager.LocateAnchorsCompleted += CloudManager_LocateAnchorsCompleted;
            CloudManager.LogDebug += CloudManager_LogDebug;
            CloudManager.Error += CloudManager_Error;

            anchorLocateCriteria = new AnchorLocateCriteria();
        }

        /// <summary>
        /// Advances .
        /// </summary>
        /// <returns>
        /// A <see cref="Task"/> that represents the operation.
        /// </returns>
        public abstract Task AdvanceAsync();

        /// <summary>
        /// This version only exists for Unity to wire up a button click to.
        /// If calling from code, please use the Async version above.
        /// </summary>
        public async void Advance()
        {
            try
            {
                Debug.Log("Button Pressed, advance !");
                await AdvanceAsync();
            }
            catch (Exception ex)
            {
                Debug.LogError($"{nameof(ArAppScriptBase)} - Error in {nameof(Advance)}: {ex.Message} {ex.StackTrace}");
                feedbackBox.text = $" failed, check debugger output for more information";
            }
        }

        /// <summary>
        /// returns to the launcher scene.
        /// </summary>
        public virtual async void ReturnToLauncher()
        {
            // If AdvanceAsync is still running from the gesture handler,
            // wait for it to complete before returning to the launcher.
            if (advanceTask != null) { await advanceTask; }

            // Return to the launcher scene
            SceneManager.LoadScene(0);
        }

        protected void CleanupSpawnedObject()
        {
            if (spawnedObject != null)
            {
                Destroy(spawnedObject);
                spawnedObject = null;
            }

            if (spawnedObjectMat != null)
            {
                Destroy(spawnedObjectMat);
                spawnedObjectMat = null;
            }
        }

        /// <summary>
        /// Cleans up spawned objects.
        /// </summary>
        protected virtual void CleanupSpawnedObjects()
        {

            for (int i = spawnedObjects.Count - 1; i >= 0; i--)
            {
                Destroy(spawnedObjects[i]);
            }

            spawnedObjects.Clear();

            if (spawnedObject != null)
            {
                Destroy(spawnedObject);
                spawnedObject = null;
            }

            if (spawnedObjectMat != null)
            {
                Destroy(spawnedObjectMat);
                spawnedObjectMat = null;
            }
        }

        protected CloudSpatialAnchorWatcher CreateWatcher()
        {
            if ((CloudManager != null) && (CloudManager.Session != null))
            {
                return CloudManager.Session.CreateWatcher(anchorLocateCriteria);
            }
            else
            {
                return null;
            }
        }

        protected void SetAnchorIdsToLocate(IEnumerable<string> anchorIds)
        {
            Debug.Log("Setting anchor ids to locate...");
            if (anchorIds == null)
            {
                throw new ArgumentNullException(nameof(anchorIds));
            }

            anchorIdsToLocate.Clear();
            anchorIdsToLocate.AddRange(anchorIds);
            Debug.Log("Setting anchorlocatecriteria identfiers...");
            Debug.Log("anchorLocateCriteria.Identifiers" + anchorLocateCriteria.Identifiers);
            Debug.Log("anchorIdsToLocate.ToArray()" + anchorIdsToLocate.ToArray());
            anchorLocateCriteria.Identifiers = anchorIdsToLocate.ToArray();
        }

        protected void ResetAnchorIdsToLocate()
        {
            anchorIdsToLocate.Clear();
            anchorLocateCriteria.Identifiers = new string[0];
        }

        protected void SetNearbyAnchor(CloudSpatialAnchor nearbyAnchor, float DistanceInMeters, int MaxNearAnchorsToFind)
        {
            if (nearbyAnchor == null)
            {
                anchorLocateCriteria.NearAnchor = new NearAnchorCriteria();
                return;
            }

            NearAnchorCriteria nac = new NearAnchorCriteria();
            nac.SourceAnchor = nearbyAnchor;
            nac.DistanceInMeters = DistanceInMeters;
            nac.MaxResultCount = MaxNearAnchorsToFind;
            anchorLocateCriteria.NearAnchor = nac;
        }

        protected void SetGraphEnabled(bool UseGraph, bool JustGraph = false)
        {
            anchorLocateCriteria.Strategy = UseGraph ?
                                            (JustGraph ? LocateStrategy.Relationship : LocateStrategy.AnyStrategy) :
                                            LocateStrategy.VisualInformation;
        }

        /// <summary>
        /// Bypassing the cache will force new queries to be sent for objects, allowing
        /// for refined poses over time.
        /// </summary>
        /// <param name="BypassCache"></param>
        public void SetBypassCache(bool BypassCache)
        {
            anchorLocateCriteria.BypassCache = BypassCache;
        }


        /// <summary>
        /// Gets the color of the current  step.
        /// </summary>
        /// <returns><see cref="Color"/>.</returns>
        protected abstract Color GetStepColor();

        /// <summary>
        /// Determines whether the  is in a mode that should place an object for an anchor
        /// </summary>
        /// <returns><c>true</c> to place; otherwise, <c>false</c>.</returns>
        protected abstract bool IsCreatingAnchorObject();

        /// <summary>
        /// Moves the specified anchored object.
        /// </summary>
        /// <param name="objectToMove">The anchored object to move.</param>
        /// <param name="worldPos">The world position.</param>
        /// <param name="worldRot">The world rotation.</param>
        /// <param name="cloudSpatialAnchor">The cloud spatial anchor.</param>
        public static void MoveObject(GameObject objectToMove, Vector3 worldPos, Quaternion worldRot, CloudSpatialAnchor cloudSpatialAnchor = null)
        {
            // Get the cloud-native anchor behavior
            Debug.Log("Getting cloud native anchor");
            CloudNativeAnchor cna = objectToMove.GetComponent<CloudNativeAnchor>();

            // Warn and exit if the behavior is missing
            if (cna == null)
            {
                Debug.LogWarning($"The object {objectToMove.name} is missing the {nameof(CloudNativeAnchor)} behavior.");
                return;

            }
            // Is there a cloud anchor to apply
            if (cloudSpatialAnchor != null)
            {
                // Yes. Apply the cloud anchor, which also sets the pose.
                cna.CloudToNative(cloudSpatialAnchor);
            }
            else
            {
                Debug.Log("Set pose");
                // No. Just set the pose, this is the spawned object's pose. 
                cna.SetPose(worldPos, worldRot);
            }
        }

        /// <summary>
        /// Called when a cloud anchor is located.
        /// </summary>
        /// <param name="args">The <see cref="AnchorLocatedEventArgs"/> instance containing the event data.</param>
        protected virtual void OnCloudAnchorLocated(AnchorLocatedEventArgs args)
        {
            // To be overridden.
        }

        /// <summary>
        /// Called when cloud anchor location has completed.
        /// </summary>
        /// <param name="args">The <see cref="LocateAnchorsCompletedEventArgs"/> instance containing the event data.</param>
        protected virtual void OnCloudLocateAnchorsCompleted(LocateAnchorsCompletedEventArgs args)
        {
            Debug.Log("Locate pass complete");
        }

        /// <summary>
        /// Called when the current cloud session is updated.
        /// </summary>
        protected virtual void OnCloudSessionUpdated()
        {
            // To be overridden.
        }

        /// <summary>
        /// Called when a cloud anchor is not saved successfully.
        /// </summary>
        /// <param name="exception">The exception.</param>
        protected virtual void OnSaveCloudAnchorFailed(Exception exception)
        {
            // we will block the next step to show the exception message in the UI.
            isErrorActive = true;
            Debug.LogException(exception);
            Debug.Log("Failed to save anchor " + exception.ToString());

            UnityDispatcher.InvokeOnAppThread(() => this.feedbackBox.text = string.Format("Error: {0}", exception.ToString()));
        }

        protected void OnDeleteCloudAnchorFailed(Exception exception)
        {
            // we will block the next step to show the exception message in the UI.
            isErrorActive = true;
            Debug.LogException(exception);
            Debug.Log("Failed to delete anchor " + exception.ToString());

            UnityDispatcher.InvokeOnAppThread(() => this.feedbackBox.text = string.Format("Error: {0}", exception.ToString()));
        }

        /// <summary>
        /// Called when a cloud anchor is saved successfully.
        /// </summary>
        protected virtual Task OnSaveCloudAnchorSuccessfulAsync()
        {
            // To be overridden.
            return Task.CompletedTask;
        }

        protected virtual Task OnDeleteCloudAnchorSuccessfulAsync()
        {
            // To be overridden
            return Task.CompletedTask;
        }

        /// <summary>
        /// Saves the current object anchor to the cloud.
        /// </summary>
        protected virtual async Task SaveCurrentObjectAnchorToCloudAsync()
        {
            // Get the cloud-native anchor behavior
            Debug.Log("Saving current object to cloud");
            Debug.Log("Getting cloudnative anchor");
            CloudNativeAnchor cna = spawnedObject.GetComponent<CloudNativeAnchor>();
            Debug.Log("Received cloud native anchor");

            // If the cloud portion of the anchor hasn't been created yet, create it
            if (cna.CloudAnchor == null) { cna.NativeToCloud(); }

            // Get the cloud portion of the anchor
            CloudSpatialAnchor cloudAnchor = cna.CloudAnchor;

            // if updating (anchor selected already has anchor information, e.g. anchorNumber 
            var existingAnchor = spawnedObject.GetComponent<AnchorModel>().anchor;
            if (existingAnchor.anchorNumber > 0)
            {
                Debug.Log("If updating anchor...: " + existingAnchor.anchorNumber);
                // Delete from cloud and anchor database
                await DeleteCurrentObjectAnchorToCloudAsync(); 
            }

            // No expiration
            cloudAnchor.Expiration = DateTimeOffset.Now.AddDays(2); // to be removed

            Debug.Log("Checking if cloudmanager is ready to create");
            while (!CloudManager.IsReadyForCreate)
            {
                await Task.Delay(330);
                float createProgress = CloudManager.SessionStatus.RecommendedForCreateProgress;
                feedbackBox.text = $"Move your device to capture more environment data: {createProgress:0%}";
            }

            bool success = false;

            Debug.Log("saving...");
            feedbackBox.text = "Saving...";

            try
            {
                // Actually save
                await CloudManager.CreateAnchorAsync(cloudAnchor);

                // Store
                currentCloudAnchor = cloudAnchor;
                spawnedObject.GetComponent<AnchorModel>().currentCloudAnchor = cloudAnchor;

                // Success?
                success = currentCloudAnchor != null;

                if (success && !isErrorActive)
                {
                    // Await override, which may perform additional tasks
                    // such as storing the key in the AnchorExchanger
                    await OnSaveCloudAnchorSuccessfulAsync();
                }
                else
                {
                    OnSaveCloudAnchorFailed(new Exception("Failed to save, but no exception was thrown."));
                }
            }
            catch (Exception ex)
            {
                OnSaveCloudAnchorFailed(ex);
            }
        }

        protected async Task DeleteCurrentObjectAnchorToCloudAsync()
        {
            feedbackBox.text = "Deleting...";
            try
            {
                await cloudManager.DeleteAnchorAsync(currentCloudAnchor);
                await OnDeleteCloudAnchorSuccessfulAsync();

            }
            catch (Exception ex)
            {
                OnDeleteCloudAnchorFailed(ex);
            }
        }

        /// <summary>
        /// Spawns a new anchored object.
        /// </summary>
        /// <param name="worldPos">The world position.</param>
        /// <param name="worldRot">The world rotation.</param>
        /// <returns><see cref="GameObject"/>.</returns>
        public virtual GameObject SpawnNewAnchoredObject(Vector3 worldPos, Quaternion worldRot, Asset toSpawnAsset = null)
        {

            Debug.Log("Creating empty game object");
            // Create game object to hold anchor
            GameObject emptyGo = new GameObject();
            GameObject newGameObject = Instantiate(emptyGo, worldPos, worldRot); // initially was empty object

            MeshRenderer tempMeshR;
            if (newGameObject.TryGetComponent<MeshRenderer>(out tempMeshR)) {
                Destroy(newGameObject.GetComponent<BoxCollider>());
                tempMeshR.material.color = Color.black;
            }

            Debug.Log("Adding cloud native anchor");
            // Attach a cloud-native anchor behavior to help keep cloud
            // and native anchors in sync.
            newGameObject.AddComponent<CloudNativeAnchor>();

            // Add Anchor
            newGameObject.AddComponent<AnchorModel>();

            // Instantiate manipulator.
            Debug.Log("Manipulator prefab instantiating..");
            var manipulator = Instantiate(ManipulatorPrefab, worldPos, worldRot);
            // note that there are no 'anchor objects attached', may affect code, but don't think so. 

            // Make manipulator a child of the anchor
            manipulator.transform.SetParent(newGameObject.transform);

            // Select the placed object.
            manipulator.GetComponent<Manipulator>().Select();

            Debug.Log("Getting anchored asset prefab");
            // Get Anchored Asset Prefab 
            GameObject toSpawnPrefab = DefaultAnchoredObjectPrefab;
            if (toSpawnAsset == null)
            {
                if (IsCreatingAnchorObject()) // ensures that during locating an anchor, it won't replace the null anchored asset
                {
                    var assetService = AddAssetManager.GetComponent<AssetService>();
                    if (assetService.getAssetPrefab() != null)
                    {
                        Debug.Log("Setting anchored asset, assetid");
                        toSpawnPrefab = assetService.getAssetPrefab();
                        toSpawnPrefab.AddComponent<CapsuleCollider>();
                        //Camera.main.
                        //Camera.main.orthographicSize * 2.0 * Screen.width / Screen.height;
                        //var desiredWidth = Screen.width / Screen.dpi; // pixels to inches
                        toSpawnPrefab.transform.localScale = new Vector3(0.2f, 0.2f, 0.2f);

                        // for every child component 
                        foreach (Transform child in toSpawnPrefab.transform)
                        {
                            if (child.TryGetComponent<MeshRenderer>(out var meshR))
                            {
                                if (meshR.gameObject.activeSelf)
                                {
                                    var meshC = child.transform.gameObject.AddComponent<BoxCollider>(); // add a mesh collider so it can detect ray casts
                                }
                            }
                        }
                        newGameObject.GetComponent<AnchorModel>().anchoredAsset.assetID = assetService.getSelectedAsset().assetID;
                    }
                }    
            }
            else
            {
                Debug.Log("toSpawnAsset is not null");
            }

            Debug.Log("Instantiating asset prefab...");
            // Instantiate asset
            GameObject newAsset = Instantiate(toSpawnPrefab, worldPos, worldRot);
            newAsset.transform.rotation *= Quaternion.Euler(0, 180f, 0); // flip it so that it faces the correct direction, due to hit rotation

            Debug.Log("Setting color");
            // Set the color
            if (toSpawnPrefab == DefaultAnchoredObjectPrefab)
            {
                newAsset.GetComponent<MeshRenderer>().material.color = GetStepColor();
            }

            // Make asset a child of the manipulator 
            newAsset.transform.SetParent(manipulator.transform);

            if (toSpawnAsset != null)
            {
                // unity will get the correct asset to be loaded from the asset bundle
                StartCoroutine(AddAssetManager.GetComponent<AssetService>().GetAssetPrefab(toSpawnAsset, newAsset));
            }

            spawnedObjects.Add(newGameObject);

            // Return created object
            return newGameObject;
        }

        /// <summary>
        /// Spawns a new object.
        /// </summary>
        /// <param name="worldPos">The world position.</param>
        /// <param name="worldRot">The world rotation.</param>
        /// <param name="cloudSpatialAnchor">The cloud spatial anchor.</param>
        /// <returns><see cref="GameObject"/>.</returns>
        protected virtual GameObject SpawnNewAnchoredObject(Vector3 worldPos, 
                                                            Quaternion worldRot, 
                                                            CloudSpatialAnchor cloudSpatialAnchor,
                                                            Anchor existingAnchor = null,
                                                            AnchoredAsset existingAnchoredAsset = null,
                                                            Asset existingAsset = null)
        {
            // Create the object like usual
            GameObject newGameObject = SpawnNewAnchoredObject(worldPos, worldRot, existingAsset);

            // If a cloud anchor is passed, apply it to the native anchor
            if (cloudSpatialAnchor != null)
            {
                CloudNativeAnchor cloudNativeAnchor = newGameObject.GetComponent<CloudNativeAnchor>();
                cloudNativeAnchor.CloudToNative(cloudSpatialAnchor);
            }

            if (existingAnchor != null)
            {
                var anchorModel = newGameObject.GetComponent<AnchorModel>();
                anchorModel.anchor = existingAnchor;
                anchorModel.currentCloudAnchor = cloudSpatialAnchor;

                if (existingAnchoredAsset != null)
                {
                    anchorModel.anchoredAsset = existingAnchoredAsset;
                }
            }


            // Return newly created object
            return newGameObject;
        }

        private void CloudManager_AnchorLocated(object sender, AnchorLocatedEventArgs args)
        {
            Debug.LogFormat("Anchor recognized as a possible anchor {0} {1}", args.Identifier, args.Status);
            if (args.Status == LocateAnchorStatus.Located)
            {
                OnCloudAnchorLocated(args);
            }
        }
         
        private void CloudManager_LocateAnchorsCompleted(object sender, LocateAnchorsCompletedEventArgs args)
        {
            OnCloudLocateAnchorsCompleted(args);
        }

        private void CloudManager_SessionUpdated(object sender, SessionUpdatedEventArgs args)
        {
            OnCloudSessionUpdated();
        }

        private void CloudManager_Error(object sender, SessionErrorEventArgs args)
        {
            isErrorActive = true;
            Debug.Log(args.ErrorMessage);

            UnityDispatcher.InvokeOnAppThread(() => this.feedbackBox.text = string.Format("Error: {0}", args.ErrorMessage));
        }

        private void CloudManager_LogDebug(object sender, OnLogDebugEventArgs args)
        {
            Debug.Log(args.Message);
        }

        protected struct StepParams
        {
            public Color StepColor { get; set; }
            public string StepMessage { get; set; }
        }

        /// <summary>
        /// Returns true if the manipulation can be started for the given gesture.
        /// </summary>
        /// <param name="gesture">The current gesture.</param>
        /// <returns>True if the manipulation can be started.</returns>
        protected override bool CanStartManipulationForGesture(TapGesture gesture)
        {
            if (gesture.TargetObject == null)
            {
                return true;
            }

            return false;
        }

        /// <summary>
        /// Function called when the manipulation is ended.
        /// </summary>
        /// <param name="gesture">The current gesture.</param>
        protected override void OnEndManipulation(TapGesture gesture)
        {
            if (gesture.WasCancelled)
            {
                Debug.Log("Gesture was cancelled");
                return;
            }

            // If gesture is targeting an existing object we are done.
            if (gesture.TargetObject != null)
            {
                Debug.Log("Gesture is targeting existing object");
                return;
            }

            // if there is no hit and not touching a ui button

            GraphicRaycaster gr = Canvas.GetComponent<GraphicRaycaster>();
            PointerEventData ped = new PointerEventData(null);
            ped.position = gesture.StartPosition;
            List<RaycastResult> results = new List<RaycastResult>();
            gr.Raycast(ped, results);

            if (results.Count > 0)
            {
                Debug.Log("Gesture is targeting UI");
                return;
            }

            // Create object
            // Raycast against the location the player touched to search for planes.
            List<ARRaycastHit> aRRaycastHits = new List<ARRaycastHit>();
            TrackableType trackableTypeMask = TrackableType.PlaneWithinPolygon;

            if (ManipulationSystem.Instance.arRayCastManager.Raycast(gesture.StartPosition, aRRaycastHits, trackableTypeMask) && aRRaycastHits.Count > 0)
            {
                ARRaycastHit hit = aRRaycastHits[0];
                Debug.Log("Getting manipulation system instance");
                ARPlane plane = ManipulationSystem.Instance.arPlaneManager.GetPlane(hit.trackableId);
                // Use hit pose and camera pose to check if hittest is from the
                // back of the plane, if it is, no need to create the anchor.

                Debug.Log("Checking if statement");
                if (plane && Vector3.Dot(Camera.main.transform.position - hit.pose.position, hit.pose.rotation * Vector3.up) < 0)
                {
                    Debug.Log("Hit at back of the current DetectedPlane");
                }
                else
                {
                    Debug.Log("Instantiating model");
                    // Instantiate model at the hit pose.
                    if (IsCreatingAnchorObject())
                    {
                        var currentObject = SpawnNewAnchoredObject(hit.pose.position, hit.pose.rotation); // rotation was Quaternion rotation = Quaternion.AngleAxis(0, Vector3.up);
                    }
                }
            }
        }


        #region Public Properties
        /// <summary>
        /// Gets the prefab used to represent an anchored object.
        /// </summary>
        public GameObject DefaultAnchoredObjectPrefab { get { return defaultAnchoredObjectPrefab; } }

        /// <summary>
        /// Gets the <see cref="SpatialAnchorManager"/> instance used by this .
        /// </summary>
        public SpatialAnchorManager CloudManager { get { return cloudManager; } }
        #endregion // Public Properties
    }
}
