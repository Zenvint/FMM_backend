const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    sectionId: {
        type: String,
        required: true
    },
    classId: {
        type: String,
        required: true
    },
    teacherId: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Course', courseSchema)