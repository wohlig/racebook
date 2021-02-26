export default {
    /* 
        author: Siddhesh Salunkhe
        description: Check sessions by session id and status
    */
    sessionExists: function (data, callback) {
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
            // console.log("1", found)
            // console.log("2", found.userId);
            // console.log("3", data.userId);
            if (err || _.isEmpty(found)) {
                var responseData = {}
                responseData.status = "INVALID_SID"
                callback(null, responseData)
            } else if (found) {
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

    balanceWallet: function (data, callback) {
        // console.log("<><><balanceWallet><><>", data)

        Sessions.findOne(
            {
                sessionId: data.sid,
                status: "Active"
            },
            {
                url: 1
            }
        ).exec(function (err, found) {
            if (err || _.isEmpty(found)) {
                let responseData = {}
                responseData.status = "INVALID_SID"
                callback(null, responseData)
            } else if (found) {
                var userData = {}
                userData.id = data.userId
                // console.log("*********", userData)

                request.post(
                    {
                        // url: found.url + "AR/getCurrentBalanceNew",
                        url:
                            "http://localhost:1339/Api/Racebook/getCurrentBalanceNew",
                        body: userData,
                        json: true
                    },
                    function (error, response, body) {
                        // console.log(
                        //     "*******balanceWallet BODY*********",
                        //     error,
                        //     body
                        // )
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

    createLoginSidNew: function (data, callback) {
        data.url = ConfigModel.getMainServer(data.frontendUrl)
        // console.log("data ::::: ", data)
        // console.log("data.url ::::: ", data.url)

        Sessions.findOne(
            {
                userId: data.userId,
                url: data.url
            },
            {
                sessionId: 1
            }
        ).exec(function (err, found) {
            console.log("Session found ::::: ", found)

            if (err) {
                var responseData = {}
                responseData.status = "INVALID_USERID22"
                callback(null, responseData)
            } else if (found) {
                // console.log("TESTTTTTTTTTTt", global["env"])
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
            }  else {
                SessionsModel.checkUser(data, function(err, userData) {
                    if (err) {
                        var responseData = {};
                        responseData.status = "INVALID_PARAMETER";
                        callback(null, responseData);
                    } else {
                        if (data.nickname) {
                            let username = _.split(data.nickname, "_", 2);
                            if (!_.isEmpty(username)) {
                                data.name = username[0];   
                            }
                        }
                        if (userData.currencyType) {
                            data.currencyType = userData.currencyType;
                        } else {
                            data.currencyType = "HKD";
                        }
                        data.userId = data.userId;
                        data.sessionId = uuidv1();
                        data.status = "Active";
                        // data.url = Config.getMainServer(data.frontendUrl);
                        data.domain = data.frontendUrl
                        console.log("%%%%%%%%%%%%%%data%%%%%%%%%%%%%%%", data)
                        
                        Sessions.saveData(data, function(err, savedData) {
                            console.log("%%%%%%%%%%%%%%savedData%%%%%%%%%%%%%%%", savedData)
                            if (err) {
                                var responseData = {};
                                responseData.status = "UNKNOWN_ERROR";
                                callback(null, responseData);
                            } else {
                                var currency = "HKD";
                                if (
                                    global["env"].arCurrencyPoints &&
                                    global["env"].arCurrencyInr &&
                                    global["env"].arCurrencyOther
                                ) {
                                    if (!data.currencyType) {
                                        currency = global["env"].arCurrencyOther; //currency to be given to 3rd party
                                    } else {
                                        // for points user
                                        if (data.currencyType == "POINTS") {
                                            currency = global["env"].arCurrencyPoints;
                                        }
                                        // for INR user
                                        else if (data.currencyType == "INR") {
                                            currency = global["env"].arCurrencyInr;
                                        }
                                        // accept currency code from request
                                        else {
                                            currency = data.currencyType;
                                        }
                                    }
                                }
                                Sessions.createIframe(
                                    data,
                                    savedData.sessionId,
                                    currency,
                                    callback
                                );
                            }
                        });
                    }
                });
            }
        })
    },

    createIframe: function (data, sessionId, currency, callback) {
        const uuidv1 = require("uuid/v1")

        // console.log("createIframe data----->>>", data)
        // console.log("createIframe sessionId----->>>", sessionId)
        // console.log("createIframe v----->>>", currency)

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
        // console.log("datassssssss", datas)
        // console.log("%%%%%%%%%%%%%", global["env"]);

        /* request.post(
            {
                // url: global["env"].evoURL,
                url: "https://kingscasino.uat1.evo-test.com/ua/v1/kingscasino00001/test123",
                body: datas,
                json: true
            },
            function (error, response, body) {
                console.log("%%%%%%%%%%%%%", body);
                callback(error, body)
            }
        ) */
    },

    checkUser: function (data, callback) {
        var mainServer = ConfigModel.getMainServer(data.frontendUrl)

        var userData = {}
        userData._id = data.userId
        if (data.accessToken) {
            userData._accessToken = data.accessToken
        }
        console.log("mainServer ::::: ", mainServer)
        console.log("userData ::::: ", userData)

        request.post(
            {
                url: "http://localhost:1339/Api/member/getOne",
                // url: mainServer + "member/getOne",
                body: userData,
                json: true
            },
            function (error, response, body) {
                console.log("body ::::: ", body);

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
    }
}
