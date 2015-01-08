#!/usr/bin/env bash

set -u
set -e

mkdir -p fixtures
pushd fixtures >/dev/null

size=7
head -c $((1024*1024*size)) /dev/urandom > big-test.tar.gz
size=44
head -c $((1024*1024*size)) /dev/urandom > bigger-test.deb

echo "test file" > test.txt

popd >/dev/null

echo "Done."
