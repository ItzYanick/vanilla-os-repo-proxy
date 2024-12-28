require('dotenv').config()

const express = require('express')
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))
const app = express()
const port = 3001

const interceptMap = process.env.INTERCEPT.split(',').reduce((acc, curr) => {
    const [key, value] = curr.split(':')
    acc[key] = value
    return acc
}, {})

app.get('/api/pkg/:name', (req, res) => {
    const { name } = req.params
    if (interceptMap[name]) {
        res.json({
            name,
            version: interceptMap[name],
            conflicts: [],
            depends: [],
            description: '',
            provides: [],
            recommends: [],
            replaces: [],
            suggests: [],
        })
        return
    }
    fetch(`https://packages.vanillaos.org/api/pkg/${req.params.name}`)
        .then((response) => response.json())
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            res.status(404).send(error)
        })
})

app.listen(port, () => {
    console.log(`Proxy app listening on port ${port}`)
})
