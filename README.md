# UCL-Final-Year-Project-Hospital-Induction

A suite of apps were developed for the use of hospital induction for junior doctors at Great Ormond Street Hospital (GOSH). 

A mobile app was built in Unity to display maps of building layouts at GOSH, and to create, edit, delete and view Augmented Reality (AR) assets. The AR used was Azure Spatial Anchors. This is designed to be used by the junior doctors. 

A web app was built in Angular with CRUD functionality to upload maps to the storage. This is designed to be used by the staff at GOSH to upload their own maps as they see fit. This is hosted on the cloud with Azure Web App. 

To upload 3D models to be used by AR, staff will need to use the 'Create and Upload AssetBundles' script in Unity following a series of steps detailed in the report. 

A server built in Express.JS connects the web app and mobile app to the storage, following a REST-like interface (Not fully RESTful as it was not cacheable). 

The storage is a combination of MySQL Database, hosted on Azure Database For MySQL and Azure Blob Storage, to store assets. 

Full details of the project is detailed on the report attached to this repository.

