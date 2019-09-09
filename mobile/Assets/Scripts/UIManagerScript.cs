using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class UIManagerScript : MonoBehaviour
{
    public Animator hamburgerMenu;
    public bool isHiddenDefaultValue;
    private bool isHidden;

    // Start is called before the first frame update
    void Start()
    {
        hamburgerMenu.SetBool("isHidden", isHiddenDefaultValue);
        isHidden = hamburgerMenu.GetBool("isHidden");
    }

    // Update is called once per frame
    void Update()
    {
    }

    public void ToggleMenu()
    {
        Debug.Log("Toggling Menu");
        isHidden = hamburgerMenu.GetBool("isHidden");
        hamburgerMenu.SetBool("isHidden", !isHidden);
    }
}
