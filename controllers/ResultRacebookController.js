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
                    async (callback) => {
                        let betsData = await TransactionsModel.getBetsForResult()
                        console.log("betsData ::::: ", betsData)

                        if (!betsData) {
                            callback("No Bets Found For Result")
                        } else {
                            callback(null, betsData)
                        }
                    }
                ],
                function(err, finalData) {
                    console.log("FINAL", finalData)
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