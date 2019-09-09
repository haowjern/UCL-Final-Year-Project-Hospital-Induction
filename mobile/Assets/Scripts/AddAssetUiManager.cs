using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AddAssetUiManager : MonoBehaviour
{
    public Animator hamburgerMenu;
    public bool isHiddenDefaultValue;
    private bool isHidden;
    private bool buttonListIsSet; 

    // Start is called before the first frame update
    void Start()
    {
        hamburgerMenu.SetBool("isHidden", isHiddenDefaultValue);
        isHidden = hamburgerMenu.GetBool("isHidden");
        buttonListIsSet = false; 
    }

    // Update is called once per frame
    void Update()
    {
        if (!isHidden && !buttonListIsSet)
        {

            // get all assets 

            // load names into button list for hamburger menu, 
            // and adding more or deleting rest of the buttons
            // set button with object values too; 

            // each button assign script to load assetbundle of its own value!
        }
    }

    public void ToggleMenu()
    {
        isHidden = hamburgerMenu.GetBool("isHidden");
        hamburgerMenu.SetBool("isHidden", !isHidden);
        isHidden = !isHidden;
        buttonListIsSet = !buttonListIsSet;
    }

    //public void LoadAssetBundle(string asset);
    //{
        // get asset blob url 

        // load asset bundle into the center 
        // and give it its asset bundle script to manipulate its movements 
    //}

    //public void Save()
    //{
        // save new anchor 
        // for every asset existing on screen, save anchored asset with its pose
        // 
    //}
}
