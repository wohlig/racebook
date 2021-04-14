export default {
    /* 
        author: Siddhesh Salunkhe
        description: 
    */
    verifyDomain: (data, callback) => {
        DomainWhitelist.findOne({
            domain: data.frontendUrl
        }).exec((err, result) => {
            console.log(
                "verifyDomain err ::::: ",
                err,
                "verifyDomain result ::::: ",
                result
            )
            if (err || _.isEmpty(result)) {
                callback("Domain Not Registered")
            } else {
                callback(null, result)
            }
        })
    }
}
