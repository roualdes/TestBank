var express = require('express');
var router = express.Router();

// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

var xmlhttprequest = require('xmlhttprequest');
var ws = require('ws');
var fs = require('fs');
global.XMLHttpRequest = xmlhttprequest.XMLHttpRequest;
global.WebSocket = ws;
var jupyter = require('jupyter-js-services');

var gatewayUrl = process.env.BASE_GATEWAY_HTTP_URL || 'http://localhost:8888';
var gatewayWsUrl = process.env.BASE_GATEWAY_WS_URL || 'ws://localhost:8888';

var demoLang = process.env.DEMO_LANG || 'python';
var demoInfo = {
    python: {
        kernelName: 'python',
        filename: 'example.py'
    },
    scala: {
        kernelName: 'scala',
        filename: 'example.scala'
    },
    r: {
        kernelName: 'ir',
        filename: 'example.r'
    }
}[demoLang];
var demoSrc = fs.readFileSync(demoInfo.filename, {encoding: 'utf-8'});

console.log('Targeting server:', gatewayUrl);
console.log('Using example code:', demoInfo.filename);

var ajaxSettings = {};

// For authentication, set the environment variables:
// BASE_GATEWAY_USERNAME and BASE_GATEWAY_PASSWORD.

if (process.env.BASE_GATEWAY_USERNAME) {
    ajaxSettings['user'] = process.env.BASE_GATEWAY_USERNAME
}

if (process.env.BASE_GATEWAY_PASSWORD) {
    ajaxSettings['password'] = process.env.BASE_GATEWAY_PASSWORD
}

console.log('AJAX User:', ajaxSettings['user']);
console.log('AJAX Password:', ajaxSettings['password']);

// query with
// curl -k -L http://localhost/testbank/2

// router.get('/', function(req, res, next) {
//     res.render('testbank', {title: 'testbank',
//                             session: req.session});
// });

router.get('/', function(req, res, next) {
    var output = '';
    jupyter.startNewKernel({
        baseUrl: gatewayUrl,
        wsUrl: gatewayWsUrl, // passing this separately to demonstrate basic auth
        name: demoInfo.kernelName,
        ajaxSettings: ajaxSettings
    }).then((kernel) => {
        // execute some code
        // console.log('Executing sample code');
        var future = kernel.execute({ code: demoSrc } );
        future.onIOPub = (msg) => {
            // print received messages
            output = msg.content.text;
            if (output != null) {
                res.send({'output': output});
            }
        };
    }).catch(req => {
        console.log('Error starting new kernel:', req.xhr.statusText);
        process.exit(1);
    });


    // jupyter.getKernelSpecs({
    //     baseUrl: gatewayUrl,
    //     ajaxSettings: ajaxSettings
    // }).then((kernelSpecs) => {
    //     console.log('Available kernelspecs:', kernelSpecs);

    //     // request a new kernel
    //     console.log('Starting kernel:', demoLang)
    //     jupyter.startNewKernel({
    //         baseUrl: gatewayUrl,
    //         wsUrl: gatewayWsUrl, // passing this separately to demonstrate basic auth
    //         name: demoInfo.kernelName,
    //         ajaxSettings: ajaxSettings
    //     }).then((kernel) => {
    //         // execute some code
    //         console.log('Executing sample code');
    //         var future = kernel.execute({ code: demoSrc } );
    //         future.onDone = (msg) => {
    //             // quit the demo when done, but leave the kernel around
    //             // process.exit(0);
    //         };
    //         future.onIOPub = (msg) => {
    //             // print received messages
    //             tmp = msg.content.text;
    //             if (tmp != null) {
    //                 output = tmp;
    //                 console.log('onIOPub:', output);
    //             }
    //         };
    //     }).catch(req => {
    //         console.log('Error starting new kernel:', req.xhr.statusText);
    //         process.exit(1);
    //     });
    // }).catch((req) => {
    //     console.log('Error fetching kernel specs:', req.xhr.statusText);
    //     process.exit(1);
    // });
});

let exercises = {
  1: {
      id: '1',
      exercise : 'Tough problem',
  },
  2: {
      id: '2',
      exercise: 'Easy problem',
  },
};

// router.get('/:tbID', function(req, res, next) {
//     let payload = exercises[req.params.tbID];
//     if (payload) {
//         res.send(payload);
//     } else {
//         res.send({'payload': 'nothing'});
//     }
// });

module.exports = router;