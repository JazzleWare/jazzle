  import {UntransformedEmitters} from '../other/globals.js';
  import {CB} from '../other/util.js';
  import {ETK_ID} from '../other/constants.js';
  import {wcb_afterStmt} from '../other/wcb.js';
  import {cls} from './ctor.js';

UntransformedEmitters['transformed-fn'] =
function(n, flags, isStmt) {
  return n.target ?
    this.emitDeclFn(n, flags, isStmt) :
    this.emitExprFn(n, flags, isStmt);
};

cls.emitTransformedFn =
function(n, flags, isStmt) {
  var raw = n.fun, cb = CB(raw);
  this.emc(cb, 'bef');
  this.wt('function', ETK_ID );
  this.emc(cb, 'fun.aft');
  var scopeName = raw['#scope'].scopeName;

  var ni = this.namei_cur;
  if (scopeName) {
    this.bs();
    var name_cb = scopeName.site && CB(scopeName.site);
    name_cb && this.emc(name_cb, 'bef' );
    ni = this.smSetName_str(scopeName.name);
    this.writeIDName(scopeName.name);
    name_cb && this.emc(name_cb, 'aft');
  }
  this.emc(cb, 'list.bef' );
  this.sl(raw['#argploc']);
  this.w('(');

  if (raw.params) {
    this.emitCommaList(raw.params);
    this.emc(cb, 'inner');
  }

  var own = {used: false}, lsn = null, em = 0;
  this.wm(')','','{').i();

  this.gu(wcb_afterStmt).gmon(own);
  this.emitFnHead(n);
  if (own.used) {
    em++;
    own.used = false;
    this.trygu(wcb_afterStmt, own);
  }

  this.emitStmtList(raw.body.body);

  if (own.used) em++;
  else { this.grmif(own); }

  this.u();

  em && this.l();

  this.w('}');
  this.namei_cur = ni;
  this.emc(cb, 'aft');
};


