class Logger {

    log(message) {
        // you can use winston or any logger you want
        // you can inject currently authorized user, any request data via constructor injection
        console.log(message);
    }

}

module.exports = {
    Logger: Logger
};