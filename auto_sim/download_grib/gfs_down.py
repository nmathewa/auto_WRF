import os 
import pandas as pd
import numpy as np



# get the current directory of file
dir_path = os.path.dirname(os.path.realpath(__file__))

os.chdir(dir_path)


main_dir = 'https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl'

config_file = 'auto_namelist.txt'

if not os.path.exists(config_file):
    print('Config file not found')
    