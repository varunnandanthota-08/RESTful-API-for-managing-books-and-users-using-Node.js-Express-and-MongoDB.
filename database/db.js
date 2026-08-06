const mongoose=require('mongoose')

const connectToDB=async()=>{
    try{
        await mongoose.connect('mongodb://varunnandanthota_db_user:RTkYw2Uf8a4Wj1lK@ac-mhpdpjp-shard-00-00.nwolfax.mongodb.net:27017,ac-mhpdpjp-shard-00-01.nwolfax.mongodb.net:27017,ac-mhpdpjp-shard-00-02.nwolfax.mongodb.net:27017/?ssl=true&replicaSet=atlas-4efpik-shard-0&authSource=admin&appName=Cluster0')
        console.log('mongodb connected succesfully!!!');
    }
    catch(error){
        console.log('Mongodb connection failed: ',error);
        process.exit(1)
    }
}

module.exports=connectToDB