
const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
// calls-75-4 jsonwevtoken setup 
const jwt= require('jsonwebtoken')

require('dotenv').config()
// require('dotenv').config()

const app = express()
const cors = require('cors')
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

// class 75-5 jwt setup step 3
function verifyJWT(req,res,next){
    console.log('json verifyJWT setup',req.headers.authorization)
const authHeader =req.headers.authorization;
if(!authHeader){
    return res.send(401).send('unauthorized acces')
}
const token =authHeader.split(' ')[1];
jwt.verify(token, process.env.ACCESS_TOKEN,function(err,decoded){
    if(err){
        return res.status(403).send({message: ' forvidden access'})
    }
    req.decoded=decoded
    next()
})
}
// class 75-5 jwt setup step 4
function verifyJWT(req,res,next){
    console.log('json verifyJWT setup',req.headers.authorization)
const authHeader =req.headers.authorization;
if(!authHeader){
    return res.send(401).send('unauthorized acces')
}
const token =authHeader.split(' ')[1];
jwt.verify(token, process.env.ACCESS_TOKEN,function(err,decoded){
    if(err){
        return res.status(403).send({message: ' forvidden access'})
    }
    req.decoded=decoded
    next()
})
}



// dotenv crud mongodb example

async function run() {
    try {
        const appointmentOptionCollextion = client.db('doctorprotailfive-main').collection('adersoptions')
        const bookingsCollextion=client.db('doctorprotailfive-main').collection('bookings')
        const userCollextion=client.db('doctorprotailfive-main').collection('users')

        app.get('/appointmentoption', async (req, res) => {


            // Use Aggregate to query multiple collection and then merge data

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
                const remainingSlots = option.slots.filter(slot => !bookedSlots.includes(slot))
                option.slots = remainingSlots;
                console.log(remainingSlots.length)
            })
            res.send(options);
        });

        app.get('/v2/appointmentoption', async (req, res) => {
            const date = req.query.date;
            const options = await appointmentOptionCollextion.aggregate([
                {
                    $lookup: {
                        from: 'bookings',
                        localField: 'name',
                        foreignField: 'treatment',
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$appointmentDate', date]
                                    }
                                }
                            }
                        ],
                        as: 'booked'
                    }
                },
                {
                    $project: {
                        name: 1,
                        slots: 1,
                        booked: {
                            $map: {
                                input: '$booked',
                                as: 'book',
                                in: '$$book.slot'
                            }
                        }
                    }
                },
                {
                    $project: {
                        name: 1,
                        slots: {
                            $setDifference: ['$slots', '$booked']
                        }
                    }
                }
            ]).toArray();
            res.send(options);
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
       //class-75  
       //class-75-7   verifyjwt
       app.get('/bokings', verifyJWT, async (req, res) => {
        const email = req.query.email;
        console.log(email)
        // const decodedEmail = req.decoded.email;

        // if (email !== decodedEmail) {
        //     return res.status(403).send({ message: 'forbidden access' });
        // }

        const query = { email: email };
        const bookings = await bookingsCollextion.find(query).toArray();
        res.send(bookings);
        console.log(bookings)
    })
        // app.post('/bokings',async (req,res)=>{
        app.post('/bokings', async (req, res) => {
            const booking = req.body;
            // console.log(booking);
            const query = {
                appointmentDate: booking.appointmentDate,
                email: booking.email,
                treatment: booking.treatment
            }

            const alreadyBooked = await bookingsCollextion.find(query).toArray();

            if (alreadyBooked.length) {
                const message = `You already have a booking on ${booking.appointmentDate}`
                return res.send({ acknowledged: false, message })
            }

            const result = await bookingsCollextion.insertOne(booking);
            res.send(result);
        })
//class -75-4 jsonwebtoken setup 

app.get('/jwt', async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    const user = await userCollextion.findOne(query);
    if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
        return res.send({ accessToken: token });
    }
    res.status(403).send({ accessToken: '' })
});



// class -75-7  এটা হলো ইউজার গুলোকে ক্লায়ন্ড শায়টে দেকাব
app.get('/users/createUser',async(req,res)=>{
    const query = {}
    const users= await userCollextion.find(query).toArray()
    res.send(users)
})


      
        app.post('/users/createUser', async (req, res) => {
            const user = req.body;
            console.log("user data push ok",user);
            const result = await userCollextion.insertOne(user);
            res.send(result);
        });
    }
    finally {

    }

}
run().catch(console.log)





app.get('/', (req, res) => {
    res.send('running')
})
app.listen(port, () => {
    console.log(`running${port}`)
})