cd dist/sic-ng
git checkout release/22
git add .
git commit -m "release v22.0.3"
git tag v22.0.3
git push origin release/22
git push origin v22.0.3
git checkout source/22
