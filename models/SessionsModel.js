export default {
    /* 
        author: Siddhesh Salunkhe
        description: Check sessions by session id and status
    */
    sessionExists: function (data, callback) {
        Sessions.findOne(
            {
                sessionId: data.sid,
                status: "Active"
            },
            {
                userId: 1,
                url: 1
            }
        ).exec((err, found) => {
            // console.log("1", found)
            // console.log("2", found.userId);
            // console.log("3", data.userId);
            if (err || _.isEmpty(found)) {
                var responseData = {}
                responseData.status = "INVALID_SID"
                callback(null, responseData)
            } else if (found) {
                if (found.userId + "" == data.userId + "") {
                    var responseData = {}
                    responseData.status = "OK"
                    responseData.url = found.url ? found.url : ""
                    callback(null, responseData)
                } else {
                    var responseData = {}
                    responseData.status = "INVALID_PARAMETER"
                    callback(null, responseData)
                }
            } else {
                var responseData = {}
                responseData.status = "INVALID_SID"
                callback(null, responseData)
            }
        })
    },

    balanceWallet: function (data, callback) {
        Sessions.findOne(
            {
                sessionId: data.sid,
                status: "Active"
            },
            {
                url: 1
            }
        ).exec(function (err, found) {
            if (err || _.isEmpty(found)) {
                let responseData = {}
                responseData.status = "INVALID_SID"
                callback(null, responseData)
            } else if (found) {
                var userData = {}
                userData.id = data.userId
                
                request.post(
                    {
                        // url: found.url + "AR/getCurrentBalanceNew",
                        url: "http://localhost:1339/Api/Racebook/getCurrentBalanceNew",
                        body: userData,
                        json: true
                    },
                    function (error, response, body) {
                        if (error || body.error) {
                            // console.log("*******ERROR BODY*********", error, body);
                            var responseData = {}
                            responseData.status = "INVALID_PARAMETER"
                            callback(null, responseData)
                        } else {
                            if (body && body.data && body.data.balance) {
                                let responseData = {}
                                responseData.status = "OK"
                                responseData.balance = body.data.balance.toFixed(
                                    2
                                )
                                responseData.uuid = data.uuid
                                callback(null, responseData)
                            } else {
                                let responseData = {}
                                responseData.status = "INVALID_PARAMETER"
                                callback(null, responseData)
                            }
                        }
                    }
                )
            } else {
                var responseData = {}
                responseData.status = "INVALID_SID"
                callback(null, responseData)
            }
        })
    }
}
