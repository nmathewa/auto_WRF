# Manual installation 

This readme file is for manual installation of WRF on linux based systems (tested on UBUNTU 22.04 LTS).

1. Manual installation 

2. Using SPACK (Recommended in HPC/Clusters environment)


## 1. Manual installation

### 1.1. Downloading the source code


### 1.2 Installing the libraries 

In this step if you are on debian based repos free to use the following command to install the libraries

```bash

sudo apt-get install -y build-essential csh gfortran m4 curl perl mpich libhdf5-mpich-dev libpng-dev netcdf-bin libnetcdff-dev
```

> it is highly recommended to make a custom bash enviornment as in the auto script


### 1.2.1. Setting up the basic enviornment

```bash

touch wrf.bash

code wr.bash

```
# 1.2.2 installing zlib 

```bash
wget https://www.zlib.net/fossils/zlib-1.3.tar.gz
tar -xzvf zlib-1.3.tar.gz
cd zlib-1.3
mkdir build


```


### 1.2.2. Installing HDF5

```bash

wget https://hdf-wordpress-1.s3.amazonaws.com/wp-content/uploads/manual/HDF5/HDF5_1_14_0/src/hdf5-1.14.0.tar.gz

tar -xvf hdf5-1.14.0.tar.gz

cd hdf5-1.14.0

mkdir build

./configure --prefix=$PWD/build 

make -j 4

make install

```


### 1.2.3. Installing NETCDF-C

```bash

wget https://downloads.unidata.ucar.edu/netcdf-c/4.9.2/netcdf-c-4.9.2.tar.gz

tar -xvf netcdf-c-4.9.2.tar.gz

cd netcdf-c-4.9.2

mkdir build

./configure --prefix=$wrf_libs/netcdf-c --disable-dap --enable-netcdf-4 --enable-netcdf4 --enable-shared --enable-static --enable-pnetcdf --enable-cdf5 --enable-parallel-tests

make -j 4

make install

```

## 1.2.4. Installing NETCDF-FORTRAN

```bash

wget https://downloads.unidata.ucar.edu/netcdf-fortran/4.6.0/netcdf-fortran-4.6.0.tar.gz

tar -xvf netcdf-fortran-4.6.0.tar.gz

cd netcdf-fortran-4.6.0

mkdir build

./configure --prefix=$PWD/build/  --disable-dap --disable-netcdf-4 --disable-shared CFLAGS="$(nc-config --cflags)" LDFLAGS="$(nc-config --libs)" LIBS="$(nc-config --libs)"


make -j 4

make install

```
> If installation fails for netcdf-fortran, possibly hte issue is due to unsuppoted vesrion of netcdf-c. In that case, try to install netcdf-c-4.8.1 and netcdf-fortran-4.5.3




## 1.2.5 Installing WPS 


```bash

cp Config.pl Config.pl_backup


```

wget -c https://github.com/madler/zlib/releases/download/v$Zlib_Version/zlib-$Zlib_Version.tar.gz
wget -c https://github.com/HDFGroup/hdf5/releases/download/hdf5_$HDF5_Version.$HDF5_Sub_Version/hdf5-$HDF5_Version-$HDF5_Sub_Version.tar.gz
wget -c https://github.com/Unidata/netcdf-c/archive/refs/tags/v$Netcdf_C_Version.tar.gz
wget -c https://github.com/Unidata/netcdf-fortran/archive/refs/tags/v$Netcdf_Fortran_Version.tar.gz
wget -c https://download.sourceforge.net/libpng/libpng-$Libpng_Version.tar.gz
wget -c https://www.ece.uvic.ca/~frodo/jasper/software/jasper-$Jasper_Version.zip
wget -c https://github.com/pmodels/mpich/releases/download/v$Mpich_Version/mpich-$Mpich_Version.tar.gz
wget -c  https://parallel-netcdf.github.io/Release/pnetcdf-$Pnetcdf_Version.tar.gz
    


