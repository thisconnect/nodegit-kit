#!/bin/sh
mkdir repos/log-git
cd repos/log-git
git init
echo "Hello\n" > file.txt
git add .
git commit -am"first commit"
echo "Hello 2\n" > file.txt
git add .
git commit -am"second commit"
echo "Hello 3\n" > file.txt
git add .
git commit -am"third commit"
