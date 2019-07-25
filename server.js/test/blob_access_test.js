const assert = require('chai').assert;
const blob_access = require('../blob_access'); 
const https = require('https');

let container_name = "assets";
let file_path = "C:/Users/haowjern/UCL Summer Project/AR-Treasure-Hunt-App/server.js/test/assets/Building Layer.PNG"
let blob_name = "test_asset";


async function main() {
  await blob_access.uploadStream(container_name, file_path, blob_name); 
}

main().then(() => {
  console.log("Success");
}).catch(err => {
  console.log(err.message);
})

https.get("https://apptreasurehunt.blob.core.windows.net/assets/", (res) => {
  console.log("Get request sent");
});
