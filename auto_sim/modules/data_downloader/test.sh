#!/bin/bash

#url1="https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl?file=gfs.t00z.pgrb2.0p25."
maindir="https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl"

config=/home/nma/GIT/auto_WRF/auto_sim/modules/data_downloader/wrfautoconfig
s_year="$(cat $config | grep ^s_year* | cut -d '=' -f 2)" 
s_month="$(cat $config | grep ^s_month* | cut -d '=' -f 2)"
s_date="$(cat $config | grep ^s_day* | cut -d '=' -f 2)"
s_hour="$(cat $config | grep ^s_hour* | cut -d '=' -f 2)"
s_simin="$(cat $config | grep ^s_min* | cut -d '=' -f 2)"
s_simsec="$(cat $config | grep ^s_sec* | cut -d '=' -f 2)"

e_year="$(cat $config | grep ^e_year* | cut -d '=' -f 2)" 
e_month="$(cat $config | grep ^e_month* | cut -d '=' -f 2)"
e_date="$(cat $config | grep ^e_day* | cut -d '=' -f 2)"
e_hour="$(cat $config | grep ^e_hour* | cut -d '=' -f 2)"
e_simin="$(cat $config | grep ^e_min* | cut -d '=' -f 2)"
e_simsec="$(cat $config | grep ^e_sec* | cut -d '=' -f 2)"

days="$(cat $config | grep ^simday* | cut -d '=' -f 2)"
hours="$(cat $config | grep ^simhour* | cut -d '=' -f 2)"
mins="$(cat $config | grep ^simmin* | cut -d '=' -f 2)"
secs="$(cat $config | grep ^simsec* | cut -d '=' -f 2)"

stop
#read -p 'Enter year:' year
#read -p 'Enter month:' month
#read -p 'Enter date:' date
year=$s_year
month=$s_month
date=$s_date
#read -p 'Enter GFS initial time("00","06","12","18"):' forecyc
forecyc="$(cat $config | grep ^forecast* | cut -d '=' -f 2)"

url1="https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl?file=gfs.t00z.pgrb2.0p25."
url2="&all_lev=on&all_var=on&subregion=&leftlon=60&rightlon=100&toplat=40&bottomlat=0&dir=%2Fgfs.${year}${month}${date}%2F00"


#read -p 'Enter Required forecast Period in hours:' hour
hour="$(cat $config | grep ^NumbeR_* | cut -d '=' -f 2)"

echo $hour
echo $((hour+1)) "file(s)"
start=0


#read -p 'Paste default direc:' dirname
dirname="$(cat $config | grep ^down_dir* | cut -d '=' -f 2)"

cd dirname
mkdir ${date}_${month}_${year}_${forecyc}

new_dir=${dirname}/${date}_${month}_${year}_${forecyc}/

declare -i end=$hour


for i in $(eval echo "{$start..$end}")
do
#	echo $i
	TFCH=`expr 1000 + $i`
  	FCH=`echo $TFCH | cut -c2-4`
  	echo $FCH
  	url11=${url1}f${FCH}${url2}
  	echo $url11
  	filee=${new_dir}gfs.t00z.pgrb2.0p25.f${FCH}.grib2
#  	echo $filee
  	wget -O $filee $url11
  	
done
echo "All files downloaded"