const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const port = 8000;

app.listen(port, (req,res) => {
    console.log(`server started on port ${port}`);
});


app.get('/', function (req,res) {
    res.status(200).json({
        success: true,
        message: "THANK YOU"
    });
});



// Database Config

const sequelize = new Sequelize('fountane', 'navaneethnivol', 'Admin123', {
    host: 'localhost',
    dialect: 'postgres'
});

// Database connection 


sequelize.authenticate()
.then( ()=> {
    console.log("Database Connected");
}).catch( err => {
    console.error('unable to connect to Database');
});


// Creating DB schemas and Creating Tables

const login = sequelize.define('logins', {
    lid: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },

    name: { 
        type: DataTypes.TEXT,
        allowNull: false
    },

    password: { 
        type: DataTypes.TEXT,
        allowNull: false
    },

    salt: { 
        type: DataTypes.TEXT,
        allowNull: false
    }

    }, {
        timestamps: false
});


const User = sequelize.define('users',{

    id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: Sequelize.STRING,
    mono: Sequelize.STRING,
    
    },{
        timestamps: false
});

const Car = sequelize.define('cars',{

    id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    cName: Sequelize.STRING,
    model: Sequelize.STRING,
    year: Sequelize.STRING
    
    },{
        timestamps: false
});


// sequelize.sync({
//     force: true
// });


// Done with Database


app.listen(port, (req,res) => {
    console.log(`server started on port ${port}`);
});


app.get('/', function (req,res) {
    res.status(200).json({
        success: true,
        data: "Home Url"
    });
    return;
});

app.get('/login', async function(req,res) {

    try{

        // validation for username and password here

        var user_details = await login.findAll({
            where: {
                name: req.body.name
            }
        });

        if(user_details.length > 0)
        {
            var token = jwt.sign(user_details, 'shhhhh', { algorithm: 'RS256'});
            res.status(200).json({
                success: true,
                token: token
            });
            return;
        }
        else{
            res.status(500).json({
                success: false,
                error: `Cannot find your account`
            });
            return;
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            success: false,
            error: `internal server ERROR: ${err.message} `
        });
        return;
    }

})

var authHandler = function (req, res, next) {
    
    if(!req.get("X-AUTH-TOKEN"))
    {
        res.status(500).json({
            success: false,
            error: {
                message: "token not passed"
            }
        });
        return;
    }

    try{
        var token = req.get("X-AUTH-TOKEN");

        var user_credentials = jwt.verify(token, 'shhhhh');

    }
    catch(err){
        console.log(err);
        res.status(401).json({
            success: false,
            error: {
                message: "Invalid Token"
            }
        });
        return;
    }
    next();
}

app.get('/api/user/data', authHandler, async function (req,res) {

    let query = {};

   try {

       if(req.query.id)
       {
           query.id = req.query.id;
       }
      
       values =  await User.findAll();

        res.status(200).json({
            success: true,
            data: values
        })

   } catch(err){
    
        console.log(err);

        res.status(500).json({
            success: false,
            error: `internal server ERROR: ${err} `
        });
   }
})

app.get('/api/car/data', authHandler, async function (req,res) {

    let query = {};

   try {

        if(req.query.id)
        {
            query.id = req.query.id;
        }

       values = await Car.findAll({
           where: query
        })

        res.status(200).json({
            success: true,
            data: values
        })

   } catch (err) {

        res.status(500).json({
            success: false,
            error: `internal server ERROR: ${err} `
        });
   }
})


app.post('/api/post/user', authHandler, async function (req, res) {

    try {

        let dataObj = {
            id: req.body.id,
            name: req.body.name,
            mono: req.body.mono
        }
    
        let createdData = await User.destroy({
            where: {
                id: 2
            }
        });

        res.status(200).json({
            success: true,
            data: createdData
        })
        
    } catch (err) {

        res.status(500).json({
            success: false,
            error: `internal server ERROR: ${err} `
        });   
    }
})


app.post('/api/post/car', authHandler, async function (req, res) {

    try {

        let dataObj = {
            id: req.body.id,
            cName: req.body.cName,
            model: req.body.model,
            year: req.body.year
        }
    
        let createdData = await Car.create(dataObj);

        res.status(200).json({
            success: true,
            data: createdData
        })
        
    } catch (err) {

        res.status(500).json({
            success: false,
            error: `internal server ERROR: ${err} `
        });   
    }
})