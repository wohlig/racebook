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

            async.waterfall(
                [
                    /* 
                        from race start get bets stored in transaction collection 
                    */
                    async (callback) => {
                        let betsData = await TransactionsModel.getBetsForResult()

                        if (betsData && betsData.length > 0) {
                            callback(null, betsData)
                        } else {
                            callback("No Bets Found For Result")
                        }
                    },
                    /* 
                        from that bets need to get result data from 3rd party
                    */
                    (bets, callback) => {
                        // console.log("1st waterfalllllllllll ", bets)

                        let mainArray = [] 
                        async.eachSeries(
                            bets,
                            (market , cb) => {
                                // console.log("meetingId ::::: ", market.id)

                                TransactionsModel.getResults(
                                    {
                                        meetingId: market.meetingId,
                                        eventNo: market.eventNo
                                    },
                                    (err, data) => {
                                        console.log("getResults err ::::: ", err)
                                        console.log("getResults data ::::: ", JSON.stringify(data))
                                        if (data && data.meetings[0] && data.meetings[0].events[0] && data.meetings[0].events[0].finals[0]) {

                                            let winnerObj = {
                                                meetingId: data.meetings[0].meetingId,
                                                winnerHorse: data.meetings[0].events[0].finals[0].selections
                                            }
                                            // console.log("$$$$$$$$$$$$$$$", winnerObj)
                                            market.winnerAggregatedData = winnerObj
                                        }
                                    
                                        if (err) {
                                            // console.log("Err at async.each ::::: ", err)
                                            cb(err)
                                        } else {
                                            mainArray.push(market)
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
                                    // console.log("mainArray ::::: ", mainArray)
                                    callback(null, mainArray)
                                }

                            }
                        )

                    }, 
                    /* 
                        new credit api call for result
                        async.each needed for multiple credit calls 
                    */
                    (resultForCreditCall, callback) => {
                        // console.log("2nd waterfalllllllllll ", resultForCreditCall)
                        callback(null, resultForCreditCall)
                    }
                ],
                function(err, finalData) {
                    // console.log("FINAL ::::: -> ", finalData)
                    // SessionModel.removeResultInProcess(reqData.marketId)
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