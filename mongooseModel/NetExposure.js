var schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    rate: {
        type: Number,
        default: 1
    },
    url: String,
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },
    refId: {
        type: String,
        index: true
    },
    amount: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model("NetExposure", schema)
