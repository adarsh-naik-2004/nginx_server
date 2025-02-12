const http = require("http")
const fs = require("fs")
const path = require("path")

const port = 3000

const server = http.createServer((req,res) => {
    const filePath = path.join(__dirname, req.url === "/" ? "index.html" : req.url)
    const extension = String(path.extname(filePath)).toLowerCase()

    const mimeTypes = {
        '.html' : 'text/html',
        '.png' : 'image/png',
        '.css' : 'text/css',
        '.js' : 'application/js'
    }

    const contentType = mimeTypes[extension] || 'application/octet-stream' ; // arbitrary binary data

    fs.readFile(filePath, (err, content) => {
        if(err){
            if(err.code === "ENOENT"){
                res.writeHead(404, {"Content-Type": "text/html"});
                res.end("404: File nhi mila");
            }
        }
        else{
            res.writeHead(200, {"Content-Type": contentType});
            res.end(content, "utf-8");
        }
    })
});

server.listen(port, () => {
    console.log(`server is listening on port ${port}`);
    console.log(`http://localhost:${port}`);
})