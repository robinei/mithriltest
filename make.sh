#!/bin/sh

set -e
set -o pipefail

lint() {
    tslint -t verbose src/**/*.ts
}

update_deps() {
    wget -O data/almond.js https://raw.githubusercontent.com/requirejs/almond/master/almond.js
    wget -O data/mithril.js https://raw.githubusercontent.com/lhorie/mithril.js/master/mithril.js
    wget -O data/mithril.d.ts https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types/mithril/index.d.ts
    wget -O data/es6-shim.js https://raw.githubusercontent.com/paulmillr/es6-shim/master/es6-shim.js
}

build() {
    echo "Compiling TypeScript code to data/bundle.js..."
    tsc

    echo "Clearing build/ directory..."
    mkdir -p build
    rm -f build/*

    echo "Concatenating build/temp.js..."
    paste -sd'\n' data/es6-shim.js data/mithril.js data/almond.js data/bundle.js src/main.js > build/temp.js

    if [ ! -f "data/closure-compiler.jar" ]
    then
        echo "Downloading Closure Compiler..."
        wget -O data/closure-compiler.zip http://dl.google.com/closure-compiler/compiler-latest.zip
        unzip -j data/closure-compiler.zip '*.jar' -d data
        mv data/closure-compiler-v*.jar data/closure-compiler.jar
        rm -f data/closure-compiler.zip
    fi

    echo "Optimizing build/temp.js -> build/bundle.js..."
    java -jar data/closure-compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --js build/temp.js --js_output_file build/bundle.js

    echo "Writing modified build/index.html..."
    cp index.html build/temp.html
    sed -i.bak -e ':a;N;$!ba;s#<!--BEGIN_CODE-->.*<!--END_CODE-->#<script src="bundle.js"></script>#g' build/temp.html
    awk 'NF' build/temp.html > build/index.html # strip empty lines

    rm -f build/temp.*
}

case "$1" in
lint)
    lint;;
update_deps)
    update_deps;;
"")
    build;;
*)
    echo >&2 "usage: $0 [lint|update_deps]"
    exit 1;;
esac
