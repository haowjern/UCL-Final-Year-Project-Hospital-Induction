using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

[Serializable]
public class Asset
{
    public int assetID;
    public string asset_type_name;
    public string asset_name;
    public string blob_name;
    public string created_at;
    public string is_default_map;
    public string imgUrl;
}


[Serializable]
public class AssetList
{
    public Asset[] assets; 
}
