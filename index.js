const express = require("express");
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors())

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

app.get("/", (request, response) => {
  response.send("<h1>Phonebook</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: "name or number is missing" });
  }

  if (checkIfNameAlreadyExists(body.name)) {
    return response.status(400).json({ error: "name already exists in phonebook"});
  }
  const person = {
    name: body.name,
    number: body.number,
    id: Number(generateId(10)),
  };

  persons = persons.concat(person);
  response.json(person);
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
