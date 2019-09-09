using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Microsoft.Azure.SpatialAnchors;

public class AnchorModel : MonoBehaviour
{
    public Anchor anchor = new Anchor();
    public AnchoredAsset anchoredAsset = new AnchoredAsset();
    public CloudSpatialAnchor currentCloudAnchor = null;

    // Start is called before the first frame update
    void Start()
    {
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
