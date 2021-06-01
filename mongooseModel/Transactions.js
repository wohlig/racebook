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
            type: String
        },
        odds: {
            type: Number
        },
        bettype: {
            type: String
        },
        timeofbet: {
            type: Date
        },
        RunnerName: {
            type: String
        },
        MeetingName: {
            type: String
        },
        MeetingID: {
            type: String
        },
        EventNo: {
            type: Number
        },
        RunnerNo: {
            type: Number
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
