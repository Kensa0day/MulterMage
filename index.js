const express = require('express')
const multer = require('multer')
const fs = require('fs')
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectID
const myurl = 'mongodb+srv://Kens0day:kens0day@cluster0.rtupcjj.mongodb.net/Node-API?retryWrites=true&w=majority'
const PORT = 5500

const app = express()

app.use(express.urlencoded({ extended: true }))

// atur Penyimpanan

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
  

  const upload = multer({ storage })


// Melihat File yang sudah diupload
function getDirectoryContent (req, res, next) {
    fs.readdir('uploads', (err, files) => {
        if (err) return next(err)
        res.locals.filenames = files
        next()
    })
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})


// endpoint single file upload

app.post('/uploadfile', upload.single('myfile'), (req, res) => {
    const file = req.file
    if (!file) {
        const error = new Error('Tolong Upload File')
        error.httpStatusCode = 400
        return next(error)
    }
    res.send(file)
})

// endpoint multiple upload file
app.post('/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
    const file = req.file
    if (!file) {
        const error = new Error('Tolong Upload File')
        error.httpStatusCode = 400
        return next(error)
    }
    res.send(file)
})


app.get('/files', getDirectoryContent, (req, res) => {
    res.send({ files: res.locals.filenames })
})



// upload img kedatabase
app.post('/uploadphoto', upload.single('picture'), (req, res) => {
    const img = fs.readFileSync(req.file.path)
    const encode_image =  img.toString('base64')

    const finalImg = {
        contentType: req.file.mimetype,
        image: new Buffer(encode_image, 'base64')

    }

    db.collection('photos').insertOne(finalImg, (err, result) => {
        if (err) return console.log(err)
        console.log('Tersimpan Di Database')
        res.redirect('/')

    })
})

// get gambar dari database
app.get('/photos', (req, res) => {
    db.collection('photos').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.send(result)
    })
})


// get gambar dari database berdasarkan id
app.get('/photo/:id', (req, res) => {
    const filename = req.params.id
    db.collection('photos').findOne({ _id: ObjectId(filename) }, (err, result) => {
        if (err) return console.log(err)
        res.contentType('image/jpeg')
        res.send(result.image.Buffer)
    })
})

//MongoDB COnnect

MongoClient.connect(myurl, (err, client) => {
    if(!err) return console.log(err)
    db = client.db('products')
    app.listen(PORT, () => {
        console.log('Listen on port', PORT)
    })
})