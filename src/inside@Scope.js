this.insideIf =
function() { return this.flags & SF_IF; };

this.insideLoop =
function() { return this.flags & SF_LOOP; };

this.insideStrict = 
function() { return this.flags & SF_STRICT; };

this.insideForInit =
function() { return this.flags & SF_FORINIT; };
