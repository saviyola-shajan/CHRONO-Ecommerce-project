const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'usercollecn'
    },
    amount : {
        type : Number,
        default:"0"
    }
})

const Wallet = mongoose.model('Wallet',walletSchema);

module.exports = Wallet;