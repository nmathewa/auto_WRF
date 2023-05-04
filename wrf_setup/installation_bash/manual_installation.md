# Manual installation 

This readme file is for manual installation of WRF on linux based systems (tested on UBUNTU 22.04 LTS).

1. Manual installation 

2. Using SPACK (Recommended in HPC/Clusters environment)


## 1. Manual installation

### 1.1. Downloading the source code


### 1.2 Installing the libraries 

In this step if you are on debian based repos free to use the following command to install the libraries

```bash

sudo apt-get install libnetcdf-dev libnetcdff-dev libjasper-dev libpng-dev libgrib-api-dev libhdf5-dev libopenmpi-dev

```

> it is highly recommended to make a custom bash enviornment as in the auto script


### 1.2.1. Setting up the basic enviornment

```bash

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


### 1.2.3. Installing NETCDF

```bash

wget https://downloads.unidata.ucar.edu/netcdf-c/4.9.2/netcdf-c-4.9.2.tar.gz

tar -xvf netcdf-c-4.9.2.tar.gz

cd netcdf-c-4.9.2

mkdir build

./configure --prefix=$PWD/build --disable-dap --disable-netcdf-4 --disable-shared

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







