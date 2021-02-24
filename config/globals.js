/**
 * Define Global Variables Here
 * global._ = require("lodash")
 */

if (process.env["mongodb_url"]) {
    var mongodbTemplate = process.env["mongodb_url"]
    var mongodbUsername = process.env["mongodb_username"]
    var mongodbPassword = process.env["mongodb_password"]

    global.env.MONGODB_URL = _.template(mongodbTemplate)({
        databaseName: `${process.env["product_name"]}-racebook-${process.env["product_namespace"]}`,
        databaseUsername: mongodbUsername,
        databasePassword: mongodbPassword
    })

    global.env.PORT = 3000

    console.log("INSIDE GLOBAL.JS IFFFFFF :::::", global.env.MONGODB_URL)
} else {
    global.env.MONGODB_URL =
        "mongodb://iceexch:cpbDLN4e728d05VM@iceexch-shard-00-00-dzuqc.mongodb.net:27017,iceexch-shard-00-01-dzuqc.mongodb.net:27017,iceexch-shard-00-02-dzuqc.mongodb.net:27017/cmroyalexch-racebook-cmlevel?authSource=admin&replicaSet=IceExch-shard-0&retryWrites=true&ssl=true&w=majority"

    console.log("INSIDE GLOBAL.JS ELSEEEE :::::", global.env.MONGODB_URL)
}