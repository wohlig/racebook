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
        ).exec( (err, found) => {
            // console.log("1", found);
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
    }
}
