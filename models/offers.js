const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    offerName:{
        type:String,
        required:true,
    },
    offerType:{
        type:String,
        required:true,
        unique:true,
    },
    offerAmount : {
        type : Number,
        required : true
    },
    startDate : {
        type : Date,
        required : true
    },
    endDate:{
        type:Date,
        required:true
    },
    status : {
        type : String,
        default:"Active"
    }
},{timestamps:true})

const offer = mongoose.model('offer', offerSchema);

module.exports = offer