var schema = new Schema({
    name: {
        type: String
    }
})

// schema.plugin(timestamps)

export default mongoose.model("Config", schema)
