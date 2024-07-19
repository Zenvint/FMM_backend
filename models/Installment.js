const mongoose = require('mongoose')

const installmentSchema = new mongoose.Schema({
    sectionId: {
        type: String,
        required: true
    },
    firstinstallment: {
        type: Number,
        default: 40
    },
    secondinstallment: {
        type: Number,
        default: 30
    },
    thirdinstallment: {
        type: Number,
        default: 30
    }
})

module.exports = mongoose.model('Installment', installmentSchema)