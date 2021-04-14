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
    // console.log("IN CONTROLLERRRRRRR :::::", req.body)
    // req.transactionDumpObj = TransactionDump({
    //     type: "credit",
    //     request: req.body
    // });

    req.body.frontendUrl = req.headers.origin;
    if (
        req.body &&
        req.body.userId &&
        req.query.authToken == global["env"].authToken
    ) {
        TransactionsModel.creditWallet(req.body, res.callback);
    } else {
        var responseData = {};
        responseData.status = "INVALID_TOKEN_ID";
        res.callback(null, responseData);
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

export default router
