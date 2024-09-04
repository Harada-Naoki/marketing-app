#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

if [[ "$VERCEL_GIT_COMMIT_REF" == "frontend" ]] ; then
  # Proceed with the build
  echo "✅ - Build can proceed"
  exit 0;  # 続行するので exit 0 を使います

else
  # Don't build
  echo "🛑 - Build cancelled"
  exit 1;  # キャンセルするので exit 1 を使います
fi
