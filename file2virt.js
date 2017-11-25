var fs = require('fs'), list = process.argv, l = 2; 
var Emitter = require('./dist/jazzle.js').Emitter;


function jsStringFor(str) {
  var em = new Emitter();
  em.writeString(str, "'");
  return em.curLine;
}
console.log('var resolver = new VirtualResourceResolver();');
while (l < list.length) {
  var fileName = list[l++ ];
  console.log('resolver.set('+jsStringFor(fileName)+', '+jsStringFor(fs.readFileSync(fileName, 'utf-8').toString())+');');
}
