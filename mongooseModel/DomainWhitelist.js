var schema = new Schema({
    domain: {
        type: String
    },
    userUrl: {
        type: String
    }
})

// schema.plugin(timestamps)

export default mongoose.model("DomainWhitelist", schema)
