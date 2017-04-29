#!/bin/sh
mkdir repos/diff-git
cd repos/diff-git
git init
echo "a\nb\nc\nd" > file1.txt
echo "1\n2\n3\n4\n5\n6\n7\n8\n9\n10" > file2.txt
echo "11\n12\n13\n14\n15\n16\n17\n18\n19" >> file2.txt
echo "20\n21\n22\n23\n24\n25\n26\n27\n28\n29" >> file2.txt
git add .
git commit -am"first commit"
echo "e\nf" >> file1.txt
git commit -am"appends to file1"
echo "g\nh" >> file1.txt
git commit -am"appends to file1"
echo "foo\nbar" > file3.txt
git add file3.txt
git commit -am"adds file3.txt"
echo "i\nj" >> file1.txt
