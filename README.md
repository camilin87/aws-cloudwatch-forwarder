# aws-cloudwatch-forwarder  

[![Build Status](https://travis-ci.org/camilin87/aws-cloudwatch-forwarder.svg?branch=master)](https://travis-ci.org/camilin87/aws-cloudwatch-forwarder)  

Forwards the StdIn to AWS Cloudwatch  

## Prerequisites  
1. [NodeJs](https://nodejs.org/en/download/package-manager/)  

2. Get a pair of AWS credentials that [can forward logs to CloudWatch](https://www.tddapps.com/2016/07/01/configure-AWS-cloudwatch-for-log-forwarders/)  

3. Make sure the following environment variables are set  
    ```
    AWS_REGION='us-east-1'
    AWS_ACCESS_KEY_ID='XXXXXXXXXXXXXXX'
    AWS_SECRET_ACCESS_KEY='XXXXXXXXXXXXXXX'
    ```

## Installation  

```sh
npm i -g aws-cloudwatch-forwarder
```

## Usage  

Execute your application in the following way  

```sh
aws-cloudwatch-forwarder 'echo "sample application"'
```

Where `echo "sample application"` is your application.  

### Usage inside of a node application  

[Check out this sample application](https://github.com/camilin87/test-node-cloudwatch)  

## Configuration  

The forwarder can be configured through the following environment variables.  

- `FC_AWS_LOG_GROUP_NAME` the AWS log group name. Defaults to `aws-log-forwarder`.  

- `FC_AWS_LOG_STREAM_NAME` the AWS log stream name. Defaults to the following calculated value `{hostname}-{platform}-{title}-{pid}`.  

- `FC_AWS_DEBUG` whether to display AWS transmission DEBUG info. Defaults to `false`.  

- `FC_AWS_ENABLED` whether the AWS forwarder is enabled. Defaults to `true`.  

- `FC_STDOUT_ENABLED` whether to print out the piped data into the StdOut. Defaults to `true`.  


### Nitpicky Details  

- `FCG_POLLING_INTERVAL` the wait time in milliseconds the forwarder waits before checking if there any data to forward. Defaults to `1000` ms.  

- `FCG_MAX_COUNT_PER_TRANSMISSION` the maximum number of log messages to forward in a single AWS transmission. Defaults to `10000`.  

- `FCG_RETRY_COUNT` the number of retries in case of a failure. Defaults to `0`. This means retry is disabled.  

- `FCG_RETRY_DELAY_BASE_INTERVAL` the base number of milliseconds to use in the exponential backoff for operation retries. Defaults to `100` ms.  

- `FCG_DEBUG` whether to display forwarder events. Defaults to `false`.  

- `FCG_START_DEBUGGER` whether to launch the forwarder using the [node-inspector](https://github.com/node-inspector/node-inspector) debugger. Defaults to `false`.  
