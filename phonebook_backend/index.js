const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(express.static('dist'))

app.use(cors())

app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res) +
        ' ' +
        tokens.url(req, res) +
        ' ' +
        tokens.status(req, res) +
        ' ' +
        (tokens.res(req, res, 'content-length')
          ? tokens.res(req, res, 'content-length')
          : '-') +
        ' ' +
        '-' +
        ' ' +
        tokens['response-time'](req, res) +
        ' ' +
        'ms ' +
        '{' +
        (req.body.name ? `"name":"${req.body.name}"` : '') +
        (req.body.number ? `,"number":"${req.body.number}"}` : '') +
        '}',
    ]
  })
)

// Info Page
app.get('/info', (request, response) => {
  const requestTime = new Date()
  Person.find({})
    .then((returnedPersons) => {
      console.log(returnedPersons)

      response.send(
        `Phonebook has info for ${
          returnedPersons.length === 1
            ? '1 person'
            : String(returnedPersons.length + ' people')
        }
    <br />
    <br />
    ${requestTime}
    `
      )
      console.log(response.getHeaders())
    })
    .catch((error) => {
      console.error('could not fetch info: ', error)
    })
})

////////////
// CRUD

// Read ALL Persons
app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

// Create Person
app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log(body)

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

// Read Person
app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person)
        console.log(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

// Delete Person
app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then((deletedPerson) => {
      response.status(204).end()
      console.log(`deleted person id ${deletedPerson.id}`)
    })
    .catch((error) => next(error))
})

// Update Person
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  const id = request.params.id

  Person.findByIdAndUpdate(
    id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      console.log('updated person: ', updatedPerson)
      response.json(updatedPerson)
    })
    .catch((error) => {
      next(error)
    })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

// Start app
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Navigate to http://localhost:${PORT}\n\n`)
})
