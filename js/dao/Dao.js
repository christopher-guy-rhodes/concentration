class Dao {
    constructor() {
        AWS.config.region = 'us-east-1'; // Region
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:5c67bf62-755c-41f2-8ddf-a0a0ceea6a18',
        });

        this.s3 = new AWS.S3({apiVersion: '2006-03-01'});
        this.bucket = 'concentrationgame';
        this.stateDir = 'state'
    }

    put(key, value, fn) {
        console.log('putting: %o bucket: %s key: %o', JSON.parse(value), ' into bucket:' + this.bucket + '/' + this.stateDir, key);
        this.s3.putObject({
            Bucket: this.bucket + '/' + this.stateDir,
            Key: key,
            ContentType: 'application/json; charset=utf-8',
            Body: value
        }, fn);

    }

    get(key, fn) {
        this.s3.getObject({Bucket : this.bucket + '/' + this.stateDir, Key: key}, fn);
    }
}
