#!/usr/bin/env node

 

var app = require('../app');
var debug = require('debug')('myabc:server'); 
 

app.listen(80, 'xiyuetatest.top', function() {//ָ������
  console.log('Server is running on xiyuetatest.top');
});
 