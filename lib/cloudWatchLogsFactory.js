var awsModule = require('aws-sdk');

module.exports = (aws, env) => {
    if (!aws){
        aws = awsModule
    }

    if (!env){
        env = process.env
    }

    return {
        create: () => {
            if (!env.AWS_REGION){
                throw new Error("AWS_REGION missing")
            }

            if (!env.AWS_ACCESS_KEY_ID){
                throw new Error("AWS_ACCESS_KEY_ID missing")
            }

            if (!env.AWS_SECRET_ACCESS_KEY){
                throw new Error("AWS_SECRET_ACCESS_KEY missing")
            }

            aws.config.update({
                region: env.AWS_REGION,
                accessKeyId: env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY
            })

            return new aws.CloudWatchLogs()
        }
    }
}