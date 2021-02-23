export default {
    /* 
        author: Siddhesh Salunkhe
        description: 
    */
    GetNetExpoByuser(data, callback) {
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
                if (err) {
                    callback(err)
                } else {
                    if (
                        !_.isEmpty(netExposureData) &&
                        !_.isEmpty(netExposureData[0])
                    ) {
                        netExposureData[0].amount *= -1
                    } else {
                        netExposureData = [{}]
                        netExposureData[0].amount = 0
                    }
                    callback(null, netExposureData[0])
                }
            })
        }
    }
}
