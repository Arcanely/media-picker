const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'example-assets')));
app.use(express.static(path.join(__dirname, 'dist')));


app.get('/example.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'example.html'));
});

app.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');

  const searchString = req.query.search;

  const response = {
    success: true,
    items: [
      {
        href: `https://codex.so/` + `${searchString} first search item`.replace(/([^a-zA-Z0-9])/g, '-'),
        name: `${searchString} first search item`,
        description: 'Desc for the first item',
        id: '873acc61-73de-40cb-b430-e20da97a6b2e',
      },
      {
        href: `https://codex.so/` + `${searchString} another one search item`.replace(/([^a-zA-Z0-9])/g, '-'),
        name: `${searchString} another one search item`,
        description: 'Desc for the second item',
        id: '873acc61-73de-40cb-b430-e20da97a6b2e',
      },
      {
        href: `https://codex.so/` + `${searchString} third item`.replace(/([^a-zA-Z0-9])/g, '-'),
        name: `${searchString} third item`,
        description: 'Desc for the third item',
        id: '873acc61-73de-40cb-b430-e20da97a6b2e',
      },
    ],
  };


  res.setHeader('Content-Type', 'application/json');
  res.send(response);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
