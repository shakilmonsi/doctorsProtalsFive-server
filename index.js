
const express =require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
// require('dotenv').config()

const app = express ()
const cors= require('cors')
const port = process.env.PORT || 5000

// middiewarer 
app.use(cors())
app.use(express.json())

// DB_USER=doctorsProtalsFive-server
// DB_PASS=doctorsProtalsFive-server
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fm710lc.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// dotenv crud mongodb example
 
async function run(){
  try{
const appointmentOptionCollextion = client.db('doctorprotailfive-main').collection('adersoptions')
const bookingsCollextion = client.db('doctorprotailfive-main').collection('bookings')

app.get('/appointmentoption', async (req,res)=>{
  

  const date = req.query.date;
            const query = {};
            const options = await appointmentOptionCollextion.find(query).toArray();

            // get the bookings of the provided date
            const bookingQuery = { appointmentDate: date }
            const alreadyBooked = await bookingsCollextion.find(bookingQuery).toArray();

            // code carefully :D
            options.forEach(option => {
                const optionBooked = alreadyBooked.filter(book => book.treatment === option.name);
                const bookedSlots = optionBooked.map(book => book.slot);
  console.log(date, option.naem, bookedSlots)
 })
res.send(options)

})
// class -74-4 
/*
* api nameng canvention
 app.get('/bookings')
 app.get('/bookings/:id')
 app.post('bookings')
 app.post('/bookings/:id')
app.patch('/bookings/:id')
app.delete('/bookings/:id')

*/
app.post('/bokings',async (req,res)=>{
  const booking =req.body 
  console.log(booking)
  const result= await bookingsCollextion.insertOne(booking)
  res.send(result)
})

  }
  finally{

  }

}
run().catch(console.log)





app.get('/',(req,res)=>{
        res.send('running')
})
app.listen(port,()=>{
        console.log(`running${port}`)
})