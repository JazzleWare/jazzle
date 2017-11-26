  import {CH_LPAREN, CH_RPAREN} from '../other/constants.js';
  import {DT_CATCHARG, DT_NONE} from '../other/scope-constants.js';
  import {cls} from './ctor.js';

cls. parseCatchClause = function () {
   var c0 = this.c0, cb = {}, loc0 = this.loc0();

   this.suc(cb, 'bef');
   this.next(); // 'catch'
   this.suc(cb, 'catch.aft');

   this.enterScope(this.scope.spawnCatch());
   if (!this.expectT(CH_LPAREN))
     this.err('catch.has.no.opening.paren',{c0:c0,loc0:loc0});

   this.declMode = DT_CATCHARG;
   var catParam = this.parsePat();
   if (this.peekEq())
     this.err('catch.has.an.assig.param',{c0:startc,loc0:startLoc,extra:catParam});

   this.declMode = DT_NONE;
   if (catParam === null)
     this.err('catch.has.no.param',{c0:startc,loc0:startLoc});

   if (catParam.type === 'Identifier')
     this.scope.argIsSimple = true;

   this.spc(catParam, 'aft');
   if (!this.expectT(CH_RPAREN))
     this.err('catch.has.no.end.paren',{c0:startc,loc0:startLoc,extra:catParam});

   this.scope.activateBody();
   var catBlock = this.parseDependent('catch');
   catBlock['#scope'] = this.scope ; 
   var scope = this.exitScope();

   return {
       type: 'CatchClause',
       loc: { start: loc0, end: catBlock.loc.end },
       start: c0,
       end: catBlock.end,
       param: catParam ,
       body: catBlock,
       '#scope': scope,
       '#y': this.Y(catParam)+this.Y(catBlock)
   };
};


