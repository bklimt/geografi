
open(INPUT, '<', 'cities.md') or die $!;

sub read_line {
    my $line = <INPUT>;
    chomp $line;
    $line =~ s/\<ref\>.*\<\/ref\>//g;
    $line =~ s/\<sup[^>]*\>.*\<\/sup\>//g;
    $line =~ s/^ *//;
    $line =~ s/ *$//;
    # $line =~ s/^\| bgcolor="[0-9A-F]*" //;
    # print("line: $line\n");
    return $line;
}

sub process_one {
    my $flag = read_line();
    if ($flag eq "") {
        return 0;
    }
    $flag =~ /^\| \{\{flag\|(.*)\}\}$/ or die "invalid flag line $flag";
    my $state = $1;

    # print "$state\n";
    # print "  \"$state\": { ";
    print "  { \"name\": \"$state\", \"cities\": [ ";

    my $pop = read_line();
    $pop =~ /^\|[0-9,]*$/ or die "invalid population";

    my $first = 1;
    while (1) {
        my $line = read_line();
        if ($line eq "|-") {
            print " ]},\n";
            return 1;
        }
        if ($line eq "") {
            print " ]}\n";
            return 0;
        }

        my $capital = 0;
        if ($line =~ /^\| bgcolor="[0-9A-F]*" */) {
            $line =~ s/^\| bgcolor="[0-9A-F]*" *//;
            $capital = 1;
        }

        $line =~ s/^\| *//;
        $line =~ s/ \([0-9]*\)$//;

        if ($line =~ /^[0-9,]*$/) {
            # It's a population.
        } else {
            $line =~ s/^\[\[(.*)\]\]$/\1/;
            my $city = $line;
            if ($line =~ /^(.*)\|(.*)$/) {
                $city = $2;
            }
            if ($first) {
                $first = 0;
            } else {
                print ", ";
            }
            print "{ \"name\": \"$city\", \"isCapital\": ";
            if ($capital) {
                print "true }";
            } else {
                print "false }";
            }
        }
    }

    return 1;
}

print "[\n";
while (process_one()) {}
print "]\n";

close(INPUT);

