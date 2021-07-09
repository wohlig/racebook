const router = Router()

/* 
    author: Siddhesh Salunkhe
    description:  
*/
router.post("/debit", (req, res) => {
    console.log("Debit Call ::::: ", req.body)
    req.body.frontendUrl = req.headers.origin
    if (
        req.body &&
        req.body.userId
        // &&
        // req.query.authToken == global["env"].authToken
    ) {
        TransactionsModel.debitWallet(req.body, res.callback)
    } else {
        var responseData = {}
        responseData.status = "INVALID_TOKEN_ID"
        res.callback(null, responseData)
    }
})

/* 
    author: Siddhesh Salunkhe
    description:  
*/
router.post("/credit", (req, res) => {
    console.log("Credit Call ::::: ", req.body)

    // req.transactionDumpObj = TransactionDump({
    //     type: "credit",
    //     request: req.body
    // })

    req.body.frontendUrl = req.headers.origin
    if (
        req.body &&
        req.body.userId
        // &&
        // req.query.authToken == global["env"].authToken
    ) {
        console.log("Credit Call ::::: req.body ::::: ", req.body)

        TransactionsModel.creditWallet(req.body, res.callback)
    } else {
        var responseData = {}
        responseData.status = "INVALID_TOKEN_ID"
        res.callback(null, responseData)
    }
})

/* 
    author: Siddhesh Salunkhe
    description:
*/
router.post("/balance", (req, res) => {
    req.body.frontendUrl = req.headers.origin;
    
    console.log("Balance Call", req.body)
    console.log("Balance Call", req.query)
    if (
        req.body &&
        req.body.userId 
        // req.query.authToken == global["env"].authToken
    ) {
        console.log("Balance ::::: req.body ::::: ", req.body)
        SessionsModel.balanceWallet(req.body, res.callback);
    } else {
        // console.log("Body not set for balance ", req.body)
        var responseData = {};
        responseData.status = "INVALID_TOKEN_ID";
        res.callback(null, responseData);
    }
})

router.post("/creditNew", (req, res) => {
    // console.log("Credit Call New ::::: ", req.body)

    req.body.frontendUrl = req.headers.origin
    if (
        req.body &&
        req.body.userId
    ) {
        // console.log("Credit Call ::::: req.body ::::: ", req.body)

        TransactionsModel.creditWalletNew(req.body, res.callback)
    } else {
        var responseData = {}
        responseData.status = "INVALID_TOKEN_ID"
        res.callback(null, responseData)
    }
})

router.post("/getOpenBets", (req, res) => {
    // console.log("IN ROUTEEEEEE", req.body)
    TransactionsModel.getOpenBets(req.body, res.callback);
})

/* 
    router.post("/getBetsForResult", (req, res) => {
        console.log("IN ROUTEEEEEE")
        TransactionsModel.getBetsForResult(req.body, res.callback);
    })
*/

export default router
