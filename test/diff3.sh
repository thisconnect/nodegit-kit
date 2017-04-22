#!/bin/sh
mkdir repos/diff-git
cd repos/diff-git
git commit -am"update"
git mv file2.txt file4.txt
git commit -am"moves file2 to file4"
