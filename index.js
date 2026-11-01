require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Entry = require('./models/entry')
const app = express()

app.use(express.json())
app.use(express.static('dist'))

const postToken = morgan.token(
  'head',
  (request, response) => { return JSON.stringify(request.body) }
)

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :head'))

let persons = [
  {
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '39-44-5323523'
  },
  {
    id: '3',
    name: 'Dan Abramov',
    number: '12-43-234345'
  },
  {
    id: '4',
    name: 'Mary Poppendieck',
    number: '39-23-6423122'
  }
]

app.get('/api/persons', (request, response) => {
  Entry.find({}).then(e => {
    response.json(e)
  })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  const current_time = new Date()
  response.send(`<div><p>Phonebook has info for ${persons.length} people</p><p>${current_time}</p></div>`)
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Entry.findById(id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const person = request.body

  if (!person || !person.name || !person.number) {
    return response.status(400).json({
      error: 'name or number doesn\'t exist'
    })
  }

  if (persons.find(p => p.name === person.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const entry = new Entry({
    name: person.name,
    number: person.number
  })

  entry.save().then(savedEntry => {
    response.json(savedEntry)
  })
    .catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id

  Entry.findByIdAndDelete(id).then(() =>
    response.status(204).end()
  )
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Entry.findById(request.params.id)
    .then(entry => {
      if (!entry) {
        return response.status(404).end()
      }

      entry.name = name
      entry.number = number

      return entry.save().then(updatedEntry => {
        response.json(updatedEntry)
      })
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
