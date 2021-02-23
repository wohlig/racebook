export default {
    /* 
        author: Siddhesh Salunkhe
        description: 
    */
    sessionExists: function (data, callback) {
        console.log("sessionExists:::::")
        Sessions.findOne(
            {
                sessionId: data.sid,
                status: "Active"
            },
            {
                userId: 1,
                url: 1
            }
        ).exec(function (err, found) {
            console.log("sessionExists::::: <><found><>", found)
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
