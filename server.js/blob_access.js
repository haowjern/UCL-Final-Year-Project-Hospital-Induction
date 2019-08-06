const config = require('./config')['development'];

const {
    Aborter,
    BlobURL,
    BlockBlobURL,
    ContainerURL,
    ServiceURL,
    StorageURL,
    SharedKeyCredential,
    uploadStreamToBlockBlob
} = require('@azure/storage-blob');

const fs = require("fs");
const path = require("path");

const ONE_MEGABYTE = 1024 * 1024;
const FOUR_MEGABYTES = 4 * ONE_MEGABYTE;
const ONE_MINUTE = 60 * 1000;

const aborter = Aborter.timeout(30 * ONE_MINUTE);

const uploadOptions = {
    bufferSize: FOUR_MEGABYTES,
    maxBuffers: 5,
};

const STORAGE_ACCOUNT_NAME = config.storage.accountName;
const ACCOUNT_ACCESS_KEY = config.storage.accountKey; 

const sharedKeyCredential = new SharedKeyCredential(STORAGE_ACCOUNT_NAME, ACCOUNT_ACCESS_KEY);
const pipeline = StorageURL.newPipeline(sharedKeyCredential);
const serviceURL = new ServiceURL(`https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`, pipeline);


// Upload file stream
module.exports = {
    uploadStream: async function (containerName, stream, blobName) {
        const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);
        const blobURL = BlobURL.fromContainerURL(containerURL, blobName);
        const blockBlobURL = BlockBlobURL.fromBlobURL(blobURL);
    
        try { 
            await uploadStreamToBlockBlob(aborter, stream, blockBlobURL, uploadOptions.bufferSize, uploadOptions.maxBuffers);
            console.log('Success - File uploaded to Azure Blob Storage.');   
        } catch (err) {
            console.log('Error - File not uploaded to Azure Blob Storage');
            console.log(err);
        }
    },

    deleteBlob: async function (containerName, blobName) {
        const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);
        const blobURL = BlobURL.fromContainerURL(containerURL, blobName);
        const blockBlobURL = BlockBlobURL.fromBlobURL(blobURL);

        try {
            blockBlobURL.delete(aborter); 
        } catch (err) {
            console.log('Error - Blob cannot be deleted');
        }
    },

    readStream: async function (containerName, blobName) {
        const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);
        const blobURL = BlobURL.fromContainerURL(containerURL, blobName);
        const blockBlobURL = BlockBlobURL.fromBlobURL(blobURL);

        try {
            const downloadResponse = await blockBlobURL.download(aborter, 0);
            return downloadResponse.readableStreamBody; 
        } catch (err) {
            console.log('Error - Blob cannot be read ' + err);
        }
    }
}