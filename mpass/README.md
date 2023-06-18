# MPASS Model For Prediction Across Scales


This is for running MPASS Atmosphere suite for the defined region 


## Installation


### 1. Setting up the environment

#### 1. Requirements 

1. PGI/ Gfortran compiler 
2. PIO [https://ncar.github.io/ParallelIO/install.html]

##### 1. Installing PIO



- openmpi should build with PIO 



### 2. Obtaining the Source Code


```bash
git clone https://github.com/MPAS-Dev/MPAS-Model.git

git checkout atmosphere/v6.x-openacc
```

### 3. Building the Model


```bash
make -j 4 pgi CORE=atmosphere USE_PIO2=true OPENACC=true

```


# References

1. https://ncar.github.io/ParallelIO/install.html
2. https://mpas-dev.github.io/atmosphere/atmosphere_download.html
3. 