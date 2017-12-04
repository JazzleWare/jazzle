 import SortedObj from '../SortedObj/cls.js';
 import {ASSERT, HAS} from '../other/constants.js';
 export default function JZMap(helpers) {
   this.jzmap = new SortedObj();
   this.active = new SortedObj();
   var len = helpers.length, l = 0;
   while (l < len) {
     var h = helpers[l++];
     ASSERT.call(this, !HAS.call(this.jzmap, h.id), 'helper '+h.id+' exists');
     this.jzmap.set(h.id, h);
   }
 }

 var jcl = JZMap.prototype;

 jcl.use =
 function(id) {
   ASSERT.call(this, this.jzmap.has(id), 'no such name: '+id );
   if (!HAS.call(this.active, id)) { 
     this.active.set(id, true);
     var list = this.jzmap.get(id).uses, l = 0;
     while (l < list.length)
       this.use(list[l++]);
   }
 };

 jcl.asCode =
 function() {
   var list = this.active, l = 0, len = list.length();
   var str = "";
   while (l < len) {
     var name = list.keys[l++];
     str += this.jzmap.get(name).codeString;
   }

   return str;
 };
