function LabelTracker(parent) {
  // the parent label tracker, or null if it is a top-level label tracker
  this.parent = parent || null;

  // the labels the label tracker has been given
  // before reaching a non-Labeledstatement node
  this.activeLabels = [];

  // the labels contained in this label tracker; it initially contains the active labels,
  // but each time a descendant label tracker finishes, that descendant label tracker concatenates
  // the array given below with its own contained labels
  this.containedLabels = [];

  // when the label tracker exits, it synthesizes a label name for a container it has been given
  this.synthAtExit = false;

  this.target = null;
}
