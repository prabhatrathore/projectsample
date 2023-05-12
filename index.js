const express=require('express')
const mongo=require('mongoose')
const app=express()
const route=require('./routes/router')


app.use(express.json())

mongo.connect("mongodb://localhost:27017/prd").then(()=>{
   console.log(" connect to mongo")
}).catch((err)=>console.log(err,"errorr occure"))

app.use('/',route)
app.listen(process.env.port||3002,()=>console.log("express run success"))