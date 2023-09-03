const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const {v4: uuidv4} = require('uuid');

app.use(bodyParser.urlencoded({extended: true}));

const usersDatabase = [];
const exercisesDatabase = []

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
    const _id = uuidv4();
    const username = req.body.username;

    // Create a new user object and push it to the array
    const newUser = {
        username,
        _id
    };
    usersDatabase.push(newUser);
    res.json(newUser);
});

app.get('/api/users', (req, res) => {
    // Return the entire array of user objects
    res.json(usersDatabase);
});

app.post('/api/users/:_id/exercises', (req, res) => {
    const _id = req.params._id; // Use req.params to get the user ID from the URL
    const foundUser = usersDatabase.find(user => user._id === _id);

    if (foundUser) {
        const username = foundUser.username;
        const description = req.body.description;
        const duration = parseFloat(req.body.duration);

        let date = new Date();
        let dateString = date.toDateString();

        if (req.body.date) {
            date = new Date(req.body.date);
            dateString = date.toDateString();
        }

        // Create an exercise object
        const exercise = {
            username: username,
            description: description,
            duration: duration,
            date: dateString,
            _id: _id,
        };

        // Add the exercise to the exercisesDatabase
        exercisesDatabase.push(exercise);

        res.json(exercise);
        console.log(exercisesDatabase)
    } else {
        res.send('User not found');
    }
});

app.get("/api/users/:_id/logs", (req, res) => {
    let from_date = req.query.from ? new Date(req.query.from) : null;
    let to_date = req.query.to ? new Date(req.query.to) : null;
    let limit = req.query.limit ? parseInt(req.query.limit) : null;

    const _id = req.params._id;

    let allExercises = exercisesDatabase.filter(exercise => {
        const idCondition = exercise._id === _id;
        const exerciseDate = new Date(exercise.date)

        const fromDateCondition = from_date ? exerciseDate >= from_date : true;
        const toDateCondition = to_date ? exerciseDate <= to_date : true;
        return idCondition && fromDateCondition && toDateCondition;
    });


    if (limit) {
        allExercises = allExercises.slice(0, limit);
    }

    const count = allExercises.length;

    const logsData = allExercises.map(item => ({
        description: item.description,
        duration: item.duration,
        date: item.date
    }));

    res.json({
        username: allExercises[0].username,
        count: count,
        _id: allExercises[0]._id,
        log: logsData
    });
});


const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})
