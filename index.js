const express = require("express")
const path = require("path")
const logger = require("./middleware/logger")
const members = require("./Members")

const app = express()

//Init middleware
app.use(logger)

app.get("/api/members", (req, res) => res.json(members))

// send html directly
// app.get("/", (req, res) => {
//   res.send(`<h1>Hello Poppet!</h1>`)
// })

// send individual htm file in public folder
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index-example.html"))
// })

//Set public folder to static so static assets (such as HTML, CSS, images, and client-side JavaScript files are served directly to clients without any processing by the server. any request that matches a file in the "public" folder will be served directly by Express
app.use(express.static(path.join(__dirname, "public")))

const PORT = process.eventNames.PORT || 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
