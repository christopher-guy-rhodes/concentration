class Dao {
    constructor() {
        AWS.config.region = 'us-east-1'; // Region
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:5c67bf62-755c-41f2-8ddf-a0a0ceea6a18',
        });

        const customBackoff = (retryCount) => {
            console.log(`retry count: ${retryCount}, waiting: 1000ms`)
            return 1000
        }


        this.s3 = new AWS.S3({apiVersion: '2006-03-01',
            maxRetries: 2,
            retryDelayOptions: { customBackoff },
            httpOptions: {
                connectTimeout: 2 * 1000, // time succeed in starting the call
                timeout: 5 * 1000, // time to wait for a response
                // the aws-sdk defaults to automatically retrying
                // if one of these limits are met.
            },
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
        }, function(err) {
            if (err) {
                // there could still be retries left
                //alert('error putting value ' + value);
            }
            fn(err);
        });

    }

    get(key, fn, count = 0) {
        let self = this;
        //console.log('get: bucket: %s key: %s', this.bucket + '/' + this.stateDir, key);
        let retryFn = async function retry(err, data) {
            if (err) {
                if (count > 3) {
                    fn(err);
                } else {
                    let backoff = Math.pow(2, count);
                    //console.log('get error: key:%s retrying with backoff:%d count:%d', key, backoff, count);
                    await sleep(backoff);
                    self.get(key, retry, ++count);
                }
            } else {
                //console.log('get successful: key: %s bucket: %s', key, self.bucket + '/' + self.stateDir);
                fn(undefined, data);
            }
        };

        /*
        let rand = Math.floor(Math.random() * 10);
        console.log('rand is ' + rand);
        let simulateError = rand <= 4;
        */
        let simulateError = false;
        this.s3.getObject({Bucket : this.bucket + '/' + this.stateDir, Key: simulateError ? undefined : key}, retryFn);
    }
}
