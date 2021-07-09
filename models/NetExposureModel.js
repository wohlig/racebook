export default {
    /* 
        author: Siddhesh Salunkhe
        description: getting overall exposure
    */
    GetNetExpoByuser: (data, callback) => {
        console.log("GetNetExpoByuser ::::: data ::::: ", data)
        var query = {}
        if (!data.url) {
            callback("URL Missing")
        } else {
            query = {
                userId: ObjectId(data.userId),
                status: "pending",
                url: data.url,
                createdAt: {
                    $gte: moment().subtract(10, "minutes").toDate()
                }
            }
            console.log("GetNetExpoByuser ::::: query ::::: ", query)

            NetExposure.aggregate([
                {
                    $match: query
                },
                {
                    $group: {
                        _id: null,
                        amount: {
                            $sum: "$amount"
                        }
                    }
                }
            ]).exec((err, netExposureData) => {
                console.log("GetNetExpoByuser ::::: responseeeeeee ::::: ", err, netExposureData)

                if (err) {
                    callback(err)
                } else {
                    if (
                        !_.isEmpty(netExposureData) &&
                        !_.isEmpty(netExposureData[0])
                    ) {
                        console.log(
                            "GetNetExpoByuser ::::: netExposureData before ::::: ",
                            netExposureData
                        )
                        netExposureData[0].amount *= -1
                        console.log(
                            "GetNetExpoByuser ::::: netExposureData after ::::: ",
                            netExposureData
                        )
                    } else {
                        console.log("GetNetExpoByuser ::::: IN ELSEEEEEEEEEE")
                        netExposureData = [{}]
                        netExposureData[0].amount = 0
                    }
                    callback(null, netExposureData[0])
                }
            })
        }
    },

    /* 
        author: Siddhesh Salunkhe
        description: getting refId wise exposure
    */
    GetNetExposureByUser: (data, callback) => {
        console.log("GetNetExposureByUser data ::::: ", data)

        var query = {}
        if (!data.url) {
            callback("URL Missing")
        } else {
            query = {
                userId: ObjectId(data.userId),
                status: "pending",
                url: data.url,
                createdAt: {
                    $gte: moment().subtract(10, "minutes").toDate()
                }
            }
            if (data.transaction && data.transaction.refId) {
                query.refId = data.transaction.refId
            }
            console.log("GetNetExposureByUser ::::: query ::::: ********* ", query)

            NetExposure.aggregate([
                {
                    $match: query
                },
                {
                    $group: {
                        _id: null,
                        amount: {
                            $sum: "$amount"
                        }
                    }
                }
            ]).exec((err, netExposureData) => {
                console.log("GetNetExposureByUser ::::: ", err, netExposureData)
                if (err) {
                    callback(err)
                } else {
                    if (
                        !_.isEmpty(netExposureData) &&
                        !_.isEmpty(netExposureData[0])
                    ) {
                        console.log(
                            "GetNetExposureByUser ::::: netExposureData before ::::: ",
                            netExposureData
                        )
                        netExposureData[0].amount *= -1
                        console.log(
                            "GetNetExposureByUser ::::: netExposureData after ::::: ",
                            netExposureData
                        )
                    } else {
                        netExposureData = [{}]
                        netExposureData[0].amount = 0
                    }
                    callback(null, netExposureData[0])
                }
            })
        }
    },

    /* 
        author: Siddhesh Salunkhe
        description: update netexposure status after credit call
    */
    updateNetExposure: (data, callback) => {
        console.log("updateNetExposure ::::: queryyyyyyyyyy ::::: ", {
            userId: data.userId,
            url: data.url,
            refId: data.transaction.refId
        })

        NetExposure.update(
            {
                userId: data.userId,
                url: data.url,
                refId: data.transaction.refId
            },
            {
                status: "completed"
            },
            {
                multi: true
            }
        ).exec(callback)
    }
}
