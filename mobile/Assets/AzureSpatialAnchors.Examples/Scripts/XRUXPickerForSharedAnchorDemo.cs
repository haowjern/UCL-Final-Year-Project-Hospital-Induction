// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace Microsoft.Azure.SpatialAnchors.Unity.Examples
{
    /// <summary>
    /// Picks the appropriate UI game object to be used in the SharedAnchor demo.
    /// This allows us to have both HoloLens and Mobile UX in the same
    /// scene.
    /// </summary>
    public class XRUXPickerForSharedAnchorDemo : XRUXPicker
    {
        private static XRUXPickerForSharedAnchorDemo _Instance;
        public new static XRUXPickerForSharedAnchorDemo Instance
        {
            get
            {
                if (_Instance == null)
                {
                    _Instance = FindObjectOfType<XRUXPickerForSharedAnchorDemo>();
                }

                return _Instance;
            }
        }

        /// <summary>
        /// Gets the buttons used in the demo.
        /// </summary>
        /// <returns>The buttons used in the demo.</returns>
        public Button[] GetDemoButtons()
        {
#if UNITY_WSA
            return HoloLensUXTree.GetComponentsInChildren<Button>(true);
#else
            return MobileAndEditorUXTree.GetComponentsInChildren<Button>(true);
#endif
        }

        /// <summary>
        /// Gets the input field used in the demo.
        /// </summary>
        /// <returns>The input field used in the demo.</returns>
        public InputField GetDemoInputField()
        {
#if UNITY_WSA
            return HoloLensUXTree.GetComponentInChildren<InputField>(true);
#else
            return MobileAndEditorUXTree.GetComponentInChildren<InputField>(true);
#endif
        }

        public Button GetSaveButton()
        {
            Debug.Log("Getting save button...");
            return GameObject.Find("Save Button").gameObject.GetComponent<Button>();
        }
    }
}
