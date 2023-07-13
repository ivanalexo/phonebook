const express = require("express");
const cors = require('cors');
const morgan = require('morgan');

require('dotenv').config()

const Person = require('./models/phonebook');

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  console.log('ERROR: ', error)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if ( error.name === 'MongooseError') {
    return response.status(500).json({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const app = express();

app.use(express.json());
app.use(cors())
app.use(express.static('build'))

morgan.token('body', function(req, res) {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})
app.use(morgan(':method :url :status :req[Content-Length] :response-time ms :body'))

const PORT = process.env.PORT || 3001;
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateId = (length = 6) => {
  let id = "";
  const characters = "0123456789";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    id += characters.charAt(randomIndex);
  }
  return id;
};

const checkIfNameAlreadyExists = (name) =>
  Person.find({ name: name }).then(result => result)

app.get("/api/persons", (request, response, next) => {
  Person.find({}).then(result => {
    response.json(result)
  }).catch(error => next(error))
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id).then(result => {
    response.json(result)
  }).catch(error => next(error))
  // const person = persons.find((person) => person.id === id);
  // response.json(person);
});

app.put("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  const body = request.body
  const updatePerson = {
    name: body.name,
    number: body.number
  }
  const err = Person.schema.path('number').options.validate.validator(body.number)
  if (!err) {
    return response.status(401).json({ error: 'number is invalid'})
  }
  Person.findByIdAndUpdate(id, updatePerson, { new: true }).then(result => {
    response.json(result)
  })
})

app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findByIdAndDelete(id).then(result => {
    response.status(204).end()
  }).catch(error => next(error))
  // persons = persons.filter((person) => person.id !== id);
  // response.status(204).end();
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: "name or number is missing" });
  }

  Person.findOne({ name: body.name })
    .then(result => {
      if (result?.name) {
        const person = {
          name: result.name,
          number: body.number
        }
        const err = Person.schema.path('number').options.validate.validator(body.number)
        if (!err) {
          return response.status(401).json({ error: 'number is invalid'})
        }
        Person.findByIdAndUpdate(result.id, person, { new: true }).then(updatedPerson => {
          response.json(updatedPerson)
        }).catch(error => next(error))
      } else {
        const person = new Person({
          name: body.name,
          number: body.number,
        });
        const error = person.validateSync()
        person.save().then(result => {
          response.json(result)
        }).catch(error => next(error))
      }
    }).catch(error => next(error))

});

app.get("/api/info", async (request, response) => {
  const total = await Person.countDocuments({})
  response.send(`<p>Phonebook has info for ${total} people</p>
    <p>${new Date()}</p>`);
});

app.use(unknownEndpoint)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
