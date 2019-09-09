using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
using UnityEngine.UI;
using UnityEngine.Networking;
using System.Threading.Tasks;

public class AssetService : MonoBehaviour
{
    public GameObject AddAssetManager;
    public GameObject ListOfOptions;
    public GameObject OptionPrefab;
    public GameObject foundAssetPrefab;
    public bool foundAssetHasAResponse; 
    private GameObject AssetPrefab;
    private Asset selectedAsset; 
    private DatabaseService service;
    private AddAssetUiManager AddAssetScript;
    private List<AssetBundle> existingAssetBundles; 

    // get all assets and load the names 
    public async void setAssets()
    {
        // delete all options 
        for (int i = ListOfOptions.transform.childCount -1; i >= 0; i--)
        {
            Debug.Log("Deleting asset");
            Transform child = ListOfOptions.transform.GetChild(i);
            Destroy(child.gameObject);
        }

        var selectedAssets = await service.GetAllARAssets();
        Debug.Log("Total found assets count = " + selectedAssets.assets.Length);

        // add options from data retrieved
        foreach (var asset in selectedAssets.assets)
        {
            Debug.Log("Instantiating asset ui");
            var option = Instantiate(OptionPrefab);
            option.transform.SetParent(ListOfOptions.transform); // put option into list of options
            option.transform.Find("Text").gameObject.GetComponent<TextMeshProUGUI>().text = asset.asset_name;
            option.GetComponent<Button>().onClick.AddListener(() => onAssetSelected(asset));
        }
    }

    private void onAssetSelected(Asset asset)
    {
        Debug.Log("onAssetSelected...");
        // close dialog
        AddAssetScript.ToggleMenu();

        // set selectedAsset as asset
        selectedAsset = asset;

        // load asset prefab
        Debug.Log("Asset name: " + asset.asset_name);
        Debug.Log("Asset imgurl: " + asset.imgUrl);
        StartCoroutine(SetAssetPrefab(asset.asset_name, asset.imgUrl)); 
    }

    public GameObject getAssetPrefab()
    {
        return AssetPrefab;
    }

    public Asset getSelectedAsset()
    {
        return selectedAsset;
    }

    public async Task<Asset> getAssetFromAnchoredAsset(AnchoredAsset obj)
    {
        Debug.Log("Getting anchored asset prefab");
        Debug.Log("Getting asset with assetID");
        var foundAssetList = await service.GetARAssetWithAssetID(obj.assetID.ToString());
        if (foundAssetList.assets.Length == 0)
        {
            Debug.Log("Anchored Asset does not exist, can't find asset referenced.");
            return null;
        }
        var foundAsset = foundAssetList.assets[0];
        return foundAsset;
    }

    public void unloadExistingAssetBundles()
    {
        foreach (var bundle in existingAssetBundles)
        {
            bundle.Unload(true);
        }
    }

    public IEnumerator GetAssetPrefab(Asset foundAsset, GameObject toBeReplaced)
    {
        Debug.Log("Getting asset bundle...");
        var www = UnityWebRequestAssetBundle.GetAssetBundle(foundAsset.imgUrl);
        Debug.Log("Sending web request");
        yield return www.SendWebRequest();

        if (www.isNetworkError || www.isHttpError)
        {
            Debug.Log(www.error);
}
        else
        {
            AssetBundle bundle = DownloadHandlerAssetBundle.GetContent(www);
            existingAssetBundles.Add(bundle);
            Debug.Log(bundle);
            var names = bundle.GetAllAssetNames();
            Debug.Log("Name of asset to be loaded is: " + names[0]);
            var asset = bundle.LoadAsset<GameObject>(names[0]);
            asset.transform.localScale = new Vector3(0.2f, 0.2f, 0.2f);
            var assetPrefabIns = Instantiate(asset, toBeReplaced.transform.position, toBeReplaced.transform.rotation);
            assetPrefabIns.transform.SetParent(toBeReplaced.transform.parent);
            Destroy(toBeReplaced);
            bundle.Unload(false); // so references to the asset still exists
        }
    }

    IEnumerator SetAssetPrefab(string assetName, string url)
    {
        Debug.Log("instantiating object...");
        Debug.Log("assetname is: " + assetName);
        Debug.Log("url is: " + url);
       
        var www = UnityWebRequestAssetBundle.GetAssetBundle(url);
        yield return www.SendWebRequest();

        Debug.Log("content length: " + www.GetResponseHeader("content-length"));
        
        if (www.isNetworkError || www.isHttpError)
        {
            Debug.Log(www.error);
        }
        else
        {
            AssetBundle bundle = DownloadHandlerAssetBundle.GetContent(www);
            existingAssetBundles.Add(bundle);
            Debug.Log(bundle);
            var names = bundle.GetAllAssetNames();
            Debug.Log("Name of asset to be loaded is: " + names[0]);
            var asset = bundle.LoadAsset<GameObject>(names[0]);
            AssetPrefab = asset;
            bundle.Unload(false);
        }
    }

    // Start is called before the first frame update
    void Start()
    {
        Debug.Log("Starting asset service...");
        service = DatabaseService.Instance; // Singleton
        if (service.httpClient is null)
        {
            service.StartDatabase();
        }
        AddAssetScript = AddAssetManager.GetComponent<AddAssetUiManager>();
        existingAssetBundles = new List<AssetBundle>(); 
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
