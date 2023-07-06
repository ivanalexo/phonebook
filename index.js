const express = require("express");
const cors = require('cors');
const morgan = require('morgan');
const Person = require('./models/phonebook');

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
  persons.find((person) => person.name === name);

app.get("/api/persons", (request, response) => {
  Person.find({}).then(result => {
    response.json(result)
  })
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  Person.findById(id).then(result => {
    response.json(result)
  })
  // const person = persons.find((person) => person.id === id);
  // response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  Person.findByIdAndDelete(id).then(result => {
    response.status(204).end()
  })
  // persons = persons.filter((person) => person.id !== id);
  // response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: "name or number is missing" });
  }

  // if (checkIfNameAlreadyExists(body.name)) {
  //   return response.status(400).json({ error: "name already exists in phonebook"});
  // }
  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person.save().then(result => {
    response.json(result)
  })
});

app.get("/api/info", (request, response) => {
  const total = persons.reduce((counter, obj) => {
    counter += 1;
    return counter;
  }, 0);
  response.send(`<p>Phonebook has info for ${total} people</p>
    <p>${new Date()}</p>`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
