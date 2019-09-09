// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
using System;
using System.Net.Http;
using System.Threading.Tasks;
using UnityEngine;
using System.Collections.Generic;
using System.Text;

namespace Microsoft.Azure.SpatialAnchors.Unity.Examples
{
    public class AnchorExchanger
    {
        //#if !UNITY_EDITOR
        private DatabaseService service = DatabaseService.Instance; 

        private string baseAddress = "";

        private List<string> anchorkeys = new List<string>();

        public List<string> AnchorKeys
        {
            get
            {
                lock (anchorkeys)
                {
                    return new List<string>(anchorkeys);
                }
            }
        }

        public void WatchKeys(string exchangerUrl)
        {
            baseAddress = exchangerUrl;
            Task.Factory.StartNew(async () =>
                {
                    string previousKey = string.Empty;
                    while (true)
                    {
                        var currentAnchor = await RetrieveLastAnchorKey();
                        string currentKey = currentAnchor.anchors[0].anchorID.ToString();
                        if (!string.IsNullOrWhiteSpace(currentKey) && currentKey != previousKey)
                        {
                            Debug.Log("Found key " + currentKey);
                            lock (anchorkeys)
                            {
                                anchorkeys.Add(currentKey);
                            }
                            previousKey = currentKey;
                        }
                        await Task.Delay(500);
                    }
                }, TaskCreationOptions.LongRunning);
        }

        public async Task<AnchorList> RetrieveAllAnchorKeys()
        {
            try
            {
                HttpClient client = service.httpClient;
                var content = await client.GetStringAsync(baseAddress);
                Debug.Log("Getting anchor: " + content);
                return JsonUtility.FromJson<AnchorList>("{\"anchors\":" + content + "}");

            }
            catch (Exception ex)
            {
                Debug.LogException(ex);
                Debug.LogError($"Failed to retrieve all anchor keys");
                return null;
            }
        }

        public async Task<AnchorList> RetrieveAnchorKeyWithId(string anchorID)
        {
            try
            {
                HttpClient client = service.httpClient;
                var content = await client.GetStringAsync(baseAddress + "/?anchorID=" + anchorID);
                Debug.Log("Getting anchor key with id: " + content);
                return JsonUtility.FromJson<AnchorList>("{\"anchors\":" + content + "}");

            }
            catch (Exception ex)
            {
                Debug.LogException(ex);
                Debug.LogError($"Failed to retrieve anchor key with anchorID." + anchorID);
                return null;
            }
        }

        public async Task<AnchorList> RetrieveAnchorKey(long anchorNumber)
        {
            try
            {
                HttpClient client = service.httpClient;
                var content = await client.GetStringAsync(baseAddress + "/" + anchorNumber.ToString());
                Debug.Log("Getting anchor: " + content);
                return JsonUtility.FromJson<AnchorList>("{\"anchors\":" + content + "}");

            }
            catch (Exception ex)
            {
                Debug.LogException(ex);
                Debug.LogError($"Failed to retrieve anchor key for anchor number: {anchorNumber}.");
                return null;
            }
        }

        public async Task<AnchorList> RetrieveLastAnchorKey()
        {
            try
            {
                HttpClient client = service.httpClient;
                var content = await client.GetStringAsync(baseAddress + "/last");
                //Debug.Log("Getting last anchor: " + content);
                return JsonUtility.FromJson<AnchorList>("{\"anchors\":" + content + "}");
            }
            catch (Exception ex)
            {
                Debug.LogException(ex);
                Debug.LogError("Failed to retrieve last anchor key.");
                return null;
            }
        }

        public async Task<string> DeleteAnchorKey(Anchor anchor)
        {
            try
            {
                HttpClient client = service.httpClient;
                var response = await client.DeleteAsync(baseAddress + "/?anchorNumber=" + anchor.anchorNumber);
                if (response.IsSuccessStatusCode)
                {
                    Debug.Log("Deleted anchor number successful " + anchor.anchorNumber);
                } else
                {
                    Debug.Log("Delete anchor not successful " + anchor.anchorNumber);
                    Debug.Log(response.ReasonPhrase);
                }
                return response.ToString();
            }
            catch (Exception ex)
            {
                Debug.LogException(ex);
                Debug.LogError("Failed to delete anchor number.");
                return null;
            }
        } 

        internal async Task<long> StoreAnchorKey(Anchor anchor)
        {
            if (string.IsNullOrWhiteSpace(anchor.anchorID.ToString()))
            {
                Debug.Log("Anchor's anchor ID is null or white space");
                return -1;
            }

            try
            {
                //#if !UNITY_EDITOR
                service = DatabaseService.Instance;
                HttpClient client = service.httpClient;
                var json = JsonUtility.ToJson(anchor);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await client.PostAsync(baseAddress, content);
                if (response.IsSuccessStatusCode)
                {
                    string responseBody = await response.Content.ReadAsStringAsync();
                    long ret;
                    Debug.Log("Response body is " + responseBody);
                    var res = JsonUtility.FromJson<responseSql>(responseBody);

                    if (long.TryParse(res.insertId.ToString(), out ret))
                    {
                        Debug.Log("Key " + ret.ToString());
                        return ret;
                    }
                    else
                    {
                        Debug.LogError($"Failed to store the anchor key. Failed to parse the response body to a long: {responseBody}.");
                    }
                }
                else
                {
                    Debug.LogError($"Failed to store the anchor key: {response.StatusCode} {response.ReasonPhrase}.");
                }

                Debug.LogError($"Failed to store the anchor key: {anchor.anchorID}.");
                return -1;
            }
            catch (Exception ex)
            {
                Debug.LogException(ex);
                Debug.LogError($"Failed to store the anchor key: {anchor.anchorID}.");
                return -1;
            }
        }
//#endif
    }
}
