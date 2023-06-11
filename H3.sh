#!/bin/sh
search_dir=/Volumes/Main/Music/Podcasts

for entry in "$search_dir"/*
do
  ls -Art $entry
done