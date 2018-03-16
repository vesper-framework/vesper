var bootstrap = require("../../../src").bootstrap;
var PhotoModule = require("./modules/photo/PhotoModule").PhotoModule;
var PostModule = require("./modules/post/PostModule").PostModule;

bootstrap({
    port: 3000,
    modules: [
        PhotoModule,
        PostModule,
    ]
});