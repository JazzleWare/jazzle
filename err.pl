#!/usr/bin/perl
open my $errFile, $ARGV[0];

my @errList = <$errFile>;

my @sources = <STDIN>;

for my $err (@errList) {
  if ($err =~ /^(.*)$/) {
    $err = $1;
  }
  else {
    print "<$err> is not a valid str\n";
  }

  print "<$err>\n";

  for my $sourceName (@sources) {

    if ($sourceName =~ /^(.*)$/) {
      $sourceName = $1;
    }
    else {
      print "<$sourceName> is not a valid name\n";
    }

    open my $sourceFile, $sourceName;
    my @lines = <$sourceFile>;
   
    my $len = $#lines, $l = 0;
    while ($l < $len) {
      if ($lines[$l] =~ /$err/) {
        print " * ", $sourceName, " ", $l + 1, "\n";
      }
      ++$l;
    }

  }
    print "\n";
}
