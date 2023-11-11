const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'usercollecn'
    },
    amount : {
        type : Number
    }
})

const Wallet = mongoose.model('Wallet',walletSchema);

module.exports = Wallet;