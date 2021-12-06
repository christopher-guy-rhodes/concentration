class Dao {
    constructor() {
        AWS.config.region = S3_REGION; // Region
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: COGNITO_IDENTITY_POOL_ID,
        });

        this.s3 = new AWS.S3({apiVersion: AWS_SDK_API_VERSION});
        this.bucket = S3_BUCKET_NAME;
        this.stateDir = S3_ONLINE_GAMEPLAY_DIR;
    }

    putObject(key, value, fn) {
        this.put(key, JSON.stringify(value), function (err) {
            if (fn !== undefined) {
                fn(err);
            }
        });
    }

    put(key, value, fn) {
        let self = this;

        this.s3.putObject({
            Bucket: this.bucket + '/' + this.stateDir,
            Key: key,
            ContentType: 'application/json; charset=utf-8',
            Body: value
        }, function(err) {
            if (fn !== undefined) {
                fn(err);
            }
        });

    }

    get(key, fn) {
        let self = this;
        this.s3.getObject({Bucket : this.bucket + '/' + this.stateDir, Key: key}, function (err, data) {
            if (fn !== undefined) {
                fn(err, data);
            }
        });
    }
}
