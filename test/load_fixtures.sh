#!/usr/bin/env bash

set -u
set -e

S3_URL="https://s3-us-west-2.amazonaws.com/kloudless-static-assets/misc/node-sdk-fixtures"

mkdir -p fixtures
pushd fixtures

for i in big-test.tar.gz bigger-test.deb test.txt; do
    wget $S3_URL/$i
done

popd