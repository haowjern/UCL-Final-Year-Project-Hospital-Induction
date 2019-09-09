using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

[Serializable]
public class responseSql
{
    public int fieldCount;
    public int affectedRows;
    public int insertId;
    public int serverStatus;
    public int warningCount;
    public string message;
    public bool protocol41;
    public int changedRows;
}