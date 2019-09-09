using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Networking;
using System.Threading.Tasks;
using TMPro;
using System;



public class MapService : MonoBehaviour
{
    public GameObject mapImage;
    public GameObject locationParent;
    public GameObject locationPrefab;
    public GameObject dropdownObject;

    public Asset selectedMap
    {
        get { return SelectedMap; }
        set {
            SelectedMap = value;
        }
    }

    private Asset SelectedMap; 


    public LocationList selectedLocations { get; set; } = null;
    public Location selectedLocation { get; set; } = null; // to be set by LocationButton.
    public FloorList selectedFloors { get; set; } = null;

    private List<GameObject> LocationUIObjects = new List<GameObject>();

    private List<Asset> mapDropDownOptions
    {
        get { return MapDropDownOptions; }
        set {
            MapDropDownOptions = value;
        }
    }
    private List<Asset> MapDropDownOptions = new List<Asset>();

    private TMP_Dropdown dropdown;
    private GameObject dropdownLabel;
    private TextMeshProUGUI dropdownLabelText;

    private int prev_value = -1;
    private int current_floor_number = -1;
    private Location highlightedLocation; 




    // MAPS
    // function to return texture for current selected map & map layers 

    // array to know all the maps that has been traversed: Base Layer Map, once selected a location and entered, then in the location itself the array has Building Layer + Weston - Floor 1, Weston - FLoor 2, etc. 

    // LOCATIONS 
    // function return texture for current selected location 

    // get all locations for a map 

    // create new object for every location once a map is loaded

    // if a location (building) is selected, get all maps of floors - add into layer 

    // exit function, everytime update, remember to pop eleement for maps_traversed as appropriate

    // PROGRAMMING FLOW 

    // on every selected location, 
    // each location selected, loads the map, and selects the location. 


    DatabaseService service;

    public async void loadMapAndLocations()
    {
        Debug.Log("Loading maps and locations...");
        await setDefaultMap();
        StartCoroutine(setImageMap());
        Debug.Log("Getting locations...");
        await setLocations();
        Debug.Log("Destroying location ui objects...");
        destroyLocationsUI();
        Debug.Log("Setting new location ui objects...");
        setLocationsUi();
        Debug.Log("Setting maps drop down ui...");
        setMapsDropDownUi();
        changeDropDownValue();
    }

    void setMapsDropDownUi()
    {
        Debug.Log("Setting maps drop down ui...");
        var startIndex = dropdown.options.Count;
    
        dropdown.options = new List<TMP_Dropdown.OptionData>();
        for (int i = 0; i < mapDropDownOptions.Count; i++)
        {
            var anOption = new TMP_Dropdown.OptionData(mapDropDownOptions[i].asset_name);
            dropdown.options.Add(anOption);
        }
    }

    public void setMapFromDropDown()
    {
        Debug.Log("Setting map from dropdown...");
        selectedMap = mapDropDownOptions[dropdown.value];


        // remove all floor options except for the main map layer when a user selects the main map layer
        if (dropdown.value == 0)
        {
            dropdown.onValueChanged.RemoveAllListeners();
            while(mapDropDownOptions.Count > 1)
            {
                Debug.Log("Removing map dropdown option...: " + (mapDropDownOptions.Count - 1));
                mapDropDownOptions.RemoveAt(mapDropDownOptions.Count - 1);
            }
            setUpListeners();
            selectedFloors = null;
            //selectedLocation = null;
        }

        loadMapAndLocations();
    }

    public async Task setDefaultMap()
    {
        Debug.Log("Setting default map...");
        if (selectedMap == null)
        {
            var maps = await service.GetDefaultMapAsync();
            selectedMap = maps.assets[0];
            mapDropDownOptions.Add(maps.assets[0]);
        }
        Debug.Log("Map Set: " + selectedMap);
    }

    public async Task setLocations()
    {
        Debug.Log("Setting locations...");
        selectedLocations = await service.GetAllLocationsAsync(selectedMap.assetID.ToString());
    }

    public async Task<FloorList> getLocationFloors()
    {
        Debug.Log("Getting floors of location...");
        return await service.GetFloorsAsync(selectedLocation.current_mapID.ToString(), selectedLocation.locationID.ToString());
    }

    public void destroyLocationsUI()
    {
        Debug.Log("Location UI Objects.length = " + LocationUIObjects.Count);
        foreach (GameObject loc in LocationUIObjects)
        {
            Debug.Log("Destroying location ui object...");
            Destroy(loc);
        }

        LocationUIObjects = new List<GameObject>();
    }

    public void setLocationsUi()
    {
        Debug.Log("Setting Locations UI...");
        Debug.Log("Length of selectedLocations: " + selectedLocations.locations.Length);
        Debug.Log("Length of location ui objects: " + LocationUIObjects.Count);
        int prev_locId = 0;
        foreach (Location loc in selectedLocations.locations)
        {

            if (loc.locationID != prev_locId)
            {
                prev_locId = loc.locationID; // list of locations include locations and its floors 

                var width = mapImage.GetComponent<RectTransform>().rect.width;
                var height = mapImage.GetComponent<RectTransform>().rect.height;
                var x = loc.rel_position_on_map_x * width;
                var y = (1 - loc.rel_position_on_map_y) * height + (Screen.height - height) / 2;
                Vector3 position = new Vector3(x, y, 0);

                GameObject locationGo = Instantiate(locationPrefab, new Vector3(0, 0, 0), Quaternion.identity);
                locationGo.transform.SetParent(locationParent.transform);
                locationGo.transform.position = position;

                Debug.Log("Adding locations...");
                LocationUIObjects.Add(locationGo);

                GameObject locationManager = locationGo.transform.GetChild(0).gameObject;
                LocationButton locBtn = locationManager.GetComponent<LocationButton>();
                locBtn.location = loc;
                locBtn.isSelected = false;
                if (highlightedLocation != null)
                {
                    if (loc.locationID == highlightedLocation.locationID)
                    {
                        locBtn.isSelected = true;
                        highlightedLocation = null; 
                    }
                }
                locBtn.toggleTexture();


            }
        }
    }

    public IEnumerator setImageMap()
    {
        Debug.Log("Setting Image Map...");
        Debug.Log(selectedMap);
        UnityWebRequest www = UnityWebRequestTexture.GetTexture(selectedMap.imgUrl);
        yield return www.SendWebRequest();
        Texture2D texture = null;
        if (www.isNetworkError || www.isHttpError)
        {
            Debug.Log(www.error);
            texture = null;
        }
        else
        {
            texture = ((DownloadHandlerTexture)www.downloadHandler).texture;
        }

        Rect rect = new Rect(0, 0, texture.width, texture.height);
        Debug.Log("Width is " + texture.width);
        var a_sprite = Sprite.Create(texture, rect, new Vector2(0, 0));

        // mapImage.GetComponent<RectTransform>().sizeDelta = new Vector2(texture.width, texture.height);
        mapImage.GetComponent<Image>().sprite = a_sprite;
        //Raw Image texture is not working for some reason, hence chose Image instead;
    }

    private void clearData()
    {
        selectedMap = null;
        selectedLocations = null;
        selectedLocation = null;
        selectedFloors = null;
        current_floor_number = -1;
        highlightedLocation = null;
        LocationUIObjects = new List<GameObject>();
        mapDropDownOptions = new List<Asset>();
        destroyLocationsUI();
    }

    public void initialiseMapService()
    {
        clearData();

        Debug.Log("Starting map service...");
        dropdown = dropdownObject.GetComponent<TMP_Dropdown>();
        dropdownLabel = dropdownObject.transform.Find("Label").gameObject;
        dropdownLabelText = dropdownLabel.GetComponent<TextMeshProUGUI>();
    
        loadMapAndLocations();
    }

    private void changeDropDownValue()
    {
        dropdown.onValueChanged.RemoveAllListeners();
        Debug.Log("Event, changing drop down value...");
        var index = getMapOptionIndex();
        if (index > -1)
        {
            Debug.Log("Index is: " + index);
            dropdown.value = index;
            prev_value = index;
            dropdownLabelText.SetText(mapDropDownOptions[index].asset_name);
            Debug.Log("Dropdown value is: " + dropdown.value);
        }
        setUpListeners();
    }

    private int getMapOptionIndex()
    {
        for (int i = 0; i < mapDropDownOptions.Count; i++)
        {
            var aMap = mapDropDownOptions[i];
            if (aMap.assetID == selectedMap.assetID)
            {
                return i;
            }
        }

        return -1; 
    }

    private void setUpListeners()
    {
        dropdown.onValueChanged.AddListener(delegate
        {
            Debug.Log("DropDown Value listened is: " + dropdown.value);
            Debug.Log("Previous value listened is: " + prev_value);
            if (dropdown.value != prev_value)
            {
                Debug.Log("Listener: value of dropdown != prev value ");
                setMapFromDropDown();
                prev_value = dropdown.value;
            }

        });
    }

    // Start is called before the first frame update
    void Start()
    {
        Debug.Log("Starting map service...");
        service = DatabaseService.Instance; // Singleton
        if (service.httpClient is null)
        {
            service.StartDatabase();
        }

        initialiseMapService();
        setUpListeners();
    }

    

    public async void setFloorsWithMaps()
    {
        if (selectedLocation != null)
        {
            if (selectedFloors == null || (selectedFloors.floors.Length == 0)) // get all floor maps, select Floor 1 as the selectedMap, and loadMapAndLocations
            {
                if (!(current_floor_number > 0))
                {
                    // if no values chosen
                    current_floor_number = 1; 
                }

                selectedFloors = await getLocationFloors();

                Array.Sort(selectedFloors.floors, delegate(Floor first, Floor second)
                {
                    return first.floor_number.CompareTo(second.floor_number);
                });

                var count = 0;
                var index = 1;
                foreach (Floor aFloor in selectedFloors.floors)
                {
                    count += 1;
                    var mapId = aFloor.floor_mapID;
                    if (mapId > 0)
                    {
                        var mapList = await service.GetMapAsync(mapId.ToString());
                        var aMap = mapList.assets[0];
                        mapDropDownOptions.Add(aMap);

                        if (count < current_floor_number)
                        {
                            index += 1; // to be used for mapdropdownoptions to select floors
                        }
                    }
                    
                }

                Debug.Log("Map Drop Down Options Count: " + mapDropDownOptions.Count);
                if (mapDropDownOptions.Count > 1)
                {
                    selectedMap = mapDropDownOptions[index];
                    loadMapAndLocations();
                } else
                {
                    selectedFloors = null;
                }
            } else
            {
                Debug.Log("Selected floors is null or empty");
            }
        }
    }

    // set the correct map depending on the mapId
    public async void setMainScreenWithLocation(Location location)
    {
        highlightedLocation = location;
        var mapId = location.current_mapID.ToString();
        // get map 
        AssetList mapList = await service.GetMapAsync(mapId);
        var aMap = mapList.assets[0];

        // remove everything until the first default layer 
        dropdown.onValueChanged.RemoveAllListeners();
        while (mapDropDownOptions.Count > 1)
        {
            Debug.Log("Removing map dropdown option...: " + (mapDropDownOptions.Count - 1));
            mapDropDownOptions.RemoveAt(mapDropDownOptions.Count - 1);
        }
        setUpListeners();
        selectedFloors = null;

        selectedMap = mapDropDownOptions[0];
        loadMapAndLocations();

        if (aMap.is_default_map != "1")
        {
            // get the 'locationfloor' of this building through using the current_mapID of this location
            var tempFloorList = await service.GetFloorWithTheSameMap(mapId);
            var current_floor = tempFloorList.floors[0];
            // set the current floor number to be this floor 
            current_floor_number = current_floor.floor_number;
            // get the building that this floor is in 
            var tempLocationList = await service.GetLocationFromLocationId(current_floor.selected_locationID.ToString());
            selectedLocation = tempLocationList.locations[0];

            // load appropriate maps and floors and locations
            setFloorsWithMaps();
        }    
    }

    // Update is called once per frame
    void Update()
    {
    }
}
