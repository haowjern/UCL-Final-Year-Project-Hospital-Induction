using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class AppLoader : MonoBehaviour
{
    // load scene 
    public void loadCameraScene()
    {
        SceneManager.LoadScene(1);
    }

    public void loadCrudArScene()
    {
        SceneManager.LoadScene(2);
    }

    public void loadUiScene()
    {
        SceneManager.LoadScene(0);
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
