# Literally just counts the lines of actual code
# This is to boost my ego and nothing more
# Probably remove this in prod idk

git ls-files | grep -E '\.ts|\.tsx|\.py|\.scss' | xargs wc -l