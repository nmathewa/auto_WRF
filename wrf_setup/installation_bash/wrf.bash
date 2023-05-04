#!/bin/bash

# **       **   *******     ********
#/**      /**  /**////**   /**///// 
#/**   *  /**  /**   /**   /**      
#/**  *** /**  /*******    /******* 
#/** **/**/**  /**///**    /**////  
#/**** //****  /**  //**   /**      
#/**/   ///**  /**   //**  /**      
#//       //   //     //   //   
                     _           _   _               _   _ __  __    _    
#  ___ _ __ ___  __ _| |_ ___  __| | | |__  _   _   | \ | |  \/  |  / \   
# / __| '__/ _ \/ _` | __/ _ \/ _` | | '_ \| | | |  |  \| | |\/| | / _ \  
#| (__| | |  __/ (_| | ||  __/ (_| | | |_) | |_| |  | |\  | |  | |/ ___ \ 
# \___|_|  \___|\__,_|\__\___|\__,_| |_.__/ \__, |  |_| \_|_|  |_/_/   \_\
#                                           |___/            

echo "Script for WRF 4.2.2 installation"
echo "Installation may take several hours and it takes 52 GB storage. Be sure that you have enough time and storage."

#+-+-+-+-+-+-+-+-+-+-+ +-+-+-+ +-+-+-+-+-+-+-+-+
#|I|n|s|t|a|l|l|i|n|g| |a|l|l| |p|a|c|k|a|g|e|s|
#+-+-+-+-+-+-+-+-+-+-+ +-+-+-+ +-+-+-+-+-+-+-+-+


sudo apt-get update
sudo apt-get install -y build-essential csh gfortran m4 curl perl mpich libhdf5-mpich-dev libpng-dev netcdf-bin libnetcdff-dev

cd /home/nma/

mkdir Build_WRF
cd Build_WRF
mkdir LIBRARIES
cd LIBRARIES


#+-+-+-+-+-+-+-+ +-+-+ +-+-+-+-+-+-+
#|s|e|t|t|i|n|g| |u|p| |b|a|s|h|r|c|
#+-+-+-+-+-+-+-+ +-+-+ +-+-+-+-+-+-+

echo "" >> ~/.bashrc
echo "#WRF Variables" >> ~/.bashrc
echo "export DIR="$(pwd) >> ~/.bashrc
echo "export CC=gcc" >> ~/.bashrc
echo "export CXX=g++" >> ~/.bashrc
echo "export FC=gfortran" >> ~/.bashrc
echo "export FCFLAGS=-m64" >> ~/.bashrc
echo "export F77=gfortran" >> ~/.bashrc
echo "export FFLAGS=-m64" >> ~/.bashrc
echo "export NETCDF=/usr" >> ~/.bashrc
echo "export HDF5=/usr/lib/x86_64-linux-gnu/hdf5/serial" >> ~/.bashrc
echo "export LDFLAGS="\""-L/usr/lib/x86_64-linux-gnu/hdf5/serial/ -L/usr/lib"\""" >> ~/.bashrc
echo "export CPPFLAGS="\""-I/usr/include/hdf5/serial/ -I/usr/include"\""" >> ~/.bashrc
echo "export LD_LIBRARY_PATH=/usr/lib" >> ~/.bashrc



DIR=$(pwd)
export CC=gcc
export CXX=g++
export FC=gfortran
export FCFLAGS=-m64
export F77=gfortran
export FFLAGS=-m64
export NETCDF=/usr
export HDF5=/usr/lib/x86_64-linux-gnu/hdf5/serial
export LDFLAGS="-L/usr/lib/x86_64-linux-gnu/hdf5/serial/ -L/usr/lib"
export CPPFLAGS="-I/usr/include/hdf5/serial/ -I/usr/include"
export LD_LIBRARY_PATH=/usr/lib



#+-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+-+-+-+
#|J|a|s|p|e|r| |I|n|s|t|a|l|l|a|t|i|o|n|
#+-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+-+-+-+


wget http://www2.mmm.ucar.edu/wrf/OnLineTutorial/compile_tutorial/tar_files/jasper-1.900.1.tar.gz
tar -zxvf jasper-1.900.1.tar.gz
cd jasper-1.900.1/
./configure --prefix=$DIR/grib2
make
make install
echo "export JASPERLIB=$DIR/grib2/lib" >> ~/.bashrc
echo "export JASPERINC=$DIR/grib2/include" >> ~/.bashrc
export JASPERLIB=$DIR/grib2/lib
export JASPERINC=$DIR/grib2/include
cd ..


#+-+-+-+ +-+-+-+-+-+-+-+-+-+-+-+-+
#|W|R|F| |i|n|s|t|a|l|l|a|t|i|o|n|
#+-+-+-+ +-+-+-+-+-+-+-+-+-+-+-+-+



cd ..
[ -d "WRF-4.2.2" ] && mv WRF-4.2.2 WRF-4.2.2-old
[ -f "vWRF-4.2.2.tar.gz" ] && mv v4.2.2.tar.gz v4.2.2.tar.gz-old
wget https://github.com/wrf-model/WRF/archive/v4.2.2.tar.gz
mv v4.2.2.tar.gz WRFV4.2.2.tar.gz
tar -zxvf WRFV4.2.2.tar.gz
cd WRF-4.2.2
sed -i 's#  export USENETCDF=$USENETCDF.*#  export USENETCDF="-lnetcdf"#' configure
sed -i 's#  export USENETCDFF=$USENETCDFF.*#  export USENETCDFF="-lnetcdff"#' configure
cd arch
cp Config.pl Config.pl_backup
sed -i '405s/.*/  $response = 34 ;/' Config.pl
sed -i '667s/.*/  $response = 1 ;/' Config.pl
cd ..
./configure
gfortversion=$(gfortran -dumpversion | cut -c1)
if [ "$gfortversion" -lt 8 ] && [ "$gfortversion" -ge 6 ]; then
sed -i '/-DBUILD_RRTMG_FAST=1/d' configure.wrf
fi
logsave compile.log ./compile em_real
cd arch
cp Config.pl_backup Config.pl
cd ..
if [ -n "$(grep "Problems building executables, look for errors in the build log" compile.log)" ]; then
        echo "There were some errors while installing WRF exiting....."
        exit
fi

cd ..


#+-+-+-+ +-+-+-+-+-+-+-+-+-+-+-+-+
#|W|P|S| |i|n|s|t|a|l|l|a|t|i|o|n|
#+-+-+-+ +-+-+-+-+-+-+-+-+-+-+-+-+


[ -d "WPS-4.2" ] && mv WPS-4.2 WPS-4.2-old
[ -d "v4.2.tar.gz" ] && mv v4.2.tar.gz v4.2.tar.gz-old
wget https://github.com/wrf-model/WPS/archive/v4.2.tar.gz
mv v4.2.tar.gz WPSV4.2.TAR.gz
tar -zxvf WPSV4.2.TAR.gz
cd WPS-4.2
cd arch
cp Config.pl Config.pl_backup
sed -i '141s/.*/  $response = 3 ;/' Config.pl
cd ..
./clean
sed -i '122s/.*/    NETCDFF="-lnetcdff"/' configure
sed -i '154s/.*/standard_wrf_dirs="WRF-4.2.2 WRF WRF-4.0.3 WRF-4.0.2 WRF-4.0.1 WRF-4.0 WRFV3"/' configure
./configure
logsave compile.log ./compile
cd arch
cp Config.pl_backup Config.pl
cd ..
cd ..
echo "+-+-+-+-+-+-+-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+-+
|i|n|s|t|a|l|l|a|t|i|o|n| |c|o|m|p|l|e|t|e|d|!|
+-+-+-+-+-+-+-+-+-+-+-+-+ +-+-+-+-+-+-+-+-+-+-+"

exec bash
exit


