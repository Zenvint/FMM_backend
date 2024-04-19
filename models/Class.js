const mongoose = require('mongoose')

const classSchema = new mongoose.Schema({
    classname: {
        type: String,
        required: true
    },
    sectionId: {
        type: String,
        required: true
    },
    tuition: {
        type: Number,
        required: true
    },
})

module.exports = mongoose.model('Class', classSchema)