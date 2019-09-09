
using UnityEngine;
using System; 

[Serializable]
public class Floor
{
    public int location_floor_mapID;
    public int selected_locationID;
    public int floor_mapID;
    public int floor_number; 
}

[Serializable]
public class FloorList
{
    public Floor[] floors;
}