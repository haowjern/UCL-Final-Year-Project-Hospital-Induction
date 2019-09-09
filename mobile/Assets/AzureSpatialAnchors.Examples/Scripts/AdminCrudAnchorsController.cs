// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
using System.Linq;
using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using System.Threading.Tasks;

namespace Microsoft.Azure.SpatialAnchors.Unity.Examples
{
    public class AdminCrudAnchorsController : ArAppScriptBase
    {
        internal enum AppState
        {
            StepChooseFlow = 0,
            StepInputAnchorNumber,
            StepCreateSession,
            StepConfigSession,
            StepStartSession,
            StepCreateLocalAnchor,
            StepSaveCloudAnchor,
            StepSavingCloudAnchor,
            StepStopSession,
            StepDestroySession,
            StepCreateSessionForQuery,
            StepStartSessionForQuery,
            StepLookForAnchor,
            StepLookingForAnchor,
            StepLookedForAnchor,
            StepDeletedAnchor,
            StepStopSessionForQuery,
            StepComplete,
        }

        internal enum Flow
        {
            CreateFlow = 0,
            LocateFlow
        }

        private readonly Dictionary<AppState, StepParams> stateParams = new Dictionary<AppState, StepParams>
        {
            { AppState.StepChooseFlow,new StepParams() { StepMessage = "Next: Start your flow", StepColor = Color.clear }},
            { AppState.StepInputAnchorNumber,new StepParams() { StepMessage = "Next: Input anchor number", StepColor = Color.clear }},
            { AppState.StepCreateSession,new StepParams() { StepMessage = "Next: Create CloudSpatialAnchorSession", StepColor = Color.clear }},
            { AppState.StepConfigSession,new StepParams() { StepMessage = "Next: Configure CloudSpatialAnchorSession", StepColor = Color.clear }},
            { AppState.StepStartSession,new StepParams() { StepMessage = "Next: Start CloudSpatialAnchorSession", StepColor = Color.clear }},
            { AppState.StepCreateLocalAnchor,new StepParams() { StepMessage = "Tap a surface to add the local anchor.", StepColor = Color.blue }},
            { AppState.StepSaveCloudAnchor,new StepParams() { StepMessage = "Next: Save local anchor to cloud", StepColor = Color.yellow }},
            { AppState.StepDeletedAnchor, new StepParams() { StepMessage = "Next: Create local anchor", StepColor = Color.yellow }},
            { AppState.StepSavingCloudAnchor,new StepParams() { StepMessage = "Saving local anchor to cloud...", StepColor = Color.yellow }},
            { AppState.StepStopSession,new StepParams() { StepMessage = "Next: Stop cloud anchor session", StepColor = Color.green }},
            { AppState.StepDestroySession,new StepParams() { StepMessage = "Next: Destroy Cloud Anchor session", StepColor = Color.clear }},
            { AppState.StepCreateSessionForQuery,new StepParams() { StepMessage = "Next: Create CloudSpatialAnchorSession for query", StepColor = Color.clear }},
            { AppState.StepStartSessionForQuery,new StepParams() { StepMessage = "Next: Start CloudSpatialAnchorSession for query", StepColor = Color.clear }},
            { AppState.StepLookForAnchor,new StepParams() { StepMessage = "Next: Look for anchor", StepColor = Color.clear }},
            { AppState.StepLookingForAnchor,new StepParams() { StepMessage = "Looking for anchor..press next to stop looking.", StepColor = Color.clear }},
            { AppState.StepLookedForAnchor,new StepParams() { StepMessage = "Looked for anchor...", StepColor = Color.clear }},
            { AppState.StepStopSessionForQuery,new StepParams() { StepMessage = "Next: Stop CloudSpatialAnchorSession for query", StepColor = Color.yellow }},
            { AppState.StepComplete,new StepParams() { StepMessage = "Next: Restart ", StepColor = Color.clear }}
        };

        //#if !UNITY_EDITOR
        public AnchorExchanger anchorExchanger = new AnchorExchanger();
        //#endif

        #region Member Variables
        private AppState _currentAppState = AppState.StepChooseFlow;
        private Flow _currentFlow = Flow.CreateFlow;
        private readonly List<GameObject> otherSpawnedObjects = new List<GameObject>();
        private int anchorsLocated = 0;
        private int anchorsExpected = 0;
        private readonly List<string> localAnchorIds = new List<string>();
        private string _anchorKeyToFind = null;
        private long? _anchorNumberToFind;
        private AnchorList anchorList; 
        #endregion // Member Variables

        #region Unity Inspector Variables
        [SerializeField]
        [Tooltip("The base URL for the example sharing service.")]
        private string baseSharingUrl = "";
        #endregion // Unity Inspector Variables

        private AppState currentAppState
        {
            get
            {
                return _currentAppState;
            }
            set
            {
                if (_currentAppState != value)
                {
                    Debug.LogFormat("State from {0} to {1}", _currentAppState, value);
                    _currentAppState = value;
                    if (spawnedObjectMat != null)
                    {
                        spawnedObjectMat.color = stateParams[_currentAppState].StepColor;
                    }

                    feedbackBox.text = stateParams[_currentAppState].StepMessage;
                    EnableCorrectUIControls();
                }
            }
        }

        protected override void OnCloudAnchorLocated(AnchorLocatedEventArgs args)
        {
            base.OnCloudAnchorLocated(args);

            if (args.Status == LocateAnchorStatus.Located)
            {
                //CloudSpatialAnchor nextCsa = args.Anchor;
                //currentCloudAnchor = args.Anchor;

                UnityDispatcher.InvokeOnAppThread(async () =>
                {
                    CloudSpatialAnchor nextCsa = args.Anchor;
                    currentCloudAnchor = args.Anchor;

                    anchorsLocated++;
                    Debug.Log("Anchor located! Total anchors located: " + anchorsLocated);
                    currentCloudAnchor = nextCsa;
                    Pose anchorPose = Pose.identity;

                    Debug.Log("Found anchor: " + nextCsa.Identifier);

                    #if UNITY_ANDROID || UNITY_IOS
                    anchorPose = nextCsa.GetPose();
#endif
                    // HoloLens: The position will be set based on the unityARUserAnchor that was located.

                    // Get anchor from anchorID (cloudIdentifier) 
                    Debug.Log("Retrieve anchor key with id");
                    AnchorList retrievedAnchorList = await anchorExchanger.RetrieveAnchorKeyWithId(nextCsa.Identifier);
                    Anchor retrievedAnchor = null;
                    AnchoredAsset retrievedAnchoredAsset = null;
                    Asset retrievedAsset= null;
                    Debug.Log("Check if retrieved anchorlist exists");
                    if (retrievedAnchorList.anchors.Length > 0)
                    {
                        Debug.Log("Retrievedanchorlist anchors length is: " + retrievedAnchorList.anchors.Length);
                        retrievedAnchor = retrievedAnchorList.anchors[0];
 

                        // Get anchored asset
                        Debug.Log("Getting anchored asset: with anchorNumber" + retrievedAnchor.anchorNumber);
                        Debug.Log("And Anchor key is: " + retrievedAnchor.anchorID);
                        AnchoredAssetList retrievedAnchoredAssetList = await service.GetAnchoredAssetWithAnchorNumber(retrievedAnchor.anchorNumber.ToString());

                        Debug.Log("Check if there is anchored asset");
                        if (retrievedAnchoredAssetList.anchoredAssets.Length > 0)
                        {
                            Debug.Log("Retrieved anchoredasset");
                            retrievedAnchoredAsset = retrievedAnchoredAssetList.anchoredAssets[0];

                            var assetService = AddAssetManager.GetComponent<AssetService>();
                            Debug.Log("Get asset prefab");
                            AssetList retrievedAssetList = await service.GetARAssetWithAssetID(retrievedAnchoredAsset.assetID.ToString());
                            if (retrievedAssetList.assets.Length > 0)
                            {
                                Debug.Log("Retrieved asset");
                                retrievedAsset = retrievedAssetList.assets[0];
                            }
                        }
                    }
                    Debug.Log("Spawning object with id: " + nextCsa.Identifier);
                    Debug.Log("Spawning object with anchor number: " + retrievedAnchor.anchorNumber);
                    GameObject nextObject = SpawnNewAnchoredObject(anchorPose.position,
                                                                    anchorPose.rotation,
                                                                    nextCsa,
                                                                    retrievedAnchor,
                                                                    retrievedAnchoredAsset,
                                                                    retrievedAsset);
                    if (nextObject.transform.GetChild(0).GetChild(0).TryGetComponent<MeshRenderer>(out var tempMesh))
                    {
                        spawnedObjectMat = tempMesh.material;
                    }

                    otherSpawnedObjects.Add(nextObject);

                    //if (anchorsLocated >= anchorsExpected)
                    //{
                    //    currentAppState = AppState.StepLookedForAnchor;
                    //}
                    // currentAppState = AppState.StepLookedForAnchor;
                });
            }
        }

        /// <summary>
        /// Start is called on the frame when a script is enabled just before any
        /// of the Update methods are called the first time.
        /// </summary>
        public override void Start()
        {
            base.Start();

            //var button = XRUXPickerForSharedAnchorDemo.Instance.GetSaveButton();
            //button.onClick.RemoveAllListeners();
            //button.onClick.AddListener(() =>
            //{
            //    currentAppState = AppState.StepSaveCloudAnchor;
            //});
            
            if (!SanityCheckAccessConfiguration())
            {
                XRUXPickerForSharedAnchorDemo.Instance.GetDemoButtons()[1].gameObject.SetActive(false);
                XRUXPickerForSharedAnchorDemo.Instance.GetDemoButtons()[0].gameObject.SetActive(false);
                XRUXPickerForSharedAnchorDemo.Instance.GetDemoInputField().gameObject.SetActive(false);
                return;
            }

            SpatialAnchorSamplesConfig samplesConfig = Resources.Load<SpatialAnchorSamplesConfig>("SpatialAnchorSamplesConfig");
            if (string.IsNullOrWhiteSpace(BaseSharingUrl) && samplesConfig != null)
            {
                BaseSharingUrl = samplesConfig.BaseSharingURL;
            }

            if (string.IsNullOrEmpty(BaseSharingUrl))
            {
                feedbackBox.text = $"Need to set {nameof(BaseSharingUrl)}.";
                XRUXPickerForSharedAnchorDemo.Instance.GetDemoButtons()[1].gameObject.SetActive(false);
                XRUXPickerForSharedAnchorDemo.Instance.GetDemoButtons()[0].gameObject.SetActive(false);
                XRUXPickerForSharedAnchorDemo.Instance.GetDemoInputField().gameObject.SetActive(false);
                return;
            }
            else
            {
                Uri result;
                if (!Uri.TryCreate(BaseSharingUrl, UriKind.Absolute, out result))
                {
                    feedbackBox.text = $"{nameof(BaseSharingUrl)} is not a valid url";
                    return;
                }
                else
                {
                    BaseSharingUrl = $"{result.Scheme}://{result.Host}/api/anchors";
                }
            }

            //#if !UNITY_EDITOR
            anchorExchanger.WatchKeys(BaseSharingUrl);
            //#endif

            feedbackBox.text = stateParams[currentAppState].StepMessage;

            Debug.Log("Azure Spatial Anchors Shared  script started");
            EnableCorrectUIControls();
        }

        /// <summary>
        /// Update is called every frame, if the MonoBehaviour is enabled.
        /// </summary>
        protected override void Update()
        {
            base.Update();

            if (spawnedObjectMat != null)
            {
                float rat = 0.1f;
                float createProgress = 0f;
                if (CloudManager.SessionStatus != null)
                {
                    createProgress = CloudManager.SessionStatus.RecommendedForCreateProgress;
                }
                rat += (Mathf.Min(createProgress, 1) * 0.9f);
                spawnedObjectMat.color = stateParams[currentAppState].StepColor * rat;
            }
        }

        protected override bool IsCreatingAnchorObject()
        {
            return currentAppState == AppState.StepCreateLocalAnchor;
        }

        protected override Color GetStepColor()
        {
            if (currentCloudAnchor == null || localAnchorIds.Contains(currentCloudAnchor.Identifier))
            {
                return stateParams[currentAppState].StepColor;
            }

            return Color.magenta;
        }

#pragma warning disable CS1998 // Conditional compile statements are removing await
        protected override async Task OnSaveCloudAnchorSuccessfulAsync()
#pragma warning restore CS1998

        {
            Debug.Log("On save cloud anchor successful async");
            await base.OnSaveCloudAnchorSuccessfulAsync();

            long anchorNumber = -1;

            localAnchorIds.Add(currentCloudAnchor.Identifier);
            
            // save to anchor database
            Debug.Log("Saving to anchor database");
            var anchor = new Anchor();
            anchor.anchorID = currentCloudAnchor.Identifier;
            anchorNumber = await anchorExchanger.StoreAnchorKey(anchor);

            // update anchormodel information 
            Debug.Log("Adding anchor model information: and anchor number is: " + anchorNumber);
            spawnedObject.GetComponent<AnchorModel>().anchor.anchorID = anchor.anchorID;
            spawnedObject.GetComponent<AnchorModel>().anchor.anchorNumber = (int)anchorNumber;
            spawnedObject.GetComponent<AnchorModel>().anchoredAsset.anchorNumber = (int)anchorNumber; 

            // save to anchoredassets database
            Debug.Log("Saving to anchored asset database");
            var anchoredAsset = spawnedObject.GetComponent<AnchorModel>().anchoredAsset;

            if (anchoredAsset.assetID > 0)
            {
                Debug.Log("Uploading anchored asset: " + anchoredAsset.assetID);
                var response = await service.UploadAnchoredAsset(anchoredAsset);
                if (response != null)
                {
                    Debug.Log("Uploaded anchored asset");
                }
                else
                {
                    Debug.Log("Couldn't upload anchored asset");
                }
            }

            Pose anchorPose = Pose.identity;

            #if UNITY_ANDROID || UNITY_IOS
            anchorPose = currentCloudAnchor.GetPose();
#endif
            // MoveObject(spawnedObject, anchorPose.position, anchorPose.rotation); // move spawnedObject

            //AttachTextMesh(spawnedObject, anchorNumber);
            //Debug.Log("spawnedobject.transform.getchild(0).getchild(0): " + spawnedObject.transform.GetChild(0).GetChild(0).gameObject.name);

            if (spawnedObject.transform.GetChild(0).GetChild(0).gameObject.TryGetComponent<MeshRenderer>(out var abc))
            {
                Debug.Log("spawnedobject.transform.getchild(0).getchild(0) is an asset ");
            } else
            {
                MeshRenderer bcd = spawnedObject.transform.GetChild(0).GetChild(0).gameObject.GetComponentInChildren<MeshRenderer>();
                if (bcd != null)
                {
                    Debug.Log("spawnedobject.transform.getchild(0).getchild(0).getcomponentinchildren is an asset");
                }
            
            }

            // feedbackBox.text = $"Created anchor {anchorNumber}. Next: Stop cloud anchor session";
            feedbackBox.text = $"Created anchor {anchorNumber}. ";
        }

        protected override async Task OnDeleteCloudAnchorSuccessfulAsync()
        {
            Debug.Log("Delete from azure successful!");
            await base.OnDeleteCloudAnchorSuccessfulAsync();

            // Delete from anchor database
            await anchorExchanger.DeleteAnchorKey(spawnedObject.GetComponent<AnchorModel>().anchor);

            // Delete from anchoredassets database, no need to do this yet because we are only attaching one anchor to one asset
            // await service.DeleteAnchoredAsset(spawnedObject.GetComponentInChildren<AnchoredAsset>());

            feedbackBox.text = $"Deleted anchor.";

        }

        protected override void OnSaveCloudAnchorFailed(Exception exception)
        {
            base.OnSaveCloudAnchorFailed(exception);
        }



        public async override Task AdvanceAsync()
        {
            if (currentAppState == AppState.StepChooseFlow || currentAppState == AppState.StepInputAnchorNumber)
            {
                return;
            }

            if (_currentFlow == Flow.CreateFlow)
            {
                await AdvanceCreateFlowAsync();
            }
            else if (_currentFlow == Flow.LocateFlow)
            {
                await AdvanceLocateFlowAsync();
            }
        }

        public async Task InitializeCreateFlowAsync()
        {
            Debug.Log("Initialize Create Flow  Async");
            Debug.Log("Appstate step choose flow: " + AppState.StepChooseFlow);
            if (currentAppState == AppState.StepChooseFlow)
            {
                Debug.Log("Setting createflow");
                _currentFlow = Flow.CreateFlow;

                // get all anchor numbers 
                anchorList = await anchorExchanger.RetrieveAllAnchorKeys();
                currentAppState = AppState.StepCreateSession;
            }
            else
            {
                Debug.Log("Advance  async");
                await AdvanceAsync();
            }
        }

        // To be used for delete button click
        public async void DeleteAnchor()
        {
            Debug.Log("Trying to Delete Anchor");
            try
            {
                Debug.Log("Checking if spawnedObject is null");
                if (spawnedObject != null)
                {
                    Debug.Log("Deleting anchor...");
                    var currentAnchor = spawnedObject.GetComponent<AnchorModel>().anchor;
                    if (currentAnchor.anchorID != null)
                    {
                        await DeleteCurrentObjectAnchorToCloudAsync();
                        CleanupSpawnedObject();
                    }
                    else
                    {
                        CleanupSpawnedObject();
                    }
                }               
            }
            catch (Exception ex)
            {
                Debug.LogError("Failed to delete current object anchor: " + ex);
            }

        }

        /// <summary>
        /// This version only exists for Unity to wire up a button click to.
        /// If calling from code, please use the Async version above.
        /// </summary>
        public async void InitializeCreateFlow()
        {
            try
            {
                await InitializeCreateFlowAsync();
            }
            catch (Exception ex)
            {
                Debug.LogError($"{nameof(AdminCrudAnchorsController)} - Error in {nameof(InitializeCreateFlow)}: {ex.Message}");
            }
        }


#pragma warning disable CS1998 // Conditional compile statements are removing await

        public async Task InitializeLocateFlowAsync()
#pragma warning restore CS1998
        {
            if (currentAppState == AppState.StepChooseFlow)
            {
                currentAppState = AppState.StepInputAnchorNumber;
            }
            else if (currentAppState == AppState.StepInputAnchorNumber)
            {
                //long anchorNumber;

                // get all anchor numbers 
                anchorList = await anchorExchanger.RetrieveAllAnchorKeys();

                if (anchorList.anchors.Length == 0)
                {
                    feedbackBox.text = "No Anchor Numbers!";
                    
                }
                else
                {
                    //_anchorNumberToFind = anchorNumber;

                    //#if !UNITY_EDITOR
                    //AnchorList anchorList = await anchorExchanger.RetrieveAnchorKey(_anchorNumberToFind.Value); 
                    //#endif

                    _currentFlow = Flow.LocateFlow;
                    currentAppState = AppState.StepCreateSession;
                    XRUXPickerForSharedAnchorDemo.Instance.GetDemoInputField().text = "";

                    //if (anchorList == null)
                    //{
                    //    anchor = null;
                    //    _anchorKeyToFind = null;    
                    //    feedbackBox.text = "Anchor Number Not Found!";
                    //}
                    //else
                    //{
                    //    anchor = anchorList.anchors[0];
                    //    _anchorKeyToFind = anchor.anchorID.ToString();
                    //    _currentFlow = Flow.LocateFlow;
                    //    currentAppState = AppState.StepCreateSession;
                    //    XRUXPickerForSharedAnchorDemo.Instance.GetInputField().text = "";
                    //}
                }
            }
            else
            {
                await AdvanceAsync();
            }
        }

        /// <summary>
        /// This version only exists for Unity to wire up a button click to.
        /// If calling from code, please use the Async version above.
        /// </summary>
        public async void InitializeLocateFlow()
        {
            try
            {
                await InitializeLocateFlowAsync();
            }
            catch (Exception ex)
            {
                Debug.LogError($"{nameof(AdminCrudAnchorsController)} - Error in {nameof(InitializeLocateFlow)}: {ex.Message}");
            }
        }

        public override async void ReturnToLauncher()
        {
            CloudManager.StopSession();
            CleanupSpawnedObjects();
            await CloudManager.ResetSessionAsync();
            base.ReturnToLauncher();
        }


        // Button Click to save current selected object
        public async void SaveCurrentObjectAnchorToCloud()
        {
            Debug.Log("Pressing save button");
            if (currentAppState == AppState.StepCreateLocalAnchor)
            {
                Debug.Log("Saving cloud anchor...");
                currentAppState = AppState.StepSaveCloudAnchor;
                await SaveCurrentObjectAnchorToCloudAsync();
                Debug.Log("Change back to create local anchor state");
                currentAppState = AppState.StepCreateLocalAnchor;
            }
        }

        private async Task AdvanceCreateFlowAsync()
        {
            switch (currentAppState)
            {
                case AppState.StepCreateSession:
                    currentCloudAnchor = null;
                    currentAppState = AppState.StepCreateSessionForQuery;
                    break;
                case AppState.StepCreateSessionForQuery:
                    anchorsLocated = 0;
                    ConfigureSession();
                    Debug.Log("Changing to start session query..");
                    currentAppState = AppState.StepStartSessionForQuery;
                    break;
                case AppState.StepStartSessionForQuery:
                    Debug.Log("Start session async");
                    await CloudManager.StartSessionAsync();
                    if (anchorList.anchors.Length == 0)
                    {
                        currentAppState = AppState.StepCreateLocalAnchor;
                    } else
                    {
                        currentAppState = AppState.StepLookForAnchor;
                    }
                    break;
                case AppState.StepLookForAnchor:
                    currentAppState = AppState.StepLookingForAnchor;
                    currentWatcher = CreateWatcher();
                    break;
                case AppState.StepLookingForAnchor:
                    currentWatcher.Stop();
                    // when user presses next, stop looking for anchors 

                    currentAppState = AppState.StepCreateLocalAnchor;
                    break;
                case AppState.StepLookedForAnchor:
                    currentAppState = AppState.StepCreateLocalAnchor;
                    break;
                case AppState.StepCreateLocalAnchor: // user creates and edits anchors 
                    break;
                case AppState.StepDeletedAnchor:
                    currentAppState = AppState.StepCreateLocalAnchor;
                    break;
                case AppState.StepSaveCloudAnchor: // must be used by 'save' button
                    currentAppState = AppState.StepSavingCloudAnchor;
                    //foreach (var toSaveObj in spawnedObjects)
                    //{
                    //    spawnedObject = toSaveObj;
                    //    await SaveCurrentObjectAnchorToCloudAsync();
                    //}
                    //await SaveCurrentObjectAnchorToCloudAsync();
                    break;
                case AppState.StepStopSession:
                    CloudManager.StopSession();
                    CleanupSpawnedObjects();
                    await CloudManager.ResetSessionAsync();
                    // currentAppState = AppState.StepComplete;
                    break;
                case AppState.StepComplete:
                    currentCloudAnchor = null;
                    currentAppState = AppState.StepChooseFlow;
                    CleanupSpawnedObjects();
                    break;
                default:
                    Debug.Log("Shouldn't get here for app state " + currentAppState);
                    break;
            }
        }

        private async Task AdvanceLocateFlowAsync()
        {
            switch (currentAppState)
            {
                case AppState.StepCreateSession:
                    currentAppState = AppState.StepChooseFlow;
                    currentCloudAnchor = null;
                    currentAppState = AppState.StepCreateSessionForQuery;
                    break;
                case AppState.StepCreateSessionForQuery:
                    anchorsLocated = 0;
                    ConfigureSession();
                    currentAppState = AppState.StepStartSessionForQuery;
                    break;
                case AppState.StepStartSessionForQuery:
                    await CloudManager.StartSessionAsync();
                    currentAppState = AppState.StepLookForAnchor;
                    break;
                case AppState.StepLookForAnchor:
                    currentAppState = AppState.StepLookingForAnchor;
                    currentWatcher = CreateWatcher();
                    break;
                case AppState.StepLookingForAnchor:

                    // Advancement will take place when anchors have all been located.
                    break;
                case AppState.StepLookedForAnchor:
                    currentAppState = AppState.StepStopSessionForQuery;
                    break;
                case AppState.StepStopSessionForQuery:
                    CloudManager.StopSession();
                    currentAppState = AppState.StepComplete;
                    break;
                case AppState.StepComplete:
                    currentCloudAnchor = null;
                    currentWatcher = null;
                    currentAppState = AppState.StepChooseFlow;
                    CleanupSpawnedObjects();
                    break;
                default:
                    Debug.Log("Shouldn't get here for app state " + currentAppState);
                    break;
            }
        }

        private void EnableCorrectUIControls()
        {
            switch (currentAppState)
            {
                case AppState.StepChooseFlow:

                    XRUXPickerForSharedAnchorDemo.Instance.GetDemoButtons()[1].gameObject.SetActive(false);
                    #if UNITY_WSA
                    XRUXPickerForSharedAnchorDemo.Instance.transform.position = Camera.main.transform.position + Camera.main.transform.forward * 0.1f;
                    XRUXPickerForSharedAnchorDemo.Instance.transform.LookAt(Camera.main.transform);
                    XRUXPickerForSharedAnchorDemo.Instance.transform.Rotate(Vector3.up, 180);
                    XRUXPickerForSharedAnchorDemo.Instance.GetButtons()[0].gameObject.SetActive(true);
                    #else
                    XRUXPickerForSharedAnchorDemo.Instance.GetDemoButtons()[0].transform.Find("Text").GetComponent<Text>().text = "Create & Share Anchor";
                    #endif
                    XRUXPickerForSharedAnchorDemo.Instance.GetDemoInputField().gameObject.SetActive(false);
                    break;
                case AppState.StepInputAnchorNumber:
                    XRUXPickerForSharedAnchorDemo.Instance.GetDemoButtons()[1].gameObject.SetActive(true);
                    XRUXPickerForSharedAnchorDemo.Instance.GetDemoButtons()[0].gameObject.SetActive(false);
                    //XRUXPickerForSharedAnchorDemo.Instance.GetInputField().gameObject.SetActive(true);
                    break;
                case AppState.StepCreateLocalAnchor:
                    XRUXPickerForSharedAnchorDemo.Instance.GetDemoButtons()[0].gameObject.SetActive(false);
                    break;
                default:
                    XRUXPickerForSharedAnchorDemo.Instance.GetDemoButtons()[1].gameObject.SetActive(false);
#if UNITY_WSA
                    XRUXPickerForSharedAnchorDemo.Instance.GetDemoButtons()[0].gameObject.SetActive(false);
#else
                    XRUXPickerForSharedAnchorDemo.Instance.GetDemoButtons()[0].gameObject.SetActive(true);
                    XRUXPickerForSharedAnchorDemo.Instance.GetDemoButtons()[0].transform.Find("Text").GetComponent<Text>().text = "Next Step";
                    #endif
                    XRUXPickerForSharedAnchorDemo.Instance.GetDemoInputField().gameObject.SetActive(false);
                    break;
            }
        }

        private void ConfigureSession()
        {
            Debug.Log("Configure session...");
            List<string> anchorsToFind = new List<string>();

            if (currentAppState == AppState.StepCreateSessionForQuery)
            {
                Debug.Log("For each anchor...");
                foreach (var anchor in anchorList.anchors)
                {
                    Debug.Log("Each anchor id: " + anchor.anchorID);
                    _anchorKeyToFind = anchor.anchorID.ToString();
                    anchorsToFind.Add(_anchorKeyToFind);
                }
            }

            anchorsExpected = anchorsToFind.Count;
            SetAnchorIdsToLocate(anchorsToFind);
        }

        protected override void CleanupSpawnedObjects()
        {
            base.CleanupSpawnedObjects();

            for (int index = 0; index < otherSpawnedObjects.Count; index++)
            {
                Destroy(otherSpawnedObjects[index]);
            }

            otherSpawnedObjects.Clear();
        }

        /// <summary>
        /// Gets or sets the base URL for the example sharing service.
        /// </summary>
        public string BaseSharingUrl { get => baseSharingUrl; set => baseSharingUrl = value; }
    }
}
