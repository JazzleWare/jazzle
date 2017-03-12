#!/usr/bin/perl

my $file1 = $ARGV[0];
my $file2 = $ARGV[1];

open my $in1, $file1;
print "open: <$file1>\n";

open my $in2, $file2;
print "open: <$file2>\n";

my %all = {};
my @lines1 = <$in1>;

my %list1 = {};
for my $l (@lines1) {
  if ($l =~ /^([^0-9\s]+)\s*([0-9]+)\s*$/) {
    print "<$1> $2\n" if 0;
    $list1{$1} = $2;
  }
  else {
    print "NOT <$l>";
  }
}

my $total = 0;

my @lines2 = <$in2>;
my %list2 = {};
for my $l (@lines2) {
  if ($l =~ /^([^0-9\s]+)\s*([0-9]+)\s*$/) {
    $list2{$1} = $2;
    my $len = $list2{$1};
    if ($list1{$1}) {
      $len -= $list1{$1};
      print "<$1> ", $len > 0 ? "+"."$len" : "$len", " existing", "\n" if $len;
    }
    else {
      print "<$1> ", "+"."$2", " fresh", "\n";
    }
    $total += $len;
  }
  else {
    print "NOT <$l>";
  }
}

print "TOTAL: $total\n";
