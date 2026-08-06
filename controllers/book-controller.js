const Book=require('../models/book')

const getAllBooks=async(req,res)=>{
    try{
        const allBooks=await Book.find({});
        if(allBooks?.length>0){
            res.status(201).json({
                success:true,
                message: 'fecthed all Books',
                data: allBooks
            })
        }
        else{
            res.status(404).json({
                success:false,
                message: 'No books found in collection',
            })
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            success:false,
            message: 'error found',
        })
    }
}
const getSingleBookById=async(req,res)=>{
    try{
        const getBookId=req.params.id
        const bookDetailsById=await Book.findById(getBookId)
        if(!bookDetailsById){
            return res.status(404).json({
                success:false,
                message:"Book with curr id not found"
            })
        }
        else{
            res.status(200).json({
                success:true,
                message:'book found',
                data: bookDetailsById,
            })
        }
    }   
    catch(err){
        console.log(err);
    }
}
const addNewBook=async(req,res)=>{
    try{
        const newBookFormData=req.body;
        const newlyCreatedBook =await Book.create(newBookFormData)
        if(newBookFormData){
            res.status(201).json({
                success:true,
                message: 'Book addded',
                data: newlyCreatedBook
            })
        }
    }
    catch(err){
        console.log(err);
    }
}
const updateBook=async(req,res)=>{
    try{
        const updateBookData=req.body
        const updateBookId=req.params.id;
        const updateBook=await Book.findByIdAndUpdate(updateBookId,
            updateBookData,
            {
                new:true,
            }
        )
        if(!updateBook){
            res.status(404).json({
                success:false,
                message:"Book not found"
            })
        }
        else{
            res.status(200).json({
                success:true,
                meassage:'updated successfully'
            })
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            success:false,
            message: 'error found',
        })
    }
}
const deleteBook=async(req,res)=>{
    try{
        const getCurrBookId=req.params.id;
        const delBook=await Book.findByIdAndDelete(getCurrBookId)
        if(!delBook){
            res.status(404).json({
                sucess:false,
                message:"Book not found"
            })
        }
        else{
            res.status(200).json({
                success:true,
                data:delBook
            })
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            success:false,
            message: 'error found',
        })
    }
}
module.exports={getAllBooks,getSingleBookById,addNewBook,updateBook,deleteBook};