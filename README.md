# Concentration Game

Javascript/JQuery based implementation of the classic concentration card game

Author: Christopher Rhodes (chrisguyrhodes@gmail.com)

![Concentration Screenshot](/images/screenshot.png?raw=true "Concentration Game")

## Rules

https://en.wikipedia.org/wiki/Concentration_(card_game)

## Demo

Play the game by visiting http://concentrationgame.s3-website-us-east-1.amazonaws.com/concentration.html

## Setup

The game will run on any web server. Just export the files to the root directory of the webserver to play. If you want to service the content from s3 see the instructions below

### Serving the content form s3

A simple and fast way to setup a site that will serve the content is to use Amazon S3 static website hosting. See ![Website Endpoints](/documentation/s3-userguide.pdf#WebsiteEndpoints) 
documentation (Website endpoints section on page 1118).

### Setting up online game play support

If you want to support online game play you will need to configure the Amazon AWS Client and read/write permissions on a state directory used to keep game state.

#### Create a "state" directory that will have public read/write permissions

In an Amazon S3 bucket (you can use the same bucket you are using to service the game static content) create a directory that will be used to store game state. The directory has to be a top level directory in the bucket. Update the
S3_ONLINE_GAMEPLAY_DIR in the js/constants.js to be set to the name of this S3 directory. Also set the S3_REGION and S3_BUCKET_NAME in the js/constants.js file to the approprite values.

#### Setup CORS policies

You must grant permission of other domains to access the state directory via a CORS policy on your S3 bucket. Click the "permissions" tab in your S3 bucket and add the following CORS policy.

```javascript
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD",
            "PUT",
            "POST",
            "DELETE"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": []
    }
]
```

![CORS Screenshot](/images/corspolicy.png?raw=true "Cors Policy")

#### Setup the Cognito identity pool for unauthenticated users

See ![Javascript SDK getting started documentation](/documentation/js-sdk-dg.pdf#getting-started-browser) documentation (Getting started in a browser script on page 8).

Set the COGNITO_IDENTITY_POOL_ID in js/constants.js to your identity pool id. Please do not use the existing one that belongs to me.

#### Grant the Cognito user read write permissions on the state directory

The AWS S3 client will need read/write permission on the state directory. Of course you do not want the user to have write permission on other directories. Create a new AWS S3 policy that gives the Cognito role you created read and write
permission on the state directory.

The policy will look like the following if the state directory is named "state"

```javascript
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "s3:*",
            "Resource": "arn:aws:s3:::concentrationgame/state/*"
        }
    ]
}
```

![Cognito IAM Policy Screenshot](/images/cognitoiampolicy.png?raw=true "Cognito IAM Policy")

Attach the policy to the Cognito role

### Changing the logic / Compiling

The project include a number of JavaScript classes and scripts. In order to prevent numerous http requests to load all of the various JavaScript files they all get "compiled" into a single file called js/compiled.js. Any time changes are
made to the JavaScript files you need to "recompile them". The compilation process simply involves concatenating all the files into a single file in a particular order. If you are using a Mac or Linux you can use the "compile" bash script
that is in the root directory. If you are using other platforms you will need some way to concatenate all the JavaScript files into a single filed called js/compiled.js. The order must be the same as the order defined in the js/compile 
script.
