export default {
    /* 
        author: Siddhesh Salunkhe
        description: 
    */
    debitWallet: (data, callback) => {
        var rate
        var m = moment()
        console.log("debit request-----", m, data)
        function getDiff(val) {
            console.log("Debsit::::", val, "=========", moment().diff(m, "ms"))
        }

        // var transactionData = {};
        var currentBalance = 0
        async.waterfall(
            [
                (callback) => {
                    getDiff("1st waterfall start")
                    SessionsModel.sessionExists(data, callback)
                },
                (arg, callback) => {
                    getDiff("2.time taken for sessionExists")
                    console.log("Waterfall 2---->>", arg)
                    // if (arg.status == "OK") {
                    data.url = arg.url ? arg.url : ""

                    TransactionsModel.txExists(data, (err, txData) => {
                        getDiff("3.Check for transaction exists")
                        console.log("TxData----->>", txData)
                        if (err) {
                            var responseData = {}
                            responseData.status = "UNKNOWN_ERROR"
                            callback(err, responseData)
                        } else {
                            if (_.isEmpty(txData)) callback(null, arg)
                            else {
                                var responseData = {}
                                responseData.status = "BET_ALREADY_EXIST"
                                callback("BET_ALREADY_EXIST", responseData)
                            }
                        }
                    })
                    // } else {
                    //     // console.log("inside else");
                    //     callback("error", arg)
                    // }
                },
                (arg1, callback) => {
                    console.log("Waterfall 3---->>", arg1)
                    // NetExposure.GetNetExpoByuser(data, (err, exposure) => {
                    // if (err) {
                    //     callback(err)
                    // } else {
                    // console.log("Exposure---------", exposure);
                    let options = {
                        method: "POST",
                        url: "http://localhost:1339/Api/Racebook/getBalance",
                        // url: arg1.url + "AR/getBalance",
                        body: {
                            id: data.userId ? data.userId : "",
                            netExpo: 250,
                            // netExpo: exposure.amount ? exposure.amount : 0,
                            betInfo: data ? data : ""
                        },
                        json: true
                    }
                    request(options, (error, response, body) => {
                        getDiff("4.Get CurrentBalnce from kings")
                        // console.log("current balance",body)
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
                                currentBalance = body.data.balance
                                if (
                                    body.data.balance * body.data.rate >=
                                    data.transaction.amount
                                ) {
                                    callback(null, arg1)
                                } else {
                                    var responseData = {}
                                    responseData.status = "UNKNOWN_ERROR"
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
                    // }
                    // })
                },
                (arg1, callback) => {
                    // console.log("Waterfall 4---->>", arg1);
                    // NetExposures
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
                                    var saveNetExposure = new NetExposure(
                                        dataToSave
                                    )
                                    saveNetExposure.save((err, saveData) => {
                                        if (err) {
                                            callback(err)
                                        } else {
                                            getDiff("5.Saving NetExpo")
                                            callback(null, saveData)
                                        }
                                    })
                                },
                                // save transactions
                                transactions: (callback) => {
                                    data.type = "debit"
                                    data.subGame = data.game.type
                                    data.rate = rate
                                    var debitTransaction = new Transactions(
                                        data
                                    )
                                    debitTransaction.save((err, savedData) => {
                                        if (err) {
                                            var responseData = {}
                                            responseData.status =
                                                "UNKNOWN_ERROR"
                                            callback(err, responseData)
                                        } else if (savedData) {
                                            getDiff("6.Saving Transaction")
                                            callback(null, "saved")
                                        }
                                    })
                                }
                            },
                            callback
                        )
                    } else {
                        callback(" Invalid Bet ")
                    }
                }
                /* (balance, callback) => {
                    getDiff("TIME FOR ------parallel")
                    // console.log(
                    //   "Waterfall 5 Balance---->>bal,cuunetexpo,final",
                    //   currentBalance,
                    //   data.transaction.amount,
                    //   currentBalance - data.transaction.amount
                    // );
                    var responseData = {}
                    responseData.status = "OK"
                    responseData.balance =
                        currentBalance - data.transaction.amount
                    responseData.uuid = data.uuid
                    getDiff("7.final balance")
                    // console.log("responseData", responseData);
                    callback(null, responseData)
                } */
            ],
            (err, result) => {
                if (err) {
                    // console.log(err);
                    callback(null, err)
                } else {
                    console.log("Final-----", moment(), result)
                    getDiff("8.Final")
                    /* callback(null, result)
                    // Balance Socket
                    // console.log(
                    //   "Debit socket call time---->>userId",
                    //   data.userId,
                    //   data.url
                    // );
                    let socketData = {
                        socketName: "Balance_" + data.userId,
                        data: {}
                    }
                    let userurl = data.url
                    let socketUrl = userurl.replace("users", "kings-socket")
                    socketUrl = socketUrl.replace("api/", "callSocket")
                    // if royal's replace with zodeexchange url
                    socketUrl = socketUrl.replace(
                        "royalexch.in",
                        "zodexchange.com"
                    )
                    // console.log("Debit socket call time---->>SocketURl", socketUrl);

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
                            // console.log("-------debit socket-----");
                        }
                    ) */
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
    }
}
