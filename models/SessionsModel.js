export default {

    /* 
        author: Siddhesh Salunkhe
        description: Check sessions by session id and status
    */
    sessionExists: (data, callback) => {
        Sessions.findOne(
            {
                sessionId: data.sid,
                status: "Active"
            },
            {
                userId: 1,
                url: 1
            }
        ).exec((err, found) => {
            if (err || _.isEmpty(found)) {
                var responseData = {}
                responseData.status = "INVALID_SID"
                callback(null, responseData)
            } else if (found) {
                console.log("sessionExists ::::: found ::::: ", found)
                console.log("sessionExists ::::: found.userId ::::: ", found.userId, data.userId);

                if (found.userId + "" == data.userId + "") {
                    var responseData = {}
                    responseData.status = "OK"
                    responseData.url = found.url ? found.url : ""
                    callback(null, responseData)
                } else {
                    var responseData = {}
                    responseData.status = "INVALID_PARAMETER"
                    callback(null, responseData)
                }
            } else {
                var responseData = {}
                responseData.status = "INVALID_SID"
                callback(null, responseData)
            }
        })
    },

    balanceWallet: (data, callback) => {
        console.log("balanceWallet ::::: data ::::: ", data)

        Sessions.findOne(
            {
                sessionId: data.sid,
                status: "Active"
            },
            {
                url: 1
            }
        ).exec((err, found) => {
            if (err || _.isEmpty(found)) {
                let responseData = {}
                responseData.status = "INVALID_SID"
                callback(null, responseData)
            } else if (found) {
                var userData = {}
                userData.id = data.userId
                
                console.log("balanceWallet ::::: found ::::: ", found)
                console.log("balanceWallet ::::: userData ::::: ", userData)

                console.log(found.url + "Racebook/getCurrentBalanceNew")

                request.post(
                    {
                        // url: found.url + "AR/getCurrentBalanceNew",
                        // url:
                        //     "http://localhost:1339/Api/Racebook/getCurrentBalanceNew",
                        url: found.url + "Racebook/getCurrentBalanceNew",
                        body: userData,
                        json: true
                    },
                    (error, response, body) => {
                        console.log(
                            "balanceWallet Responseee ::::: body ::::: ",
                            error,
                            body
                        )
                        if (error || body.error) {
                            var responseData = {}
                            responseData.status = "INVALID_PARAMETER"
                            callback(null, responseData)
                        } else {
                            if (body && body.data && body.data.balance) {
                                let responseData = {}
                                responseData.status = "OK"
                                responseData.balance = body.data.balance.toFixed(
                                    2
                                )
                                responseData.uuid = data.uuid
                                callback(null, responseData)
                            } else {
                                let responseData = {}
                                responseData.status = "INVALID_PARAMETER"
                                callback(null, responseData)
                            }
                        }
                    }
                )
            } else {
                var responseData = {}
                responseData.status = "INVALID_SID"
                callback(null, responseData)
            }
        })
    },

    authenticate: (data, callback) => {
        const uuidv1 = require("uuid/v1")

        data.url = ConfigModel.getMainServer(data.frontendUrl)
        console.log("authenticate ::::: data ::::: ", data)
        console.log("authenticate ::::: data.url ::::: ", data.url)

        Sessions.findOne(
            {
                userId: data.userId,
                url: data.url
            },
            {
                sessionId: 1
            }
        ).exec((err, found) => {
            console.log("authenticate ::::: Session found ::::: ", found)
            if (err) {
                var responseData = {}
                responseData.status = "INVALID_USERID22"
                callback(null, responseData)
            } else if (found) {
                console.log(
                    "authenticate ::::: global[env] ::::: ",
                    global["env"]
                )

                var currency = "HKD"
                if (
                    global["env"].arCurrencyPoints &&
                    global["env"].arCurrencyInr &&
                    global["env"].arCurrencyOther
                ) {
                    if (!data.currencyType) {
                        currency = global["env"].arCurrencyOther // currency to be given to 3rd party
                    } else {
                        // for points user
                        if (data.currencyType == "POINTS") {
                            currency = global["env"].arCurrencyPoints
                        }
                        // for INR user
                        else if (data.currencyType == "INR") {
                            currency = global["env"].arCurrencyInr
                        }
                        // accept currency code from request
                        else {
                            currency = data.currencyType
                        }
                    }
                }
                SessionsModel.createIframe(
                    data,
                    found.sessionId,
                    currency,
                    callback
                )
            } else {
                SessionsModel.checkUser(data, (err, userData) => {
                    if (err) {
                        var responseData = {}
                        responseData.status = "INVALID_PARAMETER"
                        callback(null, responseData)
                    } else {
                        if (data.nickname) {
                            let username = _.split(data.nickname, "_", 2)
                            if (!_.isEmpty(username)) {
                                data.name = username[0]
                            }
                        }
                        if (userData.currencyType) {
                            data.currencyType = userData.currencyType
                        } else {
                            data.currencyType = "HKD"
                        }
                        data.userId = data.userId
                        data.sessionId = uuidv1()
                        data.status = "Active"
                        // data.url = Config.getMainServer(data.frontendUrl)
                        data.domain = data.frontendUrl

                        console.log(
                            "authenticate ::::: data ::::: ",
                            data
                        )

                        // Sessions.saveData(data, function(err, savedData) {
                        var saveSessionData = new Sessions(data)
                        saveSessionData.save((err, savedData) => {
                            console.log(
                                "authenticate ::::: savedData ::::: ",
                                savedData
                            )
                            if (err) {
                                var responseData = {}
                                responseData.status = "UNKNOWN_ERROR"
                                callback(null, responseData)
                            } else {
                                var currency = "HKD"
                                if (
                                    global["env"].arCurrencyPoints &&
                                    global["env"].arCurrencyInr &&
                                    global["env"].arCurrencyOther
                                ) {
                                    if (!data.currencyType) {
                                        currency = global["env"].arCurrencyOther //currency to be given to 3rd party
                                    } else {
                                        // for points user
                                        if (data.currencyType == "POINTS") {
                                            currency =
                                                global["env"].arCurrencyPoints
                                        }
                                        // for INR user
                                        else if (data.currencyType == "INR") {
                                            currency =
                                                global["env"].arCurrencyInr
                                        }
                                        // accept currency code from request
                                        else {
                                            currency = data.currencyType
                                        }
                                    }
                                }

                                SessionsModel.createIframe(
                                    data,
                                    savedData.sessionId,
                                    currency,
                                    callback
                                )
                            }
                        })
                    }
                })
            }
        })
    },

    createIframe: (data, sessionId, currency, callback) => {
        console.log("createIframe ::::: data ::::: ", data)
        console.log("createIframe ::::: sessionId ::::: ", sessionId)
        console.log("createIframe ::::: currency ::::: ", currency)
        let obj = {
            // data : data,
            sessionId : sessionId,
            currency : currency
        }
        console.log("obj ::::: ", obj)

        callback(null, obj)
        
        /* const uuidv1 = require("uuid/v1")
        var datas = {
            uuid: uuidv1(),
            player: {
                id: data.userId,
                update: true,
                firstName: "Kings",
                lastName: "Play",
                nickname: data.nickname,
                country: "IN",
                language: "en",
                currency: currency,
                session: {
                    id: sessionId,
                    ip: "18.195.103.129" //18.195.103.129 germany ip
                }
            },
            config: {
                brand: {
                    id: "1",
                    skin: "1"
                },
                game: {
                    category: data.game,
                    interface: "view1"
                },
                channel: {
                    wrapped: true,
                    mobile: data.mobile
                }
            }
        }
        console.log("createIframe ::::: datassssssss ::::: ", datas)
        // console.log("createIframe ::::: global[env] ::::: ", global["env"])

        request.post(
            {
                // url: global["env"].evoURL,
                url: "https://kingscasino.uat1.evo-test.com/ua/v1/kingscasino00001/test123",
                body: datas,
                json: true
            },
            (error, response, body) => {
                console.log("createIframe ::::: body ::::: ", body)
                callback(error, body)
            }
        ) */
    },

    checkUser: (data, callback) => {
        var mainServer = ConfigModel.getMainServer(data.frontendUrl)

        var userData = {}
        userData._id = data.userId
        if (data.accessToken) {
            userData._accessToken = data.accessToken
        }
        
        console.log("checkUser ::::: mainServer ::::: ", mainServer)
        console.log("checkUser ::::: userData ::::: ", userData)

        request.post(
            {
                // url: "http://localhost:1339/Api/member/getOne",
                url: mainServer + "member/getOne",
                body: userData,
                json: true
            },
            (error, response, body) => {
                console.log("checkUser ::::: body ::::: ", body)

                if (error) {
                    callback(error, null)
                } else if (body && body.data && body.data._id) {
                    var responseData = {}
                    responseData.status = "OK"
                    callback(null, responseData)
                } else {
                    callback("empty", null)
                }
            }
        )
    },

    /* 
    setResultInProcess: function (marketId) {
        global.resultInProcess.push(marketId)
    },

    checkResultInProcess: function (marketId) {
        return _.includes(global.resultInProcess, marketId)
    },

    removeResultInProcess: function (marketId) {
        _.remove(global.resultInProcess, function (n) {
            return n == marketId
        })
    }
    */
}
