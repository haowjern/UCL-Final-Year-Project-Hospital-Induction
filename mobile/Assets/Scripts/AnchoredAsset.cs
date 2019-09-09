using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

[Serializable]
public class AnchoredAsset
{
    public int anchored_assetID;
    public int anchorNumber;
    public int assetID;
}

[Serializable]
public class AnchoredAssetList
{
    public AnchoredAsset[] anchoredAssets;
}
