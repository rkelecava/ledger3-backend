<h1>Installation...</h1>
<ol>
    <li>Create a config.js in the root directory<br /><br />
    <code>
        module.exports = {
    appName: 'NAME OF YOUR APP',
    frontendUrl: 'PATH TO YOUR FRONTEND APP',
    mongo: {
        db: 'PATH TO YOUR MONGO SERVER',
        dbOptions: { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
    },
    smtp: {
        from: 'FROM ADDRESS',
        username: 'GMAIL USERNAME',
        password: 'GMAIL PASSWORD',
        server: 'smtp.gmail.com'
    }
}
    </code>
    </li>
    <li>Create an APP_SECRET environment variable on your host server</li>
    <li>npm start</li>
    
</ol>
