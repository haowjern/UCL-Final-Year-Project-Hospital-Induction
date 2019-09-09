using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class LocationService : MonoBehaviour
{
    public GameObject ListOfOptions;
    public GameObject OptionPrefab;
    public GameObject mapManager;
    public GameObject uiManager;
    private DatabaseService service;
    private UIManagerScript AddLocationScript;
    private Location selectedLocation;
    private MapService mapService;

    // get all assets and load the names 
    public async void setLocations()
    {
        // delete all options 
        for (int i = ListOfOptions.transform.childCount - 1; i >= 0; i--)
        {
            Debug.Log("Deleting location");
            Transform child = ListOfOptions.transform.GetChild(i);
            Destroy(child.gameObject);
        }

        var selectedLocations = await service.GetAllLocationsAsync();
        Debug.Log("Total found locations count = " + selectedLocations.locations.Length);

        // add options from data retrieved
        foreach (var location in selectedLocations.locations)
        {
            Debug.Log("Instantiating location ui");
            var option = Instantiate(OptionPrefab);
            option.transform.SetParent(ListOfOptions.transform); // put option into list of options
            option.transform.Find("Text").gameObject.GetComponent<TextMeshProUGUI>().text = location.location_name;
            option.GetComponent<Button>().onClick.AddListener(() => onLocationSelected(location));
        }
    }

    private void onLocationSelected(Location location)
    {
        Debug.Log("onLocationSelected...");
        // close dialog
        AddLocationScript.ToggleMenu();

        // set selectedAsset as asset
        selectedLocation = location;

        mapService.setMainScreenWithLocation(location);
    }

    private void Awake()
    {
        service = DatabaseService.Instance; // Singleton
        if (service.httpClient is null)
        {
            service.StartDatabase();
        }
        mapService = mapManager.GetComponent<MapService>();
        AddLocationScript = uiManager.GetComponent<UIManagerScript>(); 
    }



    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
