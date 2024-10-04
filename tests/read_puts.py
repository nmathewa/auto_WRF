#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Oct  3 18:26:57 2024

@author: nmathewa
"""

import xarray as xr 
import numpy as np


wrfdata = '/home/nmathewa/Build_WRF/WRF-4.6.0-ARW/run/wrfout_d03_2024-10-03_22:00:00'

ds = xr.open_dataset(wrfdata)

lon = np.unique(ds.XLONG.values.flatten())
lat = np.unique(ds.XLAT.values.flatten())

#%%

t_test = ds.T.isel(Time=0,bottom_top=-1)
dset_new = xr.DataArray(data=(t_test.values),
                        dims = ['lat','lon'],
                        coords=({'lat':lat,'lon':lon}))



import cartopy.crs as ccrs 
import matplotlib.pyplot as plt 



ax = plt.axes(projection=ccrs.PlateCarree())

dset_new.plot(ax=ax)

ax.coastlines()
ax.gridlines(draw_labels=True)

#%%
.plot()

