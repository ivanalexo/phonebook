const mongoose = require('mongoose')

const password = process.argv[2]
const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
console.log('Connecting to: ', url)
mongoose.connect(url)
    .then(result => {
        console.log('Connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB: ', error.message)
    })

const phonebookSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        validate: {
            validator: function(v) {
                return /^\d{2,3}-\d{8,}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number`
        },
        required: true
    }
})

phonebookSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', phonebookSchema)
