var schema = new Schema({
    sid: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    currency: {
        type: String
    },
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
    url: String,
    transaction: {
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
        timeOfRace: {
            type: Number
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
    type: String,
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
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model("Transactions", schema)
