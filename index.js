var request = require("request")
var aws = require('aws-sdk')

var url = process.env.url
var expectedResponse = process.env.expectedResponse
var lambdaOnFailure = process.env.lambdaOnFailure
var region = process.env.region

exports.handler = (event, context, callback) => {
  check(callback)
}

function check(callback) {
  request(url, function (error, response, body) {
    if (error) {
      console.log("Got error! Will call " + lambdaOnFailure, error)
      callFailureLambda(callback)      
    } else if (response.statusCode != 200) {
      console.log("Got status code " + response.statusCode + ". Will call " + lambdaOnFailure)
      callFailureLambda(callback)      
    } else {
      if (body == expectedResponse) {
        console.log("Got expected response :)")
        callback(null, "Got expected response: " + body)
      } else {
        console.log("Got unexpected response! Will call " + lambdaOnFailure, body)
        callFailureLambda(callback)
      }             
    }
  })
}

function callFailureLambda(callback) {
  var accessKeyId = "AKIAJMJQ3RR2QR2UDYMA"
  var secretAccessKey = "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"
  
  var lambda = new aws.Lambda({
    region: region,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
  });

  lambda.invoke({
    FunctionName: lambdaOnFailure
  }, function(error, data) {
    if (error) {      
      callback(error, null)
    } else {
      callback(null, "Watchdog detected a problem! Calling " + lambdaOnFailure)
    }
  });  
}


