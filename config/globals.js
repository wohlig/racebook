/**
 * Define Global Variables Here
 * global._ = require("lodash")
 */

if (process.env["mongodb_url"]) {
    console.log("INSIDE IFFFFF")
    var mongodbTemplate = process.env["mongodb_url"]
    var mongodbUsername = process.env["mongodb_username"]
    var mongodbPassword = process.env["mongodb_password"]
    console.log(mongodbTemplate)
    global.env.MONGODB_URL = _.template(mongodbTemplate)({
        databaseName: `${process.env["product_name"]}-racebook-${process.env["product_namespace"]}`,
        databaseUsername: mongodbUsername,
        databasePassword: mongodbPassword
    })
    console.log(global.env.MONGODB_URL)

    global.env.PORT = 3000
}