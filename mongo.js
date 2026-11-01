const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.a7897dx.mongodb.net/`

mongoose.set('strictQuery', false)

mongoose.connect(url, { dbName: 'phonebook', family: 4 })

const entrySchema = new mongoose.Schema({
  name: String,
  number: String
})

const Entry = mongoose.model('Entry', entrySchema)

if (process.argv.length === 3) {
  console.log('phonebook:')
  Entry.find({}).then(result => {
    result.forEach(e => {
      console.log(`${e.name} ${e.number}`)
    })
    mongoose.connection.close()
  })
} else if (process.argv.length > 3) {
  const name = process.argv[3]
  const number = process.argv[4]

  const entry = new Entry({
    name: name,
    number: number
  })

  entry.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}
