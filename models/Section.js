const mongoose = require('mongoose')

const sectionSchema = new mongoose.Schema({
    sectionname: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Section', sectionSchema)