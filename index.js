const express=require('express');
const Razorpay = require('razorpay')
const path = require('path')
const cors=require("cors")
const app=express();
app.use(express.json());
app.use(cors())
const http=require('http');
const  connection  = require('./db');

const {productRoute}=require('./routes/product.routes')
const {cartRoutes}=require("./routes/cart.routes")
const {userRouter}=require("./Routes/User.routes")
const swaggerJSdoc=require("swagger-jsdoc")
const swaggerUI=require("swagger-ui-express")

const {adminrouter}=require("./routes/admin.route")


require("dotenv").config();





const server=http.createServer(app);



//razorpay routes please dont touch these routes

/*************************************Razorpay********************************************************* */

// razorpay routes please dont touch these routes

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET

});


//app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/success.html'))
})

app.post('/createOrder', (req, res)=>{
    const {amount, currency, receipt, notes} = req.body;
    razorpayInstance.orders.create({amount, currency, receipt, notes},
        (err, order)=>{
            if(!err) {
                console.log(order.id)
                res.json(order)
            } else {
                res.send(err);
            }
        }
    )
});

app.post('/verifyOrder', (req, res)=>{
    const {order_id, payment_id} = req.body;
    const razorpay_signature = req.headers['x-razorpay-signature'];
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    let hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(order_id + "|" + payment_id);
    const generated_signature = hmac.digest('hex');
    if(razorpay_signature === generated_signature) {
        res.json({success:true, message:"Payment has been verified"})
    } else {
        res.json({success:false, message:"Payment verification failed"})
    }
});

const options={
    definition:{
        openapi:"3.0.0",
        info:{
            title:"Learning Swagger",
            version:"1.0.0"
        },
        servers:[
            {
                url:"https://handsome-nightshirt-cow.cyclic.app"
            }
        ]
    },
    apis:["./Routes/*.js"]
}

//specification
const swaggerSpec= swaggerJSdoc(options)
//building UI
app.use("/documentation",swaggerUI.serve,swaggerUI.setup(swaggerSpec))

// ************************************************************************************************//
app.use("/product",productRoute)
app.use("/admin",adminrouter)
app.use("/users",userRouter)
// app.use(authenticate)
app.use("/cart",cartRoutes)





//app.use(authenticate)

















server.listen(process.env.PORT,async()=>{
    try {
        await connection
        console.log("connected to db")
    } catch (error) {
        console.log(error.message)
    }
    console.log("connected to server")
})