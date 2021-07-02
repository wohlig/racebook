const router = Router()

/* 
    author: Siddhesh Salunkhe
    description: 
*/
router.post("/authenticate", (req, res) => {
    if (req && req.body) {
        req.body.frontendUrl = req.headers.origin
        console.log("Body from authenticate function ::::: ", req.body)

        if (req.body && req.body.userId) {
            DomainWhitelistModel.verifyDomain(
                req.body,
                (err, domainDetail) => {
                    console.log("domainDetail ::::: ", domainDetail)

                    if (err) {
                        let responseData = {}
                        responseData.status = "INVALID_USERID"
                        res.callback(null, responseData)
                    } else {
                        SessionsModel.authenticate(req.body, res.callback)
                    }
                }
            )
        } else {
            let responseData = {}
            responseData.status = "INVALID_TOKEN_ID"
            res.callback(null, responseData)
        }
    } else {
        let responseData = {}
        responseData.status = "INVALID_TOKEN_ID"
        res.callback(null, responseData)
    }
})

export default router
