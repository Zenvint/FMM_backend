const mongoose = require('mongoose')

const classSchema = new mongoose.Schema({
    classname: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    roles: {
        type: [String],
        default: ["Employee"]
    },
    active: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('Class', userSchema)