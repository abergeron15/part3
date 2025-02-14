const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(express.json());
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res) +
        " " +
        tokens.url(req, res) +
        " " +
        tokens.status(req, res) +
        " " +
        tokens.res(req, res, "content-length") +
        " " +
        "-" +
        " " +
        tokens["response-time"](req, res) +
        " " +
        "ms " +
        `{"name":"${req.body.name}","number":"${req.body.number}"}`,
    ];
  })
);

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// Info Page
app.get("/info", (request, response) => {
  const requestTime = new Date();

  response.send(
    `Phonebook has info for ${
      persons.length === 1 ? "1 person" : String(persons.length + " people")
    }
    <br />
    <br />
    ${requestTime}
    `
  );
  console.log(response.getHeaders());
});

////////////
// CRUD

// Read ALL Persons
app.get("/api/persons", (request, response) => {
  response.json(persons);
  console.log("persons =", persons);
});

// Create Person
app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!(body.name || body.number)) {
    return response.status(400).json({
      error: "name and number missing",
    });
  }

  if (!body.name) {
    return response.status(400).json({
      error: "name missing",
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: "number missing",
    });
  }

  if (persons.find((p) => p.name === body.name)) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: Math.round(Math.random() * 1000000000),
  };

  persons = persons.concat(person);

  response.json(person);
  console.log(person);
});

// Read Person
app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((p) => p.id === id);

  if (person) {
    response.json(person);
    console.log(person);
  } else {
    response.status(404).end();
  }
});

// Delete Person
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((p) => p.id !== id);

  response.status(204).end();
  console.log(`deleted person id ${id}`);
});

// Start app
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Navigate to http://localhost:${PORT}\n\n`);
});
