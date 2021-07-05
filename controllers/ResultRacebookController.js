import TransactionsModel from "../models/TransactionsModel"

const router = Router()

/* 
    result function
*/
router.post("/result", async (req, res) => {
    console.log("<><><>result route call<><><>")
    
    // let error = []
    // let reqData = req.body
    // let betfairNetAmt = 0

    // console.log("MATCHODDS RESULT FOR :", reqData)

    // if (reqData) {
    //     if (!reqData.marketId || !_.isString(reqData.marketId)) {
    //         error.push("Please provide valid marketId")
    //     }
    //     if (!reqData.horse) {
    //         error.push("Please provide valid horse")
    //     }
    //     if (!reqData.status) {
    //         error.push("Please provide valid result status")
    //     }
    // } else {
    //     error.push("Invalid Parameters")
    // }

    // if (_.isEmpty(error)) {
    //     if (!SessionModel.checkResultInProcess(reqData.marketId)) {
    //         SessionModel.setResultInProcess(reqData.marketId)

            let marketIds = [];
            async.waterfall(
                [
                    async (callback) => {
                        let betsData = await TransactionsModel.getBetsForResult()

                        if (betsData && betsData.length > 0) {
                            // console.log("in waterfall betsData ::::: ", betsData)
                            callback(null, betsData)
                        } else {
                            callback("No Bets Found For Result")
                        }
                    },
                    (betsData, callback) => {
                        let mainResultArray = [];

                        async.eachSeries(
                            betsData,
                            (markets , cb) => {
                                // console.log("meetingId ::::: ", markets.meetingId)

                                TransactionsModel.getResults(
                                    {
                                        meetingId: markets.meetingId,
                                        eventNo: markets.eventNo
                                    },
                                    (err, data) => {
                                        // console.log("getResults ::::: ", err, data)
                                        if (err) {
                                            cb(err)
                                        } else {
                                            marketIds.push(markets.meetingId)
                                            mainResultArray.push(data)
                                            cb(null, data)
                                        }
                                    }
                                )
                            },
                            (err) => {
                                if (err) {
                                    // console.error("async.each ::::: error iss ::::: ", err);
                                    cb(err)
                                } else {
                                    // console.log("---mainResultArray---", mainResultArray)
                                    callback(null, mainResultArray)
                                }

                            }
                        )

                    }, 
                    async (resultData ,callback) => {
                        // console.log("^^^^^^^^^resultData^^^^^^^^^", resultData);
                        // console.log("^^^^^^^^^marketIds^^^^^^^^^", marketIds);

                        let debitData = await TransactionsModel.getMarketIdWiseBets(marketIds)
                        console.log("debitData :::: ", debitData)

                        callback(null, debitData)
                        // callback(null, resultData)
                    }
                ],
                function(err, finalData) {
                    console.log("FINAL ::::: -> ", finalData)
                    // SessionModel.removeResultInProcess(reqData.marketId)s
                    res.callback(err, finalData)
                }
            )

    //     } else {
    //         res.callback("Result already in process")
    //     }
    // } else {
    //     res.callback(error)
    // }

})

export default router