# BriskController

BriskController is a fast, light-weight, brisk Controller to work in nodejs, bese on express. It references the decorator of SpringNVC framework and changes some usage in javascript. Use the brisk-ioc as the IoC/DI container.

BriskController是一个基于Express的快速、轻量级、轻快的Controller，可以在nodejs中工作。它参考了SpringMVC框架的装饰器，并改变了javascript中的一些用法。使用brisk-ioc作为 IoC/DI 容器。

[![npm version](https://badge.fury.io/js/brisk-controller.svg)](https://badge.fury.io/js/brisk-controller)

[![NPM](https://nodei.co/npm/brisk-controller.png)](https://nodei.co/npm/brisk-controller/)

# License

[MIT License](./LICENSE)

Copyright (c) 2021 Ruixiaozi

# Documentation

2. Installation

   First install Node.js and [brisk-ioc](https://github.com/ruixiaozi/brisk-ioc) 

   Reference to https://github.com/ruixiaozi/brisk-ioc
   
   
   
   Then:
   
   ```
   $ npm install brisk-controller
   ```
   
3. Importing and Using ( Example )

   ```
   // `src/index.js`
   require("@babel/polyfill");
   const BriskIoC = require('brisk-ioc');
   const BriskController = require('brisk-controller');
   
   (async function () {
     await BriskIoC
     .use(BriskController，{/*plugin option*/})
     .scanComponents(__dirname,"./controller","./bean")
     .initAsync();
   
   })();
   ```


### plugin option


# Support

+ express
+ morgan
+ cookie-parser
+ http-errors

