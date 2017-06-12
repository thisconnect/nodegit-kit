#!/bin/sh
mkdir repos/get-git
cd repos/get-git
git init
echo "a" > file1.txt
git add .
git commit -am"first commit"
echo "b" >> file1.txt
git commit -am"appends to file1"
echo "c" >> file1.txt
git commit -am"appends to file1"
echo "2" > file2.txt
git add file2.txt
git commit -am"adds file2.txt"
echo "d" >> file1.txt
git add file1.txt
