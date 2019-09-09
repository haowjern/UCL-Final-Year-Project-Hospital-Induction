using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

[Serializable]
public class Location
{
    public int locationID;
    public int current_mapID;
    public int location_typeID;
    public string location_name;
    public float rel_position_on_map_x;
    public float rel_position_on_map_y;
    public string location_type_name;
    public int location_floor_mapID;
    public int floor_mapID;
    public int floor_number;
}

[Serializable]
public class LocationList
{
    public Location[] locations; 
}
