#!/bin/bash

URL   ="$1"
USER  ="$2"
EMAIL ="$3"
PSW   ="$4"

function create_user () {
  ($(curl -X POST "${file[@]}")
  header=($(head -n 1 "$PWD/$file"))
  ncolumns=${#header[*]}
  filename="${filename%.*}"
  if [[ $ncolumns<3 ]]; then
    tn=($filename"_")
    tb=("CREATE TABLE $filename($tn${header[0]} VARCHAR(255),$tn${header[1]} VARCHAR(255));")
    echo $tb
    echo "LOAD DATA INFILE '$PWD/${file[i]}' INTO TABLE $filename IGNORE 1 LINES;" >>load.sql
  else
    tb=("CREATE TABLE $filename($tn${header[0]} VARCHAR(255), $tn${header[1]} YEAR(4) , $tn${header[2]} DECIMAL(10,2));")
    echo $tb
    echo "LOAD DATA INFILE '$PWD/${file[i]}' INTO TABLE $filename IGNORE 1 LINES;" >>load.sql
  fi
  return
}
