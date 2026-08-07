#!/bin/bash

case "$BUILD_ACTION" in
  build)
    npm run build
    ;;
  lint)
    npm run lint
    ;;
  test)
    npm test
    ;;
  *)
    echo "Unknown BUILD_ACTION: $BUILD_ACTION"
    exit 1
    ;;
esac