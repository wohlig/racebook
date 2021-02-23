const router = Router()

/* 
    author: Siddhesh Salunkhe
    description: 
*/
router.post("/debit", (req, res) => {
    console.log("Debit Call", moment())

    // req.body.frontendUrl = req.headers.origin
    // // req.transactionDumpObj = TransactionDump({
    // //   type: "debit",
    // //   request: req.body
    // // });
    // if (
    //     req.body &&
    //     req.body.userId &&
    //     req.query.authToken == global["env"].authToken
    // ) {
    TransactionsModel.debitWallet(req.body, res.callback)
    // } else {
    //     var responseData = {}
    //     responseData.status = "INVALID_TOKEN_ID"
    //     res.callback(null, responseData)
    // }
})

export default router
