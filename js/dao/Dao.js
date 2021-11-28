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

    put(key, value, fn, count = 0) {
        let self = this;
        console.log('put: value: %s bucket: %s key: %s', value, this.bucket + '/' + this.stateDir, key);
        let retryFn = async function retry(err) {
            if (err) {
                if (count > 3) {
                    fn(err);
                } else {
                    let backoff = Math.pow(2, count);
                    console.log('put error: key:%s value:%s, retrying with backoff:%d count:%d',
                        key, value, backoff, count);
                    await sleep(backoff);
                    self.put(key, value, retry, ++count);
                }
            } else {
                console.log('put successful: key: %s bucket: %s value: %s',
                    key, self.bucket + '/' + self.stateDir, value);
                fn();
            }
        };

        /*
        let rand = Math.floor(Math.random() * 10);
        console.log('rand is ' + rand);
        let simulateError = rand <= 4;
        */
        let simulateError = false;

        this.s3.putObject({
            Bucket: this.bucket + '/' + this.stateDir,
            Key: simulateError ? undefined : key,
            ContentType: 'application/json; charset=utf-8',
            Body: value
        }, retryFn);

    }

    get(key, fn, count = 0) {
        let self = this;
        console.log('get: bucket: %s key: %s', this.bucket + '/' + this.stateDir, key);
        let retryFn = async function retry(err, data) {
            if (err) {
                if (count > 3) {
                    fn(err);
                } else {
                    let backoff = Math.pow(2, count);
                    console.log('get error: key:%s retrying with backoff:%d count:%d', key, backoff, count);
                    await sleep(backoff);
                    self.get(key, retry, ++count);
                }
            } else {
                console.log('get successful: key: %s bucket: %s', key, self.bucket + '/' + self.stateDir);
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
