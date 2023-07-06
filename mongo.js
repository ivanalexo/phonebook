const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument!')
    process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://ivanalexoc:${password}@cluster0.ulmzrh4.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url).catch(e => console.log(e))

const phonebookSchema = new mongoose.Schema({
    name: String,
    number: Number
})

const Phonebook = mongoose.model('Person', phonebookSchema)

if (process.argv.length > 3) {
    const name = process.argv[3]
    const number = process.argv[4]

    const person = new Phonebook({
        name: name,
        number: number
    })

    person.save().then(result => {
        console.log(`added ${result.name} number ${result.number} to phonebook!`)
        mongoose.connection.close()
    })
} 
if (process.argv.length === 3) {
    console.log('Phonebook:')
    Phonebook.find({}).then(result => {
        result.map(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}

