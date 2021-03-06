const fs = require('fs')
const http = require('http')
const url = require('url')

//////////////////////////////////////////////
// FILES

// blocking

// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8')

// const textOut = `This is what we know about the avocado: ${textIn}\nCreated on ${Date.now()}`

// fs.writeFileSync('./txt/output.txt', textOut)
// console.log('File written!')

// // non-blocking

// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//   console.log(data1)
//   fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//     console.log(data2)
//     fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//       console.log(data3)
//       fs.writeFile('./txt/final.txt', `${data2}\n\n\n${data3}`, 'utf-8', (err) => {
//         console.log('Your file has been written :)')
//       })
//     })
//   })
// })

//////////////////////////////////////////////
// SERVER

const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName)

  output = output.replace(/{%IMAGE%}/g, product.image)
  output = output.replace(/{%PRICE%}/g, product.price)
  output = output.replace(/{%FROM%}/g, product.from)
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients)
  output = output.replace(/{%QUANTITY%}/g, product.quantity)
  output = output.replace(/{%DESCRIPTION%}/g, product.description)
  output = output.replace(/{%ID%}/g, product.id)
  if (!product.organic) output.replace(/{%NOT_ORGANIC%}/g, 'not-organic')

  return output
}

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8')
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8')
const tempProduct = fs.readFileSync(`${__dirname}/templates/product.html`, 'utf-8')

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8')
const dataObject = JSON.parse(data)

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true)
  console.log(pathname)

  // overview page
  if (pathname === '/' || pathname === '/overview') {
    const cardsHtml = dataObject.map(el => replaceTemplate(tempCard, el)).join('\n\n')
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml)

    res.writeHead(200, {
      'Content-Type': 'text/html'
    })

    res.end(output)

    // product page
  } else if (pathname === '/product') {
    const product = dataObject[query.id]

    res.writeHead(200, {
      'Content-Type': 'text/html'
    })

    const output = replaceTemplate(tempProduct, product)

    res.end(output)
    
    // api
  } else if (pathname === '/api') {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    })
    res.end(data)

    // not found
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world'
    })
    res.end('<h1>This is NOT FOUND</h1>')
  }
})

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000')
})