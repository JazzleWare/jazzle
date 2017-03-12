var parsers = {};

try {
   var pEsprima = require( 'esprima' );
   parsers.esprima = function(src, withLoc) {
      return pEsprima.parse(src, { loc: withLoc, ranges: withLoc });
   };
} catch ( e ) {}

try {
   var pAcorn = require( 'acorn' );
   parsers.acorn = function( src, withLoc ) {
      return pAcorn.parse(src, { locations: withLoc });
   };
} catch ( e ) {} 

try {
   var pLube = require( '../dist/jazzle.js' );
   parsers.jazzle = function( src, withLoc ) {
      return new pLube.Parser(src).parseProgram();
   }
} catch ( e ) {
   var pLube = require( '../dist/jazzle_error.js' );
   parsers.jazzle = function( src, withLoc ) {
      return new pLube.Parser(src).parseProgram();
   }
}

try {
   var pShift = require( 'shift-parser' );
   parsers.shift = function(src, withLoc) {
      return pShift.parseScript(src, { earlyErrors: false, loc: withLoc } );
   };
} catch ( e ) {}

var fs = require( 'fs' ), util = require( '../common/util.js' ) ;

function readFile(filePath) {
   try {
     return fs.readFileSync(filePath,'utf-8').toString();
   } catch ( e ) {
     console.log( "COULD NOT LOAD", filePath );
     return "";
   }
}

var SOURCES_ROOT = './bench/sources';
var sources = {};

var files = null, e = 0;

if (process.argv.length-1 <= 2) {
  files =  fs .readdirSync ( SOURCES_ROOT );
//sources['lube'] = readFile( './dist/lube.js' );
}
else {
  files = []; e = 2;
  SOURCES_ROOT = ".";
  while (++e < process.argv.length)
    files.push(process.argv[e]);
  console.log(files);
}

e = 0;
while ( e < files.length ) {
  if ( !fs.statSync (SOURCES_ROOT + '/' + files[e]).isDirectory() )  { 
    sources[files[e]] = readFile(SOURCES_ROOT+ '/' + files[e]);
    console.log( 'LOAD', files[e] );
  }

  e++ ;
}

var Benchmark = require( 'benchmark' ).Benchmark ;
var parserName, sourceName;

function parseLater( parserName, sourceName ) {
  return function() { return parsers[parserName](sources[sourceName], true); };

}
 
var JEAP = 'jeap';
function randJEAP() {
   var str = "";
   var jea = JEAP;
   while ( str.length < JEAP.length ) {
      var i = (Math.random()*jea.length)|0;
      str += jea.charAt(i);
      if ( i < jea.length - 1 ) 
         jea = jea.substring(0,i) + jea.substring(i+1);
      else
         jea = jea.substring(0,jea.length-1);
  
   }

   return str;
}
   
var parserNames = { e: 'esprima', a: 'acorn', j: 'jazzle', p: 'shift' };

for ( sourceName in sources ) {
 var l = 1;
 while ( l-- ) {
     if ( parsers.esprima && parsers.jazzle ) {
          var e = parsers.esprima(sources[sourceName],!false),
              j = parsers.jazzle(sources[sourceName],!false);
          util.prog_adjust(e, j, null);
          var comp =  util.compare_ea(e, j, "", util.ej_adjust);

          if ( comp ) {
            console.log( util.obj2str(comp) );
            throw new Error( 'Incompatible Parsing for ' + sourceName );
          }
     }     

     var benchmarkSet = new Benchmark.Suite();
     var str = process.argv[2] || randJEAP() ;
     var e = 0;
     while ( e < str.length ) { 
       var parserName = parserNames[str[e]];
       benchmarkSet.add( parserName, parseLater(parserName, sourceName) );
       e++ ;
     }

     benchmarkSet.on( 'complete', function(r) {
        var currentTargets = r.currentTarget, i;
        i = 0;
        console.log( "-----------START---------\n",
                     "source: ", sourceName );
        while ( i < currentTargets.length ) { 
          console.log( currentTargets[i].stats.mean, "(" + currentTargets[i].name + ')' )
          i++;
        }
        console.log( "------------DONE---------\n\n");
     });
     
     benchmarkSet.run();
  }
}


