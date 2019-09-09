using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

[Serializable]
public class Anchor
{ 
    public int anchorNumber;
    public string anchorID;
    public int locationID;
    public string anchor_name;
}

[Serializable]
public class AnchorList
{
    public Anchor[] anchors;
}
