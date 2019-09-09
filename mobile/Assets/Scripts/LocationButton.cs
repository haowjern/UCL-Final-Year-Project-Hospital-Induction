using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class LocationButton : MonoBehaviour
{
    // Start is called before the first frame update

    public GameObject locationDialog;
    public GameObject dialogTitle;
    public GameObject button; 

    public Sprite unselectedImage, selectedImage;
    public Location location;

    Renderer m_Renderer;
    public bool isSelected;

    private GameObject mapManager;


    public void onClick()
    {
        isSelected = true;
        toggleTexture();
        openDialog();
    }

    public void onExit()
    {
        isSelected = false;
        toggleTexture();
        closeDialog();
    }

    public void onEnterBuilding()
    {
        if (location.location_type_name == "building")
        {
            Debug.Log("Entering building...");
            var mapService = mapManager.GetComponent<MapService>();
            mapService.selectedLocation = location; // pass location object into mapservice to be used.
            mapService.setFloorsWithMaps(); 
            onExit(); 
        }
    }

    public void toggleTexture()
    {
        // mapImage.GetComponent<RectTransform>().sizeDelta = new Vector2(texture.width, texture.height);

        Debug.Log("ToggleTexture");
        if (isSelected)
        {
            Debug.Log("Change to selected texture");
            button.GetComponent<Image>().sprite = selectedImage;
        } else
        {
            button.GetComponent<Image>().sprite = unselectedImage;
        }
    }

    public void openDialog()
    {
        transform.parent.SetAsLastSibling();
        locationDialog.SetActive(true);
        initialiseDialog();
    }

    public void closeDialog()
    {
        Debug.Log("Closing dialog...");
        locationDialog.SetActive(false);
    }

    public void initialiseDialog()
    {
        TextMeshProUGUI tmp = dialogTitle.GetComponent<TextMeshProUGUI>();
        tmp.SetText(location.location_name);
    }

    void Start()
    {
        isSelected = false;

        locationDialog.transform.position = new Vector3(Screen.width / 2, Screen.height / 2, 0);
        locationDialog.SetActive(false);

        mapManager = GameObject.Find("Canvas/Content/Map/MapManager");
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
