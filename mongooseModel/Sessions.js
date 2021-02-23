var request = require("request")
const uuidv1 = require("uuid/v1")

var schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        index: true
    },
    sessionId: {
        type: String,
        index: true
    },
    status: {
        type: String,
        default: "Active"
    },
    name: String,
    currencyType: String,
    url: String,
    domain: String
})

export default mongoose.model("Sessions", schema)
