var schema = new Schema({
    sid: String, //
    userId: { //
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    currency: { //
        type: String
    },
    url: String,
    transaction: { //
        id: {
            type: String,
            index: true
        },
        refId: {
            type: String,
            index: true
        },
        amount: {
            type: Number
        },
        odds: {
            type: Number
        },
        bettype: {
            type: String
        },
        timeOfBet: {
            type: Number
        },
        // convert timeOfBet To Date
        timeOfBetConvert: {
            type: Date
        },
        timeOfRace: {
            type: Number
        },
        // convert timeOfRace To Date
        timeOfRaceConvert: {
            type: Date
        },
        runnerName: {
            type: String
        },
        meetingName: {
            type: String
        },
        meetingId: {
            type: String
        },
        eventNo: {
            type: String
        },
        runnerNo: {
            type: String
        }
    },
    timeOfBetConvert: { //
        type: Date
    },
    timeOfRaceConvert: { //
        type: Date
    },
    eventNo: { //
        type: String
    },
    runnerNo: { //
        type: String
    },
    meetingId : { //
        type: String
    },
    type: String, // [debit or credit]
    createdAt: { //
        type: Date,
        default: Date.now
    },
    updatedAt: { //
        type: Date,
        default: Date.now
    },
    /*
        extra keys as per I-frame integration
    */
    rate: {
        type: Number,
        default: 1
    },
    winLoseAmt: {
        type: Number
    },
    game: {},
    subGame: {
        type: String
    },
    playId: String,
    transactionSentToMainServer: {
        type: Boolean,
        default: false
    },
    ValueAsNumber: {
        type: Number
    },
    bets: {
        type: Array
    },
    result: {
        type: Schema.Types.Mixed
    },
    detailInfo: {
        type: Schema.Types.Mixed
    },
})

export default mongoose.model("Transactions", schema)
