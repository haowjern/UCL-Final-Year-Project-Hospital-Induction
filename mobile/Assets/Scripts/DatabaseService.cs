using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Threading.Tasks;
using System.Net.Http;
using System;
using UnityEngine.Networking;
using System.IO;
using System.Text;


public sealed class DatabaseService
{

#if UNITY_EDITOR
    private static string baseAddress = "https://app-treasure-hunt-server.azurewebsites.net/";
#elif UNITY_ANDROID
    private static string baseAddress = "https://app-treasure-hunt-server.azurewebsites.net/";
#endif
    
    private static string mapUrl = baseAddress + "/api/map-management/maps";
    private static string defaultMapUrl = mapUrl + "/?default=true";

    private static string assetUrl = baseAddress + "/api/asset-management/assets";
    private static string anchoredAssetsUrl = baseAddress + "/api/asset-management/anchoredassets";

    private static string locationsUrl = baseAddress + "/api/location-management/locations";
    private static string floorsUrl = baseAddress + "/api/floor-management/floors";

    public HttpClient httpClient = null;

    private static DatabaseService INSTANCE = null;

    private DatabaseService() { } // private constructor

    public static DatabaseService Instance
    {
        get
        {
            if (INSTANCE == null)
            {
                INSTANCE = new DatabaseService();
                INSTANCE.StartDatabase();
            }
            return INSTANCE;
        }
    }

    public void StartDatabase()
    {
        httpClient = new HttpClient(); 
    }

    public async Task<AssetList> GetDefaultMapAsync()
    {
        try
        {
            var content = await httpClient.GetStringAsync(defaultMapUrl);
            Debug.Log("Getting default map: " + content);
            return JsonUtility.FromJson<AssetList>("{\"assets\":" + content + "}");
        }
        catch (Exception ex)
        {
            Debug.LogException(ex);
            Debug.LogError($"Failed to retrieve default map.");
            return null;
        }
    }

    public async Task<AssetList> GetMapAsync(string mapId)
    {
        try
        {
            var url = mapUrl + "/" + mapId;
            var content = await httpClient.GetStringAsync(url);
            Debug.Log("Getting map: " + content);
            return JsonUtility.FromJson<AssetList>("{\"assets\":" + content + "}");
        }
        catch (Exception ex)
        {
            Debug.LogException(ex);
            Debug.LogError($"Failed to retrieve map with id");
            return null;
        }
    }

    public async Task<LocationList> GetAllLocationsAsync()
    {
        try
        {
            var content = await httpClient.GetStringAsync(locationsUrl);
            Debug.Log("Found locations to be: " + content);
            return JsonUtility.FromJson<LocationList>("{\"locations\":" + content + "}");
        }
        catch (Exception ex)
        {
            Debug.LogException(ex);
            Debug.LogError($"Failed to retrieve all locations.");
            return null;
        }
    }


    public async Task<LocationList> GetAllLocationsAsync(string mapId)
    {
        try
        {
            var locationUrl = mapUrl + "/" + mapId + "/locations";
            var content = await httpClient.GetStringAsync(locationUrl);
            Debug.Log("Found locations with mapid to be: " + content);
            return JsonUtility.FromJson<LocationList>("{\"locations\":" + content + "}");
        }
        catch (Exception ex)
        {
            Debug.LogException(ex);
            Debug.LogError($"Failed to retrieve all locations of mapId.");
            return null;
        }
    }

    public async Task<LocationList> GetLocationFromLocationId(string locationId)
    {
        try
        {
            var locationUrl = locationsUrl + "/" + locationId;
            var content = await httpClient.GetStringAsync(locationUrl);
            Debug.Log("Found locations with locationid to be: " + content);
            return JsonUtility.FromJson<LocationList>("{\"locations\":" + content + "}");
        }
        catch (Exception ex)
        {
            Debug.LogException(ex);
            Debug.LogError($"Failed to retrieve all locations of locationId.");
            return null;
        }
    }

    public async Task<FloorList> GetFloorsAsync(string mapId, string locationId)
    {
        try
        {
            var tempfloorsUrl = mapUrl + "/" + mapId + "/locations" + "/" + locationId + "/floors";
            var content = await httpClient.GetStringAsync(tempfloorsUrl);
            Debug.Log("Found floors to be: " + content);
            return JsonUtility.FromJson<FloorList>("{\"floors\":" + content + "}");
        }
        catch (Exception ex)
        {
            Debug.LogException(ex);
            Debug.LogError($"Failed to retrieve floors of a location.");
            return null;
        }
    }

    public async Task<FloorList> GetFloorWithTheSameMap(string mapId)
    {
        try
        {
            var content = await httpClient.GetStringAsync(floorsUrl + "\\?mapId=" + mapId);
            Debug.Log("Found floor from mapId to be: " + content);
            return JsonUtility.FromJson<FloorList>("{\"floors\":" + content + "}");
        }
        catch (Exception ex)
        {
            Debug.LogException(ex);
            Debug.LogError($"Failed to retrieve floor from mapId.");
            return null;
        }
    }

    public async Task<AssetList> GetAllARAssets()
    {
        try
        {
            var content = await httpClient.GetStringAsync(assetUrl + "\\?" + "asset_type_name=augmented_reality");
            Debug.Log("Found assets to be: " + content);
            return JsonUtility.FromJson<AssetList>("{\"assets\":" + content + "}");
        }
        catch (Exception ex)
        {
            Debug.LogException(ex);
            Debug.LogError($"Failed to retrieve all AR assets");
            return null;
        }
    }

    public async Task<AssetList> GetARAssetWithAssetID(string assetID)
    {
        try
        {
            var content = await httpClient.GetStringAsync(assetUrl + "/" + assetID);
            Debug.Log("Found asset to be: " + content);
            return JsonUtility.FromJson<AssetList>("{\"assets\":" + content + "}");
        }
        catch (Exception ex)
        {
            Debug.LogException(ex);
            Debug.LogError($"Failed to retrieve all asset");
            return null;
        }
    }

    public async Task<AnchoredAssetList> GetAnchoredAssetWithAnchorNumber(string anchorNumber)
    {
        try
        {
            var content = await httpClient.GetStringAsync(anchoredAssetsUrl + "/?anchorNumber=" + anchorNumber);
            Debug.Log("Found anchored assets to be: " + content);
            return JsonUtility.FromJson<AnchoredAssetList>("{\"anchoredAssets\":" + content + "}");
        }
        catch (Exception ex)
        {
            Debug.LogException(ex);
            Debug.LogError($"Failed to retrieve anchored asset with anchorNumber: " + anchorNumber);
            return null;
        }
    }

    public async Task<string> DeleteAnchoredAsset(AnchoredAsset anchoredAsset)
    {
        try
        {
            var response = await httpClient.DeleteAsync(anchoredAssetsUrl + "/?anchored_assetID=" + anchoredAsset.anchored_assetID);
            if (response.IsSuccessStatusCode)
            {
                Debug.Log("Deleted anchored asset successful: " + anchoredAsset.anchored_assetID);
            }
            return response.ToString();
        }
        catch (Exception ex)
        {
            Debug.LogException(ex);
            Debug.LogError("Failed to delete anchored asset: " + anchoredAsset.anchored_assetID);
            return null;
        }
    }

    public async Task<string> UploadAnchoredAsset(AnchoredAsset anchoredAsset)
    {
        var json = JsonUtility.ToJson(anchoredAsset);
        Debug.Log("Json is: " + json);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await httpClient.PostAsync(anchoredAssetsUrl, content);
        if (response.IsSuccessStatusCode)
        {
            string responseBody = await response.Content.ReadAsStringAsync();
            Debug.Log("Response body is " + responseBody);
            return responseBody;
        }
        else
        {
            Debug.LogError($"Failed to upload anchored asset.");
            return null;
        }
    }

    // Asset bundles

    //public void Upload(string filePath, string fileName)
    //{
    //    Debug.Log("Uploading file...");
    //    List<IMultipartFormSection> formData = new List<IMultipartFormSection>();
    //    formData.Add(new MultipartFormDataSection("file_name=" + fileName + "&asset_type_name=augmented_reality"));
    //    formData.Add(new MultipartFormFileSection("file", File.ReadAllBytes(filePath), fileName, "application/octet-stream"));

    //    UnityWebRequest www = UnityWebRequest.Post(assetUrl, formData);
    //    www.SendWebRequest();

    //    if (www.isNetworkError || www.isHttpError)
    //    {
    //        Debug.Log(www.error);
    //    }
    //    else
    //    {
    //        Debug.Log("Form upload complete!");
    //    }
    //}

    public async Task<string> uploadAssetBundle(string filePath, string fileName)
    {
        Debug.Log("File Path: " + filePath);
        var content = new MultipartFormDataContent();
        using (Stream fs = File.OpenRead(filePath))
        {
            Debug.Log("Using stream");
            var streamContent = new StreamContent(fs);
            streamContent.Headers.Add("Content-Disposition", "form-data; name=\"file\"; filename=\"" + Path.GetFileName(filePath) + "\"");
            streamContent.Headers.Add("Content-Type", "application/octet-stream");
            content.Add(new StringContent(fileName), "file_name");
            content.Add(new StringContent("augmented_reality"), "asset_type_name");
            content.Add(streamContent, "file", Path.GetFileName(filePath));

            var response = await httpClient.PostAsync(assetUrl, content);
            string responseBody = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                Debug.Log("Success!");
                Debug.Log("Response body is " + responseBody);
            }
            return responseBody;
        }
    }
}
