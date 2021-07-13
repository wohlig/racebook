import { forEach } from "async"

export default {

    /* 
        author: Siddhesh Salunkhe
        description: 
    */
    debitWallet: (data, callback) => {
        var rate
        var m = moment()
        console.log("debitWallet ::::: data ::::: ", data)

        function getDiff(val) {
            console.log("getDiff ::::: ", val, "=====", moment().diff(m, "ms"))
        }

        var currentBalance = 0
        async.waterfall(
            [
                (callback) => {
                    /* 
                        Check if session id exists or not for a particular user
                    */
                    getDiff("Waterfall 1---->>")

                    console.log("debitWallet ::::: Waterfall 1---->>", data)
                    SessionsModel.sessionExists(data, callback)
                },
                (arg, callback) => {
                    /* 
                        Check if transaction exists or not for a particular user
                    */
                    getDiff("Time taken for sessionExists")
                    console.log("Waterfall 2---->>", arg)

                    if (arg.status == "OK") {
                        data.url = arg.url ? arg.url : ""

                        TransactionsModel.txExists(data, (err, txData) => {
                            getDiff("Time taken for txExists")
                            console.log(
                                "debitWallet ::::: Waterfall 2---->>",
                                txData
                            )

                            if (err) {
                                var responseData = {}
                                responseData.status = "UNKNOWN_ERROR"
                                callback(err, responseData)
                            } else {
                                if (_.isEmpty(txData)) {
                                    // Send arg to next waterfall function
                                    callback(null, arg)
                                } else {
                                    var responseData = {}
                                    responseData.status = "BET_ALREADY_EXIST"
                                    callback("BET_ALREADY_EXIST", responseData)
                                }
                            }
                        })
                    } else {
                        callback("error", arg)
                    }
                },
                (arg1, callback) => {
                    /* 
                        Call getBalance from kings-user
                    */
                    console.log("debitWallet ::::: Waterfall 3---->>", arg1)
                    
                    // sNetExposureModel.GetNetExpoByuser(data, (err, exposure) => {
                    NetExposureModel.GetNetExposureByUser(data, (err, exposure) => {
                        if (err) {
                            callback(err)
                        } else {
                            console.log(
                                "GetNetExpoByuser ::::: Exposure amt --------->",
                                exposure
                            )

                            let options = {
                                method: "POST",
                                // url:
                                //     "http://localhost:1339/Api/Racebook/getBalance",
                                url: arg1.url + "Racebook/getBalance",
                                // url: arg1.url + "AR/getBalance",
                                body: {
                                    id: data.userId ? data.userId : "",
                                    // netExpo: 250,
                                    netExpo: exposure.amount
                                        ? exposure.amount
                                        : 0,
                                    betInfo: data ? data : ""
                                },
                                json: true
                            }
                            request(options, (error, response, body) => {
                                getDiff("Time taken for getBalance")
                                console.log(
                                    "Balance From Kings User ::::: ",
                                    body
                                )

                                if (error) {
                                    var responseData = {}
                                    responseData.status = "UNKNOWN_ERROR"
                                    callback(null, responseData)
                                } else {
                                    if (
                                        body &&
                                        body.data &&
                                        body.data.balance &&
                                        body.data.rate
                                    ) {
                                        // assign balance value to currentBalance
                                        currentBalance = body.data.balance
                                        if (
                                            body.data.balance *
                                                body.data.rate >=
                                            data.transaction.amount
                                        ) {
                                            console.log(
                                                "IFFFFFF",
                                                body.data.balance *
                                                    body.data.rate
                                            )
                                            console.log(
                                                "IFFFFFF",
                                                data.transaction.amount
                                            )
                                            callback(null, arg1)
                                        } else {
                                            console.log("ELSEEEE")
                                            var responseData = {}
                                            responseData.status =
                                                "UNKNOWN_ERROR"
                                            callback(responseData)
                                        }
                                    } else {
                                        console.log(
                                            "DEBIT:::Empty values from 3rd party GETBalancce",
                                            body
                                        )
                                        var responseData = {}
                                        responseData.status = "UNKNOWN_ERROR"
                                        callback(responseData)
                                    }
                                }
                            })
                        }
                    })
                },
                (arg1, callback) => {
                    console.log(
                        "debitWallet ::::: Waterfall 4 data ---->>",
                        data
                    )
                    console.log("Waterfall 4 arg1 ---->>", arg1)

                    if (!_.isEmpty(arg1)) {
                        async.parallel(
                            {
                                // save netExopsure
                                netExpo: (callback) => {
                                    var dataToSave = {
                                        userId: data.userId,
                                        url: data.url,
                                        amount: data.transaction.amount,
                                        refId: data.transaction.refId,
                                        rate: rate
                                    }
                                    console.log(
                                        "netExpo dataToSave::::: ",
                                        dataToSave
                                    )

                                    var saveNetExposure = new NetExposure(
                                        dataToSave
                                    )
                                    saveNetExposure.save((err, saveData) => {
                                        if (err) {
                                            callback(err)
                                        } else {
                                            getDiff(
                                                "Time taken for saveNetExposure"
                                            )
                                            callback(null, saveData)
                                        }
                                    })
                                },
                                // save transactions
                                transactions: (callback) => {
                                    console.log("data from waterfall ::::: <><><> ::::: ", data)

                                    data.type = "debit"
                                    if(data && data.game) {
                                        data.subGame = data.game.type ? data.game.type : "racebook"
                                    }
                                    data.rate = rate

                                    console.log(
                                        "transactions ::::: data ::::: ",
                                        data
                                    )

                                    if (data.transaction && data.transaction.timeOfBet && data.transaction.timeOfRace) {
                                        console.log("IN DATE ::::: ", data.transaction.timeOfBet, data.transaction.timeOfRace)

                                        if (data.transaction.bettype === "BACK") {
                                            data.potentialWin = (data.transaction.odds - 1) * data.transaction.amount
                                            data.transaction.potentialWin = (data.transaction.odds - 1) * data.transaction.amount
                                        } else {
                                            data.potentialWin = data.transaction.amount
                                            data.transaction.potentialWin = data.transaction.amount
                                        }
                                        
                                        if (data.transaction.bettype === "BACK") {
                                            data.potentialLose = data.transaction.amount
                                            data.transaction.potentialLose = data.transaction.amount
                                        } else {
                                            data.potentialLose = (data.transaction.odds - 1) * data.transaction.amount
                                            data.transaction.potentialLose = (data.transaction.odds - 1) * data.transaction.amount
                                        }

                                        // add new key for date and bet time inside transaction object
                                        data.transaction.timeOfBetConvert = new Date(data.transaction.timeOfBet)
                                        data.transaction.timeOfRaceConvert = new Date(data.transaction.timeOfRace)
                                        data.transaction.id = "D"+data.transaction.id
                                        data.transaction.runnerName = data.transaction.runnerName ? data.transaction.runnerName : ""
                                        data.transaction.meetingName = data.transaction.meetingName ? data.transaction.meetingName : ""

                                        // keys required outside transaction object
                                        data.timeOfBetConvert = new Date(data.transaction.timeOfBet)
                                        data.timeOfRaceConvert = new Date(data.transaction.timeOfRace)
                                        data.eventNo = data.transaction.eventNo ? data.transaction.eventNo : ""
                                        data.runnerNo = data.transaction.runnerNo ? data.transaction.runnerNo : ""
                                        data.meetingId = data.transaction.meetingId ? data.transaction.meetingId : ""
                                        data.id = data.transaction.id
                                        data.refId = data.transaction.refId ? data.transaction.refId : ""
                                        data.amount = data.transaction.amount ? data.transaction.amount : ""
                                        data.odds = data.transaction.odds ? data.transaction.odds : ""
                                        data.bettype = data.transaction.bettype ? data.transaction.bettype : ""
                                        data.runnerName = data.transaction.runnerName ? data.transaction.runnerName : ""
                                        data.meetingName = data.transaction.meetingName ? data.transaction.meetingName : ""
                                    }
                                    data.resultDeclare = false

                                    console.log(
                                        "transactions ::::: data ::::: after conversion ::::: ",
                                        data
                                    )

                                    var saveDebitTransaction = new Transactions(
                                        data
                                    )
                                    saveDebitTransaction.save(
                                        (err, savedData) => {
                                            if (err) {
                                                var responseData = {}
                                                responseData.status =
                                                    "UNKNOWN_ERROR"
                                                callback(err, responseData)
                                            } else if (savedData) {
                                                getDiff(
                                                    "Time taken for saveDebitTransaction"
                                                )
                                                callback(null, "saved")
                                            }
                                        }
                                    )
                                }
                            },
                            callback
                        )
                    } else {
                        callback(" Invalid Bet ")
                    }
                },
                (balance, callback) => {
                    console.log(
                        "debitWallet ::::: Waterfall 5---->>",
                        currentBalance,
                        data.transaction.amount
                    )

                    var responseData = {}
                    responseData.status = "OK"
                    responseData.balance =
                        parseInt(currentBalance) -
                        parseInt(data.transaction.amount)
                    responseData.uuid = data.uuid

                    console.log("responseData Finalllllllllllll", responseData)
                    getDiff("Time taken for send data at final main callback")

                    callback(null, responseData)
                }
            ],
            (err, result) => {
                if (err) {
                    // console.log(err);
                    callback(null, err)
                } else {
                    console.log(
                        "Main Callback Functionnn-----",
                        moment(),
                        result
                    )
                    getDiff("Main Callback")
                    callback(null, result)

                    if (data && data.url != "") {
                        console.log("data.url ::::: ", data.url)

                        let socketData = {
                            socketName: "Balance_" + data.userId,
                            data: {}
                        }
                        let userUrl = data.url
                        console.log("1111: userUrl", userUrl)
                        let socketUrl = userUrl.replace("users", "kings-socket")
                        console.log("2222: socketUrl", socketUrl)
                        socketUrl = socketUrl.replace("api/", "callSocket")
                        console.log("3333: socketUrl", socketUrl)

                        // if royal's replace with zodeexchange url
                        socketUrl = socketUrl.replace(
                            "royalexch.in",
                            "zodexchange.com"
                        )
                        console.log("4444: socketUrl", socketUrl)
                        request.post(
                            {
                                headers: {
                                    "content-type": "application/json"
                                },
                                url: socketUrl,
                                body: socketData,
                                json: true
                            },
                            (error, response, body) => {
                                console.log("-------debit socket-----")
                            }
                        )
                    }
                }
            }
        )
    },

    /* 
        author: Siddhesh Salunkhe
        description: 
    */
    txExists: (data, callback) => {
        if (data && data.transaction && data.transaction.id) {
            Transactions.findOne({
                "transaction.id": data.transaction.id
            }).exec((err, found) => {
                if (err) {
                    callback(err, {})
                } else if (found) {
                    callback(null, found)
                } else {
                    callback(null, {})
                }
            })
        } else {
            callback(null, {})
        }
    },
    
    /* 
    
    */
    creditWallet: (data, callback) => {
        console.log("creditWallet ::::: data ::::: ", data)

        var rate
        var refIdKey = data.transaction.refId;
        async.waterfall(
            [
                (callback) => {
                    /* 
                        user session exist
                    */
                    SessionsModel.sessionExists(data, callback)
                },
                (arg, callback) => {
                    /* 
                        check duplication result entry.
                        it should not exists
                    */
                    console.log("creditWallet ::::: 1 waterfall ::::: ", arg)

                    if (arg.status == "OK") {
                        data.url = arg.url ? arg.url : "";

                        TransactionsModel.txExists(data, (err, txData) => {
                            console.log(
                                "creditWallet ::::: 2 waterfall ::::: ",
                                txData
                            )

                            if (err) {
                                var responseData = {}
                                responseData.status = "UNKNOWN_ERROR"
                                callback(err, responseData)
                            } else {
                                if (_.isEmpty(txData)) {
                                    callback(null, "notFound")
                                } else {
                                    var responseData = {}
                                    responseData.status = "BET_ALREADY_SETTLED"
                                    callback(
                                        "BET_ALREADY_SETTLED",
                                        responseData
                                    )
                                }
                            }
                        })
                    } else {
                        callback("error", arg)
                    }
                },
                (arg, callback) => {
                    /* 
                        check bet exists.
                    */
                    console.log("data.transaction.refId ::::: ", data.transaction.refId)

                    Transactions.findOne({
                        "transaction.refId": data.transaction.refId,
                        type: "debit"
                    }).exec((err, found) => {
                        console.log(
                            "creditWallet ::::: 3 waterfall ::::: ",
                            found
                        )

                        if (err) {
                            var responseData = {}
                            responseData.status = "UNKNOWN_ERROR"
                            callback(err, responseData)
                        } else {
                            if (_.isEmpty(found)) {
                                var responseData = {}
                                responseData.status = "BET_DOES_NOT_EXIST"
                                callback("BET_DOES_NOT_EXIST", responseData)
                            } else {
                                callback(null, found)
                            } 
                        }
                    })
                },
                (arg, callback) => {
                    /* 
                        if bet exixts change type credit 
                    */
                    rate = arg.rate
                    data.type = "credit"

                    if (data && data.game) { 
                        data.subGame = data.game.type ? data.game.type : "racebook"
                    }
                    if(data && data.transaction && data.transaction.timeOfBet && data.transaction.timeOfRace) {
                        data.id = data.transaction.id
                        data.transaction.id = "C"+data.transaction.id

                        //
                        data.transaction.refId = refIdKey
                        data.transaction.amount = data.transaction.amount ? data.transaction.amount : 0
                        data.transaction.odds = data.transaction.odds ? data.transaction.odds : 0
                        data.transaction.bettype = data.transaction.bettype ? data.transaction.bettype : ""
                        data.transaction.timeOfBet = data.transaction.timeOfBet
                        data.transaction.timeOfRace = data.transaction.timeOfRace
                        data.transaction.runnerName = data.transaction.runnerName ? data.transaction.runnerName : ""
                        data.transaction.meetingName = data.transaction.meetingName ? data.transaction.meetingName : ""
                        data.transaction.meetingId = data.transaction.meetingId ? data.transaction.meetingId : ""
                        data.transaction.eventNo = data.transaction.eventNo ? data.transaction.eventNo : ""
                        data.transaction.runnerNo = data.transaction.runnerNo ? data.transaction.runnerNo : ""
                        data.transaction.timeOfBetConvert = new Date(data.transaction.timeOfBet)
                        data.transaction.timeOfRaceConvert = new Date(data.transaction.timeOfRace)
                        data.transaction.runnerName = data.transaction.runnerName ? data.transaction.runnerName : ""
                        data.transaction.meetingName = data.transaction.meetingName ? data.transaction.meetingName : ""

                        // keys required outside transaction object
                        data.timeOfBetConvert = new Date(data.transaction.timeOfBet)
                        data.timeOfRaceConvert = new Date(data.transaction.timeOfRace)
                        data.eventNo = data.transaction.eventNo ? data.transaction.eventNo : ""
                        data.runnerNo = data.transaction.runnerNo ? data.transaction.runnerNo : ""
                        data.meetingId = data.transaction.meetingId ? data.transaction.meetingId : ""
                        data.id = data.transaction.id
                        data.refId = refIdKey ? refIdKey : ""
                        data.amount = data.transaction.amount ? data.transaction.amount : ""
                        data.odds = data.transaction.odds ? data.transaction.odds : ""
                        data.bettype = data.transaction.bettype ? data.transaction.bettype : ""
                        data.runnerName = data.transaction.runnerName ? data.transaction.runnerName : ""
                        data.meetingName = data.transaction.meetingName ? data.transaction.meetingName : ""

                        data.winnerAggregatedData = data.winnerAggregatedData ? data.winnerAggregatedData : {} 
                    }                    
                    

                    data.rate = arg.rate
                    data.resultDeclare = true

                    var creditTransaction = new Transactions(data)
                    creditTransaction.save((err, savedData) => {
                        console.log(
                            "creditWallet ::::: 4 waterfall ::::: ",
                            savedData
                        )
                        if (err) {
                            var responseData = {}
                            responseData.status = "UNKNOWN_ERROR"
                            callback(err, responseData)
                        } else if (savedData) {

                            console.log("Update Debit Documents ::::: ", {
                                type: "debit",
                                refId: refIdKey 
                            })
                            Transactions.update(
                                {
                                    type: "debit",
                                    refId: refIdKey
                                }, 
                                {
                                    resultDeclare : true
                                }, 
                                (err, resData) => {
                                    console.log("RESULT UPDATE AT DEBIT CALL ::::: ", null, resData)
                                    if (err) {
                                        console.log("error in updating result key from debit entry ", +refIdKey)
                                        callback(err, responseData)
                                    } else {
                                        console.log("result key updated successfully ", +refIdKey)
                                        callback(null, "saved")
                                    }
                                }
                            )

                            // callback(null, "saved")
                        }
                    })
                },
                (transactionData, callback) => {
                    // Diff of Credit And Debit-> Kings User we will send this data
                    // Account Statement ->
                    data.checkRefId = true; // for checking
                    NetExposureModel.GetNetExposureByUser(data, callback)
                },
                (netexposureSum, callback) => {
                    console.log(
                        "creditWallet ::::: 5 waterfall ::::: ",
                        netexposureSum
                    )

                    var winAmount, loseAmount, newAmount
                    winAmount = newAmount
                    var obj = {
                        // gameId: data.game._id,
                        // gameId: data.game.id,
                        win: data.transaction.amount,
                        lose: netexposureSum.amount * -1,
                        subGame: data.transaction.meetingName,
                        net: 0,
                        url: data.url,
                        _id: data.userId,
                        account: data
                    }
                    console.log("creditWallet ::::: obj ::::: ", obj)
                    console.log(
                        " obj.win + obj.lose",
                        parseInt(obj.win) - obj.lose
                    )
                    request.post(
                        {
                            // url: obj.url + "AR/createAccountStatement",
                            url: obj.url + "Racebook/createAccountStatement",
                            // url:
                            //     "http://localhost:1339/Api/Racebook/createAccountStatement",
                            body: obj,
                            json: true
                        },
                        (error, response, body) => {
                            console.log(
                                "Afterrrrrrrrr create account statement ::::: ",
                                data.transaction.refId
                            )

                            if (error) {
                                console.log(
                                    "CREDIT::account stmt. response---",
                                    body,
                                    "OBJ----",
                                    obj
                                )
                            }
                            Transactions.update(
                                {
                                    "transaction.refId": data.transaction.refId,
                                    type: "credit"
                                },
                                {
                                    $set: {
                                        winLoseAmt: parseInt(obj.win) - obj.lose
                                    }
                                },
                                {
                                    multi: true
                                }
                            ).exec((err, result) => {
                                console.log(
                                    "credit transaction update ERR----->",
                                    err,
                                    result
                                )
                                callback()
                            })
                        }
                    )
                },
                (callback) => {
                    // change NetExposureStatus of Same RefId
                    NetExposureModel.updateNetExposure(data, callback)
                },
                (userDetail, callback) => {
                    console.log('creditWallet ::::: userDetail ::::: ', userDetail);
                    
                    SessionsModel.balanceWallet(data, (err, userData) => {
                        console.log('creditWallet ::::: userDetail ::::: ', userData);
                        if (err) {
                            var responseData = {}
                            responseData.status = "INVALID_PARAMETER"
                            callback(null, responseData)
                        } else {
                            callback(null, userData)
                        }
                    })
                }
            ],
            (err, result) => {
                console.log("MAIN RESULTTTTT CREDIT CALL ::::: result ::::: ", result);
                if (err) {
                    callback(null, result)
                } else {
                    callback(null, result)
                }
            }
        )
    },
    
    /* 
        gets bets data from timeOfRaceConvert key (means at race start)
    */
    getBetsForResult: async () => {
        var a30minAgo = new Date( Date.now() - 30000 * 60 );
        // var travelTime = moment().subtract(15, 'minutes').format('hh:mm A');

        // let startDate = moment().subtract(1, "days").startOf("day");
        // let endDate = moment().endOf("day");
        let query1 = {
            resultDeclare : false,
            type: "debit",
            timeOfRaceConvert: {
                $gte: new Date(a30minAgo),
                $lte: new Date(),
            },
        }

        // let query2 = {
        //     resultDeclare : false,
        //     type: "debit",
        //     timeOfRaceConvert: {
        //         '$gte': new Date("2021-07-12T18:30:00.000Z"),
        //         '$lte': new Date("2021-07-13T18:29:59.999Z") 
        //     },
        // }
        console.log("query1 ::::: ", query1)
        // console.log("query2 ::::: ", query2)
        
        let betsReturn = await Transactions
        .find(query1)
        .lean()
        .select("transaction meetingId runnerNo eventNo timeOfRaceConvert timeOfBetConvert id refId amount odds bettype potentialWin potentialLose userId sid currency type url")

        /* // let betsReturn = await Transactions.distinct('meetingId');
        let betsReturn = await Transactions.aggregate( 
            [
                {
                    $match : query
                },
                {
                    "$group": { 
                        "_id": { 
                            meetingId: "$meetingId", 
                            eventNo: "$eventNo" 
                        } 
                    } 
                }
            ]
        ); */

        console.log("betsReturn ::::: ", betsReturn)

        return betsReturn
    },

    /* 
        get result from 3rd party end 
    */
    getResults: (data, callback) => {
        let options = {
            method: "GET",
            url:
                `https://exchange.rapi.live/api/exchange/results/event/${data.meetingId}/${data.eventNo}`,
            headers: {
                accept: "application/json; charset=UTF-8; qs=1"
            },
            json: true,
        };
        // console.log("options ::::: ->", options);
      
        request(options, function (err, response, resData) {
            // console.log("resData ::::: ->", resData);
            if (!_.isEmpty(resData)) {
                try {
                    callback(null, resData);
                } catch (e) {
                    console.log(e);
                }
            } else {
                callback(null, []);
            }
        });
    },

    /* 
        get meetingId wise result
    */
    getMeetingIdWiseBets: async (marketIds) => {
        let queryForBets = {
            "meetingId" : {
                $in : marketIds
            }
        }
        let betsData = await Transactions
        .find(queryForBets)
        .select("transaction sid userId currency currency type eventNo meetingId meetingId timeOfBetConvert timeOfRaceConvert id refId amount odds bettype potentialWin potentialLose userId sid currency type url")
        .lean()
        .exec()
        
        return betsData
    },

    getOpenBets: (data, callback) => {
        let query = {
            "userId" : ObjectId(data.playerId),
            "resultDeclare" : false,
            "type" : "debit"
        }
        console.log("query ::::---- ", query)

        Transactions.
        find(query).
        select("id timeOfBetConvert odds amount meetingId meetingName runnerName runnerNo eventNo createdAt bettype").
        lean().
        exec( (err, betsResult) => {
            console.log(
                "Bets Resulttttttttttt ",
                err,
                betsResult
            )
            if (err) {
                callback(err, [])
            } else {
                if (betsResult && betsResult.length > 0) {
                    let mainArray = []
                    forEach(betsResult, function (item) {
                        delete item._id

                        item.betId = item.id
                        item.placedDate = item.timeOfBetConvert
                        item.betRate = item.odds
                        item.stake = item.amount
                        item.marketId = item.meetingId
                        // item.horse = item.runnerNo
                        // item.event = item.eventNo
                        item.runnerNo = item.runnerNo
                        item.eventNo = item.eventNo
                        item.horse = item.runnerName
                        item.event = item.meetingName
                        item.marketName = item.meetingId
                        item.status = "EXECUTION_COMPLETE"
                        item.betfairId = item.meetingId
                        item.createdAt = item.createdAt
                        item.type = item.bettype
                        item.averagePriceMatched = item.odds
                        item.eventType = "Racebook"
                        item.betType = "Racebook"
                        item.parentCategory = {}
                        item.placeBetCalcType = ""

                        let newObj = {}
                        newObj._id = {
                            "marketId": item.meetingId,
                            // "event": item.eventNo,
                            "event": item.meetingName,
                            "status": "EXECUTION_COMPLETE"
                        },
                        newObj.count = 1,
                        newObj.betData = [item]
                        newObj.average = [item]
    
                        mainArray.push(newObj)
                    })
    
                    callback(null, mainArray)
                } else {
                    callback(null, [])
                }
            }
        })
    },

    /* 
        credit wallet meetingId wise 
    */
    creditWalletNew: (data, callback) => {
        console.log("creditWallet ::::: data ::::: 111", data)
        delete data._id

        var rate
        var mainCreditObject = {}
        var amount
        var refIdKey = data.transaction.refId;

        async.waterfall(
            [   
                (callback) => {
                    /* 
                        user session exist
                    */
                    SessionsModel.sessionExists(data, callback)
                },
                (newData, callback) => {
                    console.log("URLLLL ::::::::::::: ", newData.url)
                    data.url = newData.url

                    if (data && data.runnerNo) {
                        console.log("IN IFFFFFFFFF 111",data.winnerAggregatedData)

                        if (data.winnerAggregatedData && data.winnerAggregatedData.winnerHorse) {
                            console.log("IN IFFFFFFFFF 222", data.runnerNo+ "===" +data.winnerAggregatedData.winnerHorse)

                            if (data.runnerNo === data.winnerAggregatedData.winnerHorse) {
                                console.log("winnnnnnnnnnnerrrrrrrr")
                                amount = data.potentialWin
                            } else {
                                console.log("looserrrrrrrrrrrrrrrrr")
                                // amount = data.potentialLose
                                amount = 0
                            }

                            console.log("aaaaaaaaaaaa", amount)
                            mainCreditObject = {
                                "transaction": {
                                    "id": data.id,
                                    "refId": data.refId,
                                    "amount": amount
                                },
                                "sid": data.sid,
                                "userId": data.userId,
                                "uuid": data.sid,
                                "currency": data.currency
                            }
                            console.log("mainCreditObject ::::: ", mainCreditObject)

                            callback(null, mainCreditObject)

                        } else {
                            console.log("@@@@@@@@@@@@@@@@@@ Result not declare at 3rd party side @@@@@@@@@@@@@@@@@@")
                            callback("Result not declare at 3rd party side", {})
                        }
                    }

                },
                (creditObj, callback) => {
                    console.log("creditObj ::::: ", creditObj)
                    console.log("data beforeeeeeee ::::: ", data)
                    // rate = data.rate
                    // data.subGame = data.game.type
                    // data.rate = data.rate
                    data.type = "credit"
                    
                    if (data.transaction && data.transaction.id) {
                        data.transaction.id = "C"+ data.transaction.id.slice(1);
                        data.id = data.transaction.id

                        //
                        data.transaction.refId = refIdKey
                        data.transaction.amount = data.transaction.amount ? data.transaction.amount : 0,
                        data.transaction.odds = data.transaction.odds ? data.transaction.odds : 0,
                        data.transaction.bettype = data.transaction.bettype ? data.transaction.bettype : "",
                        data.transaction.timeOfBet = data.transaction.timeOfBet,
                        data.transaction.timeOfRace = data.transaction.timeOfRace,
                        data.transaction.runnerName = data.transaction.runnerName ? data.transaction.runnerName : "",
                        data.transaction.meetingName = data.transaction.meetingName ? data.transaction.meetingName : "",
                        data.transaction.meetingId = data.transaction.meetingId ? data.transaction.meetingId : "",
                        data.transaction.eventNo = data.transaction.eventNo ? data.transaction.eventNo : "",
                        data.transaction.runnerNo = data.transaction.runnerNo ? data.transaction.runnerNo : "",
                        data.transaction.timeOfBetConvert = new Date(data.transaction.timeOfBet),
                        data.transaction.timeOfRaceConvert = new Date(data.transaction.timeOfRace)
                        data.transaction.runnerName = data.transaction.runnerName ? data.transaction.runnerName : ""
                        data.transaction.meetingName = data.transaction.meetingName ? data.transaction.meetingName : ""

                        // keys required outside transaction object
                        data.timeOfBetConvert = new Date(data.transaction.timeOfBet)
                        data.timeOfRaceConvert = new Date(data.transaction.timeOfRace)
                        data.eventNo = data.transaction.eventNo ? data.transaction.eventNo : ""
                        data.runnerNo = data.transaction.runnerNo ? data.transaction.runnerNo : ""
                        data.meetingId = data.transaction.meetingId ? data.transaction.meetingId : ""
                        data.id = data.transaction.id
                        data.refId = refIdKey ? refIdKey : ""
                        data.amount = data.transaction.amount ? data.transaction.amount : ""
                        data.odds = data.transaction.odds ? data.transaction.odds : ""
                        data.bettype = data.transaction.bettype ? data.transaction.bettype : ""
                        data.runnerName = data.transaction.runnerName ? data.transaction.runnerName : ""
                        data.meetingName = data.transaction.meetingName ? data.transaction.meetingName : ""
                        
                        data.winnerAggregateddata = data.winnerAggregateddata ? data.winnerAggregateddata : {} 
                    }
                    data.resultDeclare = true
                    console.log("data afterrrrrrr  ::::: 111 ", data)

                    var creditTransaction = new Transactions(data)
                    console.log("creditTransaction ::::: ", creditTransaction)

                    creditTransaction.save((err, savedData1) => {
                        console.log(
                            "creditWallet ::::: 4 waterfall ::::: ",
                            savedData1
                        )
                        if (err) {
                            var responseData = {}
                            responseData.status = "UNKNOWN_ERROR"
                            callback(err, responseData)
                        } else {
                            
                            console.log("Update Debit Documents ::::: ", {
                                type: "debit",
                                refId: refIdKey 
                            })
                            Transactions.update(
                                {
                                    type: "debit",
                                    refId: refIdKey
                                }, 
                                {
                                    resultDeclare : true
                                }, 
                                (err, resData) => {
                                    console.log("RESULT UPDATE AT DEBIT CALL ::::: ", null, resData)
                                    if (err) {
                                        console.log("error in updating result key from debit entry ")
                                        callback(err, responseData)
                                    } else {
                                        console.log("result key updated successfully ")
                                        callback(null, "saved")
                                    }
                                }
                            )
                        }
                    })
                },
                (transactionData, callback) => {
                    console.log("NET EXPOOOOOOOO CALL ::::: ", data)
                    NetExposureModel.GetNetExposureByUser(data, callback)
                },
                (netexposureSum, callback) => {
                    console.log(
                        "creditWallet ::::: 5 waterfall ::::: ",
                        netexposureSum
                    )
 
                    var winAmount, loseAmount, newAmount
                    winAmount = newAmount
                    var obj = {
                        // gameId: data.game._id,
                        // gameId: data.game.id,
                        win: amount,
                        lose: netexposureSum.amount * -1,
                        // subGame: data.game.type, // 
                        net: 0,
                        url: data.url, // 
                        _id: data.userId, // 
                        account: data
                    }
                    console.log("creditWallet ::::: obj ::::: ", obj)
                    
                    console.log(
                        " obj.win + obj.lose",
                        parseInt(obj.win) - obj.lose
                    )

                    // callback(null, obj)
                    console.log("USERRRRRRRRRRRRR ::::: ", {
                        // url: obj.url + "AR/createAccountStatement",
                        url: obj.url + "Racebook/createAccountStatement",
                        // url:
                        //     "http://localhost:1339/Api/Racebook/createAccountStatement",
                        body: obj,
                        json: true
                    })

                    request.post(
                        {
                            // url: obj.url + "AR/createAccountStatement",
                            url: obj.url + "Racebook/createAccountStatement",
                            // url:
                            //     "http://localhost:1339/Api/Racebook/createAccountStatement",
                            body: obj,
                            json: true
                        },
                        (error, response, body) => {
                            console.log(
                                "Afterrrrrrrrr create account statement ::::: ",
                                data.transaction.refId
                            )

                            if (error) {
                                console.log(
                                    "CREDIT::account stmt. response---",
                                    body,
                                    "OBJ----",
                                    obj
                                )
                            }
                            
                            console.log("AMTTTTTT winLose ::::: ", parseInt(obj.win) - parseInt(obj.lose))

                            Transactions.update(
                                {
                                    "transaction.refId": data.transaction.refId,
                                    type: "credit"
                                },
                                {
                                    $set: {
                                        winLoseAmt: parseInt(obj.win) - parseInt(obj.lose)
                                    }
                                },
                                {
                                    multi: true
                                }
                            ).exec((err, result) => {
                                console.log(
                                    "credit transaction update ERR----->",
                                    err,
                                    result
                                )
                                callback()
                            })
                        }
                    )
                },
                (callback) => {
                    // change NetExposureStatus of Same RefId
                    console.log("updateNnetExposure ::::: ", data)
                    NetExposureModel.updateNetExposure(data, callback)
                },
                (userDetail, callback) => {
                    console.log('creditWallet ::::: userDetail ::::: ', userDetail);
                    data.uuid = data.sid
                    console.log('creditWallet ::::: dataaaaaaaaaaaaaaa ::::: ', data);

                    SessionsModel.balanceWallet(data, (err, userData) => {
                        console.log('creditWallet ::::: userData ::::: ', userData);
                        if (err) {
                            var responseData = {}
                            responseData.status = "INVALID_PARAMETER"
                            callback(null, responseData)
                        } else {
                            callback(null, userData)
                        }
                    })
                }
            ],
            (err, result) => {
                console.log("MAIN RESULTTTTT CREDIT CALL ::::: result ::::: ", result);
                if (err) {
                    callback(null, result)
                } else {
                    callback(null, result)
                }
            }
        )
    },
        
}
