#!/bin/bash
pushd ../9dials/flex/recorder/
./build.sh tuna
popd
cp ../9dials/flex/recorder/recorder.swf public/assets/flash/recorder.swf 


