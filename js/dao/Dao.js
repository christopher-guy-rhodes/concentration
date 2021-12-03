class Dao {
    constructor() {
        AWS.config.region = 'us-east-1'; // Region
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:5c67bf62-755c-41f2-8ddf-a0a0ceea6a18',
        });

        const customBackoff = (retryCount) => {
            //alert('retry count: ' + retryCount + 'waiting: 1000ms)');
            if (retryCount > 0) {
                console.log('got retry > 0');
            }
            return 1000
        }


        this.s3 = new AWS.S3({apiVersion: '2006-03-01',
            /*
            maxRetries: 5,
            retryDelayOptions: { customBackoff },
            httpOptions: {
                connectTimeout: 2 * 1000, // time succeed in starting the call
                timeout: 5 * 1000, // time to wait for a response
                // the aws-sdk defaults to automatically retrying
                // if one of these limits are met.
            },

             */
        });
        this.bucket = 'concentrationgame';
        this.stateDir = 'state'
    }

    putObject(key, value) {
        this.put(key, JSON.stringify(value), function (err) {
            if (err) {
                // there could still be retries left
                //alert('putObject: error see console log for details.');
                //throw new Error(err);
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
        }, async function(err) {
            if (err) {
                console.log('put failed with error ' + err + ' key:' + key + ' value: ' + value + ' waiting 10 seconds and retrying');
                await sleep(10000);
                return self.put(key, value, fn);
            } else {
                fn(err);
            }
        });

    }

    get(key, fn, count = 0) {
        let self = this;
        this.s3.getObject({Bucket : this.bucket + '/' + this.stateDir, Key: key}, function (err, data) {
            fn(err, data);
        });
    }
}
