const mongoose =require('mongoose')
const BookSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,'Book title is req'],
        trim:true,
        maxLen:[100,'Book title len is max 100']
    },
    author:{
        type:String,
        required:[true,'Author name is req'],
        trim:true,
    },
    year:{
        type:Number,
        required:[true,'Publication year is req'],
        min:[1000,'Year must be atlast 1000'],
        max:[new Date().getFullYear(),'Year cannot be in the future']
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})


module.exports=mongoose.model('Book',BookSchema)