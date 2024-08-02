let persons = require("./db.json");

const express = require("express");
const app = express();
const morgan = require('morgan')
app.use(express.json());

app.use(morgan('tiny'));

morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get("/", (request, response) => {
  response.send("<h1>test</h1>");
});

app.get("/info", (request, response) => {
  const personCount = persons.length;
  const currentDate = new Date(); // Formats the date

  response.send(`
    <p>Phonebook has info for ${personCount} people</p>
    <p>${currentDate}</p>
  `);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).send({ error: "Person not found" });
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const maxId =
    persons.length > 0 ? Math.max(...persons.map((n) => Number(n.id))) : 0;
  return String(maxId + 1);
};
app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.name) {
    return response.status(400).json({
      error: "content missing",
    });
  } else if (persons.some((person) => person.name === body.name)) {
    return response.status(401).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  response.json(person);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} http://localhost:3001/`);
});
