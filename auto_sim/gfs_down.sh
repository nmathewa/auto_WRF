#!/bin/bash

#url1="https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl?file=gfs.t00z.pgrb2.0p25."
maindir="https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl"

config=/home/nma/Desktop/wrfautoconfig
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

#read -p "After completion input WPS-directory:" wpsdir
wpsdir="$(cat $config | grep ^wps_dire* | cut -d '=' -f 2)"


namelist=${wpsdir}/namelist.wps
cd $wpsdir

#read -p "Enter start year" s_year
#read -p "Enter start month" s_month
#read -p "Enter start date " s_date
#read -p "Enter start hour(in format 00):" s_hour
#read -p "Enter start minutes(in format 00):" s_simin
#read -p "Enter start seconds(in format 00):" s_simsec

#read -p "Enter end year" e_year
#read -p "Enter end month" e_month
#read -p "Enter end date " e_date
#read -p "Enter end hour(in format 00):" e_hour
#read -p "Enter end minutes(in format 00):" e_simin
#read -p "Enter end seconds(in format 00):" e_simsec



dom="$(cat $namelist |grep max_dom)"
dom1=`echo $dom | cut -d '='  -f 2`
dom1=`echo $dom1 | cut -d ',' -f 1`

declare -i doms=$dom1
#if [ $doms=0 ]
#then
#	echo "what the f**"
if [ $doms -eq 1 ]
then
	cat $namelist |sed -i "s:^ end_date.*$: end_date =\'${e_year}\-${e_month}\-${e_date}\_${e_hour}\:${e_simin}\:${e_simsec}\'\,:g" $namelist
	cat $namelist |sed -i "s:^ start_date.*$: start_date =\'${s_year}\-${s_month}\-${s_date}\_${s_hour}\:${s_simin}\:${s_simsec}\'\,:g" $namelist
elif [ $doms -eq 2 ]
then
	cat $namelist |sed -i "s:^ end_date.*$: end_date =\'${e_year}\-${e_month}\-${e_date}\_${e_hour}\:${e_simin}\:${e_simsec}\'\,\ \'${e_year}\-${e_month}\-${e_date}\_${e_hour}\:${e_simin}\:${e_simsec}\'\,:g" $namelist
	cat $namelist |sed -i "s:^ start_date.*$: start_date =\'${s_year}\-${s_month}\-${s_date}\_${s_hour}\:${s_simin}\:${s_simsec}\'\,\ \'${s_year}\-${s_month}\-${s_date}\_${s_hour}\:${s_simin}\:${s_simsec}\'\,:g" $namelist
elif [ $doms -eq 3 ]
then
	cat $namelist |sed -i "s:^ end_date.*$: end_date =\'${e_year}\-${e_month}\-${e_date}\_${e_hour}\:${e_simin}\:${e_simsec}\'\,\'${year}\-${month}\-${e_date}\_${e_hour}\:${e_simin}\:${e_simsec}\'\,\'${e_year}\-${e_month}\-${e_date}\_${e_hour}\:${e_simin}\:${e_simsec}\'\,:g" $namelist
	cat $namelist |sed -i "s:^ start_date.*$: start_date =\'${s_year}\-${s_month}\-${s_date}\_${s_hour}\:${s_simin}\:${s_simsec}\'\,\'${s_year}\-${s_month}\-${s_date}\_${s_hour}\:${s_simin}\:${s_simsec}\'\,\'${s_year}\-${s_month}\-${s_date}\_${s_hour}\:${s_simin}\:${s_simsec}\'\,:g" $namelist
fi

echo "start : "${s_year}\-${s_month}\-${s_date}\_${s_hour}\:${s_simin}\:${s_simsec}
echo "end : "${e_year}\-${e_month}\-${e_date}\_${e_hour}\:${e_simin}\:${e_simsec}

#gfsdir=${date}_${month}_${year}

#deleting previous files
find -type l | find -name 'GRIBFILE*' -delete
find -name 'FILE:*' -delete
find -name '*.nc' -delete
#read -p "Enter data direc" gfsdir
gfsdir=${dirname}/${date}_${month}_${year}_${forecyc}/
./link_grib.csh $gfsdir

./geogrid.exe
./ungrib.exe
./metgrid.exe

###WRF#######



#read -p "Enter WRF dire:" wrfdir
wrfdir="$(cat $config | grep ^wrf_direc* | cut -d '=' -f 2)"



#read -p "Simulation in days" days
#read -p "simulation hours" hours
#read -p "simulation mins" mins
#read -p "Simulation secs" secs


cd $wrfdir/run
find -type l | find -name 'met_em*' -delete

ln -s ${wpsdir}/met_em* .

if [ $doms -eq 1 ]
then
	cat namelist.input |sed -i "s:^ run_days.*$: run_days                            = ${days}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ run_hours.*$: run_hours                           = ${hours}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ run_minutes.*$: run_minutes                         = ${mins},\,:g" namelist.input
	cat namelist.input |sed -i "s:^ run_seconds.*$: run_seconds                         = ${secs}\,:g" namelist.input

	cat namelist.input |sed -i "s:^ start_year.*$: start_year                          = ${s_year}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ start_month.*$: start_month                         = ${s_month}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ start_day.*$: start_day                           = ${s_date}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ start_hour.*$: start_hour                          = ${s_hour}\,:g" namelist.input

	cat namelist.input |sed -i "s:^ end_year.*$: end_year                            = ${e_year}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ end_month.*$: end_month                           = ${e_month}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ end_day.*$: end_day                             = ${e_date}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ end_hour.*$: end_hour                            = ${e_hour}\,:g" namelist.input

elif [ $doms -eq 2 ]
then
	cat namelist.input |sed -i "s:^ run_days.*$: run_days                            = ${days}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ run_hours.*$: run_hours                           = ${hours}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ run_minutes.*$: run_minutes                         = ${mins}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ run_seconds.*$: run_seconds                         = ${secs}\,:g" namelist.input
s_hour
	cat namelist.input |sed -i "s:^ start_year.*$: start_year                          = ${s_year}\,${s_year}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ start_month.*$: start_month                         = ${s_month}\,${s_month}:g" namelist.input
	cat namelist.input |sed -i "s:^ start_day.*$: start_day                           = ${s_date}\,${s_date}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ start_hour.*$: start_hour                          = ${s_hour}\,${s_hour}\,:g" namelist.input

	cat namelist.input |sed -i "s:^ end_year.*$: end_year                            = ${e_year}\,${e_year}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ end_month.*$: end_month                           = ${e_month}\,${e_month}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ end_day.*$: end_day                             = ${e_date}\,${e_date}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ end_hour.*$: end_hour                            = ${e_hour}\,${e_hour}\,:g" namelist.input

elif [ $doms -eq 3 ]
then

	cat namelist.input |sed -i "s:^ run_days.*$: run_days                            = ${days}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ run_hours.*$: run_hours                           = ${hours}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ run_minutes.*$: run_minutes                         = ${mins}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ run_seconds.*$: run_seconds                         = ${secs}\,:g" namelist.input

	cat namelist.input |sed -i "s:^ start_year.*$: start_year                          = ${s_year}\, ${s_year}\, ${s_year}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ start_month.*$: start_month                         = ${s_month}\, ${s_month}\, ${s_month}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ start_day.*$: start_day                           = ${s_date}\, ${s_date}\, ${s_date}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ start_hour.*$: start_hour                          = ${s_hour}\, ${s_hour}\,, ${s_hour}\,:g" namelist.input

	cat namelist.input |sed -i "s:^ end_year.*$: end_year                            = ${e_year}\, ${e_year}\, ${e_year}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ end_month.*$: end_month                           = ${e_month}\, ${e_month}\,, ${e_month}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ end_day.*$: end_day                             = ${e_date}\,${e_date}\,${e_date}\,:g" namelist.input
	cat namelist.input |sed -i "s:^ end_hour.*$: end_hour                            = ${e_hour}\, ${e_hour}\, ${e_hour}\,:g" namelist.input
fi




