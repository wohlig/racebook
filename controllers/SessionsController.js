const router = Router()

/* 
    author: Siddhesh Salunkhe
    description: 
*/
/* router.post("/", (req, res) => {
    res.send("Test Routeeeeeee")
}) */


/* router.post("/authenticate", (req, res) => {
    if (req && req.body) {
        console.log(
            "Body Present Request for createLoginSidNew ",
            req.body,
            "Headers contain origin",
            req.headers.origin
        )
        req.body.frontendUrl = req.headers.origin

        if (req.body && req.body.userId) {
            DomainWhitelist.verifyDomain(
                req.body,
                function (err, domainDetail) {
                    if (err) {
                        let responseData = {}
                        responseData.status = "INVALID_USERID"
                        res.callback(null, responseData)
                    } else {
                        SessionsModel.authenticate(req.query, res.callback)
                        // Sessions.createLoginSidNew(req.body, res.callback)
                    }
                }
            )
        } else {
            let responseData = {}
            responseData.status = "INVALID_TOKEN_ID"
            res.callback(null, responseData)
        }
    } else {
        console.log("Body not sent in createLoginSidNew ", req)
        let responseData = {}
        responseData.status = "INVALID_TOKEN_ID"
        res.callback(null, responseData)
    }
}) */


export default router
