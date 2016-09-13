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
            validateConfiguration()

            aws.config.update({
                region: env.AWS_REGION,
                accessKeyId: env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY
            })

            return new aws.CloudWatchLogs()
        }
    }

    function validateConfiguration(){
        [
            "AWS_REGION",
            "AWS_ACCESS_KEY_ID",
            "AWS_SECRET_ACCESS_KEY"
        ].forEach(validateConfigurationSetting)
    }

    function validateConfigurationSetting(key){
        if (!env[key]){
            throw new Error(`${key} missing`)
        }
    }
}