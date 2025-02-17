const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const Person = require("./models/person");

const app = express();

app.use(express.json());
app.use(express.static("dist"));

app.use(cors());

app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res) +
        " " +
        tokens.url(req, res) +
        " " +
        tokens.status(req, res) +
        " " +
        (tokens.res(req, res, "content-length")
          ? tokens.res(req, res, "content-length")
          : "-") +
        " " +
        "-" +
        " " +
        tokens["response-time"](req, res) +
        " " +
        "ms " +
        (req.body.name
          ? `{"name":"${req.body.name}","number":"${req.body.number}"}`
          : ""),
    ];
  })
);

// Info Page
app.get("/info", (request, response) => {
  const requestTime = new Date();
  Person.find({})
    .then((returnedPersons) => {
      console.log(returnedPersons);

      response.send(
        `Phonebook has info for ${
          returnedPersons.length === 1
            ? "1 person"
            : String(returnedPersons.length + " people")
        }
    <br />
    <br />
    ${requestTime}
    `
      );
      console.log(response.getHeaders());
    })
    .catch((error) => {
      console.error("could not fetch info: ", error);
    });
});

////////////
// CRUD

// Read ALL Persons
app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

// Create Person
app.post("/api/persons", (request, response) => {
  const body = request.body;
  console.log(body);

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

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

// Read Person
app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  console.log(id);
  Person.findById(id)
    .then((person) => {
      response.json(person);
      console.log(person);
    })
    .catch((error) => {
      console.error("could not get person:", error.message);
      response.status(404).end();
    });
});

// Delete Person
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  Person.findByIdAndDelete(id).then((deletedPerson) => {
    response.status(204).end();
    console.log(`deleted person id ${deletedPerson.id}`);
  });
});

// Start app
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Navigate to http://localhost:${PORT}\n\n`);
});
