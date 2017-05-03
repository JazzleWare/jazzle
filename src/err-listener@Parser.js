this.onErr = function(errorType, errParams) {
   var message = "";
   if (!HAS.call(ErrorBuilders, errorType))
     message = "Error: " + errorType + "\n" +
       this.src.substr(this.c-120,120) +
       ">>>>" + this.src.charAt(this.c+1) + "<<<<" +
       this.src.substr(this.c, 120);

   else {
     var errorBuilder = ErrorBuilders[errorType];  
     var errorInfo = this.buildErrorInfo(errorBuilder, errParams);

     var offset = errorInfo.c0,
         line = errorInfo.li0,
         column = errorInfo.col0,
         errMessage = errorInfo.messageTemplate.applyTo(errParams);

     message += "Error: "+line+":"+column+" (src@"+offset+"): "+errMessage;

     // TODO: add a way to print a 'pin-range', i.e., the particular chunk of the
     // source code that is causing the error
   }

   throw new Error(message);
};
  
// TODO: find a way to squash it with normalize
this.buildErrorInfo = function(builder, params) {
  if (builder.preprocessor !== null)
    builder.preprocessor.call(params);

  var errInfo = {
    messageTemplate: builder.messageTemplate,
    c: -1, li: -1, col: -1,
    c0: -1, li0: -1, col0: -1,
    parser: params['parser'],
    extra: params.extra
  };

  var cur0 = params.cur0, cur = params.cur;

  if (HAS.call(builder, 'tn')) {
    var tn = builder.tn.applyTo(params);
    if (HAS.call(tn,'start')) cur0.c = tn.start;
    if (HAS.call(tn,'end')) cur.c = tn.end;
    if (HAS.call(tn,'loc')) {
      if (HAS.call(tn.loc, 'start')) {
        cur0.loc.li = tn.loc.start.line;
        cur0.loc.col = tn.loc.start.column;
      }
      if (HAS.call(tn.loc, 'end')) {
        cur.loc.li = tn.loc.end.line;
        cur.loc.col = tn.loc.end.column;
      }
    }
  }

  if (HAS.call(builder, 'cur0'))
    cur0 = builder.cur0.applyTo(params);

  if (HAS.call(builder, 'cur'))
    cur = builder.cur.applyTo(params);

  if (HAS.call(builder, 'loc0'))
    cur0.loc = builder.loc0.applyTo(params);

  if (HAS.call(builder, 'loc'))
    cur.loc = builder.loc.applyTo(params);

  if (HAS.call(builder, 'li0'))
    cur0.loc.li = builder.li0.applyTo(params);

  if (HAS.call(builder, 'li'))
    cur.loc.li = builder.li.applyTo(params);

  if (HAS.call(builder, 'col0'))
    cur0.loc.col = builder.col0.applyTo(params);

  if (HAS.call(builder, 'col'))
    cur.loc.col = builder.col.applyTo(params);

  if (HAS.call(builder, 'c0'))
    cur0.c = builder.c0.applyTo(params);

  if (HAS.call(builder, 'c'))
    cur.c = builder.c.applyTo(params);

  errInfo.c0 = cur0.c; errInfo.li0 = cur0.loc.li; errInfo.col0 = cur0.loc.col;
  errInfo.c = cur.c; errInfo.li = cur.loc.li; errInfo.col = cur.loc.col;

  return errInfo;
};

var ErrorBuilders = {};
function a(errorType, builderOutline) {
  if (HAS.call(ErrorBuilders, errorType))
    throw new Error('Error type has already got a builder: <'+errorType+'>');
  var builder = {preprocessor:null};
  for (var name in builderOutline) {
    if (name === 'm')
      builder.messageTemplate = ErrorString.from(builderOutline[name]);
    else if (name === 'p')
      builder.preprocessor = builderOutline.p; 
    else
      builder[name] = Template.from(builderOutline[name]);
  }

  ErrorBuilders[errorType] = builder;

  return builder;
}

function set(newErrorType, existingErrorType) {
  if (HAS.call(ErrorBuilders, newErrorType))
    throw new Error('cannot override the existing <'+
      newErrorType+'> with <'+existingErrorType);
  if (!HAS.call(ErrorBuilders, existingErrorType))
    throw new Error('error is not defined: <'+existingErrorType+'>');
  
  var builder = ErrorBuilders[existingErrorType];
  ErrorBuilders[newErrorType] = builder;

  return builder;
}

// TODO: the argument that is coming last is a sample error code; builders must have this value as a property.
// also a list of options may come after each of these "samples" signifying which options they should be parsed with

a('arg.non.tail', {c0:'c0', li0:'li0',col0:'col0', m: 'unexpected comma -- tail arguments not allowed in versions before 7'}, 'a(b,)');

a('arg.non.tail.in.func', {c0:'c0',li0:'li0',col0:'col0', m: 'unexpected comma -- tail parameters not allowed in versions before 7'}, 'function a(b,) {}', '(a,)=>b');

a('array.unfinished', {c0:'parser.c0', li0: 'parser.li0', col0: 'parser.col0', m: 'a \']\' was expected -- got {parser.lttype}'}, '[a 12');

a('arrow.has.a.paren.async', {tn: 'parser.parenAsync', m: '\'async\' can not have parentheses around it (the \'=>\' at {parser.li0}:{parser.col0} (offset {parser.c0}) requires this to hold'}, '(async)(a,b)=>12');

a('arrow.newline.before.paren.async', {tn:'parser.pe', m: '\'async\' of an async can not have a newline after it'}, 'async\n(a)=>12');

a('arrow.arg.is.await.in.an.async', {tn:'tn', m: 'await is not allowed as an async arrow\'s parameter'}, 'async(a=await)=>12');

a('arrow.missing.after.empty.list', {c0:'parser.se.end', li0:'parser.se.loc.end.line', col0: 'parser.se.loc.end.column', m:'unexpected \')\''}, '()');

a('assig.not.first', {c0:'parser.c0', li0:'parser.li0', col0:'parser.col0', m: 'Unexpected \'=\''}, 'a-b=12');

a('assig.not.simple', {tn:'tn', m: 'an identifier or a member expression was expected; instead got a {tn.type}'}, '([a])--');

a('assig.to.arguments.or.eval', {tn:'parser.se', m:'can not assign to {parser.se.name} while in strict mode'}, '"use strict"; [arguments] = 12');

a('async.gen.not.yet.supported', {c0:'parser.c0', li0:'parser.li0',col0:'parser.col0', m:'unexpected \'*\' -- async generators not yet supported'}, 'async function *l() {}');

a('async.newline', {c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'unexpected newline after async -- async modifier in an object can not have a newline after it'}, '({async l(){}})');

a('await.args', {c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'an async function may not contain \'await\' anywhere in its parameter list'}, 'async function l(e=[await]) {}', 'async function l(await) {}');

// TODO: await.label

a('await.in.strict', {c0:'parser.c0',li0:'parserl.li0',col0:'parser.col0',m: 'await is a reserved word when in a module, no matter it is in an async function or not'}, 'await = 12');

a('rest.binding.arg.not.id', {tn:'tn.argument',m:'binding rests can only have an argument of type \'Identifier\'(which {tn.argument.type} isn\'t) in versions before 7; current version is {parser.v}.'}, 'function a(...[b]){}');

a('binding.to.arguments.or.eval',{tn:'tn',m:'invalid binding name in strict mode: {tn.name}'}, '"use strict"; (arguments)=>12');

a('<unfinished>', {'tn':'tn', m:'unexpected {parser.lttype} -- a {extra.delim} was expected to end the {tn.type} at {tn.loc.start.line}:{tn.loc.start.column} (offset {tn.start})'});

set('block.dependent.is.unfinished', '<unfinished>', 'try { 12');

a('block.dependent.no.opening.curly', {c0:'parser.c0', li0:'parser.li', col0: 'parser.col0', m:'unexpected {parser.lttype} after {extra.name} -- expected {}'}, 'try 12');

set('block.unfinished', '<unfinished>');

a('break.no.such.label',{tn:'tn',m:'no such label: {tn.name}'}, 'while (false) break L;');

a('break.not.in.breakable', {c0:'c0',li0:'li0',col0:'col0',m:'breaks without any targets can only appear inside an iteration statement or a switch'}, 'break;');

set('call.args.is.unfinished', '<unfinished>');

a('catch.has.no.end.paren',{c0:'c0',li0:'li0',col0:'col0',m:'unexpected {parser.lttype} -- a ) was expected'}, 'try {} catch (a) { 12');

a('catch.has.no.opening.paren',{c0:'c0',li0:'li0',col0:'col0',m:'unexpected {parser.lttype} -- a ( was expected'}, 'try {} catch 12');

a('catch.has.an.asiig.param',{c0:'c0',li0:'li0',col0:'col0',m:'the parameter for a catch clause can not be an assignment pattern'},'try{} catch(a=12){}');

a('catch.has.no.param',{c0:'c0',li0:'li0',col0:'col0',m:'a catch clause must have a parameter'}, 'try{} catch(){}');

a('class.constructor.is.a.dup', {tn:'tn',m:'this class has already got a constructor'}, 'class A{constructor(){} constructor(){}}');

// TODO: what about this: class A { static get constructor() {} }
a('class.constructor.is.special.mem',{tn:'tn',m:'a class member named constructor (or \'constructor\') can not be a getter, generator, setter, or async. (it can be a static member, though.)'}, 'class A{get constructor(){}}');

a('class.decl.has.no.name',{c0:'c0',li0:'li0',col0:'col0',m:'this context requires that the class declaration has a name'}, 'class {}');

a('class.decl.not.in.block',{c0:'c0',li0:'li0',col0:'col0',m:'this scope can not contain a class declaration -- block scope (i.e, those wrapped between {} and }), module scope, and script scope are the only ones that can.'}, 'if (false) class{}');

a('class.label.not.allowed',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'can not label a class'}, 'L: class A{}');

a('class.no.curly',{c0:'c0',li0:'li0',col0:'col0',m:'a {} was expected -- got {parser.lttype} instead'},'class L 12');

a('class.prototype.is.static.mem',{tn:'tn',m:'class can not have a static member named prototype'},'class A{static prototype() {}}');

a('class.super.call',{tn:'tn',m:'can not call super in this context'},'class A{constructor(){var a = super()}');

a('class.super.lone',{tn:'tn',m:'unexpected {parser.lttype} after \'super\' -- a "(" or "." or "[" was expected'}, 'class A extends B { constructor() { (super * 12); }}');

a('class.super.mem',{tn:'tn',m:'member access from super not allowed in this context -- super member access must only occur inside an object method or inside a non-static class member'}, 'class A { static b() { (super.l()); }');

set('class.unfinished', '<unfinished>');

a('comment.multi.unfinished', {c0:'parser.c',li0:'parser.li',col0:'parser.col',m:'reached eof before finding a matching */ for the multiline comment at {extra.li0}:{extra.col0} (offset {extra.c0})'},'/* 12');

// TODO: tell what was got
a('complex.assig.not.pattern',{c0:'c0',li0:'li0',col0:'col0',m:'a \'=\' was expected'},'(a-=12)=>12');

a('cond.colon',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'a \':\' was expected; got {parser.lttype}'}, 'a ? b 5');

a('const.has.no.init',{c0:'c0',li0:'li0',col0:'col0',m:'a \'=\' was expected, got {parser.lttype} -- the declarator at {extra.e.loc.start.line}:{extra.e.loc.start.column} (offset {extra.e.start}) is a const  declarator and needs an initialiser.'},'const a' );

a('const.not.in.v5',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'in versions before ES2015 (current version is {parser.v}), const is a reserved word and can\'t be an actual identifier reference.'}, 'a * const');

a('continue.no.such.label',{tn:'tn', m:'no such label: {tn.name}'},'while (false) continue L;');

a('continue.not.a.loop.label',{tn:'tn',m:'label {tn.name} is not referring to a loop -- a continue\'s label, if any, must refer to a loop.'},'while (false)L:if(false)continue L;');

a('continue.not.in.loop',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'continue is not allowed in this context -- it has to appear in loops only'},'is (false) continue;');

a('decl.label', {c0:'c0',li0:'li0',col0:'col0',m:'{parser.ltval} declarations can not have labels'}, 'L: const a = 12;');

a('delete.arg.not.a.mem',{tn:'tn',m:'when in strict mode code, the delete operator must take a member expression as argument; currently, its argument is a {tn.type}'},  '"use strict"; a * (delete l)');

a('<closing>', {c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'a ) was expected; got {parser.lttype}'});

set('do.has.no.closing.paren', '<closing>');

a('<opening>', {c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'a ( was expected; got {parser.lttype}'});

set('do.has.no.opening.paren', '<opening>');

a('do.has.no.while',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'while expected; got {parser.lttype}'}, 'do {};');

a('esc.8.or.9',{c0:'parser.c',li0:'parser.li',col0:'parser.col0',m:'escapes \\8 or \\9 are not syntactically valid escapes'},'"\\8"');

a('exists.in.current',{tn:'tn',m:'\'{tn.name}\' has been actually declared at {extra.loc.start.line}:{extra.loc.start.column} (offset {extra.start})'},'let a;{var a;}');

a('export.all.no.from', {c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'\'from\' expected; got {parser.ltval}'}, 'export * not \'12\'');

a('export.all.not.*', {c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'unexpected {parser.ltraw}; a * was expected'}, 'export - from \'12\'');

a('export.all.source.not.str',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'a string literal was expected'}, 'export * from 12');

a('export.async.but.no.function',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'function expected to immediately follow async; got {parser.lttype}'},'export async\n12');

a('export.default.const.let',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'const and let declarations can\'t be default exports'},'export default let r = 12;');

a('export.named.has.reserved',{tn:'tn',m:'local {tn.name} is actually a reserved word'},'export {a, if as l};');

a('export.named.list.not.finished',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'unfinished specifier list -- expected }, got {parser.lttype}'},'export {a 12 from \'l\'');

a('export.named.no.exports',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'unexpected {parser.lttype} -- it is not something that can appear at the beginning of an actual declaration'},'export 12');

set('export.named.not.id.from','export.all.no.from');

set('export.named.source.not.str','export.all.source.not.str');

a('export.newline.before.the.function',{c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'a newline is not allowed before \'function\' in exported async declarations.'},'export async\nfunction l() {}');

a('export.not.in.module', {c0:'parser.c0',li0:'parser.li0',col0:'parser.col0'});

a('export.specifier.after.as.id', {c0:'parser.c0',li0:'parser.li0',col0:'parser.col0',m:'got {parser.lttype}; an identifier was expected'}, 'export {a as 12}');

a('export.specifier.not.as', {m:'\'as\' or } was expected; got {parser.lttype}'},'export {a 12 e}');

a('for.decl.multi',{tn:'tn.declarations.1',m:'head of a {extra.2} can only have one declarator'},'for (var a, b in e) break;');

a('for.decl.no.init',{m:'initialiser "=" was expected; got {parser.lttype}'},'for (var [a];;) break;');

a('for.in.has.decl.init',{tn:'tn.declarations.0.init',m:'{tn.kind} declarations and non-Identifier declarators can not have initialisers; also it is not allowed altogether in versions before 7; current version is {parser.v}'},'for (var a = 12 in e) break;');

a('for.in.has.init.assig',{tn:'tn',m:'assignment expressions can not be a {extra.2}\'s head'},'for (a=12 in e) break;');

a('for.iter.no.end.paren',{m:'a ) was expected; got {parser.lttype}'},'for (a in b 5');

a('for.iter.not.of.in',{m:'an \'in\' or \'of\' expected; got {parser.ltval}'},'for (a to e) break;');

a('for.of.var.overrides.catch',{tn:'tn',m:'{tn.name} overrides the surrounding catch block\'s variable of the same name'},'try {} catch (a) { for (var a of l) break;}');

set('for.simple.no.end.paren', 'for.iter.no.end.paren');

a('for.simple.no.init.semi',{m:'a ; was expected; got {parser.lttype}'}, 'for (a 12 b; 12) break;');

set('for.simple.no.test.semi', 'for.simple.no.init.semi');

set('for.with.no.opening.paren', '<opening>');

// TODO: precision
a('func.args.has.dup',{tn:'tn',m:'{tn.name}: duplicate params are not allowed'}, 'function l([a,a]) {}');

set('func.args.no.end.paren', '<closing>');

set('func.args.no.opening.paren', '<opening>');

a('func.args.not.enough', {m:'unexpected {parser.lttype}'}, '({ get a(l) {} })', '({set a() {}})');

a('func.body.is.unfinished', {m:'a } was expected to end the current function\'s body; got {parser.lttype}'}, 'function l() { 12');

a('func.decl.not.allowed', {m:'the current scope does not allow a function to be declared in it'}, 'while (false) function l() {}');

a('func.label.not.allowed', {m:'can not label this declaration'}, 'L:function* l() {}');

a('func.strict.non.simple.param', {tn:'parser.firstNonSimpArg', m:'a function containing a Use Strict directive can not have any non-simple paramer -- all must be Identifiers'});

a('hex.esc.byte.not.hex', {c0:'parser.c',li0:'parser.li',col0:'parser.col',m:'a hex byte was expected'}, '"\\xab\\xel"');

a('id.esc.must.be.idbody',{cur0:'cur',m:'unicode codepoint with value {extra} is not a valid identifier body codepoint'});

a('id.esc.must.be.id.head',{cur0:'cur',m:'unicode codepoint with value {extra} is not a valid identifier start codepoint'});

a('id.multi.must.be.idhead', {cur0:'cur',m:'the unicode surrogate pair [{extra.0},{extra.1}] don\'t represent an identifier start.'});

a('id.multi.must.be.idbody', {cur0:'cur',m:'the unicode surrogate pair [{extra.0},{extra.1}] don\'t represent an identifier body codepoint'});

a('id.name.has.surrogate.pair',{m:'unicode escapes in identifier names can not be parts of a surrogate pair'});

a('id.u.not.after.slash',{m:'a \'u\' was expected after \\'}, '\\e');

set('if.has.no.closing.paren', '<closing>');

set('if.has.no.opening.paren', '<opening>');

a('import.from',{m:'\'from\' expected'},'import * 12');

a('import.invalid.specifier.after.comma',{m:'unexpected {parser.lttype}'},'import a, 12 from \'l\'');

a('import.namespace.specifier.not.*',{m:'unexpected {parser.ltraw} -- a * was expected'},'import - as \'12\'');

a('import.namespace.specifier.local.not.id', {m:'valid identifier was expected; got {parser.lttype}'},'import {a as 12} from \'12\'');

a('import.namespace.specifier.no.as', {m:'\'as\' expected'}, 'import {a 12 l} from \'12\'');

a('import.not.in.module', {m:'import is not allowed in script mode'});

a('import.source.is.not.str', {m:'string literal was expected'},'import * as a from 12');

a('import.specifier.list.unfinished', {m:'a } was expected; got {parser.lttype}'}, 'import {a as b, e as l 12');

set('import.specifier.local.not.id', 'import.namespace.specifier.local.not.id');

set('import.specifier.no.as', 'import.namespace.specifier.no.as');

a('incdec.post.not.simple.assig',{m:'member expression or identifier expected -- got {tn.type}'},'[a]--');

set('incdec.pre.not.simple.assig', 'incdec.post.not.simple.assig');

a('label.is.a.dup', {m:'{tn.name} has been actually declared at {extra.li0}:{extra:col0} (offset {extra.c0})'}, 'a: a: for (;false;) break;');

// TODO:
// a('let.dcl.not.in.block',{m: 

a('lexical.decl.not.in.block',{m:'a {extra.kind}-binding can not be declared in this scope'}, 'if (false) const a = 12;');

a('lexical.name.is.let', {m:'let/const bindings can not have the name \'let\''}, 'let [[let=let]=let*let] = 12;');

a('mem.gen.has.no.name',{m:'unexpected {parser.lttype}'},'({**() {}} })');

// v < 5
a('mem.id.is.null',{m:'got {parser.ltval} -- a valid member identifier was expected'},'a.this');

a('mem.name.not.id',{m:'unexpected {parser.lttype} -- a valid member identifier was expected'}, 'a.12');

a('mem.unfinished',{m:'unexpected {parser.lttype} -- a ] was expected'}, 'a[e 12');

a('meta.new.has.unknown.prop',{m:'\'target\' is currently the only allowed meta property of new; got {parser.ltval}'},'function l() { new.a }');

a('meta.new.not.in.function',{m:'\'new.target\' must be in the body of a function'}, 'new.target');

// TODO: precision
a('meth.paren',{m:'unexpected {parser.lttype} -- a ( was expected to start method-params'},'({get a 12})');

a('func.decl.has.no.name',{m:'function declaration must have a name in this context'},'function() {}');

a('new.args.is.unfinished',{m:'unexpected {parser.lttype} -- a ) was expected'}, 'new L(12');

a('new.head.is.not.valid',{m:'unexpected {parser.lttype}'}, 'new ?');

a('arrow.newline', {m:'\'=>\' can not have a newline before it'}, 'a \n=>12');

a('nexpr.null.head',{m:'unexpected {parser.lttype} -- something that can start an actual expression was expected'},'a-- * ?');

a('non.tail.rest',{m:'a rest element can not be followed by a comma (a fact that also implies it must be the very last element)'}, '[...a,]=12');

// TODO: this.noSemiAfter(nodeType)
a('no.semi',{m:'a semicolon was expected (or a \'}\' if appropriate), but got a {parser.lttype}'},'a e'); 

a('not.assignable',{m:'{tn.type} is not a valid assignment left hand side'},'a[0]-- = 12');

a('not.bindable',{m:'{tn.type} can not be treated as an actual binding pattern'});

// TODO: for now it would suffice
a('not.stmt',{m:'unexpected {parser.lttype} -- it can\'t be used in an expression'},'a * while (false) { break; }');

a('null.stmt',{m:'unexpected {parser.lttype} -- expected something that would start a statement'}, '{ for (a=0;a>=0 && false;a--) }');

a('num.has.no.mantissa',{m:'a mantissa was expected'},'12e?');

a('num.idhead.tail',{m:'a number literal can not immediately precede an identifier head'},'120l');

a('num.legacy.oct',{m:'legacy octals not allowed in strict mode'},'01');

a('num.with.first.not.valid',{m:'{extra} digit not valid'},'0xG','0b5');

a('num.with.no.digits',{m:'{extra} digits were expected to follow -- none found'},'0x','0b');

a('obj.pattern.no.:',{m:'a : was expected -- got {parser.lttype}'},  '({a 12 e, e: a})');

a('obj.prop.assig.not.allowed',{m:'shorthand assignment not allowed in this context, because the containing object can not be an assignment left-hand side'},'-{a=12} = 12');

a('obj.prop.assig.not.assigop',{m:'a \'=\' was expected'},'({a -= 12 } = 12)');

a('obj.prop.assig.not.id',{m:'a shorthand assignment\'s left hand side must be a plain (non-computed) identifier'},'({[a]=12})');

a('obj.prop.is.null',{m:'unexpected {parser.lttype} -- a [, {}, or an Identifier (anything starting a pattern) was expected'},'var {a:-12} = 12');

a('obj.proto.has.dup',{m:'can not have more than a  single property in the form __proto__: <value> or  \'__proto_\': <value>; currently the is already one at {parser.first__proto__.loc.start.line}:{parser.first__proto__.loc.start.column} (offset {parser.first__proto__.start})'}, '({__proto__:12, a, e, \'__proto__\': 12})');

a('obj.unfinished',{m:'unfinished object literal: a } was expected; got {parser.lttype}'},'({e: a 12)');

a('unexpected.lookahead',{m:'unexpected {parser.lttype}'},'-- -a');
a('param.has.yield.or.super',{p:function(){if(this.tn !== null && this.tn.type === 'Identifier') this.tn = {type:'AwaitExpression',start:this.tn.start,loc:this.tn.loc,end:this.tn.end,argument:null};},m:'{tn.type} isn\'t allowed to appear in this context'},'function* l() { ([a]=[yield])=>12; }');

a('paren.unbindable',{m:'unexpected ) -- bindings should not have parentheses around them, neither should non-simple assignment-patterns'},'([(a)])=>12', '[a,b,e,([l])]=12');

set('pat.array.is.unfinished', 'array.unfinished');

a('pat.obj.is.unfinished',{m:'unexpected {parser.lttype} -- a } was expected'},'var {a=12 l} = 12)');

a('program.unfinished',{m:'unexpected {parser.lttype} -- an EOF was expected'},'a, b, e, l; ?');

a('prop.dyna.is.unfinished',{m:'unexpected {parser.lttype}'},'({[a 12]: e})');

set('prop.dyna.no.expr', 'prop.dyna.is.unfinished');

function regp() {
  this.col0 = this.col + (this.c0-this.c);
  if (this.extra === null)
    this.extra = {};

  this.extra.ch = this.parser.src.charAt(this.c0);
}

// TODO: precision
a('regex.flag.is.dup',{p: regp, m:'regex flag is duplicate'},'/a/guymu');

a('regex.newline',{p:regp, m:'regular expressions can not contain a newline'},'/a\n/');

a('regex.newline.esc',{p:regp, m:'regular expressions can not contain escaped newlines'},'/a\\\n/');

a('regex.unfinished',{cur0:'cur',m:'unfinished regex -- a / was expected'},'/a');

// TODO: precision
a('regex.val.not.in.range',{m:'regex contains an out-of-range value'});

a('reserved.id',{m:'{tn.name} is actually a reserved word in this context'},'"use strict"; var implements = 12;');

a('rest.binding.arg.peek.is.not.id',{m:'unexpected {parser.lttype} -- in versions before 7, a rest\'s argument must be an id'},'var [...[a]] = 12');

a('rest.arg.not.valid',{tn:'tn.argument',m:'a rest\'s argument is not allowed to have a type of {tn.arguments.type}'},'[...a=12]=12');

a('resv.unicode',{cur:'parser.eloc',m:'{parser.ltraw} is actually a reserved word ({parser.ltval}); as such, it can not contain any unicode escapes'},'whil\\u0065 (false) break;');

a('return.not.in.a.function',{m:'return statements are only allowed inside a function'},'return 12');

a('seq.non.tail.expr',{m:'trailing comma was not expected'},'(a,)');

a('shorthand.unassigned',{m:'shorthand assignments are not allowed somewhere other than am assignment\'s left hand side'},'a = [{b=12},]');

a('stmt.null',{m:'unexpected {parser.lttype} because it can not start a statement'},'while (false) ?');

a('strict.err.esc.not.valid',{cur0:'parser.eloc',m:'legacy octals are not allowed in strict mode'},'"\\12"; "use strict"');

a('strict.let.is.id',{m:'let can\'t be used as an id in strict mode'},'"use strict"; a * b * e * l * let');

a('strict.oct.str.esc',{m:'legacy octals not allowed in strict mode'},'"use strict"; "\\12"');

a('strict.oct.str.esc.templ',{m:'legacy octals not allowed inside templates'},'`\\12`');

a('str.newline',{li0: 'parser.li', m:'a string literal may not contain line breaks'},'"a\n"');

a('str.unfinished',{li0: 'parser.li', m:'the string starting at {parser.li0}:{parser.col0} (offset {parser.c0}) not finished'},'"abel');

a('switch.case.has.no.colon',{m:'unexpected {parser.lttype} -- a \':\' was expected'},'switch (a) { case 12 a break; }');

a('switch.has.a.dup.default',{m:'this switch has already got a default'},'swicth (a) { case a: break; case b: break; case e: break; default: break; default: 12; }');

a('switch.has.no.opening.curly',{m:'unexpected {parser.lttype} -- a {} was expected'},'switch (a) 12');

a('switch.has.no.closing.paren',{m:'unexpected {parser.lttype} -- a ) was expected'},'switch (a 12');

a('switch.has.no.opening.paren',{m:'unexpected {parser.lttype} -- a ( was expected'},'switch ?');

a('switch.unfinished',{m:'unexpected {parser.lttype} -- a } was expected'},'switch (a) { case 12: break; ?');

a('templ.expr.is.unfinished',{m:'unexpected {parser.lttype} -- a } was expected at the end of the current interpolated expression'},'`abel${e 12}`');

a('templ.lit.is.unfinished',{m:'the template literal at {extra.loc.start.line}:{extra.loc.start.column} (offset {extra.start}) is unfinished'},'`abel');

a('throw.has.newline',{m:'throw can not have a line-break after it'},'throw \n12');

a('throw.has.no.argument',{m:'unexpected {parser.lttype}'},'throw ?');

a('try.has.no.tain',{m:'unexpected {parser.lttype} -- try must have a \'catch\' or \'finally\' block coming after it'},'try {}\nif (false);');

a('u.curly.is.unfinished',{p: regp, m:'a } was expected'},'\\u{12;');

a('u.curly.not.in.range',{p: regp, m:'unicode codepoints must have a max decimal value of 1114111 (0x10FFFF)'}, '\\u{125400}');

a('u.esc.hex',{p: regp, m:'invalid hex'},'\\u00el');

a('unary.before.an.exponentiation',{m:'left operand for an exponentiation operator is not allowed to be an unparenthesized unary expression'},'-a**e');

a('unexpected.id',{m:'got {parser.ltval} rather than {extra}'},'export * as a from \'12\'');

a('an.id.was.expected',{m:'unexpected {parser.lttype} -- identifier \'{extra}\' was expected'},'export * as a 12 \'l\'');

a('meth.parent',{m:'a ) was expected'},'class A { e: 12 }');

a('obj.meth.no.paren',{m:'a ) was expected'},'({get a: 12})');

a('rest.arg.has.trailing.comma',{m:'trailing comma not expected after rest'},'(...a,)');

a('unexpected.rest',{m:'unexpected rest element'},'(...a)');

a('unfinished.paren',{c0:'tn.end',li0:'tn.loc.end.line',col0:'tn.loc.end.column',m:'the parenthesis at {tn.loc.start.line}:{tn.loc.start.column} (offset {tn.start}) is unfinished'}, '(a,b 12');

a('u.second.esc.not.u',{p:function(){this.col0++;}, cur0:'cur', m:'a \'u\' was expected after the slash', col0:'col'},'\\ee');

a('u.second.not.in.range',{p:function(){this.col0+=(this.c-this.extra);},cur0:'cur',col0:'col',m:'the second surrogate must be in range [0x0dc00, 0x0dfff]'});

a('var.decl.neither.of.in',{m:'unexpected {parser.lttype}'},'var [a] -= 12');

a('var.decl.not.=', {m:'Unexpected {parser.lttype} -- (maybe you mean \'=\'?)'},'var a -= l');

a('var.must.have.init', {m:'a \'=\' was expected -- current declarator needs an initialiser'},'var a, [e]');

a('var.has.no.declarators',{m:'unexpected {parser.lttype}'}, 'var -a = l');

a('var.has.an.empty.declarator',{m:'unexpected {parser.lttype}'}, 'var a, -');

a('while.has.no.closing.paren',{m:'unexpected {parser.lttype} -- a ) was expected'},'while (a 12');

a('while.has.no.opening.paren',{m:'unexpected {parser.lttype} -- a ( was expected'},'while 12) break;');

a('with.has.no.opening.paren',{m:'unexpected {parser.lttype} -- a ( was expected'},'with 12) {}');

a('with.has.no.end.paren',{m:'unexpected {parser.lttype} -- a ) was expected'},'with (a 12 {}');

a('with.strict',{m:'with statements not allowed in strict mode'},'"use strict"; with (l) {}');

a('yield.args',{m:'yield expression not allowed in generator\'s argument list'},'function* l(e=yield 12) {}');

a('yield.as.an.id',{m:'yield is not allowed as an identifier in this context'},'function* l() { var yield = 12 }');

a('yield.has.no.expr.deleg',{m:'unexpected {parser.lttype} -- it can not star an expression'},'function* l() { yield* ?}');

