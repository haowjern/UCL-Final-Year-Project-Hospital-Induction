using UnityEditor;
using System.IO;
using UnityEngine;

public class CreateAssetBundles
{
    static string assetBundleDirectory = "Assets/AssetBundles";

    [MenuItem("Assets/Build and Upload AssetBundles")]
    static void BuildAndUploadAllAssetBundles()
    {
        BuildAllAssetBundles();
        UploadAllAssetBundles();
    }

    [MenuItem("Assets/Build AssetBundles")]
    static void BuildAllAssetBundles()
    {
        
        if (!Directory.Exists(assetBundleDirectory))
        {
            Directory.CreateDirectory(assetBundleDirectory);
        }
        //BuildPipeline.BuildAssetBundles(assetBundleDirectory, BuildAssetBundleOptions.None, BuildTarget.StandaloneWindows);

        BuildPipeline.BuildAssetBundles(assetBundleDirectory, BuildAssetBundleOptions.None, BuildTarget.Android);
    }

    static async void UploadAllAssetBundles()
    {
        
        DatabaseService service = DatabaseService.Instance;

        string[] filePaths = Directory.GetFiles(@".\Assets\AssetBundles");
        foreach (var file in filePaths)
        {
            if (!file.Contains("Assets\\AssetBundles\\AssetBundles"))
            {
                if (!(file.EndsWith(".meta") || file.EndsWith(".manifest")))
                {
                    //Debug.Log("File Path uploading... " + file);
                    //service.Upload(file, Path.GetFileName(file));
                    //Debug.Log("Done")
                    string response = await service.uploadAssetBundle(file, Path.GetFileName(file));
                    Debug.Log("Response: " + response);
                }
                Debug.Log("Deleting Filename is: " + file);
                File.Delete(file);
            }
        }
    }
}