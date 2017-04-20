#!/bin/sh
mkdir repos/status-git
cd repos/status-git
git init
echo "Hello" > file.txt
echo "Hello2" > file2.txt
echo "Hello3" > file3.txt
git add .
git commit -am"first commit"
echo "Hello again" >> file.txt
echo "Hello4" > file4.txt
git add .
git rm file2.txt
git mv file3.txt file5.txt
