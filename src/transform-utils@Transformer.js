this.trListChunk =
function(list, ownerList, isVal, s, e) {
  if (arguments.length < 5 || e === -1)
    e = list.length-1;
  while (s<e) {
    list[s] = this.tr(list[s], ownerList, isVal);
    s++ ; 
  }
};

this.trList =
function(list, ownerList, isVal) {
  return this.trListChunk(list, ownerList, isVal, 0, list.length-1) ;
};
